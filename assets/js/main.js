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

    /* Attribute hooks: data-c-href="org.phoneHref" sets href. */
    Array.prototype.forEach.call(document.querySelectorAll('[data-c-href]'), function (el) {
      var v = lookup(el.getAttribute('data-c-href'));
      if (typeof v === 'string' && v && !UNFILLED.test(v)) el.setAttribute('href', v);
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

  /* ---------- 4. THE ONE LOAD REVEAL ----------
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
