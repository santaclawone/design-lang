/* ─── Design Lang Runtime ─── */

if (typeof DesignLang === 'undefined') {
  window.DesignLang = {};

  // Spring physics solver
  DesignLang.spring = function(selector, params) {
    const el = document.querySelector(selector);
    if (!el) return;
    const { stiffness = 180, damping = 20, mass = 0.012 } = params;
    let vx = 0;
    let target = 1;
    let current = 1;

    el.addEventListener('mouseenter', () => { target = 1.04; });
    el.addEventListener('mouseleave', () => { target = 1; });
    el.addEventListener('mousedown', () => { target = 0.95; });
    el.addEventListener('mouseup', () => { target = 1.04; });

    function tick() {
      const force = stiffness * (target - current);
      const damp = damping * vx;
      const accel = (force - damp) / mass;
      vx += accel * 0.016;
      current += vx * 0.016;
      el.style.transform = 'scale(' + current + ')';
      if (Math.abs(target - current) > 0.001 || Math.abs(vx) > 0.001) {
        requestAnimationFrame(tick);
      }
    }

    el.addEventListener('mouseenter', () => requestAnimationFrame(tick));
    el.addEventListener('mousedown', () => requestAnimationFrame(tick));
  };

  // Haptic feedback
  DesignLang.haptic = function(selector, params) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate(params.force || 25);
    });
  };

  // Audio feedback
  DesignLang.audio = function(selector, params) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.addEventListener('mouseenter', () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = params.hover || 880;
        osc.type = 'sine';
        gain.gain.value = 0.05;
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } catch(e) {}
    });
  };

  // Cursor glow
  DesignLang.cursor = function(selector) {
    // Implemented in the compiled CSS/HTML setup
  };

  // Tooltip
  DesignLang.tooltip = function(selector) {
    // Implemented in the compiled CSS/HTML setup
  };
}


/* ─── Component Initialization ─── */

DesignLang.spring('.dl-primary-button', { stiffness: 180, damping: 20, mass: 0.012 });


DesignLang.haptic('.dl-primary-button', { force: 25 });