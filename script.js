(() => {
  'use strict';

  const qs = (s, p = document) => p.querySelector(s);
  const qsa = (s, p = document) => [...p.querySelectorAll(s)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll progress + subtle Earth parallax
  const progress = qs('#scrollProgress');
  const earth = qs('#earth');
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    if (earth && !reducedMotion && y < innerHeight * 1.2) {
      earth.style.transform = `rotate(${-8 + y * 0.012}deg) translateY(${y * 0.035}px)`;
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on intersection
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  qsa('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min((i % 4) * 70, 210)}ms`;
    observer.observe(el);
  });

  // Star field canvas
  const starCanvas = qs('#starfield');
  const sctx = starCanvas.getContext('2d');
  let stars = [];
  const resizeStars = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    starCanvas.width = innerWidth * dpr;
    starCanvas.height = innerHeight * dpr;
    starCanvas.style.width = `${innerWidth}px`;
    starCanvas.style.height = `${innerHeight}px`;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(240, Math.floor((innerWidth * innerHeight) / 7000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.15 + .15,
      a: Math.random() * .5 + .12,
      s: Math.random() * .11 + .02
    }));
  };
  const drawStars = (t = 0) => {
    sctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const star of stars) {
      const twinkle = reducedMotion ? 1 : .72 + Math.sin(t * .001 * star.s * 20 + star.x) * .28;
      sctx.beginPath();
      sctx.fillStyle = `rgba(218,235,232,${star.a * twinkle})`;
      sctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      sctx.fill();
    }
    if (!reducedMotion) requestAnimationFrame(drawStars);
  };
  resizeStars();
  addEventListener('resize', resizeStars);
  drawStars();

  // Interactive 24h Earth clock
  const slider = qs('#timeSlider');
  const hand = qs('#dialHand');
  const clockTime = qs('#clockTime');
  const yearsAgo = qs('#yearsAgo');
  const eraName = qs('#eraName');
  const eraSub = qs('#eraSub');
  const eraGlyph = qs('#eraGlyph');
  const eventCaption = qs('#eventCaption');

  const earthAge = 4.54e9;
  const moments = [
    { p: 0, era: 'Hadean', sub: 'A planet under construction', glyph: '●', text: 'A molten young Earth is assembling from collisions, heat, and gravity.' },
    { p: .10, era: 'Hadean', sub: 'Crust, oceans, impacts', glyph: '◉', text: 'The surface cools enough for crust and persistent liquid water while impacts remain common.' },
    { p: .155, era: 'Archean', sub: 'The microbial world', glyph: '⊙', text: 'The oldest evidence for life points to a planet already inhabited by simple microbes.' },
    { p: .33, era: 'Archean', sub: 'Photosynthesis spreads', glyph: '✦', text: 'Photosynthetic microbes capture sunlight and release oxygen, slowly changing the chemistry of Earth.' },
    { p: .48, era: 'Proterozoic', sub: 'Oxygen transforms Earth', glyph: '○', text: 'Atmospheric oxygen rises dramatically, opening new biochemical possibilities while disrupting anaerobic life.' },
    { p: .68, era: 'Proterozoic', sub: 'Complex cells diversify', glyph: '✺', text: 'Eukaryotic cells—cells with internal structures and nuclei—are widespread.' },
    { p: .82, era: 'Proterozoic', sub: 'Snowball worlds', glyph: '❄', text: 'Repeated global-scale glaciations push ice toward the tropics before the planet thaws again.' },
    { p: .89, era: 'Phanerozoic', sub: 'Animals become visible', glyph: '✧', text: 'Complex animal ecosystems expand, followed by the Cambrian diversification of body plans.' },
    { p: .94, era: 'Paleozoic', sub: 'Life conquers land', glyph: '♣', text: 'Plants, fungi, arthropods, and vertebrates establish increasingly complex ecosystems on land.' },
    { p: .985, era: 'Mesozoic', sub: 'Age of dinosaurs', glyph: '◇', text: 'Dinosaurs dominate terrestrial ecosystems while the first birds and mammals evolve.' },
    { p: .997, era: 'Cenozoic', sub: 'Mammal radiation', glyph: '◌', text: 'After the end-Cretaceous extinction, mammals and birds rapidly diversify into newly opened niches.' },
    { p: .999934, era: 'Human', sub: 'A geological instant', glyph: '✶', text: 'Homo sapiens appears. Nearly the entire planetary day has already passed.' },
    { p: 1, era: 'Now', sub: 'The clock is still running', glyph: '│', text: 'Midnight is not an ending. It is simply the edge of the page we can currently read.' }
  ];

  function formatAgo(years) {
    if (years >= 1e9) return `${(years / 1e9).toFixed(years > 4e9 ? 2 : 1)} billion years ago`;
    if (years >= 1e6) return `${(years / 1e6).toFixed(years > 100e6 ? 0 : 1)} million years ago`;
    if (years >= 1e3) return `${Math.round(years / 1000).toLocaleString()} thousand years ago`;
    if (years > 1) return `${Math.round(years).toLocaleString()} years ago`;
    return 'now';
  }

  function updateClock() {
    const p = Number(slider.value) / 1000;
    const seconds = p * 86400;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    clockTime.textContent = [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
    yearsAgo.textContent = formatAgo(earthAge * (1 - p));
    hand.style.transform = `rotate(${p * 360 - 90}deg)`;
    slider.style.setProperty('--progress', `${p * 100}%`);
    let moment = moments[0];
    for (const item of moments) if (p >= item.p) moment = item;
    eraName.textContent = moment.era;
    eraSub.textContent = moment.sub;
    eraGlyph.textContent = moment.glyph;
    eventCaption.textContent = moment.text;
  }
  slider.addEventListener('input', updateClock);
  updateClock();

  // Extinction event console
  const extinctionData = {
    ordovician: { pct: '~85%', unit: 'marine species lost', cause: 'Rapid cooling + glaciation', story: 'A severe ice age and sea-level fall transform shallow marine habitats at the end of the Ordovician.' },
    devonian: { pct: '~75%', unit: 'species lost', cause: 'Ocean anoxia + climate stress', story: 'A long series of pulses destabilizes marine ecosystems, especially reefs, over millions of years.' },
    permian: { pct: '>80%', unit: 'marine species lost', cause: 'Mass volcanism + extreme warming', story: 'The largest known mass extinction follows immense volcanism, greenhouse warming, ocean acidification, and oxygen loss.' },
    triassic: { pct: '~80%', unit: 'species lost', cause: 'Volcanism + carbon release', story: 'Enormous eruptions linked to the opening Atlantic drive rapid climate and ocean chemistry change.' },
    cretaceous: { pct: '~76%', unit: 'species lost', cause: 'Asteroid impact + global darkness', story: 'An asteroid strikes near today’s Yucatán Peninsula. Dust, soot, and aerosols crash food webs worldwide.' }
  };
  const tabs = qsa('.extinction-tab');
  const corePct = qs('#extinctionPercent');
  const coreUnit = qs('.extinction-core small');
  const cause = qs('#extinctionCause');
  const story = qs('#extinctionStory');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const d = extinctionData[tab.dataset.event];
    corePct.textContent = d.pct;
    coreUnit.textContent = d.unit;
    cause.textContent = d.cause;
    story.textContent = d.story;
    const visual = qs('#extinctionVisual');
    visual.animate([{ opacity: .65, transform: 'scale(.99)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 320, easing: 'ease-out' });
  }));

  // Planetary pulse canvas
  const pulseCanvas = qs('#pulseCanvas');
  const pctx = pulseCanvas.getContext('2d');
  const bands = [
    { amp: 23, freq: .015, speed: .00035, y: .22 },
    { amp: 34, freq: .010, speed: -.00024, y: .43 },
    { amp: 27, freq: .019, speed: .00019, y: .64 },
    { amp: 19, freq: .012, speed: -.00031, y: .81 }
  ];
  const drawPulse = (t = 0) => {
    const rect = pulseCanvas.getBoundingClientRect();
    const w = rect.width;
    const h = Math.max(300, rect.height);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    if (pulseCanvas.width !== Math.round(w * dpr) || pulseCanvas.height !== Math.round(h * dpr)) {
      pulseCanvas.width = Math.round(w * dpr); pulseCanvas.height = Math.round(h * dpr); pctx.setTransform(dpr,0,0,dpr,0,0);
    }
    pctx.clearRect(0,0,w,h);
    pctx.strokeStyle = 'rgba(202,223,216,.07)'; pctx.lineWidth = 1;
    for (let x=0; x<w; x+=w/12) { pctx.beginPath(); pctx.moveTo(x,0); pctx.lineTo(x,h); pctx.stroke(); }
    bands.forEach((b, idx) => {
      pctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const chaos = Math.sin(x * b.freq * 2.7 - t * b.speed * .6) * b.amp * .25;
        const y = h * b.y + Math.sin(x * b.freq + t * b.speed) * b.amp + chaos;
        if (x === 0) pctx.moveTo(x,y); else pctx.lineTo(x,y);
      }
      pctx.strokeStyle = idx === 2 ? 'rgba(186,255,99,.55)' : idx === 1 ? 'rgba(99,230,255,.34)' : 'rgba(190,212,205,.22)';
      pctx.lineWidth = idx === 2 ? 1.5 : 1;
      pctx.stroke();
    });
    if (!reducedMotion) requestAnimationFrame(drawPulse);
  };
  drawPulse();

  // Tiny optional ambient synth. Starts only after explicit user interaction.
  let audioCtx, nodes = [];
  const soundToggle = qs('#soundToggle');
  function startSound() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const master = audioCtx.createGain();
    master.gain.value = .028;
    master.connect(audioCtx.destination);
    [55, 82.5, 110].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      gain.gain.value = i === 0 ? .52 : .16;
      filter.type = 'lowpass'; filter.frequency.value = 240 + i * 80;
      osc.connect(filter); filter.connect(gain); gain.connect(master); osc.start();
      nodes.push(osc);
    });
  }
  function stopSound() {
    nodes.forEach(n => { try { n.stop(); } catch {} });
    nodes = [];
    if (audioCtx) audioCtx.close();
    audioCtx = null;
  }
  soundToggle.addEventListener('click', () => {
    const next = soundToggle.getAttribute('aria-pressed') !== 'true';
    soundToggle.setAttribute('aria-pressed', String(next));
    next ? startSound() : stopSound();
  });
})();
