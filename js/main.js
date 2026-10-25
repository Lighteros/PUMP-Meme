/* $PUMP · Pretty Unreal Massive Pair · v2 scroll site */
// ---- CONFIG: fill these in ----
const CONFIG = {
  ca: '',                                   // Solana mint. TBA. (legacy placeholder "xxpump" counts as unset)
  x: 'https://x.com/PUMPMassivePair',
  tg: '',                                   // Telegram invite. TBA.
};
// --------------------------------

const isMint = (s) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s || '');
const hasCA = isMint(CONFIG.ca);
const LINKS = {
  buy: hasCA ? 'https://pump.fun/coin/' + CONFIG.ca : '',
  chart: hasCA ? 'https://dexscreener.com/solana/' + CONFIG.ca : '',
  solscan: hasCA ? 'https://solscan.io/token/' + CONFIG.ca : '',
  x: CONFIG.x,
  tg: CONFIG.tg,
};

/* links: live when set, SOON when not */
document.querySelectorAll('[data-link]').forEach((a) => {
  const url = LINKS[a.dataset.link];
  if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
  else {
    a.removeAttribute('href'); a.classList.add('is-soon'); a.setAttribute('aria-disabled', 'true');
    a.title = a.dataset.link === 'tg' ? 'Telegram: coming soon' : 'Coming soon: contract address not announced yet';
  }
});

/* contract strip */
const caEl = document.querySelector('.js-ca');
const copyBtn = document.querySelector('.js-copy');
if (hasCA) {
  caEl.textContent = CONFIG.ca; copyBtn.disabled = false;
  const status = document.getElementById('buyStatus'); if (status) status.textContent = 'Always check the CA above before you swap.';
  copyBtn.addEventListener('click', async () => {
    const label = copyBtn.querySelector('span');
    try { await navigator.clipboard.writeText(CONFIG.ca); label.textContent = 'Copied'; }
    catch { label.textContent = 'Copy failed'; }
    setTimeout(() => (label.textContent = 'Copy CA'), 1500);
  });
} else {
  caEl.textContent = 'TBA · announced on X'; caEl.classList.add('is-tba'); copyBtn.disabled = true;
  copyBtn.querySelector('span').textContent = 'Soon';
}

/* split headings into words for reveals */
document.querySelectorAll('.reveal-words').forEach((el) => {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((t) => {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.textContent = t; w.appendChild(i); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el);
});

const header = document.getElementById('header');
const bar = document.getElementById('progressBar');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const acro = [...document.querySelectorAll('#acro li')];
const pairNote = document.getElementById('pairNote');
const NOTES = [
  'One pill. Two halves. $PUMP on one side, BTC on the other.',
  'Pretty: a mascot your timeline will actually stop for.',
  'Unreal: trading fees routed back to the people holding.',
  'Massive: every trade on the pair feeds the reward pool.',
  'Pair: $PUMP in your wallet. BTC lands next to it.',
];
function setAcro(p) {
  const n = Math.min(4, Math.floor(p * 5.2));
  acro.forEach((li, i) => li.classList.toggle('on', i < n));
  if (pairNote && pairNote.textContent !== NOTES[n]) pairNote.textContent = NOTES[n];
}

/* nav / rail active state */
const sections = ['top', 'story', 'pair', 'gallery', 'buy', 'community', 'faq'].map((id) => document.getElementById(id));
function setActive() {
  const y = innerHeight * 0.45; let cur = sections[0];
  sections.forEach((s) => { if (s && s.getBoundingClientRect().top <= y) cur = s; });
  document.querySelectorAll('.rail a, .site-header nav a').forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + cur.id));
}
let lastY = 0;
function onScroll() {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  header.classList.toggle('is-solid', y > 40);
  header.classList.toggle('is-hidden', y > lastY && y > innerHeight * 1.2);
  lastY = y; setActive();
}
addEventListener('scroll', onScroll, { passive: true }); onScroll();

if (reduce || !window.gsap || !window.ScrollTrigger || !window.Lenis) {
  acro.forEach((li) => li.classList.add('on'));
  document.querySelectorAll('.steps article').forEach((a) => { a.style.opacity = 1; a.style.transform = 'none'; });
  document.querySelectorAll('[data-scroll]').forEach((a) => a.addEventListener('click', (e) => {
    const t = document.querySelector(a.getAttribute('href')); if (t) { e.preventDefault(); t.scrollIntoView(); }
  }));
} else {
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('[data-scroll]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); const t = id === '#top' ? 0 : document.querySelector(id);
    if (t !== null) { e.preventDefault(); lenis.scrollTo(t, { offset: 0, duration: 1.4 }); }
  }));

  // intro
  const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro.from('.hero-bg img', { scale: 1.15, opacity: 0, duration: 1.4 })
    .from('.hero-cutout', { y: 120, opacity: 0, duration: 1.1 }, 0.2)
    .from('.hero-btc', { xPercent: 60, opacity: 0, duration: 1.2 }, 0.4)
    .from('.hero-pills', { scale: 1.2, opacity: 0, duration: 1.2 }, 0.3)
    .from('.hero h1 .ln', { yPercent: 110, opacity: 0, stagger: 0.12, duration: 0.9 }, 0.35)
    .from('.hero .kicker, .hero-lede, .hero-actions', { y: 24, opacity: 0, stagger: 0.1, duration: 0.8 }, 0.6)
    .from('.hero-word', { opacity: 0, x: 80, duration: 1.4 }, 0.4);

  // idle float on the mascot (independent of scroll)
  gsap.to('.hero-cutout img', { y: -14, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  const mm = gsap.matchMedia();
  mm.add({ desk: '(min-width: 761px)', mob: '(max-width: 760px)' }, (ctx) => {
    const { desk } = ctx.conditions;

    // 1 · hero pinned: layers move at different speeds
    const heroTl = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=' + (desk ? 110 : 70) + '%', pin: true, scrub: 0.6, anticipatePin: 1 } });
    heroTl.to('.hero-bg', { yPercent: 8, scale: 1.08, ease: 'none' }, 0)
      .to('.hero-btc', { xPercent: desk ? -55 : 30, yPercent: desk ? -20 : -40, rotate: -6, ease: 'none' }, 0)
      .to('.hero-cutout', { scale: desk ? 1.12 : 1.05, yPercent: -4, ease: 'none' }, 0)
      .to('.hero-pills', { scale: 1.35, yPercent: -10, ease: 'none' }, 0)
      .to('.hero-word', { xPercent: -25, ease: 'none' }, 0)
      .to('.hero-copy', { yPercent: -18, opacity: 0, ease: 'none' }, 0.25)
      .to('.scroll-cue', { opacity: 0, ease: 'none', duration: 0.1 }, 0);

    // 2 · CA strip pop
    gsap.from('.contract-strip > *', { y: 20, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: '.contract-strip', start: 'top 92%' } });

    // 2b · ribbon rows slide opposite ways with scroll
    gsap.fromTo('.ribbon .r1', { xPercent: 0 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: '.ribbon', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('.ribbon .r2', { xPercent: -35 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.ribbon', start: 'top bottom', end: 'bottom top', scrub: true } });

    // word reveals
    document.querySelectorAll('.reveal-words').forEach((el) => {
      gsap.from(el.querySelectorAll('.w > span'), { yPercent: 110, duration: 0.9, ease: 'power3.out', stagger: 0.05, scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    document.querySelectorAll('.reveal-stagger').forEach((el) => {
      gsap.from(el.children, { y: 30, opacity: 0, duration: 0.8, ease: 'power2.out', stagger: 0.12, scrollTrigger: { trigger: el, start: 'top 85%' } });
    });

    // 3 · banner: clip opens + image drift + marquee
    gsap.fromTo('.banner', { clipPath: 'inset(0% 14% 0% 14% round 6px)' }, { clipPath: 'inset(0% 0% 0% 0% round 6px)', ease: 'none', scrollTrigger: { trigger: '.banner', start: 'top 95%', end: 'top 35%', scrub: true } });
    gsap.fromTo('.banner-img', { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1, ease: 'none', scrollTrigger: { trigger: '.banner', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('#marquee', { xPercent: 0 }, { xPercent: -45, ease: 'none', scrollTrigger: { trigger: '.banner', start: 'top bottom', end: 'bottom top', scrub: true } });

    // steps
    gsap.to('.steps article', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.15, scrollTrigger: { trigger: '.steps', start: 'top 82%' } });

    // 4 · the pair: pinned, pill splits, BTC coin appears, acronym lights up
    const pairTl = gsap.timeline({ scrollTrigger: { trigger: '.pair', start: 'top top', end: desk ? '+=200%' : '+=150%', pin: '.pair-pin', scrub: 0.5, onUpdate: (st) => setAcro(st.progress) } });
    pairTl.fromTo('.pill-stage', { rotate: -35, scale: 0.85 }, { rotate: 0, scale: 1, ease: 'power1.out', duration: 0.3 }, 0)
      .to('.pill-half.left', { xPercent: -45, rotate: -14, ease: 'power2.inOut', duration: 0.4 }, 0.3)
      .to('.pill-half.right', { xPercent: 45, rotate: 14, ease: 'power2.inOut', duration: 0.4 }, 0.3)
      .to('.coin', { scale: 1, rotateY: 360, ease: 'back.out(1.6)', duration: 0.4 }, 0.45)
      .to('.pill-glow', { scale: 1.4, opacity: 0.9, duration: 0.6 }, 0.3)
      .to({}, { duration: 0.2 });

    // 5 · gallery: horizontal on desktop
    const track = document.getElementById('track');
    if (desk) {
      const dist = () => Math.max(0, track.scrollWidth - innerWidth + 60);
      gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.gallery', start: 'top top', end: () => '+=' + dist(), pin: '.gallery-pin', scrub: 0.6, invalidateOnRefresh: true } });
      gsap.utils.toArray('.card img').forEach((img) => gsap.fromTo(img, { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.gallery', start: 'top top', end: () => '+=' + dist(), scrub: true } }));
    } else {
      gsap.from('.card', { y: 40, opacity: 0, stagger: 0.08, duration: 0.7, scrollTrigger: { trigger: '.track', start: 'top 85%' } });
    }

    // 6 · buy + faq parallax
    gsap.fromTo('.buy-bg img', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.buy', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('.faq-bg img', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.faq', start: 'top bottom', end: 'bottom top', scrub: true } });

    // 7 · community cutout rises
    gsap.fromTo('.community-art .cutout', { yPercent: 22, scale: 0.9, rotate: -4 }, { yPercent: 0, scale: 1, rotate: 0, ease: 'none', scrollTrigger: { trigger: '.community', start: 'top bottom', end: 'center center', scrub: true } });
    gsap.from('.community-copy > *', { x: 40, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.community', start: 'top 70%' } });

    // faq rows
    gsap.from('.faq details', { y: 24, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: '.faq-list', start: 'top 85%' } });
  });

  addEventListener('load', () => ScrollTrigger.refresh());
}
