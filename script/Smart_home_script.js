/* ============================================================
   walgi_overrides.js
   Walgi — Nav toggle & Cube Slider scripts
   Load this AFTER Smart_home_script.js
   ============================================================ */

/* ── MOBILE NAV TOGGLE ── */
document.getElementById('navToggle').addEventListener('click', function () {
  document.getElementById('navLinks').classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(function (a) {
  a.addEventListener('click', function () {
    document.getElementById('navLinks').classList.remove('open');
  });
});

/* ── TRUE CUBE SLIDER ── */
(function () {
  const cube    = document.getElementById('cubeSlider');
  const prevBtn = document.getElementById('cubePrev');
  const nextBtn = document.getElementById('cubeNext');
  const thumbs  = document.querySelectorAll('.cube-thumb');
  if (!cube || !prevBtn || !nextBtn) return;

  const total = 4;
  let current  = 0;
  let rotating = false;
  let autoTimer;

  /* translateZ = half viewport width so faces wrap perfectly */
  function setTZ() {
    const tz = Math.round(window.innerWidth / 3.2);
    document.documentElement.style.setProperty('--cube-tz', tz + 'px');
  }
  setTZ();
  window.addEventListener('resize', setTZ);

  function goTo(index) {
    if (rotating) return;
    rotating = true;
    current = ((index % total) + total) % total;
    cube.style.transform = `rotateY(${-current * 90}deg)`;
    thumbs.forEach((t, i) => t.classList.toggle('active', i === current));
    setTimeout(() => { rotating = false; }, 1050);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  nextBtn.addEventListener('click', () => { next(); resetAuto(); });
  prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
  thumbs.forEach((t, i) => t.addEventListener('click', () => { goTo(i); resetAuto(); }));

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 5000);
  }
  resetAuto();
})();