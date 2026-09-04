/* =============================================================================
   main.js — behaviour, plus hydration of volatile values.

   It does NOT render sections. Every heading, paragraph and answer is static
   markup in index.html, so the page is complete and indexable with JS off.
   This file only:
     1. refreshes [data-c] spans from content.js,
     2. runs the one load reveal,
     3. wires the sticky header.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.CONTENT || {};

  /* ---------- 1. HYDRATION ---------- */

  /* Resolve a dotted path like "fees.cse" against CONTENT. */
  function lookup(path) {
    return path.split('.').reduce(function (o, k) {
      return (o && Object.prototype.hasOwnProperty.call(o, k)) ? o[k] : undefined;
    }, C);
  }

  var UNFILLED = /\[\[CONFIRM/;

  /* Each hook already holds the correct value as static text. We overwrite it
     only when content.js actually differs, so a JS failure degrades to the
     static copy rather than to an empty element. */
  /* Derived first-year totals. These are the one place a number on the page
     is not copied from content.js but computed from it, so they are rebuilt
     here rather than trusted: change a fee and the total follows.

     Day scholar  = tuition + forms + registration + uniform + caution
     With hostel  = the above + hostel + hostel security deposit

     Convocation is excluded: it falls in the final year, not the first. The
     B1 supplement is excluded: it is conditional on availability. */
  function rupeesToNumber(s) {
    var n = parseInt(String(s).replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? null : n;
  }
  function numberToRupees(n) {
    return '₹' + n.toLocaleString('en-IN');
  }

  function firstYearTotals() {
    var f = C.fees || {}, k = C.costs || {};
    var oneTime = ['forms', 'registration', 'uniform', 'caution']
      .map(function (key) { return rupeesToNumber(k[key]); });
    var hostel = [rupeesToNumber(k.hostel), rupeesToNumber(k.hostelDeposit)];

    /* If any input is missing or is still a [[CONFIRM]] marker, do not print
       a total that silently omits it. */
    if (oneTime.indexOf(null) > -1) return null;
    var base = oneTime.reduce(function (a, b) { return a + b; }, 0);
    var hostelAdd = hostel.indexOf(null) > -1 ? null
      : hostel.reduce(function (a, b) { return a + b; }, 0);

    var out = {};
    [['set', f.civil], ['cse', f.cse], ['aiml', f.aiml]].forEach(function (pair) {
      var tuition = rupeesToNumber(pair[1]);
      if (tuition === null) return;
      out[pair[0]] = numberToRupees(tuition + base);
      if (hostelAdd !== null) out[pair[0] + '+hostel'] = numberToRupees(tuition + base + hostelAdd);
    });
    return out;
  }

  function hydrateSums() {
    var totals = firstYearTotals();
    Array.prototype.forEach.call(document.querySelectorAll('[data-sum]'), function (el) {
      var key = el.getAttribute('data-sum');
      var v = totals && totals[key];
      if (!v) { el.classList.add('confirm'); el.textContent = '[[CONFIRM: first-year total]]'; return; }
      if (el.textContent.trim() !== v) {
        console.warn('[data-sum] static HTML drifted: ' + key +
                     ' html="' + el.textContent.trim() + '" computed="' + v + '"');
        el.textContent = v;
      }
    });
  }

  function hydrate() {
    var missing = [];
    var drifted = [];

    Array.prototype.forEach.call(document.querySelectorAll('[data-c]'), function (el) {
      var path = el.getAttribute('data-c');
      var v = lookup(path);

      if (v === undefined) { missing.push(path); return; }
      v = String(v);

      var staticText = el.textContent.trim();
      if (staticText && staticText !== v) drifted.push(path + ': html="' + staticText + '" js="' + v + '"');

      if (staticText !== v) el.textContent = v;

      /* An unfilled value is made loud rather than shipped quietly. */
      el.classList.toggle('confirm', UNFILLED.test(v));
    });

    /* Attribute hooks: data-c-href="org.phoneHref" sets href.

       A marker is never written into an href. The element keeps whatever
       safe fallback the markup gave it, and anything wearing the blocked
       styling keeps wearing it, so an unresolved destination stays visible
       instead of becoming an ordinary-looking link that goes nowhere
       useful. Clearing the class is tied to the same test that writes the
       href, so the two can never disagree. */
    Array.prototype.forEach.call(document.querySelectorAll('[data-c-href]'), function (el) {
      var v = lookup(el.getAttribute('data-c-href'));
      var resolved = typeof v === 'string' && v && !UNFILLED.test(v);
      if (resolved) {
        el.setAttribute('href', v);
        el.classList.remove('bar__item--blocked');
      }
    });

    if (missing.length) console.warn('[data-c] paths not found in content.js:', missing);
    if (drifted.length) console.warn('[data-c] static HTML has drifted from content.js:\n  ' + drifted.join('\n  '));
  }

  hydrate();
  hydrateSums();

  /* ---------- 2. STICKY HEADER ---------- */
  var hdr = document.getElementById('siteHeader');
  if (hdr) {
    var stuck = false;
    var onScroll = function () {
      var should = window.scrollY > 80;
      if (should !== stuck) { stuck = should; hdr.classList.toggle('is-stuck', should); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 3. ACCORDIONS ----------
     User-triggered, so motion is welcome here. The panel is measured while
     briefly visible, its height handed to CSS as --h, and the keyframe runs
     from 0 to that value. Height is never left inline, so a resize or a font
     swap cannot strand the panel at a stale pixel value. */
  Array.prototype.forEach.call(document.querySelectorAll('.acc__trigger'), function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;

    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';

      if (open) {
        btn.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
        return;
      }

      btn.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      panel.style.setProperty('--h', panel.scrollHeight + 'px');
    });
  });

  /* ---------- 4. CAMPUS GALLERY ----------
     Pointer drag to pan, arrow keys once the strip has focus. Both are
     user-triggered, so neither spends the page's one load-motion budget. */
  (function () {
    var strip = document.getElementById('galStrip');
    if (!strip) return;

    var down = false, startX = 0, startLeft = 0, moved = 0;

    strip.addEventListener('pointerdown', function (e) {
      /* Let the browser handle text selection and real clicks on links. */
      if (e.button !== 0) return;
      down = true;
      moved = 0;
      startX = e.clientX;
      startLeft = strip.scrollLeft;
      strip.classList.add('is-dragging');
      strip.setPointerCapture(e.pointerId);
    });

    strip.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.abs(dx);
      strip.scrollLeft = startLeft - dx;
    });

    function release(e) {
      if (!down) return;
      down = false;
      strip.classList.remove('is-dragging');
      if (e && e.pointerId != null && strip.hasPointerCapture(e.pointerId)) {
        strip.releasePointerCapture(e.pointerId);
      }
    }
    strip.addEventListener('pointerup', release);
    strip.addEventListener('pointercancel', release);

    /* Suppress the click that follows a real drag, so panning off a frame
       never counts as activating it. */
    strip.addEventListener('click', function (e) {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    strip.addEventListener('keydown', function (e) {
      var frame = strip.querySelector('.gal__frame');
      if (!frame) return;
      var step = frame.getBoundingClientRect().width + 16;
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (e.key === 'ArrowRight') { e.preventDefault(); strip.scrollBy({ left: step, behavior: reduced ? 'auto' : 'smooth' }); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); strip.scrollBy({ left: -step, behavior: reduced ? 'auto' : 'smooth' }); }
      else if (e.key === 'Home') { e.preventDefault(); strip.scrollTo({ left: 0, behavior: reduced ? 'auto' : 'smooth' }); }
      else if (e.key === 'End') { e.preventDefault(); strip.scrollTo({ left: strip.scrollWidth, behavior: reduced ? 'auto' : 'smooth' }); }
    });
  })();

  /* ---------- 5. MAP, BUILT ON CLICK ----------
     No iframe ships in the markup. A visitor who never opens the map pays
     nothing for it: no Google request, no third-party cookie, no cost to
     first paint. */
  (function () {
    var btn = document.getElementById('mapBtn');
    var wrap = document.getElementById('map');
    if (!btn || !wrap) return;

    btn.addEventListener('click', function () {
      var lat = btn.getAttribute('data-lat');
      var lng = btn.getAttribute('data-lng');
      var frame = document.createElement('iframe');
      frame.src = 'https://www.google.com/maps?q=' + lat + ',' + lng + '&z=15&output=embed';
      frame.title = 'Map of Sandip University, Sijoul, Madhubani';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      frame.setAttribute('allowfullscreen', '');
      wrap.replaceChildren(frame);
    });
  })();

  /* ---------- 7. ENQUIRY FORM (5.14) ----------
     The form validates here rather than through the browser, because native
     validation shows one bubble at a time, positions it outside the layout,
     and cannot be styled to match anything else on the page.

     Timing matters as much as the rules. Nothing is marked wrong while the
     visitor is still typing it for the first time: fields are checked on
     submit, and only after that first submit does a field re-check as it is
     edited, so an error clears the moment it is fixed. Validating on every
     keystroke from the start marks a half-typed mobile number as invalid,
     which reads as the form arguing with you. */
  (function () {
    var form = document.getElementById('enquiry');
    if (!form) return;

    var submit = document.getElementById('f-submit');
    var status = document.getElementById('f-status');
    var submitted = false;
    var sending = false;

    /* Each rule returns an error string, or '' when the value is acceptable. */
    var RULES = {
      name: function (v) {
        if (!v.trim()) return 'Please enter your name.';
        if (v.trim().length < 2) return 'That looks too short to be a name.';
        return '';
      },
      /* Indian mobile numbers are ten digits and start 6, 7, 8 or 9. People
         paste them with +91, spaces and dashes, so the separators are
         stripped before checking rather than rejected. */
      mobile: function (v) {
        var d = v.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
        if (!d) return 'Please enter your mobile number.';
        if (d.length !== 10) return 'A mobile number is 10 digits.';
        if (!/^[6-9]/.test(d)) return 'An Indian mobile number starts with 6, 7, 8 or 9.';
        return '';
      },
      /* Optional. Checked only when something has been typed, because most
         of this audience will reach the campus by phone and requiring an
         address they do not use would cost enquiries for nothing. */
      email: function (v) {
        if (!v.trim()) return '';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Check the email address.';
        return '';
      },
      branch: function (v) { return v ? '' : 'Choose a branch, or "Not decided yet".'; },
      district: function (v) { return v ? '' : 'Choose your district.'; },
      consent: function (_, el) { return el.checked ? '' : 'Please tick this so we can call you.'; },
    };

    var FIELDS = Object.keys(RULES).map(function (name) {
      return {
        name: name,
        el: form.elements[name],
        err: document.getElementById('e-' + name),
      };
    }).filter(function (f) { return f.el && f.err; });

    function show(field, message) {
      if (message) {
        field.err.textContent = message;
        field.err.hidden = false;
        field.el.setAttribute('aria-invalid', 'true');
      } else {
        field.err.textContent = '';
        field.err.hidden = true;
        field.el.removeAttribute('aria-invalid');
      }
      return !message;
    }

    function check(field) {
      return show(field, RULES[field.name](field.el.value || '', field.el));
    }

    /* Accept a number in whatever shape it arrives — pasted with +91, typed
       with spaces, written with a leading 0 — and show the cleaned version
       back, so what is in the box is what gets submitted.

       The leading 91 is only dropped at 12 digits, never on sight. Indian
       mobile numbers may legitimately begin with 9, so stripping "91" from a
       10-digit 9123456789 would quietly turn a valid number into a broken
       one. Twelve digits beginning 91 is unambiguous; ten is not. */
    var mobileEl = form.elements.mobile;
    if (mobileEl) {
      mobileEl.addEventListener('input', function () {
        var d = mobileEl.value.replace(/\D/g, '');
        if (d.length === 12 && d.slice(0, 2) === '91') d = d.slice(2);
        else if (d.length === 11 && d.charAt(0) === '0') d = d.slice(1);
        d = d.slice(0, 10);
        if (d !== mobileEl.value) mobileEl.value = d;
      });
    }

    FIELDS.forEach(function (field) {
      var events = field.el.type === 'checkbox' || field.el.tagName === 'SELECT'
        ? ['change'] : ['input', 'blur'];
      events.forEach(function (ev) {
        field.el.addEventListener(ev, function () { if (submitted) check(field); });
      });
    });

    function setSending(on) {
      sending = on;
      submit.disabled = on;
      submit.textContent = on ? 'Sending…' : 'Request a call back';
    }

    function say(message, kind) {
      status.textContent = message;
      status.className = 'f__status f__status--' + kind;
      status.hidden = false;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      submitted = true;
      status.hidden = true;

      var bad = FIELDS.filter(function (f) { return !check(f); });
      if (bad.length) {
        /* Send focus to the first problem rather than announcing a count. */
        bad[0].el.focus();
        if (bad[0].el.scrollIntoView) bad[0].el.scrollIntoView({ block: 'center' });
        return;
      }

      var endpoint = (window.CONTENT && window.CONTENT.FORM_ENDPOINT) || '';

      /* The endpoint is still a [[CONFIRM]] marker. Saying "thank you" here
         would be a lie the visitor cannot detect, and this exact failure —
         a success state showing before anything was sent — has already been
         caught once on this build. So it refuses, loudly, and confirm.js
         holds the marker until a real URL replaces it. */
      if (!endpoint || endpoint.indexOf('[[CONFIRM') === 0) {
        say('This form is not connected yet — FORM_ENDPOINT in content.js is '
          + 'still a placeholder, so nothing was sent. Nobody has your details.', 'bad');
        return;
      }

      setSending(true);

      var payload = new FormData(form);
      payload.append('page', 'btech-admission-2026');

      fetch(endpoint, { method: 'POST', body: payload, headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset();
          submitted = false;
          FIELDS.forEach(function (f) { show(f, ''); });
          say('Thank you. The admission cell will call you back.', 'ok');
        })
        .catch(function () {
          say('That did not go through. Please try again, or call the admission '
            + 'cell directly using the number in the header.', 'bad');
        })
        .then(function () { setSending(false); });
    });
  })();

  /* ---------- 6. THE ONE LOAD REVEAL ----------
     Held until the fonts settle so the masked lines do not animate in the
     fallback face and then reflow. The timeout is a floor, so a slow font
     never leaves the hero invisible. */
  var revealed = false;
  function reveal() {
    if (revealed) return;
    revealed = true;
    document.documentElement.classList.add('is-ready');
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reveal);
  setTimeout(reveal, 900);
})();
