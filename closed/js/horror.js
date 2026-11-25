// 공포 이벤트 디렉터: 장소/시간/행동 기반 랜덤 발생 + 쿨다운 + 중복 방지
const Horror = (() => {
  const H = { last: {}, recent: [], timer: 12, ents: [], log: 0 };
  const V3 = THREE.Vector3, tv = new V3();
  const P = () => G.player;                       // {x,z,yaw}
  const now = () => G.state.time;
  const camPos = () => G.camera.position;
  const fwd = () => new V3(-Math.sin(P().yaw), 0, -Math.cos(P().yaw));
  const dist = (x, z) => Math.hypot(P().x - x, P().z - z);
  const place = (obj, angOff, d) => {
    const a = P().yaw + angOff;
    obj.position.set(P().x - Math.sin(a) * d, 0, P().z - Math.cos(a) * d);
    obj.lookAt(P().x, 0, P().z);
  };
  const looking = (pos, cos = 0.92) => {
    const d = new V3(); G.camera.getWorldDirection(d);
    return d.dot(tv.copy(pos).sub(camPos()).normalize()) > cos;
  };
  const panOf = (x, z) => { const dx = x - P().x, dz = z - P().z, r = new V3(Math.cos(P().yaw), 0, -Math.sin(P().yaw)); return (dx * r.x + dz * r.z) / (Math.hypot(dx, dz) || 1); };
  const behindPan = () => (Math.random() - 0.5) * 0.6;
  const scare = (v = 1) => { G.state.scares++; G.addSanity(-4 * v); };
  H.add = (ent) => H.ents.push(ent);
  // 시선에 잡히면 사라지는 객체 공통 처리
  function watchVanish(obj, life, onSeen, holdNeed = 0.25, headY = 1.6) {
    let t = 0, hold = 0; obj.visible = true;
    H.add({ update(dt) {
      t += dt; tv.set(obj.position.x, headY, obj.position.z);
      const wp = obj.parent && obj.parent !== G.scene ? obj.getWorldPosition(new V3()) : tv;
      if (looking(wp, 0.95)) hold += dt;
      if (hold > holdNeed) { obj.visible = false; onSeen && onSeen(); return false; }
      if (t > life) { obj.visible = false; return false; }
      return true;
    } });
  }
  const near = (x, z, r) => dist(x, z) < r;

  const E = [
    { id: 'farMascot', name: '멀리 서 있는 마스코트', cd: 70, run() { place(W.mascot, (Math.random() - 0.5) * 1.2, 22 + Math.random() * 10); watchVanish(W.mascot, 10, () => { AudioFX.sting(0.6); scare(); }, 0.7, 2.2); } },
    { id: 'dollBehind', name: '뒤돌아보면 사라지는 인형', cd: 60, tags: ['dark'], run() { place(W.doll, Math.PI + (Math.random() - 0.5) * 0.6, 3.5); watchVanish(W.doll, 15, () => { AudioFX.sting(0.8); UI.flash(); scare(); }, 0.2, 0.6); AudioFX.laugh(behindPan()); } },
    { id: 'carouselSpin', name: '갑자기 작동하는 회전목마', cd: 90, cond: () => near(-40, -32, 40) && !W.carousel.power, run() { W.carousel.forced = 7; W.setBulbs(W.carousel.bulbs, true, true); AudioFX.musicBox(panOf(-40, -32)); setTimeout(() => !W.carousel.power && W.setBulbs(W.carousel.bulbs, false), 7000); UI.subtitle('(꺼져 있던 회전목마가 혼자 다시 돌기 시작한다)'); } },
    { id: 'bumperSelf', name: '혼자 움직이는 범퍼카', cd: 80, cond: () => near(42, -36, 35) && !G.chase, run() {
      const car = W.bumper.cars[(Math.random() * 6) | 0]; let t = 0; car.userData.headl.material = W.M.bulbRed;
      AudioFX.noise({ dur: 3, type: 'lowpass', freq: 200, gain: 0.3, pan: panOf(car.position.x, car.position.z) });
      H.add({ update(dt) { t += dt; const dx = P().x - car.position.x, dz = P().z - car.position.z, l = Math.hypot(dx, dz) || 1;
        car.position.x += dx / l * 3 * dt; car.position.z += dz / l * 3 * dt; car.rotation.y = Math.atan2(dx, dz);
        G.clampCar(car); if (t > 3.5) { car.userData.headl.material = W.M.bulbOff; return false; } return true; } });
    } },
    { id: 'footsteps', name: '뒤에서 들리는 발소리', cd: 45, tags: ['idle', 'run'], run() { for (let i = 0; i < 7; i++) setTimeout(() => AudioFX.footstep(false, behindPan()), 300 + i * 450); UI.subtitle('(뒤에서 발소리가 들린다…)', 3); setTimeout(() => G.state && scare(0.5), 3000); } },
    { id: 'shadowCross', name: '갑자기 나타나는 그림자', cd: 50, tags: ['dark'], run() {
      const s = W.shadow, f = fwd(), r = new V3(-f.z, 0, f.x), d = 9, side = Math.random() < 0.5 ? -1 : 1; let t = 0;
      s.position.set(P().x + f.x * d - r.x * 6 * side, 0, P().z + f.z * d - r.z * 6 * side); s.lookAt(P().x, 0, P().z); s.visible = true;
      AudioFX.noise({ dur: 1, type: 'bandpass', freq: 600, gain: 0.25, sweep: 3000 });
      H.add({ update(dt) { t += dt; s.position.addScaledVector(r, 10 * dt * side); if (t > 1.3) { s.visible = false; return false; } return true; } }); scare(0.6);
    } },
    { id: 'weirdAnnounce', name: '비정상적인 안내 방송', cd: 60, run() {
      const L = ['아직… 폐장 시간이… 아닙니다…', '미아를 찾습니다. 빨간 풍선을 든 아이를… 보신 분은…', '손님, 뒤에 계신 분은 일행이십니까?', '즐거운 시간 되세요. 영원히.', '퇴장은… 허락되지… 않습니다.', '해피가 손님을 찾고 있습니다.'];
      const t = L[(Math.random() * L.length) | 0]; AudioFX.chime(); setTimeout(() => { UI.subtitle('📢 ' + t, 5, true); AudioFX.speak(t, true); UI.static(0.4); }, 1200);
    } },
    { id: 'envShift', name: '순간적으로 바뀌는 주변 환경', cd: 100, run() {
      W.lampsOn(true, true); G.scene.fog.color.setHex(0x2a0000); UI.glitch(0.25); AudioFX.sting(0.5); UI.static(0.5);
      setTimeout(() => { W.lampsOn(true); G.scene.fog.color.setHex(G.fogColor); }, 3500); scare();
    } },
    { id: 'doorSlam', name: '갑자기 닫히는 출입문', cd: 60, cond: () => W.booths.some(b => near(b.x, b.z, 30)), run() {
      const b = W.booths.reduce((a, c) => dist(c.x, c.z) < dist(a.x, a.z) ? c : a); let t = 0;
      AudioFX.creak(panOf(b.x, b.z));
      H.add({ update(dt) { t += dt; if (t < 1.5) b.hinge.rotation.y = 1.1 + t * 0.3; else { b.hinge.rotation.y = Math.max(0, b.hinge.rotation.y - dt * 12); if (b.hinge.rotation.y === 0) { AudioFX.slam(panOf(b.x, b.z)); UI.shake(); setTimeout(() => b.hinge.rotation.y = 1.1, 15000); scare(); return false; } } return true; } });
    } },
    { id: 'mannequinStare', name: '플레이어를 바라보는 마네킹', cd: 70, cond: () => near(-40, -32, 35), run() {
      W.mannequins.forEach(m => m.lookAt(P().x, 0, P().z)); AudioFX.creak(panOf(-40, -32)); UI.subtitle('(…마네킹들이 전부 이쪽을 보고 있다)', 4); scare(0.5);
    } },
    { id: 'flashFlicker', name: '손전등 깜빡임', cd: 40, tags: ['wrong'], screen: true, cond: () => G.flashOn, run() { G.flickerT = 2.5; AudioFX.click(); } },
    { id: 'jumpFace', name: '얼굴 갑툭튀', cd: 110, w: 0.6, tags: ['wrong'], screen: true, run() { UI.jumpscare(); AudioFX.scream(); scare(2); } },
    { id: 'whisper', name: '귓가의 속삭임', cd: 40, tags: ['wrong', 'dark'], screen: true, run() { const L = ['…돌아가…', '…나랑 놀자…', '…틀렸어…', '…여기 있어…', '…같이 타자…']; AudioFX.whisper(behindPan()); UI.subtitle(L[(Math.random() * L.length) | 0], 3, true); } },
    { id: 'balloon', name: '떠오르는 빨간 풍선', cd: 80, run() { const b = W.balloon; place(b, (Math.random() - 0.5) * 0.8, 10); b.position.y = 0.5; b.visible = true; let t = 0; AudioFX.laugh(0);
      H.add({ update(dt) { t += dt; b.position.y += dt * 1.5; b.position.x += Math.sin(t) * dt * 0.3; if (t > 12) { b.visible = false; return false; } return true; } }); } },
    { id: 'lightsOut', name: '모든 조명이 꺼짐', cd: 90, tags: ['wrong'], run() { W.lampsOn(false); AudioFX.noise({ dur: 0.2, type: 'lowpass', freq: 200, gain: 0.5 }); AudioFX.heartbeat(5);
      setTimeout(() => { place(W.mascot2, 0, 6); W.mascot2.visible = true; AudioFX.sting(0.7); }, 2500);
      setTimeout(() => { W.mascot2.visible = false; W.lampsOn(true); }, 3200); scare(); } },
    { id: 'childLaugh', name: '아이 웃음소리', cd: 50, run() { AudioFX.laugh(behindPan()); UI.subtitle('(어린아이의 웃음소리)', 3); } },
    { id: 'staticBurst', name: 'VHS 노이즈 폭주', cd: 35, tags: ['wrong'], screen: true, run() { UI.static(1.3); AudioFX.staticBurst(1.3); UI.glitch(0.2); } },
    { id: 'phoneRing', name: '매표소 전화벨', cd: 120, cond: () => near(0, 66, 40), run() { AudioFX.ring(panOf(-10, 66)); UI.subtitle('(매표소에서 전화벨이 울린다)', 5); } },
    { id: 'handprints', name: '화면의 핏자국 손바닥', cd: 75, tags: ['wrong'], screen: true, run() { UI.hands(); AudioFX.slam(0, 0.4); scare(); } },
    { id: 'mascotClose', name: '등 뒤의 마스코트', cd: 140, w: 0.7, tags: ['idle'], run() {
      place(W.mascot, Math.PI, 1.8); AudioFX.noise({ dur: 2, type: 'lowpass', freq: 150, gain: 0.25, attack: 1.5 });
      watchVanish(W.mascot, 7, () => { UI.jumpscare(); AudioFX.scream(); scare(2); }, 0.05, 2.2);
    } },
    { id: 'heartbeat', name: '심장 박동', cd: 45, tags: ['wrong'], screen: true, run() { AudioFX.heartbeat(7, 0.7); UI.pulse(5); } },
    { id: 'musicBoxFar', name: '멀리서 들리는 오르골', cd: 70, run() { AudioFX.musicBox((Math.random() - 0.5) * 1.6, 1.4); } },
    { id: 'ferrisSilhouette', name: '관람차 꼭대기의 실루엣', cd: 90, cond: () => near(-40, 30, 70), run() { H.ferrisFigure(10); } },
    { id: 'coasterRider', name: '뒷좌석의 존재', cd: 90, cond: () => near(47, 27, 50), run() { H.coasterRider(12); } },
    { id: 'mannequinCircle', name: '둘러싼 마네킹', cd: 150, w: 0.6, run() {
      W.lampsOn(false); G.flickerT = 0.8;
      W.extraMannequins.forEach((m, i) => { place(m, i / 6 * Math.PI * 2, 2.6); m.visible = true; });
      AudioFX.sting(1); UI.shake();
      setTimeout(() => { W.extraMannequins.forEach(m => m.visible = false); W.lampsOn(true); }, 700); scare(1.5);
    } }
  ];
  H.events = E; H.looking = looking;

  H.ferrisFigure = (life) => {
    const f = W.ferris; let top = f.gond[0], wp = new V3();
    f.gond.forEach(g => { if (g.getWorldPosition(wp).y > top.getWorldPosition(tv).y) top = g; });
    top.add(W.silhouette); W.silhouette.position.set(0, -2.1, 0.75); W.silhouette.rotation.set(0, 0, 0);
    watchVanish(W.silhouette, life, () => { AudioFX.sting(0.7); scare(); }, 1.2);
  };
  H.coasterRider = (life) => { watchVanish(W.coaster.rider, life, () => { AudioFX.sting(0.8); UI.flash(); scare(); }, 0.8); };

  // tag: ambient | wrong | dark | idle | run
  H.trigger = (tag = 'ambient', screenOnly = false) => {
    const t = now();
    const ok = E.filter(e => (t - (H.last[e.id] ?? -999)) > e.cd && !H.recent.includes(e.id) && (!e.cond || e.cond())
      && (tag === 'ambient' || (e.tags || []).includes(tag))
      && (!screenOnly || e.screen));
    if (!ok.length) return null;
    let sum = ok.reduce((a, e) => a + (e.w || 1), 0), r = Math.random() * sum, pick = ok[0];
    for (const e of ok) { r -= e.w || 1; if (r <= 0) { pick = e; break; } }
    H.last[pick.id] = t; H.recent.push(pick.id); if (H.recent.length > 5) H.recent.shift();
    H.log++; pick.run();
    return pick.id;
  };
  H.reset = () => { H.last = {}; H.recent = []; H.timer = 15; H.ents.forEach(e => e.kill && e.kill()); H.ents = [];
    [W.mascot, W.mascot2, W.doll, W.shadow, W.balloon, W.silhouette, W.coaster.rider].forEach(o => o.visible = false); };
  H.update = (dt) => {
    H.ents = H.ents.filter(e => e.update(dt));
    if (G.chase || G.cinematic > 0 || UI.modalOpen) return;
    H.timer -= dt;
    if (H.timer <= 0) {
      const ch = G.state.ch; H.timer = 14 + Math.random() * 14 - ch * 1.8;
      H.trigger('ambient');
    }
    // 행동 기반
    if (G.idleT > 18) { G.idleT = 0; H.trigger('idle'); }
    if (G.darkT > 10) { G.darkT = 0; H.trigger('dark'); }
    if (G.runT > 8) { G.runT = 0; H.trigger('run'); }
  };
  return H;
})();
