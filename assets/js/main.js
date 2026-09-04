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

  /* ---------- 3. THE ONE LOAD REVEAL ----------
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
