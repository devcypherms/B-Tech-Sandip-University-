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
     A stage with a thumbnail rail. Four ways to move: the rail, the two
     arrows, a swipe, and the arrow keys once the stage has focus. All four
     are user-triggered, so none of them spends the page's load-motion
     budget.

     The slides are stacked and crossfaded rather than scrolled, so there is
     no scroll position to keep in step with anything — one index is the
     whole state, and every control just sets it. */
  (function () {
    var box = document.getElementById('gal');
    if (!box) return;

    var stage  = document.getElementById('galStage');
    var slides = Array.prototype.slice.call(box.querySelectorAll('.gal__slide'));
    var thumbs = Array.prototype.slice.call(box.querySelectorAll('.gal__thumb'));
    var rail   = document.getElementById('galRail');
    var capEl  = document.getElementById('galCap');
    var nowEl  = document.getElementById('galNow');
    var live   = document.getElementById('galLive');
    if (!stage || slides.length < 2) return;

    var n = slides.length;
    var at = 0;

    /* The caption text lives on each slide's aria-label as "3 of 7: Hostel
       block", which is also what the label has to say. Read it back from
       there so the two can never disagree. */
    function captionOf(i) {
      var label = slides[i].getAttribute('aria-label') || '';
      var colon = label.indexOf(': ');
      return colon < 0 ? label : label.slice(colon + 2);
    }

    /* Zero-padded, because "01 / 07" is a pair of matched marks and
       "1 / 7" is two loose ones. */
    function pad(k) { return String(k + 1).length < 2 ? '0' + (k + 1) : String(k + 1); }

    function show(i, announce) {
      i = (i % n + n) % n;          /* wraps both ways */
      if (i === at) return;
      at = i;

      slides.forEach(function (el, k) {
        var on = k === i;
        el.classList.toggle('is-on', on);
        if (on) el.removeAttribute('aria-hidden');
        else el.setAttribute('aria-hidden', 'true');
      });
      thumbs.forEach(function (el, k) {
        var on = k === i;
        el.classList.toggle('is-on', on);
        if (on) el.setAttribute('aria-current', 'true');
        else el.removeAttribute('aria-current');
      });

      var cap = captionOf(i);
      if (capEl) capEl.textContent = cap;
      if (nowEl) nowEl.textContent = pad(i);
      /* Only on a deliberate move. Announcing during a drag would fire on
         every frame. */
      if (announce !== false && live) live.textContent = cap + ', ' + (i + 1) + ' of ' + n;

      if (lb && !lb.hidden) paintLightbox();
      keepThumbInView(i);
    }

    /* On a narrow screen the rail scrolls, so arrowing past the visible
       thumbnails must bring the current one back into view. */
    function keepThumbInView(i) {
      if (!rail || rail.scrollWidth <= rail.clientWidth + 4) return;
      var t = thumbs[i];
      if (!t) return;
      var r = t.getBoundingClientRect(), rr = rail.getBoundingClientRect();
      if (r.left < rr.left || r.right > rr.right) {
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        rail.scrollTo({
          left: rail.scrollLeft + (r.left - rr.left) - (rr.width - r.width) / 2,
          behavior: reduced ? 'auto' : 'smooth'
        });
      }
    }

    thumbs.forEach(function (t) {
      t.addEventListener('click', function () { show(+t.getAttribute('data-go')); });
    });

    var prev = document.getElementById('galPrev');
    var next = document.getElementById('galNext');
    if (prev) prev.addEventListener('click', function () { show(at - 1); });
    if (next) next.addEventListener('click', function () { show(at + 1); });

    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight')     { e.preventDefault(); show(at + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(at - 1); }
      else if (e.key === 'Home')      { e.preventDefault(); show(0); }
      else if (e.key === 'End')       { e.preventDefault(); show(n - 1); }
    });

    /* Swipe. touch-action: pan-y in the stylesheet leaves vertical scrolling
       to the page, so this only ever sees a horizontal gesture. The 40px
       threshold is above the wobble in a tap but below a deliberate flick,
       and the vertical check drops a diagonal that was meant as a scroll. */
    var x0 = 0, y0 = 0, tracking = false, dragged = 0;

    /* A photograph is draggable by default, so dragging across one starts
       the browser's own image drag: that fires pointercancel and the swipe
       died before pointerup arrived. Both halves are needed — refusing
       dragstart stops the native drag, capturing the pointer keeps the rest
       of the sequence on the stage even when the cursor leaves it. */
    stage.addEventListener('dragstart', function (e) { e.preventDefault(); });

    stage.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      /* The arrows live inside the stage, so without this the capture below
         redirects their pointer events to the stage and the button never
         sees a click at all. Press on an arrow, nothing happens. */
      /* Any real control inside the stage has to be excluded, not just the
         arrows: pointer capture retargets the click to the stage, so the
         button never sees one. The enlarge control was opening the view
         with the stage recorded as its opener, and focus came back to the
         wrong element on close. */
      if (e.target.closest && e.target.closest('.gal__arrow, .gal__zoom')) return;
      tracking = true; dragged = 0; x0 = e.clientX; y0 = e.clientY;
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    });
    stage.addEventListener('pointerup', function (e) {
      if (!tracking) return;
      tracking = false;
      try { if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId); } catch (err) {}
      dragged = Math.abs(e.clientX - x0);
      var dx = e.clientX - x0, dy = e.clientY - y0;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(at + (dx < 0 ? 1 : -1));
    });
    stage.addEventListener('pointercancel', function () { tracking = false; });

    /* ----- enlarged view -----
       The stage is a 2.4:1 crop of a 3:2 photograph, so a third of each
       image is not on screen. This is where the whole frame can be seen,
       which is the honest reason to have it at all rather than decoration.

       It is a modal, so it owes the usual four things: focus moves in on
       open, Tab stays inside while it is up, Escape closes it, and focus
       returns to whatever opened it. */
    var lb = document.getElementById('galLb');
    if (lb) {
      var lbImg = document.getElementById('lbImg');
      var lbText = document.getElementById('lbText');
      var lbCount = document.getElementById('lbCount');
      var lbClose = document.getElementById('lbClose');
      var zoom = document.getElementById('galZoom');
      var returnTo = null;

      var paintLightbox = function () {
        var img = slides[at].querySelector('img');
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt;
        lbText.textContent = captionOf(at);
        lbCount.textContent = pad(at) + ' / ' + pad(n - 1);
      };

      var openLb = function (opener) {
        returnTo = opener || document.activeElement;
        paintLightbox();
        lb.hidden = false;
        document.documentElement.classList.add('is-lb-open');
        lbClose.focus();
      };

      var closeLb = function () {
        lb.hidden = true;
        document.documentElement.classList.remove('is-lb-open');
        if (returnTo && returnTo.focus) returnTo.focus();
        returnTo = null;
      };

      /* A click on the stage opens it, but not a drag: the swipe handler
         records how far the pointer travelled, and anything past the swipe
         threshold was a gesture, not a click. Nor do the arrows count. */
      stage.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('.gal__arrow')) return;
        if (dragged > 6) return;
        openLb(stage);
      });
      zoom.addEventListener('click', function (e) { e.stopPropagation(); openLb(zoom); });

      lbClose.addEventListener('click', closeLb);
      document.getElementById('lbPrev').addEventListener('click', function () { show(at - 1); });
      document.getElementById('lbNext').addEventListener('click', function () { show(at + 1); });

      /* Clicking the backdrop closes; clicking the photograph does not. */
      lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });

      lb.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { e.preventDefault(); closeLb(); return; }
        if (e.key === 'ArrowRight') { e.preventDefault(); show(at + 1); return; }
        if (e.key === 'ArrowLeft') { e.preventDefault(); show(at - 1); return; }
        if (e.key !== 'Tab') return;

        /* Keep Tab inside. Collected live rather than cached, because a
           button can be disabled or hidden between openings. */
        var focusable = Array.prototype.filter.call(
          lb.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])'),
          function (el) { return el.offsetWidth || el.offsetHeight || el.getClientRects().length; }
        );
        if (!focusable.length) return;
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });

      /* Swipe inside the enlarged view too, since it is the view a phone
         will spend the most time in. */
      var lx = 0, ly = 0, ltrack = false;
      lb.addEventListener('pointerdown', function (e) { ltrack = true; lx = e.clientX; ly = e.clientY; });
      lb.addEventListener('pointerup', function (e) {
        if (!ltrack) return;
        ltrack = false;
        var dx = e.clientX - lx, dy = e.clientY - ly;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(at + (dx < 0 ? 1 : -1));
      });
      lb.addEventListener('pointercancel', function () { ltrack = false; });
    }
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

  /* ---------- 7. ENQUIRY FORMS (5.2 hero, 5.14 footer) ----------
     The form validates here rather than through the browser, because native
     validation shows one bubble at a time, positions it outside the layout,
     and cannot be styled to match anything else on the page.

     Timing matters as much as the rules. Nothing is marked wrong while the
     visitor is still typing it for the first time: fields are checked on
     submit, and only after that first submit does a field re-check as it is
     edited, so an error clears the moment it is fixed. Validating on every
     keystroke from the start marks a half-typed mobile number as invalid,
     which reads as the form arguing with you.

     There are two forms on the page now: a three-field one in the hero and
     the full six-field one at 5.14. They share this implementation rather
     than duplicating it, because the interesting parts — the mobile
     normaliser, the re-check timing, and the refusal to submit while
     FORM_ENDPOINT is still a marker — are exactly the parts that would rot
     if there were two copies. A form supplies its own id prefix through
     the ids it already uses, and its own source through data-form-source.

     Fields are discovered from the markup: whichever of the six named
     controls a form actually contains gets validated, and the rest are
     simply absent. The hero form is a subset, not a special case. */
  function initEnquiryForm(form) {
    if (!form) return;

    /* Error node ids are the field name prefixed per form: e-name in 5.14,
       q-e-name in the hero. The prefix is read off the form rather than
       passed in, so the markup stays the single source of truth. */
    var prefix = form.getAttribute('data-id-prefix') || '';
    var submit = form.querySelector('[type="submit"]');
    var status = form.querySelector('.f__status');
    var source = form.getAttribute('data-form-source') || 'unknown';
    var submitted = false;
    var sending = false;
    if (!submit || !status) return;

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
      /* State is asked before district so the district list can be the right
         one, and because it is the order people think about where they live. */
      state: function (v) { return v ? '' : 'Choose your state.'; },
      /* Either a pick from Bihar's list or something typed for another state,
         so this cannot just test for truthiness the way branch does. */
      district: function (v) {
        if (!v.trim()) return 'Tell us your district.';
        if (v.trim().length < 3) return 'That looks too short to be a district.';
        return '';
      },
      consent: function (_, el) { return el.checked ? '' : 'Please tick this so we can call you.'; },
    };

    /* Whichever control of this name is currently enabled. District is two
       controls — a select for Bihar, a text box for every other state — and
       form.elements.district would hand back a RadioNodeList whose .value is
       empty for anything that is not a radio group. */
    function control(name) {
      var all = form.querySelectorAll('[name="' + name + '"]');
      for (var i = 0; i < all.length; i++) if (!all[i].disabled) return all[i];
      return all[0] || null;
    }

    var FIELDS = Object.keys(RULES).map(function (name) {
      var field = { name: name, err: document.getElementById(prefix + 'e-' + name) };
      /* A getter rather than a captured node, so every existing field.el
         reader picks up the swap without knowing it happened. */
      Object.defineProperty(field, 'el', {
        get: function () { return control(name); },
      });
      return field;
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

    /* Bound to every node carrying the name, not just the one live at init,
       because the district text box starts disabled and may become the live
       control later. */
    FIELDS.forEach(function (field) {
      var nodes = form.querySelectorAll('[name="' + field.name + '"]');
      Array.prototype.forEach.call(nodes, function (el) {
        var events = el.type === 'checkbox' || el.tagName === 'SELECT'
          ? ['change'] : ['input', 'blur'];
        events.forEach(function (ev) {
          el.addEventListener(ev, function () { if (submitted) check(field); });
        });
      });
    });

    /* Bihar's districts are listed; every other state gets a text box. The
       two controls share the name "district" and exactly one is ever enabled,
       so FormData sends one value and the payload shape never changes.

       Both are cleared on every switch. Without that, a student who picks
       Madhubani, then changes the state to Jharkhand, would send Madhubani
       from a form that no longer shows it. */
    var stateEl = form.elements.state;
    var dWrap = document.getElementById('f-district-wrap');
    var dSel = document.getElementById('f-district');
    var dTxt = document.getElementById('f-district-text');
    var dLabel = form.querySelector('[data-district-label]');

    function districtMode() {
      /* Empty counts as Bihar so the field is never a bare disabled box
         before a state has been chosen. */
      var listed = !stateEl.value || stateEl.value === 'Bihar';
      dWrap.hidden = !listed;
      dSel.disabled = !listed;
      dTxt.hidden = listed;
      dTxt.disabled = listed;
      dSel.value = '';
      dTxt.value = '';
      dLabel.setAttribute('for', listed ? 'f-district' : 'f-district-text');
      dTxt.placeholder = stateEl.value === 'Outside India'
        ? 'Type your city' : 'Type your district';
      /* The old error belonged to a control that is no longer on screen. */
      FIELDS.forEach(function (f) { if (f.name === 'district') show(f, ''); });
    }

    if (stateEl && dWrap && dSel && dTxt && dLabel) {
      stateEl.addEventListener('change', districtMode);
      /* reset() puts the state back to its placeholder but fires no change,
         so after a successful send the district would stay a text box. */
      form.addEventListener('reset', function () { setTimeout(districtMode, 0); });
    }

    /* Read the label off the markup rather than hardcoding it, so the two
       forms can say different things on their buttons. */
    var submitLabel = submit.textContent.trim();

    function setSending(on) {
      sending = on;
      submit.disabled = on;
      submit.textContent = on ? 'Sending…' : submitLabel;
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
      /* Which form converted. The hero form exists because the only form on
         the page used to sit at 93% depth; without this there is no way to
         find out whether moving it up actually worked. */
      payload.append('source', source);

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
  }

  initEnquiryForm(document.getElementById('quickEnquiry'));
  initEnquiryForm(document.getElementById('enquiry'));

  /* ---------- 8. LINKS INTO A CLOSED DISCLOSURE ----------
     Nothing on this page sends a visitor off it, so "See the full list"
     points at the placement table in §5.12 instead of the university's
     server. That table lives inside a <details> that starts closed, and a
     fragment link to a closed <details> lands on a heading with nothing
     under it — which reads as a broken link, not a compact one.

     Chrome and Safari have started opening a <details> when navigation
     targets something inside it, but that is recent and not everywhere, so
     the behaviour is done here rather than assumed. It runs on click, on
     hashchange and once at load, because a shared URL ending #recAll has to
     arrive open too. */
  function openDisclosureFor(hash) {
    if (!hash || hash.length < 2) return;
    var target;
    try { target = document.querySelector(hash); } catch (e) { return; }
    if (!target) return;
    var d = target.closest('details');
    if (d && !d.open) d.open = true;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a) openDisclosureFor(a.getAttribute('href'));
  });
  window.addEventListener('hashchange', function () { openDisclosureFor(location.hash); });
  openDisclosureFor(location.hash);

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
