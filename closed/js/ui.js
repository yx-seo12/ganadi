// HUD, 모달, 화면 효과
const UI = (() => {
  const $ = id => document.getElementById(id);
  const U = { $ };
  let toastT = 0, subT = 0;
  const nctx = $('noise').getContext('2d'), nimg = nctx.createImageData(160, 90);
  let noiseLevel = 0.07, staticT = 0;

  // 점프스케어 얼굴 (절차적)
  (function drawFace() {
    const g = $('scare').getContext('2d'), w = 512;
    const gr = g.createRadialGradient(256, 256, 20, 256, 256, 300); gr.addColorStop(0, '#2a1010'); gr.addColorStop(1, '#000');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
    g.fillStyle = '#b8ac98'; g.beginPath(); g.ellipse(256, 270, 150, 200, 0, 0, 7); g.fill();
    for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(${40 + Math.random() * 60},20,20,${Math.random() * .25})`; g.fillRect(100 + Math.random() * 310, 80 + Math.random() * 400, 3, 3); }
    g.fillStyle = '#000';
    [[190, 220], [322, 220]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 42, 55, 0, 0, 7); g.fill(); });
    g.fillStyle = '#f22'; [[190, 228], [322, 228]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); });
    g.fillStyle = '#100'; g.beginPath(); g.ellipse(256, 375, 85, 70, 0, 0, 7); g.fill();
    g.fillStyle = '#ddd'; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(180 + i * 17, 320); g.lineTo(188 + i * 17, 350); g.lineTo(196 + i * 17, 320); g.fill(); }
    g.strokeStyle = 'rgba(80,0,0,.8)'; g.lineWidth = 4; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(190 + (i % 2) * 132, 275); g.lineTo(185 + (i % 2) * 132 + Math.random() * 20, 330 + Math.random() * 80); g.stroke(); }
  })();
  (function drawHands() {
    const g = $('hands').getContext('2d');
    for (let k = 0; k < 9; k++) {
      const x = Math.random() * 800, y = Math.random() * 450, r = Math.random() * 6.28, s = 0.6 + Math.random() * 0.7;
      g.save(); g.translate(x, y); g.rotate(r); g.scale(s, s); g.fillStyle = 'rgba(110,0,0,.75)';
      g.beginPath(); g.ellipse(0, 0, 28, 34, 0, 0, 7); g.fill();
      [-22, -8, 6, 20].forEach((fx, i) => { g.beginPath(); g.ellipse(fx, -48 - (i % 2) * 6, 6, 20, 0, 0, 7); g.fill(); });
      g.beginPath(); g.ellipse(32, -6, 6, 16, -0.8, 0, 7); g.fill();
      g.fillRect(-4, 30, 4, 40 + Math.random() * 40); g.restore();
    }
  })();

  U.tick = (dt) => {
    const d = nimg.data, lvl = staticT > 0 ? 1 : 0.6;
    for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255 * lvl; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    nctx.putImageData(nimg, 0, 0);
    if (staticT > 0) { staticT -= dt; $('noise').style.opacity = 0.35 + Math.random() * 0.25; if (staticT <= 0) $('noise').style.opacity = noiseLevel; }
    if (toastT > 0 && (toastT -= dt) <= 0) $('toast').classList.remove('on');
    if (subT > 0 && (subT -= dt) <= 0) $('subtitle').classList.remove('on');
  };
  U.toast = (msg, t = 2.5) => { $('toast').innerHTML = msg; $('toast').classList.add('on'); toastT = t; };
  U.subtitle = (msg, t = 4, weird) => { const s = $('subtitle'); s.textContent = msg; s.classList.add('on'); s.classList.toggle('weird', !!weird); subT = t; };
  U.static = (t = 1) => { staticT = t; };
  U.flash = () => { const r = $('redflash'); r.style.transition = 'none'; r.style.opacity = 0.6; requestAnimationFrame(() => { r.style.transition = 'opacity .8s'; r.style.opacity = 0; }); };
  U.blackout = (t) => { $('blackout').style.opacity = 1; setTimeout(() => $('blackout').style.opacity = 0, t * 1000); };
  U.shake = () => { document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake'); };
  U.glitch = (t = 0.3) => { document.body.classList.add('glitch'); setTimeout(() => document.body.classList.remove('glitch'), t * 1000); };
  U.jumpscare = () => { const s = $('scare'); s.classList.remove('show'); void s.offsetWidth; s.classList.add('show'); U.shake(); };
  U.hands = () => { const h = $('hands'); h.style.transition = 'none'; h.style.opacity = 0.9; requestAnimationFrame(() => setTimeout(() => { h.style.transition = 'opacity 3s'; h.style.opacity = 0; }, 900)); };
  U.pulse = (t) => { $('vig').classList.add('pulse'); setTimeout(() => $('vig').classList.remove('pulse'), t * 1000); };
  U.show = (id, on = true) => $(id).classList.toggle('hidden', !on);

  U.hud = (s) => {
    $('batFill').style.width = s.battery + '%';
    $('sanFill').style.width = s.sanity + '%';
    $('staFill').style.width = s.stamina + '%';
  };
  U.prompt = (t) => { const p = $('prompt'); if (t) { p.textContent = t; p.style.display = 'block'; } else p.style.display = 'none'; };

  // 모달
  U.modalOpen = false;
  U.openModal = (html) => { $('modalBox').innerHTML = html; U.show('modal'); U.modalOpen = true; };
  U.closeModal = () => { U.show('modal', false); U.modalOpen = false; };
  U.note = (title, text, onClose) => {
    U.openModal(`<div class="note"><h3>${title}</h3>${text}</div><div class="mfoot"><button class="pri" id="mClose">닫기</button></div>`);
    $('mClose').onclick = () => { U.closeModal(); onClose && onClose(); };
  };
  U.choice = (title, text, opts) => {
    U.openModal(`<div class="mhead"><span>${title}</span></div><div class="qtext" style="white-space:pre-line">${text}</div><div class="mfoot" style="flex-direction:column">${opts.map((o, i) => `<button class="${i === 0 ? 'pri' : ''}" data-i="${i}">${o.label}</button>`).join('')}</div>`);
    $('modalBox').querySelectorAll('button[data-i]').forEach(b => b.onclick = () => { U.closeModal(); opts[+b.dataset.i].act(); });
  };
  // 문제: onPick(choiceObj) → true/false, onDone(), onLeave()
  U.question = (q, header, onPick, onDone, onLeave) => {
    const ch = q.choices.slice().sort(() => Math.random() - 0.5);
    U.openModal(`<div class="mhead"><span>${header}</span><span class="diff">${q.diff}</span></div>
      ${q.svg ? `<div class="svg">${q.svg}</div>` : ''}<div class="qtext">${q.q}</div>
      <div class="choices">${ch.map((c, i) => `<button data-i="${i}">${c.t}</button>`).join('')}</div>
      <div id="fb"></div><div class="mfoot"><button id="mLeave">나중에 풀기</button></div>`);
    const box = $('modalBox');
    box.querySelectorAll('.choices button').forEach(b => b.onclick = () => {
      const c = ch[+b.dataset.i];
      if (onPick(c)) {
        b.classList.add('good'); box.querySelectorAll('.choices button').forEach(x => x.disabled = true);
        $('fb').className = 'fb ok'; $('fb').textContent = '정답! 장치가 반응한다.\n\n[해설]\n' + q.exp;
        box.querySelector('.mfoot').innerHTML = '<button class="pri" id="mNext">계속</button>';
        $('mNext').onclick = onDone;
      } else {
        b.classList.add('bad');
        $('fb').className = 'fb no'; $('fb').textContent = '오답… 어딘가에서 무언가가 깨어났다. 다시 생각해 보라.';
      }
    });
    $('mLeave').onclick = onLeave;
  };
  return U;
})();
