/* =============================================================================
   main.js — hydration, accordions, gallery, map, forms.

   Nothing here is required for the page to be readable, indexable or usable.
   Every value is already in the markup as static text; every accordion panel
   is a real element; the gallery is a native scroll container. This file
   improves what is already there and never creates it.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.CONTENT || {};
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- 1. HYDRATION ----------
     Walk the dotted path in data-c and write the value in. The markup already
     carries the same value as static text, so this is a consistency pass
     rather than a render: with JS off the page is complete, and with JS on
     content.js becomes the single place a fee or a date is changed. */
  function lookup(path) {
    return path.split('.').reduce(function (o, k) {
      return (o && Object.prototype.hasOwnProperty.call(o, k)) ? o[k] : undefined;
    }, C);
  }

  $$('[data-c]').forEach(function (el) {
    var v = lookup(el.getAttribute('data-c'));
    if (typeof v === 'string' && v && el.textContent.trim() !== v) el.textContent = v;
  });

  /* ---------- 2. HEADER ----------
     A plain full-width bar at rest, the floating capsule once the page has
     moved. The sentinel sits 96px into the hero and the root is inset by the
     bar's height, so the change lands at about 24px of scroll.

     That number is not taste. The resting bar has no fill, so hero copy
     sliding underneath it would show straight through — and the first line of
     copy sits 102px down against a 72px bar, so it reaches the bar at 30px of
     scroll. Firing at 24 means the fill arrives before anything can pass
     behind it, and it is also early enough that the capsule reads as the
     answer to scrolling rather than as something that happens later.

     Driven by an IntersectionObserver rather than a scroll handler so it costs
     nothing on a mid-range phone. */
  var hdr = $('#siteHeader');
  var hero = $('.hero');
  if (hdr && hero && 'IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:96px;height:1px;width:1px;pointer-events:none';
    hero.appendChild(sentinel);
    new IntersectionObserver(function (entries) {
      hdr.classList.toggle('is-solid', !entries[0].isIntersecting);
    }, { rootMargin: '-' + (hdr.offsetHeight || 64) + 'px 0px 0px 0px' }).observe(sentinel);
  }

  /* ---------- 2b. WHERE AM I ----------
     Icons beside five links in a 559px capsule would be clutter — five marks
     competing with the one button that matters. This does the job an icon
     cannot: it tells the reader which section they are actually in, and it
     turns the pill from decoration into a position indicator.

     Unlike the header state above, this cannot be an IntersectionObserver —
     the reason is in the note below. */
  (function () {
    var links = $$('.hdr__nav a');
    if (!links.length) return;

    var byId = {};
    links.forEach(function (a) {
      var id = (a.getAttribute('href') || '').slice(1);
      if (id) byId[id] = a;
    });
    var targets = Object.keys(byId)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean)
      /* Document order, so "the last one passed" means the last one down the
         page rather than the last one written in the nav. */
      .sort(function (a, b) {
        return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
      });
    if (!targets.length) return;

    /* Three things were wrong before.

       One: the observer reports changes, not state, and this reacted only to
       entries that were intersecting — so the last section entered stayed
       marked forever. Land at the top with a section briefly in the band while
       images were still settling and "Branches" stayed lit at 0% scroll, with
       the reader nowhere near it.

       Two: five of the page's sections are in the nav and several are not. A
       rule that marks only the section it is inside goes blank for long
       stretches — through scholarships, process and dates — which reads as
       broken rather than as accurate. The rule is "the last nav section you
       have passed", measured against a line at 40% of the viewport. Above the
       first one nothing is marked, which is the correct state over the hero
       and the one the page opens in.

       Three, and this is why the observer had to go: IntersectionObserver
       signals crossings, not position. Every link on this page jumps — the nav
       itself, the buttons, the skip link — and a jump from the FAQ back to the
       top changes no section from intersecting to not intersecting, because
       none of them were intersecting a 1%-tall band at either end. Nothing
       fired, and the mark stayed on FAQ over the hero. Position is what is
       being asked for here, so position is what is read.

       The cost is a scroll listener, which is what the header state was
       deliberately built to avoid. It is paid down: passive, coalesced to one
       animation frame, and doing nothing but reading five rects and comparing
       one node reference. It does not write unless the answer changed, so it
       never touches layout in a scroll frame. */
    var current = null;
    var queued = false;

    function paint() {
      queued = false;
      var line = window.innerHeight * 0.4;
      var mark = null;
      for (var i = 0; i < targets.length; i++) {
        if (targets[i].getBoundingClientRect().top <= line) mark = byId[targets[i].id];
      }
      if (mark === current) return;
      if (current) current.removeAttribute('aria-current');
      if (mark) mark.setAttribute('aria-current', 'true');
      current = mark;
    }

    function schedule() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(paint);
    }

    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule, { passive: true });
    paint();
  }());

  /* ---------- 3. ACCORDIONS ----------
     Real buttons with aria-expanded, panels toggled by the hidden attribute.
     The height animation runs from the panel's own scrollHeight and is
     skipped entirely under prefers-reduced-motion. */
  function closePanel(btn, panel) {
    btn.setAttribute('aria-expanded', 'false');
    if (reduced) { panel.hidden = true; return; }
    panel.style.height = panel.scrollHeight + 'px';
    requestAnimationFrame(function () {
      panel.style.transition = 'height .26s cubic-bezier(.22,.61,.36,1)';
      panel.style.height = '0px';
    });
    window.setTimeout(function () {
      panel.hidden = true;
      panel.style.transition = panel.style.height = '';
    }, 280);
  }

  function openPanel(btn, panel) {
    btn.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    if (reduced) return;
    var h = panel.scrollHeight;
    panel.style.height = '0px';
    requestAnimationFrame(function () {
      panel.style.transition = 'height .26s cubic-bezier(.22,.61,.36,1)';
      panel.style.height = h + 'px';
    });
    window.setTimeout(function () { panel.style.transition = panel.style.height = ''; }, 280);
  }

  $$('.acc').forEach(function (acc) {
    $$('.acc__trigger', acc).forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        if (open) { closePanel(btn, panel); return; }
        /* One panel at a time. A reader comparing two branches scrolls
           between them; a page of open panels is harder to compare, not
           easier. */
        $$('.acc__trigger[aria-expanded="true"]', acc).forEach(function (other) {
          closePanel(other, document.getElementById(other.getAttribute('aria-controls')));
        });
        openPanel(btn, panel);
        track('accordion', btn.textContent.trim().slice(0, 60));
      });
    });
  });

  /* ---------- 4. RECRUITER MARQUEE ----------
     The strip animates to -50%, so it needs exactly two copies of the set to
     loop seamlessly. Cloning here rather than duplicating in the markup
     keeps one list to maintain and keeps the duplicate out of the
     accessibility tree and out of the indexable text. */
  var wallTrack = $('#wallTrack');
  if (wallTrack && !reduced) {
    var set = $('.wall__set', wallTrack);
    if (set) {
      var copy = set.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      $$('img', copy).forEach(function (img) { img.alt = ''; });
      wallTrack.appendChild(copy);
    }
  }

  /* ---------- 5. GALLERY ----------
     The strip already scrolls, drags and takes arrow keys on its own. These
     buttons page it by one viewport and disable themselves at each end. */
  var strip = $('#galStrip');
  var prev = $('#galPrev');
  var next = $('#galNext');
  if (strip && prev && next) {
    var step = function () { return Math.round(strip.clientWidth * 0.85); };
    prev.addEventListener('click', function () { strip.scrollBy({ left: -step(), behavior: reduced ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { strip.scrollBy({ left: step(), behavior: reduced ? 'auto' : 'smooth' }); });

    var sync = function () {
      var max = strip.scrollWidth - strip.clientWidth - 2;
      prev.disabled = strip.scrollLeft <= 2;
      next.disabled = strip.scrollLeft >= max;
    };
    strip.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  /* ---------- 6. MAP ON CLICK ----------
     Google's embed pulls roughly 900KB across three third-party origins. It
     loads when someone asks for it and not before. */
  var mapBtn = $('#mapBtn');
  if (mapBtn) {
    mapBtn.addEventListener('click', function () {
      var lat = (C.org && C.org.lat) || '26.3506102';
      var lng = (C.org && C.org.lng) || '86.2405787';
      var frame = document.createElement('iframe');
      frame.src = 'https://www.google.com/maps?q=' + lat + ',' + lng + '&hl=en&z=15&output=embed';
      frame.title = 'Sandip University, Sijoul, Madhubani on Google Maps';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      frame.setAttribute('allowfullscreen', '');
      mapBtn.parentNode.replaceChild(frame, mapBtn);
      track('map', 'opened');
    });
  }

  /* ---------- 7. ANALYTICS ----------
     Nothing third-party is loaded. Events are pushed to the dataLayer, which
     is where GTM will pick them up once the client confirms the container,
     the Google Ads conversion ID and the Meta pixel ID (HANDOVER.md item 13).
     Until then this is a queue nobody is draining, which costs nothing and
     means the tags need no markup changes when they are switched on. */
  window.dataLayer = window.dataLayer || [];
  function track(action, label) {
    try {
      window.dataLayer.push({ event: 'lp_' + action, lp_label: label || '' });
    } catch (e) { /* analytics must never break the page */ }
  }

  $$('[data-track]').forEach(function (el) {
    el.addEventListener('click', function () { track('click', el.getAttribute('data-track')); });
  });

  /* ---------- 8. FORMS ----------
     Validated on submit, then per-field once a field has been corrected
     — validating on first blur punishes someone who has not finished typing.

     FORM_ENDPOINT beginning with "DEMO:" puts the form into demo mode: it
     validates, shows the success state and logs the payload, but posts
     nothing. Swap in the real endpoint and posting turns on with no other
     change. See HANDOVER.md item 4. */
  var ENDPOINT = C.FORM_ENDPOINT || '';
  var DEMO = /^DEMO:/i.test(ENDPOINT) || !ENDPOINT;

  var RULES = {
    name: function (v) {
      if (!v.trim()) return 'Please tell us your name.';
      if (v.trim().length < 2) return 'Please enter your full name.';
      return '';
    },
    mobile: function (v) {
      var d = v.replace(/\D/g, '');
      if (!d) return 'Please enter your mobile number.';
      /* Indian mobile numbers are ten digits and start 6-9. Accepting a
         leading 0 or +91 and stripping it is kinder than rejecting it. */
      if (d.length === 11 && d.charAt(0) === '0') d = d.slice(1);
      if (d.length === 12 && d.slice(0, 2) === '91') d = d.slice(2);
      if (d.length !== 10) return 'A mobile number is 10 digits.';
      if (!/^[6-9]/.test(d)) return 'Please check the number — it should start with 6, 7, 8 or 9.';
      return '';
    },
    email: function (v) {
      if (!v.trim()) return '';               /* optional */
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please check the email address.';
    },
    branch: function (v) { return v ? '' : 'Please choose a branch.'; },
    district: function (v) { return v ? '' : 'Please choose your district.'; },
    consent: function (v, el) { return el.checked ? '' : 'Please tick this so we may contact you.'; }
  };

  /* form.elements[name] is an element for a single control but a RadioNodeList
     for a radio group. The list carries .value (the checked value, or '') and
     nothing else — no setAttribute, no addEventListener, no .type. Both are
     guarded here rather than at every call site. */
  function isGroup(el) { return el && typeof el.setAttribute !== 'function'; }
  function groupNodes(el) { return isGroup(el) ? Array.prototype.slice.call(el) : [el]; }

  function fieldError(form, prefix, name) {
    var el = form.elements[name];
    if (!el || !RULES[name]) return '';
    var msg = RULES[name](el.value || '', el);
    var out = document.getElementById(prefix + 'e-' + name);
    if (out) {
      out.textContent = msg;
      out.hidden = !msg;
    }
    if (!isGroup(el) && el.type !== 'checkbox') {
      if (msg) el.setAttribute('aria-invalid', 'true');
      else el.removeAttribute('aria-invalid');
    }
    if (isGroup(el)) {
      var wrap = form.querySelector('.chips');
      if (wrap) wrap.classList.toggle('is-bad', !!msg);
    }
    return msg;
  }

  $$('form.lead').forEach(function (form) {
    var prefix = form.getAttribute('data-id-prefix') || '';
    var source = form.getAttribute('data-form-source') || 'unknown';
    var submit = $('.lead__submit', form);
    var status = $('.f__status', form);
    var names = Object.keys(RULES).filter(function (n) { return !!form.elements[n]; });
    var touched = {};

    names.forEach(function (n) {
      var el = form.elements[n];
      groupNodes(el).forEach(function (node) {
        if (!node || !node.addEventListener) return;
        var ev = (node.tagName === 'SELECT' || node.type === 'checkbox' || node.type === 'radio')
          ? 'change' : 'input';
        node.addEventListener(ev, function () {
          if (touched[n]) fieldError(form, prefix, n);
        });
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstBad = null;
      names.forEach(function (n) {
        touched[n] = true;
        if (fieldError(form, prefix, n) && !firstBad) firstBad = form.elements[n];
      });

      if (firstBad) {
        if (status) { status.hidden = true; status.className = 'f__status'; }
        var target = isGroup(firstBad) ? groupNodes(firstBad)[0] : firstBad;
        if (target && target.focus) target.focus();
        if (target && target.scrollIntoView) target.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
        track('form_invalid', source);
        return;
      }

      var payload = {
        source: source,
        page: location.href,
        submittedAt: new Date().toISOString()
      };
      names.forEach(function (n) {
        var el = form.elements[n];
        payload[n] = (!isGroup(el) && el.type === 'checkbox') ? !!el.checked : (el.value || '').trim();
      });

      submit.disabled = true;
      submit.textContent = 'Sending…';

      var done = function (ok) {
        submit.disabled = false;
        submit.textContent = 'Request a call back';
        if (!status) return;
        status.hidden = false;
        if (ok) {
          form.classList.add('is-sent');
          status.className = 'f__status is-ok';
          status.textContent = 'Thank you — your enquiry has reached the admission cell. We call within one working day. For anything urgent, call ' +
            ((C.org && C.org.phone) || '1800-313-2714') + '.';
          track('form_submit', source);
        } else {
          status.className = 'f__status is-bad';
          status.textContent = 'That did not go through. Please call ' +
            ((C.org && C.org.phone) || '1800-313-2714') + ' or try again in a moment.';
          track('form_error', source);
        }
      };

      if (DEMO) {
        /* Demo mode. Nothing is posted anywhere. */
        if (window.console && console.info) console.info('[demo] enquiry not sent:', payload);
        window.setTimeout(function () { done(true); }, 550);
        return;
      }

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) { done(r.ok); })
        .catch(function () { done(false); });
    });
  });

}());
