/* ====================================================================
   ГЛАВНОЕ-КУХНЯ — script.js — WOW EDITION 2026
   Particles · Custom Cursor · 3D Gallery Swipe/Drag · Scroll Reveal
   Animated Counters · Tilt Cards · Modal Manager · Quiz Logic
   ==================================================================== */

'use strict';

// ──────────────────────────────────────────────────────
// 1. AMBIENT CURSOR GLOW (системный курсор НЕ скрываем)
// ──────────────────────────────────────────────────────
(function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || window.matchMedia('(hover: none)').matches) return;

  let mx = -999, my = -999;
  let cx = -999, cy = -999;
  let visible = false;

  // Show glow only after first move
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    if (!visible) {
      glow.style.opacity = '1';
      visible = true;
    }
  }, { passive: true });

  // Hide when mouse leaves the window
  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
    visible = false;
  });
  document.addEventListener('mouseenter', () => {
    glow.style.opacity = '1';
    visible = true;
  });

  function updateGlow() {
    cx += (mx - cx) * 0.07;
    cy += (my - cy) * 0.07;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    requestAnimationFrame(updateGlow);
  }
  glow.style.opacity = '0';
  glow.style.transition += ', opacity 0.3s';
  updateGlow();

  // Expand on interactive elements
  const interactives = document.querySelectorAll('button, a, .product-card, .quiz-option-card, .filter-btn, .dot, .ctrl-btn');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      glow.style.width  = '520px';
      glow.style.height = '520px';
    });
    el.addEventListener('mouseleave', () => {
      glow.style.width  = '380px';
      glow.style.height = '380px';
    });
  });
})();

// ──────────────────────────────────────────────────────
// 2. PARTICLE CANVAS
// ──────────────────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1.8 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.life = Math.random();
      this.maxLife = Math.random() * 0.008 + 0.003;
      this.growing = true;
      this.alpha = 0;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.growing) {
        this.alpha += this.maxLife;
        if (this.alpha >= 0.6) this.growing = false;
      } else {
        this.alpha -= this.maxLife;
        if (this.alpha <= 0) this.reset();
      }
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha * 0.45; // нежнее на светлом фоне
      // золотые и тёплые амберные частицы мраморной пыли
      const palette = ['#b8942a', '#c9a036', '#d4af37', '#c85e00', '#a0845a'];
      ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 90; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

// ──────────────────────────────────────────────────────
// 3. PARALLAX HERO ON SCROLL
// ──────────────────────────────────────────────────────
(function initParallax() {
  const heroBg = document.getElementById('heroBg');
  const heroContent = document.getElementById('heroContent');
  if (!heroBg) return;

  function onScroll() {
    const scrollY = window.scrollY;
    const speed = 0.4;
    heroBg.style.transform = `translateY(${scrollY * speed}px) scale(1.08)`;
    if (heroContent) {
      heroContent.style.transform = `translateY(${scrollY * 0.15}px)`;
      heroContent.style.opacity = 1 - scrollY / 600;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ──────────────────────────────────────────────────────
// 4. HEADER — SCROLL STYLE CHANGE
// ──────────────────────────────────────────────────────
(function initHeaderScroll() {
  const header   = document.getElementById('mainHeader');
  const progress = document.getElementById('scrollProgress');
  if (!header) return;

  function onScroll() {
    const scrolled = window.scrollY;
    const docH     = document.documentElement.scrollHeight - window.innerHeight;

    // Header state
    header.classList.toggle('scrolled', scrolled > 60);

    // Scroll progress bar
    if (progress && docH > 0) {
      progress.style.width = Math.min((scrolled / docH) * 100, 100) + '%';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // init on load
})();

// ──────────────────────────────────────────────────────
// 5. SCROLL REVEAL — INTERSECTION OBSERVER
// ──────────────────────────────────────────────────────
(function initReveal() {
  const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  
  function checkVisible() {
    els.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });
  }

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '50px 0px 50px 0px' });
    els.forEach(el => obs.observe(el));
  }
  
  // Instant check on init & scroll
  checkVisible();
  window.addEventListener('scroll', checkVisible, { passive: true });
})();

// ──────────────────────────────────────────────────────
// 6. ANIMATED COUNTERS
// ──────────────────────────────────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll('.counter');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          el.textContent = target;
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current);
        }
      }, 16);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
})();

// ──────────────────────────────────────────────────────
// 7. 3D GALLERY VIEWER — DRAG / SWIPE / BUTTONS
// ──────────────────────────────────────────────────────
(function init3DGallery() {
  const scene = document.getElementById('scene3d');
  if (!scene) return;

  const cards = scene.querySelectorAll('.scene3d-card');
  const dots  = document.querySelectorAll('.viewer3d-dots .dot');
  let current = 0;
  let isDragging = false;
  let startX = 0;
  let dragDelta = 0;
  let autoTimer = null;

  function showView(idx) {
    cards.forEach((c, i) => c.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    current = idx;
  }
  showView(0);

  // Button rotate
  window.rotateScene = function(dir) {
    const next = (current + dir + cards.length) % cards.length;
    showView(next);
    resetAutoplay();
  };

  // Dot jump
  window.jumpToView = function(idx) {
    showView(idx);
    resetAutoplay();
  };

  // Drag support — mouse
  scene.addEventListener('mousedown', e => { isDragging = true; startX = e.clientX; scene.style.cursor = 'grabbing'; });
  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    dragDelta = e.clientX - startX;
  });
  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    scene.style.cursor = 'grab';
    if (Math.abs(dragDelta) > 60) {
      window.rotateScene(dragDelta < 0 ? 1 : -1);
    }
    dragDelta = 0;
  });

  // Touch support
  scene.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  scene.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) window.rotateScene(dx < 0 ? 1 : -1);
  });

  // Autoplay
  function startAutoplay() {
    autoTimer = setInterval(() => rotateScene(1), 4000);
  }
  function resetAutoplay() {
    clearInterval(autoTimer);
    startAutoplay();
  }
  startAutoplay();

  // Pause on hover
  scene.addEventListener('mouseenter', () => clearInterval(autoTimer));
  scene.addEventListener('mouseleave', () => startAutoplay());
})();

// ──────────────────────────────────────────────────────
// 8. TILT CARDS
// ──────────────────────────────────────────────────────
(function initTilt() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -10;
      card.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

// ──────────────────────────────────────────────────────
// 9. MOBILE MENU
// ──────────────────────────────────────────────────────
window.toggleMobileMenu = function(forceClose) {
  const nav = document.getElementById('mobileNav');
  const btn = document.getElementById('burgerBtn');
  if (!nav) return;
  const shouldOpen = forceClose === false ? false : !nav.classList.contains('open');
  nav.classList.toggle('open', shouldOpen);
  if (btn) btn.classList.toggle('open', shouldOpen);
};

// Close mobile menu on click outside header
document.addEventListener('click', e => {
  const header = document.getElementById('mainHeader');
  const nav = document.getElementById('mobileNav');
  if (nav && nav.classList.contains('open') && header && !header.contains(e.target)) {
    window.toggleMobileMenu(false);
  }
});

// ──────────────────────────────────────────────────────
// 10. QUIZ LOGIC + TOUCH SWIPE
// ──────────────────────────────────────────────────────
let quizStep = 1;
const TOTAL_STEPS = 4;

window.changeStep = function(delta) {
  const cur = document.querySelector(`.quiz-step[data-step="${quizStep}"]`);
  if (cur) cur.classList.remove('active');
  quizStep = Math.max(1, Math.min(TOTAL_STEPS, quizStep + delta));
  const next = document.querySelector(`.quiz-step[data-step="${quizStep}"]`);
  if (next) next.classList.add('active');

  const progress = document.getElementById('quizProgress');
  const stepNum  = document.getElementById('stepNum');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  if (progress) progress.style.width = `${(quizStep / TOTAL_STEPS) * 100}%`;
  if (stepNum)  stepNum.textContent = quizStep;
  if (prevBtn)  prevBtn.style.display = quizStep === 1 ? 'none' : 'inline-flex';
  if (nextBtn)  nextBtn.style.display = quizStep === TOTAL_STEPS ? 'none' : 'inline-flex';
};

// Quiz touch swipe support for mobile
(function initQuizSwipe() {
  const quizCard = document.querySelector('.quiz-card');
  if (!quizCard) return;
  let startX = 0, startY = 0;
  quizCard.addEventListener('touchstart', e => {
    // Avoid interfering with range slider
    if (e.target.type === 'range') return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  quizCard.addEventListener('touchend', e => {
    if (e.target.type === 'range') return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    // Horizontal swipe threshold 60px, vertical tolerance 40px
    if (Math.abs(dx) > 60 && Math.abs(dy) < 40) {
      if (dx < 0 && quizStep < TOTAL_STEPS) window.changeStep(1);
      else if (dx > 0 && quizStep > 1) window.changeStep(-1);
    }
  });
})();

window.submitQuiz = function() {
  const phone   = document.getElementById('quizPhone');
  const consent = document.getElementById('quizConsent');
  if (!phone || !phone.value.trim()) {
    flashInput(phone); return;
  }
  if (!consent || !consent.checked) {
    alert('Пожалуйста, примите условия оферты и согласие на обработку данных для получения расчёта.');
    return;
  }
  const name = document.getElementById('quizName');
  showSuccessNotification(`Спасибо${name && name.value ? ', ' + name.value : ''}! Ваш 3D-проект и смета формируются. Перезвоним на ${phone.value} в течение 5 минут.`);
};

// ──────────────────────────────────────────────────────
// 11. CATALOG FILTER
// ──────────────────────────────────────────────────────
window.filterCatalog = function(category, btn) {
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const cards   = document.querySelectorAll('.product-card');
  const empty   = document.getElementById('catalogEmpty');
  let   visible = 0;

  cards.forEach(card => {
    const show = category === 'all' || card.dataset.category === category;
    if (show) {
      card.style.display    = '';
      card.style.opacity    = '0';
      card.style.transform  = 'translateY(16px)';
      // Stagger entry — on grid: 40ms steps
      setTimeout(() => {
        card.style.transition = 'opacity 250ms ease, transform 250ms ease';
        card.style.opacity    = '1';
        card.style.transform  = 'none';
      }, visible * 60);
      visible++;
    } else {
      card.style.display = 'none';
    }
  });

  // Show / hide empty state
  if (empty) empty.classList.toggle('visible', visible === 0);
};

// ──────────────────────────────────────────────────────
// 12. MODAL MANAGER
// ──────────────────────────────────────────────────────
const MODALS = ['callback', 'offer', 'pd', 'consent', 'return'];

window.openLegalModal = function(type) {
  // Close any open modals first
  MODALS.forEach(m => {
    const el = document.getElementById(`modal-${m}`);
    if (el) el.classList.remove('active');
  });
  const modal = document.getElementById(`modal-${type}`);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeLegalModal = function(event, type) {
  if (event.target.id === `modal-${type}`) closeLegalModalDirect(type);
};

window.closeLegalModalDirect = function(type) {
  const modal = document.getElementById(`modal-${type}`);
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
};

window.switchModal = function(fromType, toType) {
  closeLegalModalDirect(fromType);
  setTimeout(() => openLegalModal(toType), 150);
};

// Legacy alias for old onclick handlers
window.openModal = function(type) { openLegalModal(type); };

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    MODALS.forEach(m => closeLegalModalDirect(m));
  }
});

// ──────────────────────────────────────────────────────
// 13. FORM SUBMITS
// ──────────────────────────────────────────────────────
window.submitModalForm = function(type) {
  const consent = document.getElementById('cbConsent');
  if (!consent || !consent.checked) {
    alert('Пожалуйста, дайте согласие на обработку персональных данных.');
    return;
  }
  closeLegalModalDirect(type);
  showSuccessNotification('Заявка принята! Наш дизайнер перезвонит вам в течение 5 минут 🎉');
};

window.submitCTAForm = function(form) {
  const phone = form.querySelector('[type="tel"]');
  if (!phone || !phone.value.trim()) { flashInput(phone); return; }
  showSuccessNotification('Замерщик выезжает! Мы перезвоним для уточнения адреса и удобного времени 📐');
};

// ──────────────────────────────────────────────────────
// 14. HELPER: SUCCESS NOTIFICATION (TOAST)
// ──────────────────────────────────────────────────────
function showSuccessNotification(message) {
  const existing = document.getElementById('toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast-notification';
  toast.style.cssText = `
    position: fixed; bottom: 2rem; right: 2rem; z-index: 9999;
    background: linear-gradient(135deg, #10131a, #1e2430);
    border: 1px solid rgba(212,175,55,0.4);
    border-radius: 16px;
    padding: 1.25rem 1.75rem;
    max-width: 380px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.1);
    color: #f0f2f5;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9rem;
    line-height: 1.6;
    animation: toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  `;

  const icon = document.createElement('span');
  icon.textContent = '✅';
  icon.style.fontSize = '1.4rem';
  icon.style.flexShrink = '0';

  const text = document.createElement('span');
  text.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(text);
  document.body.appendChild(toast);

  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(20px) scale(0.9); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes toastOut {
      to { opacity: 0; transform: translateY(10px) scale(0.95); }
    }
    @media (max-width: 768px) {
      #toast-notification {
        bottom: calc(82px + env(safe-area-inset-bottom)) !important;
        right: 12px !important;
        left: 12px !important;
        max-width: none !important;
        padding: 1rem 1.25rem !important;
      }
    }
  `;
  if (!document.getElementById('toast-style')) {
    style.id = 'toast-style';
    document.head.appendChild(style);
  }

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// ──────────────────────────────────────────────────────
// 15. HELPER: FLASH INPUT ON ERROR
// ──────────────────────────────────────────────────────
function flashInput(el) {
  if (!el) return;
  el.style.borderColor = '#f87171';
  el.style.boxShadow = '0 0 0 3px rgba(248,113,113,0.2)';
  el.focus();
  setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 2000);
}

// ──────────────────────────────────────────────────────
// 16. SMOOTH SCROLL HELPER
// ──────────────────────────────────────────────────────
window.scrollToElement = function(id) {
  const el = document.getElementById(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

// ──────────────────────────────────────────────────────
// 17. URGENCY COUNTER (fake slots countdown for scarcity)
// ──────────────────────────────────────────────────────
(function initUrgency() {
  const el = document.querySelector('.urgency-num');
  if (!el) return;
  // Simulate depleting slots slowly
  let slots = parseInt(el.textContent, 10) || 4;
  const storedSlots = sessionStorage.getItem('gk_slots');
  if (storedSlots !== null) {
    slots = parseInt(storedSlots, 10);
    el.textContent = slots;
  }
  setInterval(() => {
    if (Math.random() < 0.003 && slots > 1) {
      slots--;
      el.textContent = slots;
      sessionStorage.setItem('gk_slots', slots);
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = 'blink 0.5s ease 2';
    }
  }, 3000);
})();

// ──────────────────────────────────────────────────────
// 18. HOVER GLOW ON PRODUCT CARDS (extra shimmer on desktop)
// ──────────────────────────────────────────────────────
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(180,144,48,0.10) 0%, rgba(255,255,255,0.90) 70%)`;
    });
    card.addEventListener('mouseleave', () => { card.style.background = ''; });
  });
}

// ──────────────────────────────────────────────────────
// 19. STICKY MOBILE BAR OBSERVER
// ──────────────────────────────────────────────────────
(function initStickyMobileBar() {
  const bar = document.getElementById('mobileStickyBar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      bar.classList.add('visible');
    } else {
      bar.classList.remove('visible');
    }
  }, { passive: true });
})();

// ──────────────────────────────────────────────────────
// INIT COMPLETE
// ──────────────────────────────────────────────────────
console.log('%c ✨ Главное-Кухня — Premium Web 2026 ✨ ', 'background:#e65c00;color:#fff;padding:8px 16px;border-radius:8px;font-weight:bold;');

