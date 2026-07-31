/* 
  Aarav Reddy's RoboLab & Portfolio Website - JavaScript Logic
  7th Standard Hyderabad Kid Portfolio
*/

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Header Scroll Effect
  const header = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Navigation Menu Toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      mobileBtn.textContent = navMenu.classList.contains('open') ? '✕' : '☰';
    });
  }

  // Smooth Scroll Link Navigation & Active Class
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        if (mobileBtn) mobileBtn.textContent = '☰';
      }
    });
  });

  // ==========================================
  // Lab Power Toggle Switch
  // ==========================================
  const labToggleBtn = document.getElementById('lab-toggle-btn');
  const powerBtnText = document.getElementById('power-btn-text');
  const powerDot = document.getElementById('power-dot');
  let isLabOnline = true;

  if (labToggleBtn) {
    labToggleBtn.addEventListener('click', () => {
      isLabOnline = !isLabOnline;
      if (isLabOnline) {
        document.body.classList.remove('lab-powered-off');
        powerBtnText.textContent = 'Lab: ONLINE ⚡';
        powerDot.style.background = 'var(--accent-green)';
        powerDot.style.boxShadow = '0 0 10px var(--accent-green)';
        playAudioBeep(880, 0.15); // High beep
      } else {
        document.body.classList.add('lab-powered-off');
        powerBtnText.textContent = 'Lab: SLEEP 💤';
        powerDot.style.background = '#ff2a85';
        powerDot.style.boxShadow = '0 0 10px #ff2a85';
        playAudioBeep(440, 0.15); // Low beep
      }
    });
  }

  // Web Audio Synthesizer Beep for Kid Tech Vibe
  function playAudioBeep(freq = 600, duration = 0.1) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio fallback silent
    }
  }

  // ==========================================
  // Project Filter Logic
  // ==========================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');
      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterVal === 'all' || category === filterVal) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ==========================================
  // Interactive Arduino Simulator Logic
  // ==========================================
  const distanceSlider = document.getElementById('distance-slider');
  const sliderValDisp = document.getElementById('slider-val-disp');
  const simRunBtn = document.getElementById('sim-run-btn');
  const simStopBtn = document.getElementById('sim-stop-btn');
  const simClearBtn = document.getElementById('sim-clear-btn');
  const serialMonitorBox = document.getElementById('serial-monitor-box');
  const simStatusBadge = document.getElementById('sim-status-badge');

  const virtualWheel = document.getElementById('virtual-wheel');
  const wheelStatusText = document.getElementById('wheel-status-text');
  const lcdLine2 = document.getElementById('lcd-line-2');
  const ledPin13 = document.getElementById('led-pin13');

  let simInterval = null;
  let isSimRunning = false;

  if (distanceSlider && sliderValDisp) {
    distanceSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      sliderValDisp.textContent = `${val} cm`;
      if (isSimRunning) {
        evaluateCircuitState(parseInt(val, 10));
      }
    });
  }

  if (simRunBtn) {
    simRunBtn.addEventListener('click', () => {
      if (isSimRunning) return;
      isSimRunning = true;
      simStatusBadge.textContent = 'STATUS: LOOP RUNNING';
      simStatusBadge.className = 'badge badge-green';
      appendSerialLog('[VOID LOOP] Starting void loop(). PWM Frequency = 490Hz.', 'info');
      playAudioBeep(700, 0.1);

      simInterval = setInterval(() => {
        const distance = parseInt(distanceSlider.value, 10);
        evaluateCircuitState(distance);
      }, 1500);
    });
  }

  if (simStopBtn) {
    simStopBtn.addEventListener('click', () => {
      stopSimulator();
    });
  }

  function stopSimulator() {
    isSimRunning = false;
    if (simInterval) clearInterval(simInterval);
    simStatusBadge.textContent = 'STATUS: PAUSED';
    simStatusBadge.className = 'badge badge-cyan';
    virtualWheel.classList.remove('spinning');
    wheelStatusText.textContent = 'DC Motor: PAUSED';
    ledPin13.classList.remove('active-red');
    appendSerialLog('[SYSTEM] Loop execution paused.', 'info');
  }

  if (simClearBtn) {
    simClearBtn.addEventListener('click', () => {
      serialMonitorBox.innerHTML = '<div class="serial-line info">[SYSTEM] Serial monitor cleared.</div>';
    });
  }

  function evaluateCircuitState(dist) {
    if (dist < 18) {
      // Obstacle close! Trigger brake & LED alert
      virtualWheel.classList.remove('spinning');
      wheelStatusText.textContent = 'DC Motor: BRAKE (0 RPM)';
      wheelStatusText.style.color = 'var(--accent-pink)';
      ledPin13.classList.add('active-red');
      lcdLine2.textContent = `> DIST: ${dist}cm | STOP`;
      lcdLine2.style.color = '#ff2a85';

      appendSerialLog(`[ULTRASONIC] Distance = ${dist} cm | < 18cm! OBSTACLE! digitalRead(PIN13) = HIGH. Motor STOP.`, 'warn');
      playAudioBeep(900, 0.08);
    } else {
      // Road clear! Spin wheel
      virtualWheel.classList.add('spinning');
      wheelStatusText.textContent = 'DC Motor: FORWARD (255 PWM)';
      wheelStatusText.style.color = 'var(--accent-green)';
      ledPin13.classList.remove('active-red');
      lcdLine2.textContent = `> DIST: ${dist}cm | CLEAR`;
      lcdLine2.style.color = '#00e676';

      appendSerialLog(`[ULTRASONIC] Distance = ${dist} cm | Clear path. analogWrite(PIN9, 255). Moving forward.`, 'info');
    }
  }

  function appendSerialLog(msg, type = '') {
    const line = document.createElement('div');
    line.className = `serial-line ${type}`;
    line.textContent = `[${new Date().toLocaleTimeString().split(' ')[0]}] ${msg}`;
    serialMonitorBox.appendChild(line);
    serialMonitorBox.scrollTop = serialMonitorBox.scrollHeight;
  }

  // Preset Helper Functions called from project cards
  window.loadSimRoverPreset = function() {
    const simSection = document.getElementById('simulator');
    simSection.scrollIntoView({ behavior: 'smooth' });
    distanceSlider.value = 12;
    sliderValDisp.textContent = '12 cm';
    if (!isSimRunning) simRunBtn.click();
    appendSerialLog('[PRESET] Loaded Obstacle Rover Code Preset! Distance set to 12cm.', 'info');
  };

  window.loadSimBinPreset = function() {
    const simSection = document.getElementById('simulator');
    simSection.scrollIntoView({ behavior: 'smooth' });
    distanceSlider.value = 8;
    sliderValDisp.textContent = '8 cm';
    if (!isSimRunning) simRunBtn.click();
    appendSerialLog('[PRESET] Loaded Smart Trash Bin Servo Preset! Hand detected near IR sensor.', 'warn');
  };

  window.triggerHomeworkDemo = function() {
    alert("📚 Aarav's Homework Alert System:\n\n'Attention Aarav! Science Lab Notebook due tomorrow! Don't forget your pencil box and umbrella!' ☔");
  };

  // ==========================================
  // Skill Bar Progress Animation on Scroll
  // ==========================================
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  const skillsSection = document.getElementById('skills');

  if (skillsSection && skillBars.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          skillBars.forEach(bar => {
            const targetWidth = bar.getAttribute('data-progress');
            bar.style.width = targetWidth;
          });
        }
      });
    }, { threshold: 0.2 });

    observer.observe(skillsSection);
  }

  // ==========================================
  // Guestbook Form Handler & Modal
  // ==========================================
  const guestForm = document.getElementById('guestbook-form');
  const confirmationModal = document.getElementById('confirmation-modal');
  const modalDescText = document.getElementById('modal-desc-text');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  if (guestForm) {
    guestForm.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'btn-submit-message') {
        e.preventDefault();
        const nameVal = document.getElementById('guest-name').value.trim() || 'Friend';
        modalDescText.textContent = `Woohoo! Thanks ${nameVal}! Aarav will read your friendly message right after finishing his Physics numericals assignment tonight! 🚀`;
        confirmationModal.classList.add('active');
        playAudioBeep(1000, 0.2);
        guestForm.reset();
      }
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      confirmationModal.classList.remove('active');
    });
  }

  // Close modal when clicking outside box
  if (confirmationModal) {
    confirmationModal.addEventListener('click', (e) => {
      if (e.target === confirmationModal) {
        confirmationModal.classList.remove('active');
      }
    });
  }
});
