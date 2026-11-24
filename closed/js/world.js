// 절차적 3D 놀이공원 생성
const World = (() => {
  const W = { colliders: [], lamps: [], lights: [], mannequins: [], booths: [], spots: {} };
  let seed = 7331;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  W.rnd = rnd;
  let scene;

  // ---------- 텍스처 ----------
  function ctex(w, h, draw, rep) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
    return t;
  }
  function speckle(g, w, h, base, n, cols, size = 3) {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) {
      g.fillStyle = cols[(Math.random() * cols.length) | 0];
      g.globalAlpha = Math.random() * 0.5;
      g.fillRect(Math.random() * w, Math.random() * h, Math.random() * size + 1, Math.random() * size + 1);
    }
    g.globalAlpha = 1;
  }
  function signTex(text, sub, bg = '#2a0606', fg = '#c9b48a') {
    return ctex(512, 192, (g, w, h) => {
      speckle(g, w, h, bg, 2500, ['#000', '#3b2a1a', '#5a1a10'], 5);
      g.strokeStyle = fg; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
      g.fillStyle = fg; g.textAlign = 'center'; g.font = 'bold 78px serif'; g.fillText(text, w / 2, sub ? 105 : 125);
      if (sub) { g.font = '30px serif'; g.fillText(sub, w / 2, 160); }
      for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(0,0,0,0.6)'; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, Math.random() * 14, 0, 7); g.fill(); }
    });
  }
  W.signTex = signTex;

  const M = {};
  function mats() {
    const std = o => new THREE.MeshStandardMaterial(o);
    const rust = ctex(256, 256, (g, w, h) => speckle(g, w, h, '#4a2a1c', 4000, ['#6b3a1f', '#2a1810', '#7a4a2a', '#1a0e08'], 6), [2, 2]);
    const ground = ctex(512, 512, (g, w, h) => {
      speckle(g, w, h, '#16171b', 9000, ['#0b0b0d', '#222328', '#1d1a18', '#2a2a2e'], 4);
      g.strokeStyle = '#060607'; g.lineWidth = 2;
      for (let i = 0; i < 25; i++) { g.beginPath(); let x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (Math.random() - .5) * 60; y += (Math.random() - .5) * 60; g.lineTo(x, y); } g.stroke(); }
    }, [40, 40]);
    const tile = ctex(256, 256, (g, w, h) => {
      speckle(g, w, h, '#2b2522', 3000, ['#1a1513', '#3a302a'], 3);
      g.strokeStyle = '#141010'; g.lineWidth = 3;
      for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); }
    }, [1, 1]);
    const stripe = ctex(512, 64, (g, w, h) => {
      for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#5a0e0e' : '#8a7d66'; g.fillRect(i * 32, 0, 32, h); }
      speckle(g, w, h, 'rgba(0,0,0,0)', 1500, ['#000', '#2a1a10'], 4);
    }, [1, 1]);
    const paper = ctex(256, 320, (g, w, h) => {
      speckle(g, w, h, '#a89c80', 2000, ['#7a6e55', '#c0b498', '#5a3a20'], 3);
      g.fillStyle = '#2a1a10'; for (let i = 0; i < 12; i++) g.fillRect(25, 40 + i * 20, 120 + Math.random() * 80, 3);
      g.fillStyle = 'rgba(90,10,10,0.7)'; g.beginPath(); g.arc(190, 270, 22, 0, 7); g.fill();
    });
    Object.assign(M, {
      ground: std({ map: ground, roughness: 1 }),
      tile: std({ map: tile, roughness: 0.95 }),
      rust: std({ map: rust, roughness: 0.85, metalness: 0.5 }),
      metal: std({ color: 0x2a2c31, roughness: 0.6, metalness: 0.7 }),
      red: std({ color: 0x5a0d0d, roughness: 0.8, map: rust }),
      navy: std({ color: 0x1b2340, roughness: 0.8 }),
      cream: std({ color: 0x7d7462, roughness: 0.9 }),
      wood: std({ color: 0x3a2a1c, roughness: 1 }),
      stripe: std({ map: stripe, roughness: 0.9, side: THREE.DoubleSide }),
      paper: std({ map: paper, roughness: 1, emissive: 0x221a10, emissiveIntensity: 0.6 }),
      skin: std({ color: 0xb3a998, roughness: 0.7 }),
      bulbOff: std({ color: 0x332a20, emissive: 0x000000 }),
      bulb: std({ color: 0xffcc88, emissive: 0xff8833, emissiveIntensity: 1.5 }),
      bulbRed: std({ color: 0xff3333, emissive: 0xff1111, emissiveIntensity: 2 }),
      black: new THREE.MeshBasicMaterial({ color: 0x000000 }),
      eye: new THREE.MeshBasicMaterial({ color: 0xff1a1a }),
      glow: new THREE.MeshBasicMaterial({ color: 0xffdd66 }),
      tree: std({ color: 0x15110e, roughness: 1 })
    });
  }
  W.M = M;

  // ---------- 헬퍼 ----------
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  function mesh(geo, mat, x = 0, y = 0, z = 0, p = scene) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); p.add(m); return m; }
  const box = (w, h, d, mat, x, y, z, p) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p);
  const cyl = (rt, rb, h, mat, x, y, z, p, s = 10) => mesh(new THREE.CylinderGeometry(rt, rb, h, s), mat, x, y, z, p);
  const sph = (r, mat, x, y, z, p, s = 10) => mesh(new THREE.SphereGeometry(r, s, s), mat, x, y, z, p);
  function beam(a, b, r, mat, p = scene) {
    const d = V().subVectors(b, a), len = d.length();
    const m = mesh(new THREE.CylinderGeometry(r, r, len, 6), mat, 0, 0, 0, p);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
    return m;
  }
  const colBox = (x1, x2, z1, z2) => { const c = { t: 'b', x1: Math.min(x1, x2), x2: Math.max(x1, x2), z1: Math.min(z1, z2), z2: Math.max(z1, z2) }; W.colliders.push(c); return c; };
  const colCirc = (x, z, r) => { const c = { t: 'c', x, z, r }; W.colliders.push(c); return c; };
  function group(x, y, z, p = scene) { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; }
  W.box = box; W.cyl = cyl; W.sph = sph; W.group = group;

  // ---------- 인물/마스코트 ----------
  W.makeMascot = () => {
    const g = new THREE.Group(), fur = new THREE.MeshStandardMaterial({ color: 0x6b4a4a, roughness: 1 }), belly = new THREE.MeshStandardMaterial({ color: 0x8a7a6a, roughness: 1 });
    cyl(0.5, 0.7, 1.4, fur, 0, 1.15, 0, g); sph(0.45, belly, 0, 1.15, 0.3, g).scale.set(1, 1.3, 0.5);
    const head = group(0, 2.2, 0, g); sph(0.6, fur, 0, 0, 0, head, 14);
    [-1, 1].forEach(s => {
      const ear = cyl(0.12, 0.18, 0.9, fur, s * 0.28, 0.75, 0, head); ear.rotation.z = -s * 0.3;
      sph(0.14, M.black, s * 0.22, 0.1, 0.5, head); sph(0.05, M.eye, s * 0.22, 0.1, 0.62, head);
      const arm = cyl(0.13, 0.16, 1.2, fur, s * 0.7, 1.1, 0.1, g); arm.rotation.z = s * 0.25;
      cyl(0.18, 0.2, 0.6, fur, s * 0.25, 0.3, 0, g);
    });
    const mouth = mesh(new THREE.TorusGeometry(0.25, 0.04, 6, 12, Math.PI), new THREE.MeshBasicMaterial({ color: 0x2a0000 }), 0, -0.15, 0.55, head);
    mouth.rotation.z = Math.PI;
    g.userData.head = head; g.visible = false; scene.add(g); return g;
  };
  W.makeDoll = () => {
    const g = new THREE.Group();
    cyl(0.05, 0.28, 0.5, new THREE.MeshStandardMaterial({ color: 0x4a0f14, roughness: 1 }), 0, 0.25, 0, g);
    sph(0.17, M.skin, 0, 0.62, 0, g); sph(0.19, new THREE.MeshStandardMaterial({ color: 0x0a0806 }), 0, 0.68, -0.04, g);
    [-1, 1].forEach(s => sph(0.035, M.black, s * 0.06, 0.64, 0.15, g));
    g.visible = false; scene.add(g); return g;
  };
  W.makeMannequin = (x = 0, z = 0, p = scene) => {
    const g = group(x, 0, z, p);
    cyl(0.04, 0.04, 0.4, M.metal, 0, 0.2, 0, g); cyl(0.25, 0.25, 0.04, M.metal, 0, 0.02, 0, g);
    cyl(0.2, 0.15, 0.7, M.skin, 0, 0.75, 0, g); cyl(0.26, 0.2, 0.6, M.skin, 0, 1.35, 0, g);
    [-1, 1].forEach(s => { const a = cyl(0.06, 0.05, 0.75, M.skin, s * 0.33, 1.25, 0, g); a.rotation.z = s * 0.15; });
    const head = group(0, 1.85, 0, g); sph(0.16, M.skin, 0, 0, 0, head).scale.set(1, 1.25, 1);
    sph(0.025, M.black, -0.06, 0.03, 0.14, head); sph(0.025, M.black, 0.06, 0.03, 0.14, head);
    g.userData.head = head; return g;
  };
  W.makeShadow = () => {
    const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.92 });
    cyl(0.22, 0.35, 1.7, m, 0, 0.85, 0, g); sph(0.24, m, 0, 1.95, 0, g);
    sph(0.03, M.eye, -0.08, 1.98, 0.21, g); sph(0.03, M.eye, 0.08, 1.98, 0.21, g);
    g.scale.setScalar(1.2); g.visible = false; scene.add(g); return g;
  };

  // ---------- 구조물 ----------
  function lamp(x, z, real) {
    const g = group(x, 0, z);
    cyl(0.08, 0.12, 5, M.metal, 0, 2.5, 0, g);
    const head = sph(0.3, M.bulb, 0, 5.1, 0, g);
    W.lamps.push(head);
    if (real) {
      const l = new THREE.PointLight(0xff9955, 1.3, 18, 1.6); l.position.set(x, 4.8, z); scene.add(l);
      l.userData.base = 1.3; l.userData.flicker = rnd() < 0.5; W.lights.push(l);
    }
    colCirc(x, z, 0.3);
  }
  function tree(x, z) {
    const g = group(x, 0, z), h = 3 + rnd() * 3;
    cyl(0.12, 0.25, h, M.tree, 0, h / 2, 0, g, 6);
    for (let i = 0; i < 4; i++) {
      const a = V(0, h * (0.5 + rnd() * 0.4), 0), ang = rnd() * 6.28;
      beam(a, V(Math.cos(ang) * 1.6, a.y + 1 + rnd(), Math.sin(ang) * 1.6), 0.05, M.tree, g);
    }
    colCirc(x, z, 0.4);
  }
  function bench(x, z, ry) {
    const g = group(x, 0, z); g.rotation.y = ry;
    box(2, 0.1, 0.5, M.wood, 0, 0.5, 0, g); box(2, 0.5, 0.08, M.wood, 0, 0.85, -0.25, g);
    [-0.85, 0.85].forEach(s => box(0.08, 0.5, 0.5, M.metal, s, 0.25, 0, g));
    colCirc(x, z, 1);
  }
  function sign(x, z, ry, text, sub) {
    const g = group(x, 0, z); g.rotation.y = ry;
    [-1.1, 1.1].forEach(s => cyl(0.06, 0.06, 3, M.rust, s, 1.5, 0, g, 6));
    const m = mesh(new THREE.PlaneGeometry(2.6, 1), new THREE.MeshStandardMaterial({ map: signTex(text, sub), roughness: 1, emissive: 0x200808, side: THREE.DoubleSide }), 0, 2.6, 0, g);
    m.rotation.z = (rnd() - 0.5) * 0.15;
    colCirc(x, z, 0.5);
  }
  W.note = (x, z, ry) => {
    const g = group(x, 0, z); g.rotation.y = ry;
    cyl(0.05, 0.05, 1.3, M.wood, 0, 0.65, 0, g, 5);
    box(0.5, 0.65, 0.03, M.paper, 0, 1.35, 0.03, g);
    return g;
  };
  function booth(x, z, label) {
    const g = group(x, 0, z);
    box(3, 3, 3, M.red, 0, 1.5, 0, g); box(3.4, 0.3, 3.4, M.navy, 0, 3.15, 0, g);
    box(1.6, 0.8, 0.05, new THREE.MeshStandardMaterial({ color: 0x0a0f18, metalness: 0.9, roughness: 0.2 }), 0, 1.8, 1.53, g);
    const pl = mesh(new THREE.PlaneGeometry(2.6, 0.7), new THREE.MeshStandardMaterial({ map: signTex(label), emissive: 0x200808 }), 0, 3.6, 0, g);
    pl.position.z = 1.6;
    const hinge = group(1.5, 0, -0.6, g); box(0.05, 2.2, 1.1, M.wood, 0, 1.1, 0.55, hinge); hinge.rotation.y = 1.1;
    W.booths.push({ g, hinge, x, z });
    colBox(x - 1.6, x + 1.6, z - 1.6, z + 1.6);
  }

  // ---------- 놀이기구 ----------
  function ferris(x, z) {
    const g = group(x, 0, z), wheel = group(0, 17, 0, g), R = 14, gond = [], bulbs = [];
    [-1, 1].forEach(s => {
      mesh(new THREE.TorusGeometry(R, 0.2, 6, 48), M.rust, 0, 0, s * 0.9, wheel);
      mesh(new THREE.TorusGeometry(7, 0.14, 6, 32), M.rust, 0, 0, s * 0.9, wheel);
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; beam(V(0, 0, s * 0.9), V(Math.cos(a) * R, Math.sin(a) * R, s * 0.9), 0.08, M.rust, wheel); }
      beam(V(s * 6, 0, -2.6), V(0, 17, s * 0.0 - 1.2), 0.3, M.metal, g);
      beam(V(s * 6, 0, 2.6), V(0, 17, 1.2), 0.3, M.metal, g);
    });
    const ax = cyl(0.6, 0.6, 3, M.metal, 0, 0, 0, wheel); ax.rotation.x = Math.PI / 2;
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2, piv = group(Math.cos(a) * R, Math.sin(a) * R, 0, wheel);
      const gm = i % 3 === 0 ? M.navy : M.red;
      box(1.8, 1.5, 1.4, gm, 0, -1.4, 0, piv); box(2, 0.15, 1.6, M.metal, 0, -0.55, 0, piv);
      box(1.6, 0.5, 1.45, new THREE.MeshStandardMaterial({ color: 0x05070a, metalness: 0.8, roughness: 0.3 }), 0, -1.1, 0, piv);
      gond.push(piv);
    }
    for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2; bulbs.push(sph(0.18, M.bulbOff, Math.cos(a) * R, Math.sin(a) * R, 1.2, wheel, 6)); }
    box(16, 0.5, 8, M.tile, 0, 0.25, 0, g);
    colBox(x - 7, x + 7, z - 3.2, z + 3.2);
    W.ferris = { g, wheel, gond, bulbs, speed: 0, power: false };
  }

  function coaster() {
    const pts = [[30, 1.6, 46], [44, 1.6, 48], [56, 9, 47], [66, 20, 38], [68, 18, 26], [63, 8, 14], [55, 13, 6], [44, 22, 5], [33, 12, 10], [27, 6, 22], [25, 3, 36]].map(p => V(...p));
    const curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5), N = 260, gapA = 0.44, gapB = 0.47;
    const sm = curve.getSpacedPoints(N), rails = [[], []], railRep = [[], []];
    const up = V(0, 1, 0), g = group(0, 0, 0);
    for (let i = 0; i < N; i++) {
      const u = i / N, p = curve.getPointAt(u), t = curve.getTangentAt(u), s = V().crossVectors(t, up).normalize();
      const inGap = u > gapA && u < gapB, near = u > gapA - 0.004 && u < gapB + 0.004;
      [0, 1].forEach(k => {
        const rp = p.clone().addScaledVector(s, k ? 0.6 : -0.6);
        if (!inGap) rails[k].push(rp); if (near) railRep[k].push(rp);
      });
      if (!inGap && i % 3 === 0) { const tie = box(1.6, 0.12, 0.25, M.wood, p.x, p.y - 0.1, p.z, g); tie.lookAt(p.clone().add(t)); }
      if (!inGap && i % 9 === 0 && p.y > 2) { cyl(0.18, 0.25, p.y, M.rust, p.x, p.y / 2, p.z, g, 6); colCirc(p.x, p.z, 0.35); }
    }
    // 레일: 갭 직후부터 갭 직전까지 이어지도록 회전
    const startIdx = Math.floor(gapA * N) + 1;
    rails.forEach(r => {
      const ordered = r.slice(startIdx).concat(r.slice(0, startIdx));
      const c = new THREE.CatmullRomCurve3(ordered, false);
      mesh(new THREE.TubeGeometry(c, 500, 0.1, 5, false), M.metal, 0, 0, 0, g);
    });
    const repair = new THREE.Group(); g.add(repair); repair.visible = false;
    railRep.forEach(r => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(r), 30, 0.12, 5, false), new THREE.MeshStandardMaterial({ color: 0x8a8a90, metalness: 0.9, roughness: 0.3, emissive: 0x221100 }), 0, 0, 0, repair));
    // 차량
    const cars = [];
    for (let i = 0; i < 3; i++) {
      const c = group(0, 0, 0, g);
      box(1.5, 0.7, 2, M.red, 0, 0.55, 0, c); box(1.5, 0.6, 0.2, M.navy, 0, 1.1, -0.9, c); box(1.3, 0.2, 0.6, M.metal, 0, 1.0, 0.4, c);
      cars.push(c);
    }
    box(18, 1, 5, M.tile, 37, 0.5, 51.5); colBox(28, 46, 49, 54);
    box(4, 3, 3, M.navy, 25, 1.5, 50); colBox(23, 27, 48.5, 51.5);
    const rider = W.makeShadow(); rider.scale.setScalar(0.55); rider.visible = false; cars[2].add(rider); rider.position.set(0, 0.6, 0.2);
    W.coaster = { g, curve, cars, repair, rider, u: 0, speed: 0, power: false, gapPos: curve.getPointAt((gapA + gapB) / 2) };
  }

  function carousel(x, z) {
    const base = group(x, 0, z), spin = group(0, 0, 0, base), horses = [], bulbs = [];
    cyl(9, 9.3, 0.6, M.tile, 0, 0.3, 0, base, 32);
    cyl(0.6, 0.6, 7, M.rust, 0, 3.8, 0, spin, 10);
    const roof = mesh(new THREE.ConeGeometry(10, 3, 24, 1, true), M.stripe, 0, 8.6, 0, spin);
    cyl(10, 10, 0.6, M.red, 0, 7, 0, spin, 24);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2, px = Math.cos(a) * 6.5, pz = Math.sin(a) * 6.5;
      cyl(0.06, 0.06, 6.4, M.rust, px, 3.8, pz, spin, 5);
      const h = group(px, 1.6, pz, spin); h.rotation.y = -a;
      const wm = i % 2 ? M.cream : new THREE.MeshStandardMaterial({ color: 0x3a3a44, roughness: 1 });
      box(0.4, 0.55, 1.5, wm, 0, 0, 0, h); box(0.3, 0.7, 0.3, wm, 0, 0.45, 0.75, h).rotation.x = -0.4;
      box(0.28, 0.3, 0.55, wm, 0, 0.75, 1.0, h);
      [[-0.15, 0.5], [0.15, 0.5], [-0.15, -0.5], [0.15, -0.5]].forEach(([lx, lz]) => box(0.08, 0.6, 0.08, wm, lx, -0.5, lz, h).rotation.x = lz * 0.6);
      sph(0.04, M.eye, 0.15, 0.8, 1.2, h, 4); sph(0.04, M.eye, -0.15, 0.8, 1.2, h, 4);
      horses.push(h);
    }
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; bulbs.push(sph(0.15, M.bulbOff, Math.cos(a) * 10, 7, Math.sin(a) * 10, spin, 6)); }
    colCirc(x, z, 9.6);
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2 + 0.3, m = W.makeMannequin(x + Math.cos(a) * 12.5, z + Math.sin(a) * 12.5);
      m.rotation.y = a + Math.PI / 2 + rnd(); m.userData.home = m.position.clone(); W.mannequins.push(m); colCirc(m.position.x, m.position.z, 0.4);
    }
    W.carousel = { g: base, spin, horses, bulbs, speed: 0, power: false, forced: 0 };
  }

  function bumper(cx, cz) {
    const w = 24, d = 16, g = group(cx, 0, cz), carCols = [0x5a0d0d, 0x1b2340, 0x5a4a10, 0x2a3a2a, 0x4a1a3a, 0x3a3a3a];
    box(w, 0.2, d, new THREE.MeshStandardMaterial({ color: 0x1e2024, metalness: 0.8, roughness: 0.4 }), 0, 0.1, 0, g);
    const x1 = cx - w / 2, x2 = cx + w / 2, z1 = cz - d / 2, z2 = cz + d / 2;
    const wall = (ax, az, bx, bz) => { box(Math.abs(bx - ax) + 0.3, 1, Math.abs(bz - az) + 0.3, M.red, (ax + bx) / 2 - cx, 0.5, (az + bz) / 2 - cz, g); colBox(ax - 0.2, bx + 0.2, az - 0.2, bz + 0.2); };
    wall(x1, z1, x2, z1); wall(x1, z2, x2, z2); wall(x2, z1, x2, z2); wall(x1, z1, x1, cz - 2.5); wall(x1, cz + 2.5, x1, z2);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => cyl(0.2, 0.2, 6, M.rust, sx * w / 2, 3, sz * d / 2, g, 6));
    const roof = box(w, 0.2, d, new THREE.MeshStandardMaterial({ color: 0x0b0c10, roughness: 1, side: THREE.DoubleSide }), 0, 6, 0, g);
    const grid = [];
    for (let i = -5; i <= 5; i++) grid.push(box(0.08, 0.05, d, M.bulbOff, i * 2.2, 5.85, 0, g));
    const cars = [];
    for (let i = 0; i < 6; i++) {
      const c = group(cx - 7 + (i % 3) * 6, 0, cz - 3 + Math.floor(i / 3) * 6);
      const col = new THREE.MeshStandardMaterial({ color: carCols[i], roughness: 0.7, metalness: 0.3 });
      box(1.5, 0.45, 2.1, col, 0, 0.45, 0, c); box(1.1, 0.5, 0.6, col, 0, 0.85, -0.6, c);
      const ring = mesh(new THREE.TorusGeometry(1.15, 0.15, 6, 20), M.black, 0, 0.35, 0, c); ring.rotation.x = Math.PI / 2; ring.scale.set(0.8, 1.05, 1);
      cyl(0.03, 0.03, 4.8, M.metal, 0, 3.5, -0.9, c, 4);
      sph(0.12, M.bulbOff, 0, 0.75, 1.05, c, 6);
      c.rotation.y = rnd() * 6.28; c.userData = { vx: 0, vz: 0, home: c.position.clone(), headl: c.children[c.children.length - 1] };
      cars.push(c);
    }
    W.bumper = { g, cars, grid, x1, x2, z1, z2, power: false, cx, cz };
  }

  function gate() {
    const g = group(0, 0, 76);
    [-5.5, 5.5].forEach(s => { box(1.4, 7, 1.4, M.red, s, 3.5, 0, g); sph(0.8, M.navy, s, 7.6, 0, g); });
    const arch = mesh(new THREE.PlaneGeometry(10, 2), new THREE.MeshStandardMaterial({ map: signTex('해 피 랜 드', 'HAPPY LAND · 1987', '#1a1030', '#b89a5a'), emissive: 0x150a0a, side: THREE.DoubleSide }), 0, 7.6, 0, g);
    arch.rotation.z = 0.04;
    const doors = [-1, 1].map(s => {
      const h = group(s * 4.8, 0, 0, g);
      for (let i = 0; i < 10; i++) cyl(0.05, 0.05, 4, M.rust, -s * (0.25 + i * 0.45), 2, 0, h, 5);
      box(4.8, 0.12, 0.12, M.rust, -s * 2.4, 3.9, 0, h); box(4.8, 0.12, 0.12, M.rust, -s * 2.4, 0.3, 0, h);
      return h;
    });
    W.gate = { g, doors, open: 0, target: 0, col: colBox(-4.8, 4.8, 75.6, 76.4) };
  }

  function perimeter() {
    const L = -75, R = 75, T = -75, B = 76;
    colBox(L - 2, L, T, B + 2); colBox(R, R + 2, T, B + 2); colBox(L, R, T - 2, T); colBox(L, -4.8, B, B + 2); colBox(4.8, R, B, B + 2);
    const post = new THREE.CylinderGeometry(0.06, 0.06, 3, 4), pts = [];
    for (let x = L; x <= R; x += 2) { pts.push([x, T]); if (Math.abs(x) > 6) pts.push([x, B]); }
    for (let z = T; z <= B; z += 2) { pts.push([L, z]); pts.push([R, z]); }
    const im = new THREE.InstancedMesh(post, M.rust, pts.length), m4 = new THREE.Matrix4();
    pts.forEach(([x, z], i) => { m4.makeRotationZ((rnd() - 0.5) * 0.15); m4.setPosition(x, 1.5, z); im.setMatrixAt(i, m4); });
    scene.add(im);
    [[0, T, 150, 0.08], [-40, B, 70, 0.08], [40, B, 70, 0.08], [L, 0.5, 0.08, 151], [R, 0.5, 0.08, 151]].forEach(([x, z, w, d]) => {
      [1, 2.6].forEach(y => box(w, 0.08, d, M.rust, x, y, z));
    });
  }

  W.build = (sc) => {
    scene = sc; mats();
    const gr = mesh(new THREE.PlaneGeometry(400, 400), M.ground); gr.rotation.x = -Math.PI / 2;
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x241f1c, roughness: 1 });
    [[0, 48, 6, 56, 0], [-22, 25, 40, 5, 0.3], [22, 25, 40, 5, -0.3], [-20, -12, 5, 50, 0.6], [20, -12, 5, 50, -0.6]].forEach(([x, z, w, d, r]) => {
      const p = mesh(new THREE.PlaneGeometry(w, d), pathMat, x, 0.02, z); p.rotation.x = -Math.PI / 2; p.rotation.z = r;
    });
    const plaza = mesh(new THREE.CircleGeometry(12, 32), M.tile, 0, 0.03, 18); plaza.rotation.x = -Math.PI / 2; plaza.material.map.repeat.set(6, 6);
    // 분수
    cyl(3.6, 3.8, 0.8, M.cream, 0, 0.4, 18, scene, 24); cyl(3.2, 3.2, 0.82, new THREE.MeshStandardMaterial({ color: 0x050608, metalness: 0.9, roughness: 0.15 }), 0, 0.42, 18, scene, 24);
    cyl(0.4, 0.6, 3, M.cream, 0, 1.5, 18); W.statue = W.makeMascot(); W.statue.visible = true; W.statue.position.set(0, 3, 18); W.statue.scale.setScalar(0.8);
    colCirc(0, 18, 3.9);

    gate(); perimeter();
    booth(-10, 66, '매 표 소'); booth(10, 66, '안 내 소');
    ferris(-40, 30); coaster(); carousel(-40, -32); bumper(42, -36);

    // 표지판
    sign(-4, 30, 0.6, '관람차', '← CH.1'); sign(4, 30, -0.6, '롤러코스터', 'CH.2 →');
    sign(-6, 6, -0.6, '회전목마', '← CH.3'); sign(6, 6, 0.6, '범퍼카', 'CH.4 →');
    sign(0, 60, 0, '폐 장', '1996.11.24'); sign(-28, -46, 0.4, '미아 보호소', '엄마를 기다리세요'); sign(55, 58, 3.1, '출구 없음', 'NO EXIT');

    // 조명/가로등
    [[-3.5, 64, 1], [3.5, 52, 0], [-3.5, 40, 1], [6, 22, 0], [-20, 26, 1], [-30, 36, 0], [20, 26, 1], [32, 40, 1], [-12, 0, 0], [-26, -20, 1], [12, 0, 0], [26, -20, 1], [-50, 14, 0], [55, 30, 0], [-55, -50, 0], [58, -52, 1], [0, -10, 0]].forEach(([x, z, r]) => lamp(x, z, r));
    for (let i = 0; i < 46; i++) {
      const a = rnd() * 6.28, edge = rnd() < 0.5;
      let x = edge ? (rnd() < 0.5 ? -70 : 70) + (rnd() - 0.5) * 6 : (rnd() - 0.5) * 140, z = edge ? (rnd() - 0.5) * 140 : (rnd() < 0.5 ? -70 : 70) + (rnd() - 0.5) * 4;
      if (z > 62 && Math.abs(x) < 16) continue;
      tree(x, z);
    }
    [[-8, 48, 1.57], [8, 44, -1.57], [-14, 20, 1.2], [14, 16, -1.2], [-52, 46, 0.5], [-30, -8, 0.3], [60, 40, 3], [30, -52, 0]].forEach(b => bench(...b));
    // 쓰러진 풍선 가판대 / 쓰레기통
    [[-18, 50], [18, 56], [-60, 0], [62, 0], [0, -40], [-20, -58]].forEach(([x, z]) => { cyl(0.4, 0.35, 1, M.navy, x, 0.5, z, scene, 8); colCirc(x, z, 0.5); });
    // 미아 보호소 오두막
    box(6, 3.5, 5, M.navy, -22, 1.75, -54); colBox(-25, -19, -56.5, -51.5);
    box(6.6, 0.3, 5.6, M.red, -22, 3.6, -54);

    W.mascot = W.makeMascot(); W.doll = W.makeDoll(); W.shadow = W.makeShadow();
    W.mascot2 = W.makeMascot();
    W.balloon = new THREE.Group(); sph(0.45, new THREE.MeshStandardMaterial({ color: 0x7a0000, roughness: 0.4, emissive: 0x200000 }), 0, 0, 0, W.balloon, 12);
    beam(V(0, -0.45, 0), V(0, -2.2, 0), 0.01, M.cream, W.balloon); W.balloon.visible = false; scene.add(W.balloon);
    W.extraMannequins = [];
    for (let i = 0; i < 6; i++) { const m = W.makeMannequin(0, -500); m.visible = false; W.extraMannequins.push(m); }
    W.silhouette = W.makeShadow(); W.silhouette.scale.setScalar(0.55);
  };

  // ---------- 매 프레임 애니메이션 ----------
  const tmp = V();
  W.update = (dt, t) => {
    const f = W.ferris;
    f.speed += ((f.power ? 0.06 : 0) - f.speed) * dt * 0.5;
    f.wheel.rotation.z += f.speed * dt;
    f.gond.forEach(p => { p.rotation.z = -f.wheel.rotation.z + Math.sin(t * 1.3 + p.id) * 0.04; });

    const c = W.coaster;
    c.speed += ((c.power ? 0.035 : 0) - c.speed) * dt * 0.6;
    c.u = (c.u + c.speed * dt) % 1;
    c.cars.forEach((car, i) => {
      const u = (c.u - i * 0.009 + 1) % 1;
      car.position.copy(c.curve.getPointAt(u));
      car.lookAt(tmp.copy(c.curve.getPointAt((u + 0.002) % 1)));
    });

    const k = W.carousel;
    if (k.forced > 0) k.forced -= dt;
    const kTarget = k.power || k.forced > 0 ? 0.5 : 0;
    k.speed += (kTarget - k.speed) * dt * 0.8;
    k.spin.rotation.y += k.speed * dt;
    k.horses.forEach((h, i) => { h.position.y = 1.6 + Math.sin(t * 2.2 + i) * 0.35 * Math.min(1, k.speed * 2); });

    W.lights.forEach(l => {
      if (l.userData.off) { l.intensity = 0; return; }
      l.intensity = l.userData.base * (l.userData.flicker && Math.random() < 0.06 ? Math.random() * 0.3 : 1);
    });
    const gt = W.gate; gt.open += (gt.target - gt.open) * dt * 1.5;
    gt.doors[0].rotation.y = -gt.open * 1.6; gt.doors[1].rotation.y = gt.open * 1.6;
  };
  W.setBulbs = (arr, on, red) => arr.forEach(b => b.material = on ? (red ? M.bulbRed : M.bulb) : M.bulbOff);
  W.lampsOn = (on, red) => {
    W.lights.forEach(l => { l.userData.off = !on; l.color.setHex(red ? 0xff1a1a : 0xff9955); });
    W.lamps.forEach(b => b.material = on ? (red ? M.bulbRed : M.bulb) : M.bulbOff);
  };
  return W;
})();
