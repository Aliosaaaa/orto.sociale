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

  /* --- Form contatti -> messaggio WhatsApp precompilato --- */
  var WHATSAPP_NUMBER = '390000000000'; // SOSTITUIRE con il numero reale (senza + e senza spazi)
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.name.value || '').trim();
      var interest = form.interest.value;
      var message = (form.message.value || '').trim();
      var text = 'Ciao! Sono ' + name + '. Mi interessa: ' + interest + '.';
      if (message) text += '\n' + message;
      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  }

  /* --- Anno nel footer --- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
