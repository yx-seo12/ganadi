// 게임 코어: 상태, 플레이어, 입력, 진행, 저장, 엔딩
const W = World;
const SAVE_KEY = 'closed_save_v1', END_KEY = 'closed_endings';
const G = { mode: 'title', player: { x: 0, z: 70, yaw: 0, pitch: 0 }, keys: {}, flashOn: true, flickerT: 0, idleT: 0, darkT: 0, runT: 0,
  cinematic: 0, chase: null, angel: null, touchMove: { x: 0, y: 0 }, touchRun: false, sens: 1, fogColor: 0x05070f };
const isTouch = 'ontouchstart' in window || matchMedia('(pointer:coarse)').matches;

const RIDES = [
  { key: 'ferris', name: '관람차', topic: '닮음', item: 'fuse', itemName: '대형 퓨즈', itemPos: [-56, 47], center: [-40, 30],
    A: { id: 'c1a', name: '그림자 측정기', pos: [-27, 43], qs: ['c1q1', 'c1q2'] },
    B: { id: 'c1b', name: '관람차 제어반', pos: [-32, 37], qs: ['c1q3', 'c1q4', 'c1q5'] } },
  { key: 'coaster', name: '롤러코스터', topic: '피타고라스 정리', item: 'cable', itemName: '전력 케이블', itemPos: [67, 50], center: [47, 30],
    A: { id: 'c2a', name: '끊어진 레일 구간', pos: null, qs: ['c2q1', 'c2q2'] },
    B: { id: 'c2b', name: '전력 공급 장치', pos: [34, 57], qs: ['c2q3', 'c2q4', 'c2q5'] } },
  { key: 'carousel', name: '회전목마', topic: '삼각형의 무게중심', item: 'weight', itemName: '균형추', itemPos: [-63, -55], center: [-40, -32],
    A: { id: 'c3a', name: '균형 장치', pos: [-25, -20], qs: ['c3q1', 'c3q2'] },
    B: { id: 'c3b', name: '회전목마 제어반', pos: [-45, -15], qs: ['c3q3', 'c3q4', 'c3q5'] } },
  { key: 'bumper', name: '범퍼카', topic: '확률과 경우의 수', item: 'token', itemName: '범퍼카 토큰', itemPos: [62, -63], center: [42, -36],
    A: { id: 'c4a', name: '스위치 조합판', pos: [25, -27], qs: ['c4q1', 'c4q2'] },
    B: { id: 'c4b', name: '범퍼카 제어반', pos: [42, -23], qs: ['c4q3', 'c4q4', 'c4q5'] } }
];
const FINAL = { id: 'fin', name: '정문 제어 장치', pos: [4, 71], qs: ['f1', 'f2'] };
const BATTERIES = [[-6, 58], [14, 40], [-48, 42], [52, 44], [-15, -10], [-58, -26], [30, -10], [60, -30], [0, -50], [-30, 62], [20, 60], [-62, 10]];
const PHOTOS = [[-52, 21], [70, 3], [-57, -44], [52, -42], [-14, 70]];
const NOTES = [
  { pos: [2, 62], t: '입구 게시판', x: '해피랜드를 찾아주신 손님께.\n1996년 11월 24일, 관람차 사고 이후\n본 놀이공원은 무기한 폐장합니다.\n\n(누군가 볼펜으로 덧써 놓았다)\n"놀이기구들이 아직 혼자 돌고 있어. 네 개 다 전원을 꺼야 나갈 수 있어."' },
  { pos: [-35, 46], t: '정비 메모 #1 — 관람차', x: '관람차 제어반 퓨즈 분실. 서쪽 벤치 근처에 떨어뜨린 듯.\n\n그림자 측정기는 같은 시각의 그림자 길이로 높이를 잰다.\n햇빛은 평행 → 삼각형은 닮음.\n(막대 높이) : (막대 그림자) = (기둥 높이) : (기둥 그림자)' },
  { pos: [41, 45], t: '정비 메모 #2 — 롤러코스터', x: '레일 한 구간이 끊어졌다. 수평 거리와 높이 차를 재면\n피타고라스 정리로 필요한 레일 길이가 나온다.\na² + b² = c²\n\n전력 케이블은 동쪽 끝 창고 쪽에 있다.\n…맨 뒷좌석에는 앉지 마라. 거긴 항상 누가 앉아 있다.' },
  { pos: [-25, -31], t: '정비 메모 #3 — 회전목마', x: '균형 장치는 삼각형 판의 무게중심으로 맞춘다.\n무게중심은 세 중선의 교점, 중선을 꼭짓점에서 2 : 1로 나눈다.\n\n균형추는 남서쪽 구석에.\n마네킹이 움직이면… 눈을 떼지 마.' },
  { pos: [29, -23], t: '정비 메모 #4 — 범퍼카', x: '스위치 조합 = 경우의 수. 곱의 법칙을 기억할 것.\n(적어도 하나) 의 확률 = 1 − (하나도 아닐 확률)\n\n토큰은 남동쪽 구석 쓰레기 더미.\n차가 혼자 움직이면 달려라.' },
  { pos: [-19, -50], t: '미아 보호소 기록', x: '1996.11.24 21:40\n미아 신고: 김민지 (7세), 빨간 풍선, 토끼 머리띠.\n마지막 목격: 관람차 꼭대기 객실.\n\n…아이는 끝내 찾지 못했다.\n사진 조각 다섯 장을 모으면, 그 아이를 찾을 수 있을지도.' },
  { pos: [8, 11], t: '직원 일지', x: '마스코트 "해피" 탈을 쓴 직원이 그날 밤 이후 퇴근하지 않았다.\n탈만 분수대 앞에 남아 있었다.\n\n가끔 방송실에서 혼자 안내 방송이 나온다.\n"아직 폐장 시간이 아닙니다."' },
  { pos: [7, 69], t: '정문 경고문', x: '정문은 네 놀이기구의 운행이 모두 종료되면 열린다.\n전력 충전에는 약 40초가 걸린다.\n\n그동안 해피가 손님을 배웅하러 온다.\n절대 잡히지 마십시오.\n\n밖으로 나갈 때… 뒤를 돌아보지 마십시오.' }
];

const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1); return w + ((c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28) ? a : b); };
function freshState() {
  return { ch: 1, rides: [0, 0, 0, 0], items: {}, solved: {}, tries: {}, picked: {}, zones: {}, final: 0,
    stats: { attempts: 0, correct: 0, points: 0 }, sanity: 100, battery: 100, stamina: 100, time: 0, scares: 0,
    pos: [0, 70], yaw: 0 };
}
G.state = freshState();
G.addSanity = (v) => { const S = G.state; S.sanity = Math.max(0, Math.min(100, S.sanity + v)); if (S.sanity <= 0 && G.mode === 'play') ending('BAD', 'sanity'); };

// ---------- 렌더러/씬 ----------
const renderer = new THREE.WebGLRenderer({ antialias: !isTouch, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1 : 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
document.getElementById('game').appendChild(renderer.domElement);
const scene = new THREE.Scene(); G.scene = scene;
scene.background = new THREE.Color(0x03040a);
scene.fog = new THREE.FogExp2(G.fogColor, 0.032);
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 300); G.camera = camera;
camera.rotation.order = 'YXZ'; scene.add(camera);
scene.add(new THREE.AmbientLight(0x1a2244, 0.55));
scene.add(new THREE.HemisphereLight(0x1a2450, 0x080404, 0.35));
const moon = new THREE.DirectionalLight(0x5a6a9a, 0.35); moon.position.set(-40, 80, -30); scene.add(moon);
const flash = new THREE.SpotLight(0xfff0d8, 3.2, 34, 0.48, 0.5, 1.3); flash.position.set(0.25, -0.2, 0);
camera.add(flash); camera.add(flash.target); flash.target.position.set(0, -0.4, -5);
const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 16), new THREE.MeshBasicMaterial({ color: 0x8a8a9a, fog: false }));
moonMesh.position.set(-120, 90, -160); scene.add(moonMesh);
W.build(scene);
RIDES[1].A.pos = [W.coaster.gapPos.x - 3, W.coaster.gapPos.z - 2];

// ---------- 상호작용 대상 ----------
const inter = [];
function glowItem(x, z, color, size = 0.25) {
  const g = W.group(x, 0, z);
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(size), new THREE.MeshBasicMaterial({ color }));
  m.position.y = 0.9; g.add(m);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(size * 2.2, 10, 10), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15, depthWrite: false }));
  halo.position.y = 0.9; g.add(halo); g.userData.spin = m; return g;
}
function panel(st) {
  const [x, z] = st.pos, g = W.group(x, 0, z);
  W.box(1.1, 1.4, 0.6, W.M.navy, 0, 0.7, 0, g);
  const scr = new THREE.MeshBasicMaterial({ color: 0x660000 });
  const s = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.45), scr); s.position.set(0, 1.1, 0.31); g.add(s);
  W.box(0.08, 0.5, 0.08, W.M.rust, 0.35, 1.6, 0, g);
  g.lookAt(0, 0, 18); st.screen = scr;
  W.colliders.push({ t: 'c', x, z, r: 0.7 });
}
const pickups = [];
function addPickup(id, kind, x, z, color, label, onPick) {
  const mesh = glowItem(x, z, color, kind === 'photo' ? 0.14 : 0.22);
  const p = { id, kind, mesh }; pickups.push(p);
  inter.push({ x, z, mesh, label: () => label, active: () => !G.state.picked[id], act: () => { G.state.picked[id] = 1; mesh.visible = false; AudioFX.pickup(); onPick(); save(); } });
}
RIDES.forEach((r, i) => {
  addPickup('item_' + r.item, 'item', r.itemPos[0], r.itemPos[1], 0xffcc44, `E: ${r.itemName} 줍기`, () => {
    G.state.items[r.item] = 1; UI.toast(`<b>${josa(r.itemName, '을', '를')}</b> 얻었다.`);
    if (G.state.ch !== i + 1) UI.subtitle('(아직은 쓸 데가 없어 보인다. 일단 챙겨 두자.)');
  });
  [r.A, r.B].forEach(st => { panel(st); inter.push({ x: st.pos[0], z: st.pos[1], label: () => `E: ${st.name} 조사`, active: () => true, act: () => useStation(i, st) }); });
});
panel(FINAL); inter.push({ x: FINAL.pos[0], z: FINAL.pos[1], label: () => `E: ${FINAL.name}`, active: () => G.state.final === 0, act: useFinal });
BATTERIES.forEach((b, i) => addPickup('bat' + i, 'battery', b[0], b[1], 0x55ff88, 'E: 건전지 줍기', () => { G.state.battery = Math.min(100, G.state.battery + 40); UI.toast('건전지 (+40%)'); }));
PHOTOS.forEach((p, i) => addPickup('photo' + i, 'photo', p[0], p[1], 0xeeeeff, 'E: 낡은 사진 조각 줍기', () => {
  const n = PHOTOS.filter((_, k) => G.state.picked['photo' + k]).length;
  const T = ['빨간 풍선을 든 여자아이', '아이 옆에 선 마스코트 해피', '관람차 앞에서 웃는 가족', '해피의 탈 아래로 보이는 사람의 손', '뒷면: "민지야, 꼭 찾으러 갈게. — 엄마"'];
  UI.toast(`사진 조각 ${n}/5<br><small>${T[i]}</small>`, 3.5); AudioFX.sting(0.3);
  if (n === 5) UI.subtitle('(사진이 모두 맞춰졌다. 아이가 웃고 있다… 정문에서 무언가 달라질 것 같다.)', 6);
}));
NOTES.forEach((n, i) => {
  W.note(n.pos[0], n.pos[1], Math.atan2(-n.pos[0], 18 - n.pos[1]));
  inter.push({ x: n.pos[0], z: n.pos[1], label: () => 'E: 쪽지 읽기', active: () => true, act: () => { G.state.picked['note' + i] = 1; openModal(); UI.note(n.t, n.x, closeModal); } });
});

// ---------- 저장 ----------
function save() {
  if (G.mode !== 'play' && G.mode !== 'pause') return;
  const S = G.state; S.pos = [G.player.x, G.player.z]; S.yaw = G.player.yaw;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { }
}
function loadSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; } }
const stDone = st => st.qs.every(q => G.state.solved[q]);

function applyState(S) {
  G.state = Object.assign(freshState(), S);
  S = G.state;
  pickups.forEach(p => p.mesh.visible = !S.picked[p.id]);
  const fx = [W.ferris, W.coaster, W.carousel, W.bumper];
  fx.forEach((r, i) => { r.power = !S.rides[i]; });
  W.ferris.speed = W.ferris.power ? 0.06 : 0; W.coaster.speed = W.coaster.power ? 0.035 : 0; W.carousel.speed = W.carousel.power ? 0.5 : 0;
  W.setBulbs(W.ferris.bulbs, W.ferris.power, true); W.setBulbs(W.carousel.bulbs, W.carousel.power); W.setBulbs(W.bumper.grid, W.bumper.power, true);
  W.coaster.repair.visible = stDone(RIDES[1].A);
  RIDES.forEach(r => [r.A, r.B].forEach(st => st.screen.color.setHex(stDone(st) ? 0x00aa44 : 0x660000)));
  FINAL.screen.color.setHex(S.final ? 0x00aa44 : 0x660000);
  W.bumper.cars.forEach(c => { c.position.copy(c.userData.home); c.userData.headl.material = W.M.bulbOff; });
  W.mannequins.forEach(m => m.position.copy(m.userData.home));
  W.gate.target = W.gate.open = 0; W.gate.col.x1 = -4.8; W.gate.col.x2 = 4.8;
  Horror.reset(); G.chase = null; G.angel = null; G.cinematic = 0; UI.$('timer').textContent = '';
  W.lampsOn(true); scene.fog.color.setHex(G.fogColor);
  G.player.x = S.pos[0]; G.player.z = S.pos[1]; G.player.yaw = S.yaw; G.player.pitch = 0;
  if (S.final >= 1) { S.final = 1; setTimeout(startFinalChase, 1500); }
}

// ---------- 모달/포인터락 ----------
function openModal() { G.keys = {}; if (document.pointerLockElement) document.exitPointerLock(); }
function closeModal() { UI.closeModal(); lock(); }
function lock() { if (!isTouch && G.mode === 'play' && !UI.modalOpen && renderer.domElement.requestPointerLock) { try { const p = renderer.domElement.requestPointerLock(); p && p.catch && p.catch(() => { }); } catch (e) { } } }
document.addEventListener('pointerlockchange', () => {
  if (!document.pointerLockElement && G.mode === 'play' && !UI.modalOpen) pause(true);
});
renderer.domElement.addEventListener('click', () => { if (G.mode === 'play') lock(); });

// ---------- 문제 시스템 ----------
function askStation(st, header, done) {
  const qid = st.qs.find(q => !G.state.solved[q]);
  if (!qid) { closeModal(); return done(); }
  const q = QMAP[qid], S = G.state;
  openModal();
  UI.question(q, `${header} · 문제 ${st.qs.indexOf(qid) + 1}/${st.qs.length}`, (c) => {
    S.stats.attempts++; S.tries[qid] = (S.tries[qid] || 0) + 1;
    if (c.ok) {
      S.stats.correct++; S.solved[qid] = true; S.stats.points += S.tries[qid] === 1 ? 5 : S.tries[qid] === 2 ? 3 : 1;
      AudioFX.correct(); save(); return true;
    }
    AudioFX.wrong(); G.addSanity(-8);
    setTimeout(() => { if (!Horror.trigger('wrong', true)) { UI.flash(); AudioFX.sting(0.5); } }, 250);
    return false;
  }, () => askStation(st, header, done), () => { closeModal(); save(); });
}
function useStation(i, st) {
  const S = G.state, r = RIDES[i];
  if (S.ch < i + 1) return UI.toast('전력이 들어오지 않는다.<br><small>먼저 다른 놀이기구의 전원을 꺼야 한다.</small>');
  if (stDone(st)) return UI.toast('이미 복구된 장치다.');
  if (st === r.B) {
    if (!S.items[r.item]) return UI.toast(`부품 슬롯이 비어 있다.<br><small>${josa(r.itemName, '이', '가')} 필요하다.</small>`);
    if (!stDone(r.A)) return UI.toast(`먼저 ${josa(r.A.name, '을', '를')} 복구해야 한다.`);
  }
  askStation(st, `${r.name} · ${st.name}`, () => {
    st.screen.color.setHex(0x00aa44); st === r.B ? AudioFX.powerDown() : AudioFX.powerUp();
    if (st === r.A) {
      UI.toast(`${st.name} 복구 완료!<br><small>이제 ${josa(r.B.name, '을', '를')} 조작해 전원을 끄자.</small>`, 3.5);
      if (i === 1) { W.coaster.repair.visible = true; UI.subtitle('(끊어진 레일이 연결되었다)'); }
    } else activateRide(i);
    save();
  });
}
function useFinal() {
  const S = G.state;
  if (S.ch < 5) return UI.toast(`정문이 열리지 않는다.<br><small>운행 종료된 놀이기구: ${S.rides.filter(Boolean).length}/4</small>`);
  askStation(FINAL, '정문 · 최종 점검', () => {
    FINAL.screen.color.setHex(0x00aa44); S.final = 1; save(); startFinalChase();
  });
}

// ---------- 놀이기구 작동 연출 ----------
function announce(t, weird) { AudioFX.chime(); setTimeout(() => { UI.subtitle('📢 ' + t, 6, weird); AudioFX.speak(t, weird); }, 1100); }
function stopAngel() { if (!G.angel) return; G.angel = null; UI.$('timer').textContent = ''; W.mannequins.forEach(x => x.position.copy(x.userData.home)); }
function activateRide(i) {
  stopAngel(); const S = G.state; S.rides[i] = 1; S.ch = i + 2; G.cinematic = 12; save();
  const r = RIDES[i];
  UI.toast(`<b>${r.name}</b> 운행 종료 · 전원 차단<br><small>CHAPTER ${i + 1} 완료</small>`, 4);
  if (i === 0) {
    W.ferris.power = false; W.setBulbs(W.ferris.bulbs, false);
    announce('관람차 운행을 종료합니다. 꼭대기 객실의 손님은… 아직 내리지 않으셨습니다.', true);
    setTimeout(() => { Horror.ferrisFigure(25); UI.subtitle('(꼭대기 객실에… 누군가 서 있다. 이쪽을 보고 있다.)', 5); }, 5000);
  } else if (i === 1) {
    W.coaster.power = false; announce('롤러코스터 운행을 종료합니다. 모두 내려 주세요. 뒷좌석 손님도요.', true);
    setTimeout(() => { Horror.coasterRider(30); UI.subtitle('(열차 맨 뒷좌석에 누군가 타고 있다…)', 5); }, 4000);
  } else if (i === 2) {
    W.carousel.power = false; W.setBulbs(W.carousel.bulbs, false); AudioFX.musicBox(0, 2);
    announce('회전목마 운행을 종료합니다. 마네킹 손님들은… 아직 내리기 싫으시답니다.', true);
    setTimeout(() => { G.angel = { t: 25, m: nearestMannequin() }; UI.subtitle('(마네킹 하나가 움직였다. 눈을 떼지 마라!)', 5); AudioFX.sting(0.6); }, 4000);
  } else if (i === 3) {
    W.bumper.power = false; W.setBulbs(W.bumper.grid, false);
    announce('범퍼카 운행 종료. 그런데… 몇 대는 멈추지 않네요.', true);
    setTimeout(() => {
      G.chase = { type: 'bumper', t: 18, hitCd: 0, cars: [W.bumper.cars[0], W.bumper.cars[4]] };
      G.chase.cars.forEach(c => c.userData.headl.material = W.M.bulbRed);
      UI.subtitle('(전원이 꺼졌는데도 범퍼카 두 대가 돌진한다! 도망쳐라!)', 4); AudioFX.sting(1);
    }, 3500);
  }
  if (i === 3) setTimeout(() => announce('모든 놀이기구의 운행이 종료되었습니다. 정문에서… 해피가 기다리겠습니다.', true), 24000);
  else setTimeout(() => announce(`다음 운행 종료 대상: ${RIDES[i + 1].name}. ${josa(RIDES[i + 1].name, "으로", "로")} 이동해 주세요.`), 14000);
}
function nearestMannequin() { return W.mannequins.reduce((a, m) => dist2(m.position) < dist2(a.position) ? m : a); }
const dist2 = (p) => Math.hypot(p.x - G.player.x, p.z - G.player.z);
function startFinalChase() {
  if (G.mode !== 'play' && G.mode !== 'pause') return;
  stopAngel(); Horror.reset(); W.lampsOn(true, true); scene.fog.color.setHex(0x1a0204);
  const m = W.mascot; m.visible = true; m.position.set(0, 0, 22); m.scale.setScalar(1.15);
  G.chase = { type: 'final', t: 40, beat: 0 };
  announce('정문 개방까지 40초. 해피가 배웅해 드립니다.', true);
  UI.toast('정문 충전 시작!<br><small>40초간 해피에게서 도망쳐라!</small>', 4);
}
G.clampCar = (c, m = 1.2) => { const b = W.bumper; c.position.x = Math.max(b.x1 + m, Math.min(b.x2 - m, c.position.x)); c.position.z = Math.max(b.z1 + m, Math.min(b.z2 - m, c.position.z)); };

function updateChase(dt, t) {
  const C = G.chase, P = G.player;
  if (C.type === 'bumper') {
    C.t -= dt; C.hitCd -= dt;
    C.cars.forEach((c, k) => {
      const dx = P.x - c.position.x, dz = P.z - c.position.z, l = Math.hypot(dx, dz) || 1;
      c.position.x += dx / l * (4.3 + k * 0.3) * dt; c.position.z += dz / l * (4.3 + k * 0.3) * dt;
      c.rotation.y = Math.atan2(dx, dz); G.clampCar(c, -10);
      if (l < 1.7 && C.hitCd <= 0) {
        C.hitCd = 1.2; G.addSanity(-12); UI.shake(); UI.flash(); AudioFX.slam(0, 0.8);
        P.x += dx / l * 3; P.z += dz / l * 3; c.position.x -= dx / l * 5; c.position.z -= dz / l * 5;
      }
    });
    if (Math.random() < dt * 2) AudioFX.noise({ dur: 0.4, type: 'lowpass', freq: 180, gain: 0.2 });
    UI.$('timer').textContent = `범퍼카 추격 ${Math.ceil(C.t)}`;
    if (C.t <= 0) { C.cars.forEach(c => { c.userData.headl.material = W.M.bulbOff; G.clampCar(c); }); G.chase = null; UI.$('timer').textContent = ''; UI.subtitle('(…범퍼카가 멈췄다)'); }
  } else if (C.type === 'final') {
    const S = G.state, m = W.mascot, dx = P.x - m.position.x, dz = P.z - m.position.z, l = Math.hypot(dx, dz) || 1;
    const sp = (S.final === 1 ? 3.9 + (40 - C.t) * 0.012 : 4.4) * (l > 30 ? 1.6 : 1);
    m.position.x += dx / l * sp * dt; m.position.z += dz / l * sp * dt;
    m.rotation.y = Math.atan2(dx, dz); m.position.y = Math.abs(Math.sin(t * 7)) * 0.25; m.rotation.z = Math.sin(t * 7) * 0.12;
    C.beat -= dt; if (C.beat <= 0) { C.beat = Math.max(0.35, l / 30); AudioFX.heartbeat(1); AudioFX.footstep(true, 0); }
    AudioFX.tension(Math.max(0, 1 - l / 25));
    if (S.final === 1) {
      C.t -= dt; UI.$('timer').textContent = `정문 개방까지 ${Math.ceil(C.t)}초`;
      if (C.t <= 0) { S.final = 2; W.gate.target = 1; W.gate.col.x1 = W.gate.col.x2 = 999; AudioFX.slam(0, 1); UI.toast('정문이 열렸다!<br><small>지금 탈출하라!</small>', 4); UI.$('timer').textContent = '정문으로!'; }
    }
    if (l < 1.3) { m.visible = true; UI.jumpscare(); AudioFX.scream(); ending('BAD', 'caught'); }
    if (S.final === 2 && P.z > 77) escapeChoice();
  }
}
function updateAngel(dt) {
  const A = G.angel, m = A.m, P = G.player; A.t -= dt;
  const head = m.userData.head.getWorldPosition(new THREE.Vector3());
  const d = dist2(m.position);
  if (!Horror.looking(head, 0.82) || !G.flashOn && d > 6) {
    const dx = P.x - m.position.x, dz = P.z - m.position.z;
    m.position.x += dx / d * 2.6 * dt; m.position.z += dz / d * 2.6 * dt; m.lookAt(P.x, 0, P.z);
    if (Math.random() < dt * 1.5) AudioFX.creak();
  }
  if (d < 1.4) { UI.jumpscare(); AudioFX.scream(); G.addSanity(-10); m.position.copy(m.userData.home); A.t = Math.min(A.t, 8); A.m = W.mannequins[(Math.random() * W.mannequins.length) | 0]; }
  UI.$('timer').textContent = `마네킹에서 눈을 떼지 마라 ${Math.ceil(A.t)}`;
  if (A.t <= 0) { stopAngel(); UI.subtitle('(…마네킹들이 제자리로 돌아갔다)'); }
}
function updateBumperIdle(dt) {
  if (!W.bumper.power || G.chase) return;
  W.bumper.cars.forEach((c, i) => {
    const u = c.userData; u.ang = (u.ang ?? Math.random() * 6) + (Math.random() - 0.5) * dt * 2;
    c.position.x += Math.sin(u.ang) * 1.8 * dt; c.position.z += Math.cos(u.ang) * 1.8 * dt; c.rotation.y = u.ang;
    const b = W.bumper; if (c.position.x < b.x1 + 1.3 || c.position.x > b.x2 - 1.3 || c.position.z < b.z1 + 1.3 || c.position.z > b.z2 - 1.3) u.ang += Math.PI;
    G.clampCar(c);
  });
}

// ---------- 엔딩 ----------
function escapeChoice() {
  if (G.mode !== 'play' || UI.modalOpen) return;
  G.chase = null; W.mascot.visible = false; openModal();
  const S = G.state, photos = PHOTOS.filter((_, k) => S.picked['photo' + k]).length;
  const opts = [{ label: '정문 밖으로 걸어 나간다', act: () => ending(accuracy() >= 60 && S.sanity > 0 ? 'TRUE' : 'LOOP', 'exit') },
    { label: '…뒤를 돌아본다', act: () => ending('LOOP', 'look') }];
  if (photos === 5) opts.splice(1, 0, { label: '사진 속 아이의 손을 잡고 함께 나간다', act: () => ending('SECRET') });
  UI.choice('정문', '차가운 바람이 분다. 정문 너머로 도로의 가로등이 보인다.\n등 뒤에서 아이 목소리가 들린다.\n\n"…나도 데려가 줘."', opts);
}
const accuracy = () => { const s = G.state.stats; return s.attempts ? Math.round(s.correct / s.attempts * 100) : 0; };
const ENDINGS = {
  TRUE: ['TRUE ENDING', '정문을 지나자 놀이공원의 불빛이 하나씩 꺼졌다.\n뒤에서 마지막 안내 방송이 들렸다.\n\n"오늘 해피랜드의 모든 운행이 끝났습니다.\n이용해 주셔서 감사합니다."\n\n10년 만에, 해피랜드는 진짜로 폐장했다.'],
  SECRET: ['SECRET ENDING', '사진 속 아이 — 민지가 당신의 손을 꼭 잡았다.\n정문을 나서는 순간, 아이의 손은 따뜻한 빛이 되어 흩어졌다.\n\n"고마워. 이제 엄마한테 갈 수 있어."\n\n관람차 꼭대기의 불이 마지막으로 한 번 깜빡이고, 꺼졌다.\n해피랜드의 미아는 10년 만에 집으로 돌아갔다.'],
  LOOP: ['LOOP ENDING', '정문을 나섰다… 고 생각했다.\n\n눈을 떠 보니 당신은 다시 해피랜드 입구에 서 있었다.\n등 뒤에서 철문이 닫힌다.\n\n"아직 폐장 시간이 아닙니다.\n모든 놀이기구의 운행을 완료해 주세요."\n\n(힌트: 정답률 60% 이상으로, 뒤돌아보지 말고 나가라.)'],
  BAD: ['BAD ENDING', '']
};
function ending(type, why) {
  if (G.mode === 'end') return;
  G.mode = 'end'; G.chase = null; G.angel = null; openModal(); UI.closeModal();
  const S = G.state;
  let text = ENDINGS[type][1];
  if (type === 'BAD') text = why === 'caught' ? '차가운 털로 덮인 손이 어깨를 붙잡았다.\n\n"손님, 아직 폐장 시간이 아니에요."\n\n다음 날, 분수대 앞의 해피 동상이 하나 늘어나 있었다.' : '더 이상 견딜 수 없었다.\n웃음소리와 방송이 머릿속을 가득 채웠다.\n\n당신은 회전목마 위에 앉아 영원히 돌기 시작했다.\n\n(정신력이 0이 되었다)';
  UI.$('endType').textContent = ENDINGS[type][0];
  UI.$('endText').textContent = text;
  const photos = PHOTOS.filter((_, k) => S.picked['photo' + k]).length;
  UI.$('endStats').innerHTML = statsHTML() + `<br>사진 조각 ${photos}/5`;
  try { const e = JSON.parse(localStorage.getItem(END_KEY) || '[]'); if (!e.includes(type)) e.push(type); localStorage.setItem(END_KEY, JSON.stringify(e)); localStorage.removeItem(SAVE_KEY); } catch (e) { }
  setTimeout(() => { UI.show('hud', false); UI.show('touch', false); UI.show('ending'); }, type === 'BAD' && why === 'caught' ? 900 : 300);
  if (type !== 'BAD') AudioFX.chime(); else AudioFX.sting(1);
}
function statsHTML() {
  const S = G.state, m = Math.floor(S.time / 60), s = Math.floor(S.time % 60);
  return `플레이 시간 ${m}분 ${s}초 · 수학 점수 ${S.stats.points}/${QUESTIONS.length * 5}<br>정답률 ${accuracy()}% (${S.stats.correct}/${S.stats.attempts}회) · 해결한 문제 ${Object.keys(S.solved).length}/${QUESTIONS.length}<br>겪은 공포 ${S.scares}회 · 정신력 ${Math.round(S.sanity)}%`;
}

// ---------- 시작/일시정지 ----------
function startGame(cont) {
  AudioFX.init();
  const sv = cont ? loadSave() : null;
  if (!cont) try { localStorage.removeItem(SAVE_KEY); } catch (e) { }
  G.mode = 'play';
  applyState(sv || freshState());
  ['title', 'ending', 'pause', 'how'].forEach(id => UI.show(id, false));
  UI.show('hud'); UI.show('touch', isTouch);
  lock();
  if (!sv) intro(); else UI.toast('저장된 지점에서 이어합니다', 2.5);
}
function intro() {
  G.cinematic = 10; G.player.yaw = Math.PI; UI.blackout(1.5);
  setTimeout(() => { AudioFX.slam(0, 1); UI.shake(); UI.subtitle('(쾅—! 등 뒤에서 철문이 닫혔다)', 3); }, 1200);
  setTimeout(() => announce('아직 폐장 시간이 아닙니다. 모든 놀이기구의 운행을 완료해 주세요.'), 4000);
  setTimeout(() => UI.toast('CHAPTER 1 · 관람차<br><small>정문은 잠겼다. 혼자 돌아가는 네 놀이기구의 전원을 꺼라.</small>', 5), 11000);
}
function pause(on) {
  if (on && G.mode === 'play') {
    G.mode = 'pause'; if (document.pointerLockElement) document.exitPointerLock(); save(); UI.$('pauseStats').innerHTML = statsHTML(); UI.show('pause'); G.keys = {};
  } else if (!on && G.mode === 'pause') { G.mode = 'play'; UI.show('pause', false); lock(); }
}
function toTitle() { save(); G.mode = 'title'; ['pause', 'ending', 'hud', 'touch'].forEach(id => UI.show(id, false)); UI.show('title'); refreshTitle(); try { speechSynthesis.cancel(); } catch (e) { } }
function refreshTitle() {
  UI.$('bCont').disabled = !loadSave();
  let e = []; try { e = JSON.parse(localStorage.getItem(END_KEY) || '[]'); } catch (x) { }
  UI.$('best').textContent = e.length ? `획득한 엔딩: ${e.join(' · ')} (${e.length}/4)` : '';
}
const on = (id, f) => UI.$(id).addEventListener('click', f);
on('bNew', () => startGame(false)); on('bCont', () => startGame(true));
on('bHow', () => { UI.show('title', false); UI.show('how'); }); on('bBack', () => { UI.show('how', false); UI.show('title'); });
on('bResume', () => pause(false)); on('bRestart', () => startGame(false)); on('bTitle', toTitle);
on('bAgain', () => startGame(false)); on('bEndTitle', toTitle);
on('pauseBtn', () => pause(true));
UI.$('vol').oninput = e => AudioFX.setVolume(+e.target.value);
UI.$('sens').oninput = e => G.sens = +e.target.value;

// ---------- 입력 ----------
function interact() {
  if (G.mode !== 'play' || UI.modalOpen) return;
  const it = G.focus; if (it) it.act();
}
function toggleFlash() { if (G.state.battery <= 0) return UI.toast('배터리가 없다'); G.flashOn = !G.flashOn; AudioFX.click(); }
addEventListener('keydown', e => {
  if (G.mode === 'play' && !UI.modalOpen) {
    G.keys[e.code] = true;
    if (e.code === 'KeyE') interact();
    if (e.code === 'KeyF') toggleFlash();
    if (e.code === 'KeyP' || e.code === 'Escape') pause(true);
  } else if (G.mode === 'pause' && e.code === 'KeyP') pause(false);
});
addEventListener('keyup', e => { G.keys[e.code] = false; });
addEventListener('mousemove', e => {
  if (G.mode !== 'play' || UI.modalOpen || (!document.pointerLockElement && !(e.buttons & 1))) return;
  G.player.yaw -= e.movementX * 0.0022 * G.sens; G.player.pitch = Math.max(-1.4, Math.min(1.4, G.player.pitch - e.movementY * 0.0022 * G.sens));
});
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
addEventListener('blur', () => pause(true));
// 터치
(function touch() {
  const joy = UI.$('joy'), knob = UI.$('knob'); let jid = null, jc = null, lid = null, lx = 0, ly = 0;
  joy.addEventListener('touchstart', e => { const t = e.changedTouches[0]; jid = t.identifier; const r = joy.getBoundingClientRect(); jc = [r.left + r.width / 2, r.top + r.height / 2]; e.preventDefault(); }, { passive: false });
  addEventListener('touchmove', e => {
    for (const t of e.changedTouches) {
      if (t.identifier === jid) {
        let dx = t.clientX - jc[0], dy = t.clientY - jc[1]; const l = Math.hypot(dx, dy), mx = 50; if (l > mx) { dx *= mx / l; dy *= mx / l; }
        G.touchMove = { x: dx / mx, y: dy / mx }; knob.style.transform = `translate(${dx}px,${dy}px)`;
      } else if (t.identifier === lid && G.mode === 'play') {
        G.player.yaw -= (t.clientX - lx) * 0.006 * G.sens; G.player.pitch = Math.max(-1.3, Math.min(1.3, G.player.pitch - (t.clientY - ly) * 0.006 * G.sens)); lx = t.clientX; ly = t.clientY;
      }
    }
  }, { passive: true });
  const end = e => { for (const t of e.changedTouches) { if (t.identifier === jid) { jid = null; G.touchMove = { x: 0, y: 0 }; knob.style.transform = ''; } if (t.identifier === lid) lid = null; } };
  addEventListener('touchend', end); addEventListener('touchcancel', end);
  renderer.domElement.addEventListener('touchstart', e => { const t = e.changedTouches[0]; if (lid === null) { lid = t.identifier; lx = t.clientX; ly = t.clientY; } }, { passive: true });
  const tb = (id, f) => UI.$(id).addEventListener('touchstart', e => { e.preventDefault(); f(); }, { passive: false });
  tb('tE', interact); tb('tF', toggleFlash); tb('tRun', () => { G.touchRun = !G.touchRun; UI.$('tRun').style.background = G.touchRun ? 'rgba(120,20,20,.7)' : ''; });
  ['tE', 'tF'].forEach(id => UI.$(id).addEventListener('click', () => id === 'tE' ? interact() : toggleFlash()));
})();

// ---------- 충돌 ----------
function resolve(p, r) {
  const list = G.chase ? W.colliders : W.colliders.concat(W.bumper.cars.map(c => ({ t: 'c', x: c.position.x, z: c.position.z, r: 1.1 })));
  for (const c of list) {
    if (c.t === 'b') {
      const cx = Math.max(c.x1, Math.min(p.x, c.x2)), cz = Math.max(c.z1, Math.min(p.z, c.z2)), dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
      if (d >= r) continue;
      if (d > 1e-5) { p.x += dx / d * (r - d); p.z += dz / d * (r - d); }
      else { const a = [p.x - c.x1, c.x2 - p.x, p.z - c.z1, c.z2 - p.z], m = Math.min(...a), k = a.indexOf(m); if (k === 0) p.x = c.x1 - r; else if (k === 1) p.x = c.x2 + r; else if (k === 2) p.z = c.z1 - r; else p.z = c.z2 + r; }
    } else {
      const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), rr = r + c.r;
      if (d < rr && d > 1e-5) { p.x += dx / d * (rr - d); p.z += dz / d * (rr - d); }
    }
  }
}

// ---------- 목표 / HUD ----------
function objective() {
  const S = G.state;
  if (S.ch <= 4) {
    const i = S.ch - 1, r = RIDES[i];
    const head = `CHAPTER ${S.ch} · ${r.name} — ${r.topic}`;
    if (!stDone(r.A)) return [head, S.items[r.item] ? `${josa(r.A.name, '을', '를')} 조작하라` : `${josa(r.A.name, '을', '를')} 조작하고 ${josa(r.itemName, '을', '를')} 찾아라`, r.A.pos];
    if (!S.items[r.item]) return [head, `${josa(r.itemName, '을', '를')} 찾아라 (정비 메모 참고)`, r.itemPos];
    return [head, `${r.B.name}에 ${josa(r.itemName, '을', '를')} 설치하고 전원을 차단하라`, r.B.pos];
  }
  if (S.final === 0) return ['FINAL · 정문', '정문 제어 장치를 조작하라', FINAL.pos];
  if (S.final === 1) return ['FINAL · 정문', '정문이 열릴 때까지 해피에게서 도망쳐라!', null];
  return ['FINAL · 정문', '열린 정문으로 탈출하라!', [0, 79]];
}
let hudT = 0;
function updateHUD(dt) {
  hudT -= dt; const S = G.state;
  UI.hud(S);
  if (hudT > 0) return; hudT = 0.2;
  const [h, o] = objective();
  UI.$('chapterName').textContent = h; UI.$('objective').textContent = o;
  const steps = RIDES.reduce((a, r) => a + (S.items[r.item] ? 1 : 0) + (stDone(r.A) ? 1 : 0) + (stDone(r.B) ? 1 : 0), 0) + (S.final >= 1 ? 1 : 0) + (S.final >= 2 ? 1 : 0);
  UI.$('progFill').style.width = (steps / 14 * 100) + '%';
  UI.$('progText').textContent = `진행률 ${Math.round(steps / 14 * 100)}% · 놀이기구 ${S.rides.filter(Boolean).length}/4 · 문제 ${Object.keys(S.solved).length}/${QUESTIONS.length}`;
  const photos = PHOTOS.filter((_, k) => S.picked['photo' + k]).length;
  UI.$('info').innerHTML = `사진 조각 ${photos}/5<br>수학 ${S.stats.points}점 · 정답률 ${accuracy()}%`;
  const tm = Math.floor(S.time); UI.$('vhsTime').textContent = `AM 0${2 + Math.floor(tm / 3600)}:${String(Math.floor(tm / 60) % 60).padStart(2, '0')}:${String(tm % 60).padStart(2, '0')}`;
}

// ---------- 메인 업데이트 ----------
let stepAcc = 0, saveT = 0;
const ZONES = RIDES.map((r, i) => ({ id: r.key, c: r.center, r: 26, msg: ['(녹슨 관람차가 하늘을 가린다. 꼭대기에서 무언가 삐걱거린다.)', '(레일 위로 바람이 지나가며 비명 같은 소리를 낸다.)', '(회전목마 주위의 마네킹들… 누가 여기에 세워 둔 걸까.)', '(범퍼카들이 마치 누군가를 기다리듯 한쪽을 보고 있다.)'][i] }));
function update(dt, t) {
  const S = G.state, P = G.player;
  S.time += dt; G.cinematic = Math.max(0, G.cinematic - dt);
  // 이동
  let mx = 0, mz = 0; const k = G.keys;
  if (!UI.modalOpen) {
    if (k.KeyW || k.ArrowUp) mz -= 1; if (k.KeyS || k.ArrowDown) mz += 1; if (k.KeyA || k.ArrowLeft) mx -= 1; if (k.KeyD || k.ArrowRight) mx += 1;
    mx += G.touchMove.x; mz += G.touchMove.y;
  }
  const ml = Math.hypot(mx, mz), moving = ml > 0.1;
  const wantRun = (k.ShiftLeft || k.ShiftRight || G.touchRun) && moving;
  G.running = wantRun && S.stamina > 2 && !(G.tired && S.stamina < 25);
  if (S.stamina <= 2) G.tired = true; if (S.stamina > 25) G.tired = false;
  S.stamina = Math.max(0, Math.min(100, S.stamina + (G.running ? -20 : 13) * dt));
  const speed = G.running ? 5.8 : 3.2;
  if (moving) {
    const nx = mx / Math.max(1, ml), nz = mz / Math.max(1, ml), sy = Math.sin(P.yaw), cy = Math.cos(P.yaw);
    const p = { x: P.x + (nx * cy + nz * sy) * speed * dt, z: P.z + (-nx * sy + nz * cy) * speed * dt };
    resolve(p, 0.4); resolve(p, 0.4); P.x = p.x; P.z = p.z;
    stepAcc += speed * dt; if (stepAcc > (G.running ? 1.9 : 1.5)) { stepAcc = 0; AudioFX.footstep(G.running); }
    G.idleT = 0;
  } else G.idleT = UI.modalOpen ? 0 : G.idleT + dt;
  G.runT = G.running ? G.runT + dt : 0;
  const bob = moving ? Math.sin(t * (G.running ? 13 : 8.5)) * (G.running ? 0.07 : 0.04) : 0;
  camera.position.set(P.x, 1.65 + bob, P.z); camera.rotation.set(P.pitch, P.yaw, 0);
  // 손전등
  if (G.flashOn) { S.battery = Math.max(0, S.battery - dt / 3.2); if (S.battery <= 0) { G.flashOn = false; UI.toast('손전등 배터리가 다 됐다…'); } G.darkT = 0; } else G.darkT += dt;
  G.flickerT -= dt;
  flash.intensity = G.flashOn ? (G.flickerT > 0 ? (Math.random() < 0.5 ? 0 : 1.5) : (S.battery < 15 ? 2.2 + Math.sin(t * 30) * 0.8 : 3.2)) : 0;
  // 정신력: 가로등 근처에서 회복
  const lit = W.lights.some(l => !l.userData.off && Math.hypot(l.position.x - P.x, l.position.z - P.z) < 8);
  if (!G.chase) G.addSanity((lit ? 0.35 : 0.04) * dt);
  // 구역 진입
  ZONES.forEach(z => { if (!S.zones[z.id] && Math.hypot(z.c[0] - P.x, z.c[1] - P.z) < z.r) { S.zones[z.id] = 1; UI.subtitle(z.msg, 5); if (G.cinematic <= 0) setTimeout(() => G.mode === 'play' && !G.chase && Horror.trigger('ambient'), 2500); } });
  // 상호작용 포커스
  let best = null, bd = 2.6; const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw);
  for (const it of inter) {
    if (!it.active()) continue;
    const dx = it.x - P.x, dz = it.z - P.z, d = Math.hypot(dx, dz);
    if (d < bd && (d < 1.2 || (dx * fx + dz * fz) / d > 0.55)) { bd = d; best = it; }
  }
  G.focus = best; UI.prompt(best && !UI.modalOpen ? best.label() : '');
  // 아이템 회전
  pickups.forEach(p => { if (p.mesh.visible) { p.mesh.userData.spin.rotation.y = t * 2; p.mesh.userData.spin.position.y = 0.9 + Math.sin(t * 3) * 0.1; } });
  W.update(dt, t); updateBumperIdle(dt);
  if (G.chase) updateChase(dt, t); else AudioFX.tension(G.angel ? 0.6 : 0);
  if (G.angel) updateAngel(dt);
  if (G.mode !== 'play') return;
  Horror.update(dt);
  if (Math.random() < dt * 0.05) AudioFX.creak((Math.random() - 0.5) * 2);
  saveT += dt; if (saveT > 20) { saveT = 0; save(); }
  updateHUD(dt);
}

const clock = new THREE.Clock();
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime;
  if (G.mode === 'play') update(dt, t);
  else if (G.mode === 'title') {
    camera.position.set(Math.sin(t * 0.05) * 30, 14, 60 + Math.cos(t * 0.05) * 10); camera.lookAt(0, 8, 0);
    W.update(dt, t); flash.intensity = 0;
  }
  UI.tick(dt);
  renderer.render(scene, camera);
}
refreshTitle(); UI.show('loading', false); loop();
G.debug = { RIDES, FINAL, activateRide, useStation, ending, startFinalChase, escapeChoice, save, applyState, inter };
