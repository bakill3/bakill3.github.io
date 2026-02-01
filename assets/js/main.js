// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Reveal on scroll =====
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ===== Card tilt (GPU transforms, never blocks clicks) =====
document.querySelectorAll('.tilt').forEach(card => {
  let raf = null;
  function onMove(e) {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = (y - 0.5) * 6;
    const ry = (0.5 - x) * 8;
    if (!raf) {
      raf = requestAnimationFrame(() => {
        card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        raf = null;
      });
    }
  }
  card.addEventListener('mousemove', onMove, { passive: true });
  card.addEventListener('mouseleave', () => (card.style.transform = 'rotateX(0) rotateY(0)'));
});

// ===== Smooth in-page anchors =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ===== Mobile sheet menu =====
(function(){
  const sheet = document.getElementById('mobile-menu');
  const openBtn = document.querySelector('.hamburger');
  if (!sheet || !openBtn) return;
  const closeBtn = sheet.querySelector('.sheet-close');
  const backdrop = sheet.querySelector('[data-close]');
  const open = () => { sheet.hidden = false; openBtn.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; };
  const close = () => { sheet.hidden = true; openBtn.setAttribute('aria-expanded','false'); document.body.style.overflow=''; };
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && !sheet.hidden) close(); });
  sheet.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
})();

// ===== Modals (skills + education) =====
(function(){
  function open(modal){ modal.hidden = false; document.body.style.overflow = 'hidden'; modal.querySelector('.modal-close')?.focus(); }
  function close(modal){ modal.hidden = true; document.body.style.overflow = ''; }

  document.addEventListener('click', (e)=>{
    const trigger = e.target.closest('[data-modal]');
    if (trigger){
      const id = trigger.dataset.modal;
      const modal = document.getElementById(id);
      if (modal){ open(modal); }
      return;
    }
    if (e.target.hasAttribute('data-close') || e.target.closest('[data-close]')){
      const m = e.target.closest('.modal'); if (m) close(m);
    }
  });

  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape'){
      const m = document.querySelector('.modal:not([hidden])');
      if (m) { close(m); }
    }
  });
})();

// ===== Year rail + Education spans (Experience stays stacked) =====
(function(){
  const timeline = document.getElementById('timeline');
  const eduStage = document.getElementById('edu-stage');
  const ticksWrap = document.getElementById('year-ticks');
  if (!timeline || !eduStage || !ticksWrap) return;

  const START = 2015;
  const END = new Date().getFullYear();
  const TOTAL = END - START;

  function drawTicks(H){
    ticksWrap.style.height = H + 'px';
    ticksWrap.innerHTML = '';
    for (let y = END; y >= START; y--){
      const pct = (END - y) / TOTAL;
      const top = Math.round(pct * H);
      const label = document.createElement('div');
      label.className = 'label';
      label.style.top = top + 'px';
      label.textContent = y;
      const tick = document.createElement('div');
      tick.className = 'tick';
      tick.style.top = top + 'px';
      ticksWrap.appendChild(label);
      ticksWrap.appendChild(tick);
    }
  }

  function placeEducation(H){
    eduStage.querySelectorAll('.edu-card').forEach(card=>{
      const s = parseInt(card.dataset.start,10);
      const e = parseInt(card.dataset.end,10);
      const clamp = (v,min,max)=>Math.min(Math.max(v,min),max);

      const topPct = (END - Math.min(END, e)) / TOTAL;      // end year at top
      const bottomPct = (END - Math.max(START, s)) / TOTAL; // start year at bottom
      const top = Math.round(clamp(topPct,0,1) * H);
      const bottom = Math.round(clamp(bottomPct,0,1) * H);
      const height = Math.max(72, bottom - top - 6);

      card.style.top = `${top}px`;
      card.style.height = `${height}px`;
    });
  }

  function sync(){
    const H = Math.max(timeline.scrollHeight, eduStage.scrollHeight, 900);
    eduStage.style.height = H + 'px';
    drawTicks(H);
    placeEducation(H);
  }

  window.addEventListener('load', sync);
  window.addEventListener('resize', ()=> requestAnimationFrame(sync));
})();