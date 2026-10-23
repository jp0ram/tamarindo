(() => {
  const SUITS = ['♠','♥','♦','♣'], RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  const DECKS = window.DECKS || [{ name: 'Classic', src: '' }];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const rnd = n => { const a = new Uint32Array(1), lim = 4294967296 - (4294967296 % n);
    do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; };
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const newDeck = () => shuffle(RANKS.flatMap(r => SUITS.map(s => ({ r, s, v: RANKS.indexOf(r) + 2 }))));
  const isRed = c => c.s === '♥' || c.s === '♦';
  const urlSrc = src => src ? `url("${src}")` : 'none';

  function getDeckIndex() {
    let i = parseInt(new URLSearchParams(location.search).get('deck'), 10);
    if (isNaN(i)) { try { i = parseInt(localStorage.getItem('deck'), 10); } catch (e) {} }
    return (i >= 0 && i < DECKS.length) ? i : 0;
  }
  function setDeckIndex(i) { try { localStorage.setItem('deck', i); } catch (e) {} }
  function applyBack(i = getDeckIndex()) {
    document.documentElement.style.setProperty('--back-img', urlSrc(DECKS[i].src));
    document.querySelectorAll('.menu-link').forEach(a => a.href = 'index.html');
    document.querySelectorAll('[data-game]').forEach(a => a.href = a.dataset.game + '.html?deck=' + i);
  }

  function backEl() { const b = document.createElement('div'); b.className = 'back'; return b; }
  function card(c, faceUp = false) {
    const el = document.createElement('div'); el.className = 'card' + (faceUp ? ' up' : '');
    const inner = document.createElement('div'); inner.className = 'in';
    const f = document.createElement('div'); f.className = 'face' + (isRed(c) ? ' red' : '');
    f.innerHTML = `<div>${c.r}${c.s}</div><div class="mid">${c.s}</div><div class="bot">${c.r}${c.s}</div>`;
    inner.append(backEl(), f); el.appendChild(inner); el.dataset.label = c.r + c.s; return el;
  }
  // Add a card to a container with a slide-in from the deck pile.
  async function deal(container, c, { faceUp = false, delay = 0 } = {}) {
    const el = card(c, faceUp); container.appendChild(el);
    const pile = document.querySelector('.pile'), to = el.getBoundingClientRect();
    if (pile && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
      const from = pile.getBoundingClientRect();
      el.animate([
        { transform: `translate(${from.left - to.left}px,${from.top - to.top}px) rotate(-14deg) scale(.9)`, opacity: .2 },
        { transform: 'none', opacity: 1 }
      ], { duration: 520, delay, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'backwards' });
    }
    await sleep(delay + 420); return el;
  }
  async function flip(el) { el.classList.add('up'); await sleep(450); }
  function addPile() {
    document.querySelectorAll('.pile').forEach(p => { for (let i = 0; i < 3; i++) { const c = document.createElement('div'); c.className = 'card'; const n = document.createElement('div'); n.className = 'in'; n.appendChild(backEl()); c.appendChild(n); p.appendChild(c); } });
  }
  window.CT = { SUITS, RANKS, DECKS, sleep, shuffle, newDeck, card, deal, flip, isRed, getDeckIndex, setDeckIndex, applyBack, backEl, init() { applyBack(); addPile(); } };
})();
