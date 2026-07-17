/* Orto Sociale — JS minimale (menu, reveal, form WhatsApp, anno) */
(function () {
  'use strict';

  /* --- Menu mobile --- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    });
    // chiudi il menu quando si sceglie una voce
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* --- Reveal on scroll (rispetta prefers-reduced-motion) --- */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll(
      '.section-head, .step, .benefit, .plot, .testimonial, .faq-item, .split-text, .split-media, .stat'
    );
    targets.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    /* rootMargin superiore enorme: se l'utente scorre velocissimo e "salta" un
       elemento, questo risulta comunque intersecante e viene rivelato. */
    }, { threshold: 0.05, rootMargin: '10000px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* --- Form richiesta -> Google Sheet (Apps Script) + pagina di ringraziamento --- */

  // 1) URL "/exec" del Web App di Apps Script che salva i lead sul Google Sheet.
  var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw79qa6g8AH0dg11sejeUSKuTYr5KcwrTEEQ-WfgjsK0swbLC5c2TeRGEEFBEW3cSkuNQ/exec';

  var form = document.getElementById('contact-form');
  if (form) {
    var btn = document.getElementById('submit-btn');
    var note = document.getElementById('form-note');
    var btnLabel = btn ? btn.textContent : '';

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot: se compilato è un bot -> fingi successo senza inviare.
      if (form.website && form.website.value) { window.location.href = 'grazie.html'; return; }

      if (!form.checkValidity()) { form.reportValidity(); return; }

      if (btn) { btn.disabled = true; btn.textContent = 'Invio in corso…'; }

      var data = new URLSearchParams({
        name: (form.name.value || '').trim(),
        phone: (form.phone.value || '').trim(),
        email: (form.email.value || '').trim(),
        interest: form.interest.value,
        message: (form.message.value || '').trim(),
        page: window.location.href
      });

      var vaiAlGrazie = function () { window.location.href = 'grazie.html'; };

      // Se l'URL non è ancora configurato, non bloccare l'utente: vai al grazie.
      if (SCRIPT_URL.indexOf('http') !== 0) { vaiAlGrazie(); return; }

      // sendBeacon: invia i dati in modo affidabile ANCHE mentre la pagina naviga
      // (la fetch verrebbe annullata dal redirect). Body form-encoded = niente CORS preflight.
      var inviato = false;
      try { inviato = navigator.sendBeacon && navigator.sendBeacon(SCRIPT_URL, data); } catch (err) { inviato = false; }

      if (inviato) { vaiAlGrazie(); return; }

      // Fallback per browser senza sendBeacon: fetch keepalive (sopravvive alla navigazione).
      fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: data, keepalive: true })
        .then(vaiAlGrazie)
        .catch(vaiAlGrazie);
    });
  }

  /* --- Anno nel footer --- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
