/*
  Gushwork Assignment
  Vanilla HTML/CSS/JS implementation.
  Key features:
  - Responsive layout
  - Sticky header after first fold
  - Product image carousel with hover zoom
  - FAQ accordion
  - Tabs, sliders, and form validation
*/

(function () {
  'use strict';

  // Utilities for faster DOM access
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  // Validation helpers
  const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
  const isDesktop = () => window.matchMedia('(min-width: 769px)').matches;

  // Initialize all components on DOM content ready
  document.addEventListener('DOMContentLoaded', () => {
    initStickyHeader();
    initMobileMenu();
    initProductGallery();
    initFaqAccordion();
    initTabs();
    initScrollableCarousel('#industry-carousel', '.prev-industry', '.next-industry');
    initTestimonials();
    initForms();
    initSmoothScroll();
  });

  // Sticky header: shows after the hero section and hides while scrolling upward
  function initStickyHeader() {
    const stickyHeader = $('#sticky-header');
    const navbar = $('#navbar');
    const hero = $('#hero');
    if (!stickyHeader || !navbar || !hero) return;

    let lastY = window.scrollY;
    let ticking = false;

    function update() {
      const currentY = window.scrollY;
      const heroBottom = hero.offsetTop + hero.offsetHeight - 80;
      const scrollingDown = currentY > lastY;
      
      const shouldShow = currentY > heroBottom && scrollingDown;
      
      stickyHeader.classList.toggle('visible', shouldShow);
      document.body.classList.toggle('sticky-visible', shouldShow);
      navbar.classList.toggle('scrolled', currentY > 50);

      lastY = Math.max(currentY, 0);
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  // Mobile navigation: handles hamburger toggle and menu state
  function initMobileMenu() {
    const toggle = $('#mobile-toggle');
    const menu = $('#mobile-menu');
    if (!toggle || !menu) return;

    function setOpen(open) {
      toggle.classList.toggle('open', open);
      menu.classList.toggle('active', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      menu.setAttribute('aria-hidden', String(!open));
    }

    toggle.addEventListener('click', () => setOpen(!menu.classList.contains('active')));
    $$('#mobile-menu a').forEach((link) => link.addEventListener('click', () => setOpen(false)));

    menu.addEventListener('click', (event) => {
      if (event.target === menu) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  // Product gallery: manages image carousel and hover zoom for desktop
  function initProductGallery() {
    const mainImg = $('#main-product-img');
    const thumbnails = $$('.thumb');
    const prevBtn = $('#prev-img');
    const nextBtn = $('#next-img');
    const zoomContainer = $('#zoom-container');
    const zoomLens = $('#zoom-lens');

    if (!mainImg || !thumbnails.length || !prevBtn || !nextBtn || !zoomContainer || !zoomLens) return;

    const images = thumbnails.map((thumb) => ({
      src: thumb.dataset.src,
      alt: thumb.dataset.alt || 'Product image'
    })).filter((image) => image.src);

    let currentIndex = 0;

    function updateGallery(index) {
      if (!images.length) return;
      currentIndex = (index + images.length) % images.length;
      const image = images[currentIndex];

      zoomContainer.classList.add('is-changing');
      window.setTimeout(() => {
        mainImg.src = image.src;
        mainImg.alt = image.alt;
        zoomLens.style.backgroundImage = `url("${image.src}")`;
        thumbnails.forEach((thumb, thumbIndex) => thumb.classList.toggle('active', thumbIndex === currentIndex));
        zoomContainer.classList.remove('is-changing');
      }, 120);
    }

    thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => updateGallery(index));
      thumb.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          updateGallery(index);
        }
      });
    });

    prevBtn.addEventListener('click', () => updateGallery(currentIndex - 1));
    nextBtn.addEventListener('click', () => updateGallery(currentIndex + 1));

    zoomLens.style.backgroundImage = `url("${images[0].src}")`;

    // Hover zoom logic for desktop browsers
    zoomContainer.addEventListener('mousemove', (event) => {
      if (!isDesktop()) return;
      const rect = zoomContainer.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      zoomLens.style.backgroundPosition = `${x}% ${y}%`;
      zoomContainer.classList.add('zooming');
    });

    zoomContainer.addEventListener('mouseleave', () => zoomContainer.classList.remove('zooming'));
  }

  // FAQ accordion: manages toggle states and aria-expanded attributes
  function initFaqAccordion() {
    const items = $$('.faq-item');
    if (!items.length) return;

    function closeAll() {
      items.forEach((item) => {
        item.classList.remove('active');
        const button = $('.faq-question', item);
        if (button) button.setAttribute('aria-expanded', 'false');
      });
    }

    items.forEach((item) => {
      const button = $('.faq-question', item);
      if (!button) return;

      button.addEventListener('click', () => {
        const shouldOpen = !item.classList.contains('active');
        closeAll();
        if (shouldOpen) {
          item.classList.add('active');
          button.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // Manufacturing tabs: dynamic content rendering for the process section
  function initTabs() {
    const buttons = $$('.tab-btn');
    const content = $('#tab-content');
    if (!buttons.length || !content) return;

    const tabData = {
      raw: {
        title: 'Raw Material Preparation',
        desc: 'We use 100% virgin PE 100 grade resin and quality additives before the extrusion process begins.',
        bullets: ['High-density polyethylene pellets', 'UV stabilization additives', 'Carbon black for outdoor durability', 'Purity checks before processing'],
        img: 'assets/images/industry-agri.png'
      },
      extrusion: {
        title: 'Precision Extrusion',
        desc: 'Advanced extruders melt, mix, and shape the material with consistent wall thickness control.',
        bullets: ['Homogeneous melt temperature', 'Consistent wall thickness', 'Automated dosing systems', 'High output efficiency'],
        img: 'assets/images/product-main.png'
      },
      cooling: {
        title: 'Controlled Cooling',
        desc: 'Vacuum calibration and cooling tanks stabilize dimensions and reduce internal stress.',
        bullets: ['Multi-stage cooling tanks', 'Precise vacuum control', 'Uniform stress reduction', 'Stable pipe geometry'],
        img: 'assets/images/industry-const.png'
      },
      sizing: {
        title: 'Accurate Sizing',
        desc: 'Sizing sleeves and measurement systems ensure each pipe matches project specifications.',
        bullets: ['Diameter control', 'Smooth finish', 'Laser measurement', 'Automatic correction'],
        img: 'assets/images/industry-agri.png'
      },
      qc: {
        title: 'Quality Control',
        desc: 'Pipes are tested for pressure, reversion, dimensions, and material consistency.',
        bullets: ['Hydraulic pressure testing', 'Tensile testing', 'Dimensional inspection', 'Batch traceability'],
        img: 'assets/images/product-main.png'
      },
      marking: {
        title: 'Automated Marking',
        desc: 'Product details, batch numbers, and certification references are marked for traceability.',
        bullets: ['Indelible marking', 'Batch tracking', 'Meter-wise numbering', 'Brand authentication'],
        img: 'assets/images/industry-const.png'
      },
      cutting: {
        title: 'Precision Cutting',
        desc: 'Cutting machines produce clean, square ends for better joining and site handling.',
        bullets: ['Square pipe ends', 'Smooth edge finish', 'Accurate lengths', 'Low material waste'],
        img: 'assets/images/industry-agri.png'
      },
      packaging: {
        title: 'Secure Packaging',
        desc: 'Finished products are bundled and protected for safe storage, transport, and dispatch.',
        bullets: ['Protective end caps', 'Bundle strapping', 'Weather protection', 'Dispatch-ready packing'],
        img: 'assets/images/product-main.png'
      }
    };

    function renderTab(key) {
      const data = tabData[key];
      if (!data) return;

      buttons.forEach((button) => {
        const active = button.dataset.tab === key;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
      });

      content.innerHTML = `
        <div class="tab-pane" role="tabpanel">
          <div class="tab-grid">
            <div class="tab-text">
              <h3>${data.title}</h3>
              <p>${data.desc}</p>
              <ul class="check-list">${data.bullets.map((item) => `<li>${item}</li>`).join('')}</ul>
            </div>
            <div class="tab-image"><img src="${data.img}" alt="${data.title}" loading="lazy"></div>
          </div>
        </div>`;
    }

    buttons.forEach((button) => button.addEventListener('click', () => renderTab(button.dataset.tab)));
    renderTab('raw');
  }

  // Scrollable carousels: supports horizontal scrolling and pointer drag/swipe
  function initScrollableCarousel(containerSelector, prevSelector, nextSelector) {
    const container = $(containerSelector);
    const prev = $(prevSelector);
    const next = $(nextSelector);
    if (!container) return;

    const amount = () => Math.min(container.clientWidth * 0.86, 460);

    if (prev) prev.addEventListener('click', () => container.scrollBy({ left: -amount(), behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => container.scrollBy({ left: amount(), behavior: 'smooth' }));

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    container.addEventListener('pointerdown', (event) => {
      isDown = true;
      startX = event.pageX;
      scrollLeft = container.scrollLeft;
      container.classList.add('dragging');
      container.setPointerCapture(event.pointerId);
    });

    container.addEventListener('pointermove', (event) => {
      if (!isDown) return;
      event.preventDefault();
      const walk = event.pageX - startX;
      container.scrollLeft = scrollLeft - walk;
    });

    function endDrag() {
      isDown = false;
      container.classList.remove('dragging');
    }

    container.addEventListener('pointerup', endDrag);
    container.addEventListener('pointercancel', endDrag);
    container.addEventListener('mouseleave', endDrag);
  }

  // Testimonials auto-carousel: manages infinite loop, dots, and touch swipe
  function initTestimonials() {
    const container = $('.testimonial-slider-container');
    const track = $('#testimonial-track');
    const dotsContainer = $('#testimonial-dots');
    if (!container || !track || !dotsContainer) return;

    const cards = $$('.testimonial-card', track);
    if (!cards.length) return;

    let currentIndex = 0;
    let intervalId = null;
    let isDragging = false;
    let startX = 0;
    let prevTranslate = 0;
    const gap = 24;

    function getVisibleCards() {
      if (window.matchMedia('(max-width: 768px)').matches) return 1;
      if (window.matchMedia('(max-width: 992px)').matches) return 2;
      return 3;
    }

    function getMaxIndex() {
      return Math.max(0, cards.length - getVisibleCards());
    }

    function updateDots() {
      dotsContainer.innerHTML = '';
      const max = getMaxIndex();
      for (let i = 0; i <= max; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = i === currentIndex ? 'dot active' : 'dot';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => {
          goToIndex(i);
          resetAutoSlide();
        });
        dotsContainer.appendChild(dot);
      }
    }

    function goToIndex(index) {
      const max = getMaxIndex();
      if (index > max) currentIndex = 0;
      else if (index < 0) currentIndex = max;
      else currentIndex = index;

      const cardWidth = cards[0].offsetWidth;
      const translate = -currentIndex * (cardWidth + gap);
      track.style.transform = `translateX(${translate}px)`;
      
      const dots = $$('.dot', dotsContainer);
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
      prevTranslate = translate;
    }

    function startAutoSlide() {
      if (intervalId) return;
      intervalId = setInterval(() => {
        goToIndex(currentIndex + 1);
      }, 3000);
    }

    function stopAutoSlide() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    function resetAutoSlide() {
      stopAutoSlide();
      startAutoSlide();
    }

    container.addEventListener('pointerdown', (e) => {
      isDragging = true;
      startX = e.pageX;
      container.classList.add('dragging');
      stopAutoSlide();
      track.style.transition = 'none';
      container.setPointerCapture(e.pointerId);
    });

    container.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const currentX = e.pageX;
      const diff = currentX - startX;
      track.style.transform = `translateX(${prevTranslate + diff}px)`;
    });

    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      container.classList.remove('dragging');
      track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      
      const movedBy = e.pageX - startX;
      if (movedBy < -80) goToIndex(currentIndex + 1);
      else if (movedBy > 80) goToIndex(currentIndex - 1);
      else goToIndex(currentIndex);

      startAutoSlide();
    };

    container.addEventListener('pointerup', endDrag);
    container.addEventListener('pointercancel', endDrag);

    container.addEventListener('mouseenter', stopAutoSlide);
    container.addEventListener('mouseleave', startAutoSlide);

    window.addEventListener('resize', () => {
      updateDots();
      goToIndex(currentIndex);
    });

    updateDots();
    startAutoSlide();
  }

  // Form handling: basic validation and success messaging for static forms
  function initForms() {
    const catalogueForm = $('#catalogue-form');
    const quoteForm = $('#quote-form');

    if (catalogueForm) {
      catalogueForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = $('input[type="email"]', catalogueForm);
        const message = $('.form-message', catalogueForm);
        if (!input || !message) return;

        if (!isEmail(input.value)) {
          showMessage(message, 'Please enter a valid email address.', 'error');
          return;
        }
        showMessage(message, 'Catalogue request received. We will email you shortly.', 'success');
        catalogueForm.reset();
      });
    }

    if (quoteForm) {
      quoteForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const message = $('.form-message', quoteForm);
        const name = $('#full-name');
        const company = $('#company-name');
        const email = $('#email-address');
        const phone = $('#phone-number');
        if (!message || !name || !company || !email || !phone) return;

        if (!name.value.trim() || !company.value.trim() || !email.value.trim() || !phone.value.trim()) {
          showMessage(message, 'Please fill all required fields.', 'error');
          return;
        }

        if (!isEmail(email.value)) {
          showMessage(message, 'Please enter a valid email address.', 'error');
          return;
        }

        const digits = phone.value.replace(/\D/g, '');
        if (digits.length < 7 || digits.length > 15) {
          showMessage(message, 'Please enter a valid phone number.', 'error');
          return;
        }

        showMessage(message, 'Quote request submitted successfully. Our team will contact you soon.', 'success');
        quoteForm.reset();
      });
    }
  }

  function showMessage(element, text, type) {
    element.textContent = text;
    element.classList.remove('success', 'error');
    element.classList.add(type);
  }

  // Smooth scroll: updates window position with offsets for sticky navigation
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const id = anchor.getAttribute('href');
        if (!id || id === '#') return;
        const target = $(id);
        if (!target) return;
        event.preventDefault();
        const stickyVisible = document.body.classList.contains('sticky-visible');
        const offset = stickyVisible ? 170 : 100;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }
})();
