(function () {
  'use strict';

  var C = window.CONTENT || {};
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function lookup(path) {
    return path.split('.').reduce(function (o, k) {
      return (o && Object.prototype.hasOwnProperty.call(o, k)) ? o[k] : undefined;
    }, C);
  }

  $$('[data-c]').forEach(function (el) {
    var v = lookup(el.getAttribute('data-c'));
    if (typeof v === 'string' && v && el.textContent.trim() !== v) el.textContent = v;
  });

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

  (function () {
    var links = $$('.hdr__nav a, .bar__scroll a');
    if (!links.length) return;

    var strip = $('#barScroll');

    var byId = {};
    links.forEach(function (a) {
      var id = (a.getAttribute('href') || '').slice(1);
      if (!id) return;
      (byId[id] = byId[id] || []).push(a);
    });
    var targets = Object.keys(byId)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean)

      .sort(function (a, b) {
        return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
      });
    if (!targets.length) return;

    var current = null;
    var queued = false;

    function slide(want) {
      if (!strip) return;
      var max = strip.scrollWidth - strip.clientWidth;
      want = Math.max(0, Math.min(want, max));
      if (Math.abs(want - strip.scrollLeft) < 2) return;
      var smooth = !window.matchMedia
        || !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (smooth && strip.scrollTo) strip.scrollTo({ left: want, behavior: 'smooth' });
      else strip.scrollLeft = want;
    }

    function reveal(a) {
      if (!strip || !a || a.parentNode !== strip) return;
      slide(a.offsetLeft - (strip.clientWidth - a.offsetWidth) / 2);
    }

    function paint() {
      queued = false;
      var line = window.innerHeight * 0.4;
      var id = null;
      for (var i = 0; i < targets.length; i++) {
        if (targets[i].getBoundingClientRect().top <= line) id = targets[i].id;
      }

      if (targets[targets.length - 1].getBoundingClientRect().bottom < line) id = null;
      if (id === current) return;
      if (current && byId[current]) {
        byId[current].forEach(function (a) { a.removeAttribute('aria-current'); });
      }
      if (id && byId[id]) {
        byId[id].forEach(function (a) { a.setAttribute('aria-current', 'true'); });
        byId[id].forEach(reveal);
      } else {
        slide(0);
      }
      current = id;
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

  (function () {
    if (!hdr) return;

    var dark = $$('.hero, .section--ink, .cta, .ftr, .band, .panel');
    if (!dark.length) return;

    var pending = false;
    function test() {
      pending = false;

      var y = hdr.getBoundingClientRect().top + hdr.offsetHeight / 2;

      var pad = hdr.classList.contains('on-dark') ? 14 : 0;
      var over = false;
      for (var i = 0; i < dark.length; i++) {
        var r = dark[i].getBoundingClientRect();
        if (r.top - pad <= y && r.bottom + pad >= y) { over = true; break; }
      }
      hdr.classList.toggle('on-dark', over);
    }
    function ask() { if (!pending) { pending = true; requestAnimationFrame(test); } }
    addEventListener('scroll', ask, { passive: true });
    addEventListener('resize', ask, { passive: true });
    test();
  }());

  (function () {
    var rivals = $$('.btn-primary');
    if (!rivals.length || !('IntersectionObserver' in window)) return;

    var visible = [];
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var i = visible.indexOf(e.target);
        if (e.isIntersecting) { if (i < 0) visible.push(e.target); }
        else if (i >= 0) { visible.splice(i, 1); }
      });
      document.documentElement.classList.toggle('red-taken', visible.length > 0);
    }, {

      threshold: 0
    });
    rivals.forEach(function (el) { io.observe(el); });
  }());

  $$('.voice').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var yt = btn.getAttribute('data-yt');
      if (!yt || btn.dataset.loaded) return;
      btn.dataset.loaded = '1';
      var f = document.createElement('iframe');

      f.src = 'https://www.youtube-nocookie.com/embed/' + yt + '?autoplay=1&rel=0';
      f.title = btn.getAttribute('aria-label') || 'Student video';
      f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
      f.setAttribute('allowfullscreen', '');
      var img = btn.querySelector('img'), play = btn.querySelector('.voice__play');
      if (img) img.remove();
      if (play) play.remove();
      btn.insertBefore(f, btn.firstChild);
      btn.style.cursor = 'default';

    });
  });

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

        $$('.acc__trigger[aria-expanded="true"]', acc).forEach(function (other) {
          closePanel(other, document.getElementById(other.getAttribute('aria-controls')));
        });
        openPanel(btn, panel);
        track('accordion', btn.textContent.trim().slice(0, 60));
      });
    });
  });

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

  window.dataLayer = window.dataLayer || [];
  function track(action, label) {
    try {
      window.dataLayer.push({ event: 'lp_' + action, lp_label: label || '' });
    } catch (e) {  }
  }

  $$('[data-track]').forEach(function (el) {
    el.addEventListener('click', function () { track('click', el.getAttribute('data-track')); });
  });

  var ENDPOINT = C.FORM_ENDPOINT || '';

  var RULES = {
    name: function (v) {
      if (!v.trim()) return 'Please tell us your name.';
      if (v.trim().length < 2) return 'Please enter your full name.';
      return '';
    },
    mobile: function (v) {
      var d = v.replace(/\D/g, '');
      if (!d) return 'Please enter your mobile number.';

      if (d.length === 11 && d.charAt(0) === '0') d = d.slice(1);
      if (d.length === 12 && d.slice(0, 2) === '91') d = d.slice(2);
      if (d.length !== 10) return 'A mobile number is 10 digits.';
      if (!/^[6-9]/.test(d)) return 'Please check the number — it should start with 6, 7, 8 or 9.';
      return '';
    },
    email: function (v) {
      if (!v.trim()) return '';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please check the email address.';
    },
    branch: function (v) { return v ? '' : 'Please choose a branch.'; },
    district: function (v) { return v ? '' : 'Please choose your district.'; },
    consent: function (v, el) { return el.checked ? '' : 'Please tick this so we may contact you.'; }
  };

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

      if (!ENDPOINT) { done(false); return; }

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) { done(r.ok); })
        .catch(function () { done(false); });
    });
  });

}());
