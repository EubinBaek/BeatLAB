(function () {
  'use strict';

  const DRAMATIC = !!window.BG_DRAMATIC;

  // ── Per-page presets ─────────────────────────────────────────
  const CFG = DRAMATIC ? {
    // ── 랜딩 페이지: 강하고 빠르게 ──────────────────────────
    SPRING:0.075, DAMP:0.22,  DIFFUSE:0.09,
    PUSH_STRENGTH:0.75, PUSH_MAX:30,  PUSH_RADIUS:65,
    RING_STRENGTH_N:0.60, RING_STRENGTH_F:0.90,
    RING_SPD_N:3.8,       RING_SPD_F:5.5,
    RING_MAXR_N:0.42,     RING_MAXR_F:0.60,
    RING_THROTTLE:55,  AMBIENT_STR:0.32, AMBIENT_INTERVAL:1800, BAND:14,
  } : {
    // ── 나머지 페이지: 은은하고 작게 ────────────────────────
    SPRING:0.08,  DAMP:0.26,  DIFFUSE:0.03,
    PUSH_STRENGTH:0.06, PUSH_MAX:2.5, PUSH_RADIUS:18,
    RING_STRENGTH_N:0.08, RING_STRENGTH_F:0.13,
    RING_SPD_N:2.2,       RING_SPD_F:3.0,
    RING_MAXR_N:0.28,     RING_MAXR_F:0.38,
    RING_THROTTLE:160, AMBIENT_STR:0.06, AMBIENT_INTERVAL:3500, BAND:6,
  };

  // Physics grid: 1/5 screen resolution  (fewer iterations = faster)
  const DISP_SCALE = 5;
  // Gradient texture: 1/3 screen res (WebGL bilinear upscale = soft look)
  const GRAD_SCALE = 3;
  // Max displacement stored in grid pixels
  const MAX_DISP = 32;

  // ── WebGL canvas ─────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0',
    width: '100%', height: '100%',
    zIndex: '0', pointerEvents: 'none',
  });
  document.body.prepend(canvas);

  const cssBlob = document.querySelector('.blob-wrap');
  if (cssBlob) cssBlob.style.display = 'none';

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) { console.warn('WebGL unavailable'); return; }

  // ── GLSL shaders ─────────────────────────────────────────────
  // Vertex: fullscreen quad, flip Y so UV (0,0) = top-left (canvas convention)
  const VS = `
    attribute vec2 a_pos;
    varying   vec2 v_uv;
    void main(){
      v_uv        = vec2(a_pos.x*0.5+0.5, 0.5-a_pos.y*0.5);
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }`;

  // Fragment: decode displacement texture, warp gradient sample
  const FS = `
    precision mediump float;
    uniform sampler2D u_grad;   // static gradient (low-res, bilinear filtered)
    uniform sampler2D u_disp;   // displacement field  (R=dx, G=dy, 128=zero)
    uniform vec2      u_scale;  // max displacement in UV units (x,y)
    varying vec2      v_uv;
    void main(){
      vec2 enc  = texture2D(u_disp, v_uv).rg;
      vec2 disp = (enc - 0.5) * (2.0 * u_scale);
      vec2 uv   = clamp(v_uv + disp, 0.001, 0.999);
      gl_FragColor = texture2D(u_grad, uv);
    }`;

  function mkShader(type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s); return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, mkShader(gl.VERTEX_SHADER,   VS));
  gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog); gl.useProgram(prog);

  // Fullscreen quad (triangle strip)
  const vbuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uGrad  = gl.getUniformLocation(prog, 'u_grad');
  const uDisp  = gl.getUniformLocation(prog, 'u_disp');
  const uScale = gl.getUniformLocation(prog, 'u_scale');
  gl.uniform1i(uGrad, 0);
  gl.uniform1i(uDisp, 1);

  function mkTex(unit){
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  }
  const gradTex = mkTex(0);
  const dispTex = mkTex(1);

  // ── Gradient drawn once to a small 2D canvas, then uploaded ──
  const gradCanvas = document.createElement('canvas');
  const gc = gradCanvas.getContext('2d');

  function drawGrad(w, h){
    gradCanvas.width = w; gradCanvas.height = h;

    gc.fillStyle = '#F3EDD8';
    gc.fillRect(0, 0, w, h);

    const cx = w*0.5, cy = h - w*0.46, R = w*0.60, fy = cy - R*0.05;

    const bg = gc.createRadialGradient(cx, fy, 0, cx, fy, R);
    bg.addColorStop(0.00, '#4DD4C8');
    bg.addColorStop(0.08, '#4DD4C8');
    bg.addColorStop(0.18, '#c9a090');
    bg.addColorStop(0.30, '#E8705A');
    bg.addColorStop(0.45, '#e8906a');
    bg.addColorStop(0.60, '#f0c0a0');
    bg.addColorStop(0.75, 'rgba(240,192,160,0)');
    gc.fillStyle = bg; gc.fillRect(0, 0, w, h);

    const rg = gc.createRadialGradient(cx, fy, 0, cx, fy, R*1.16);
    rg.addColorStop(0.60, 'rgba(77,212,200,0)');
    rg.addColorStop(0.68, 'rgba(77,212,200,0.75)');
    rg.addColorStop(0.78, 'rgba(77,212,200,0.30)');
    rg.addColorStop(0.90, 'rgba(77,212,200,0)');
    gc.fillStyle = rg; gc.fillRect(0, 0, w, h);

    const ig = gc.createRadialGradient(cx, fy, 0, cx, fy, R*0.12);
    ig.addColorStop(0.00, 'rgba(28,207,201,0.55)');
    ig.addColorStop(1.00, 'rgba(28,207,201,0)');
    gc.fillStyle = ig; gc.fillRect(0, 0, w, h);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gradTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gradCanvas);
  }

  // ── Physics state ────────────────────────────────────────────
  let W, H, gw, gh;
  let dispX, dispY, velX, velY;
  let dispBytes;   // Uint8Array uploaded to GPU each frame

  function resize(){
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    gl.viewport(0, 0, W, H);

    drawGrad(Math.ceil(W/GRAD_SCALE), Math.ceil(H/GRAD_SCALE));

    gw = Math.ceil(W / DISP_SCALE);
    gh = Math.ceil(H / DISP_SCALE);
    const N = gw * gh;
    dispX = new Float32Array(N);
    dispY = new Float32Array(N);
    velX  = new Float32Array(N);
    velY  = new Float32Array(N);

    // Displacement texture: R=dx, G=dy (128 = zero offset)
    dispBytes = new Uint8Array(N * 4);
    for (let i = 0; i < N*4; i += 4){
      dispBytes[i] = 128; dispBytes[i+1] = 128; dispBytes[i+3] = 255;
    }
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, dispTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gw, gh, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, dispBytes);

    // u_scale: how many UV units correspond to MAX_DISP grid pixels
    gl.uniform2f(uScale, MAX_DISP / gw, MAX_DISP / gh);
  }
  resize();
  window.addEventListener('resize', resize);

  // ── Wave rings (pure displacement, no visual stroke) ─────────
  const rings = [];
  let ambientT = 0, mouseRingT = 0, lastRingX = 0, lastRingY = 0;

  function spawnRing(sx, sy, opts){
    rings.push({
      sx, sy, r: 0,
      maxR:     opts.maxR     ?? Math.hypot(W,H)*0.85,
      strength: opts.strength ?? 0.28,
      spd:      opts.spd      ?? 1.6,
    });
  }

  const BAND = CFG.BAND;

  function applyRings(dt){
    for (let i = rings.length-1; i >= 0; i--){
      const rg = rings[i];
      const progress = rg.r / rg.maxR;
      const alpha    = (1-progress)**1.6;
      if (alpha < 0.008){ rings.splice(i,1); continue; }

      const gcx = rg.sx / DISP_SCALE, gcy = rg.sy / DISP_SCALE;
      const gr  = rg.r  / DISP_SCALE;
      const x0 = Math.max(0,    Math.floor(gcx-gr-BAND));
      const x1 = Math.min(gw-1, Math.ceil (gcx+gr+BAND));
      const y0 = Math.max(0,    Math.floor(gcy-gr-BAND));
      const y1 = Math.min(gh-1, Math.ceil (gcy+gr+BAND));
      const str = rg.strength * alpha;

      for (let y = y0; y <= y1; y++){
        for (let x = x0; x <= x1; x++){
          const dx = x-gcx, dy = y-gcy;
          const dist = Math.hypot(dx, dy);
          if (dist < 0.5) continue;
          const phase = dist - gr;
          if (Math.abs(phase) > BAND) continue;
          const imp = Math.sin(phase/BAND*Math.PI) * str;
          const idx = y*gw + x;
          velX[idx] += (dx/dist)*imp;
          velY[idx] += (dy/dist)*imp;
        }
      }
      rg.r += rg.spd;
    }

    ambientT += dt;

    if (window.BG_ANALYZING) {
      // 분석 중: 무작위 위치에서 강하게, 빠르게 여러 번 터짐
      if (ambientT > 480) {
        ambientT = 0;
        const count = 2 + Math.floor(Math.random() * 2); // 2~3개 동시 발생
        for (let k = 0; k < count; k++) {
          // 화면 전체에서 완전 무작위 위치
          const rx = W * (0.08 + Math.random() * 0.84);
          const ry = H * (0.08 + Math.random() * 0.84);
          spawnRing(rx, ry, {
            strength: 0.55 + Math.random() * 0.65,          // 0.55 ~ 1.20 (매우 강함)
            spd:      3.5  + Math.random() * 3.5,            // 3.5 ~ 7.0 (빠름)
            maxR:     Math.hypot(W, H) * (0.45 + Math.random() * 0.50), // 45~95%
          });
        }
      }
    } else if (ambientT > CFG.AMBIENT_INTERVAL) {
      ambientT = 0;
      spawnRing(W*0.5, H*0.65, {
        strength: CFG.AMBIENT_STR, spd: 1.2,
        maxR: Math.hypot(W,H)*0.92,
      });
    }
  }

  // ── Mouse ────────────────────────────────────────────────────
  let pmx = 0, pmy = 0;
  window.addEventListener('mousemove', e => {
    const vx = e.clientX - pmx, vy = e.clientY - pmy;
    pmx = e.clientX; pmy = e.clientY;
    const speed = Math.hypot(vx, vy);
    if (speed < 1) return;

    const gx = e.clientX/DISP_SCALE, gy = e.clientY/DISP_SCALE;
    const nx = vx/speed, ny = vy/speed;
    const str = Math.min(speed*CFG.PUSH_STRENGTH, CFG.PUSH_MAX);
    const rad = CFG.PUSH_RADIUS;
    const x0 = Math.max(0,    (gx-rad)|0),  x1 = Math.min(gw-1, (gx+rad+1)|0);
    const y0 = Math.max(0,    (gy-rad)|0),  y1 = Math.min(gh-1, (gy+rad+1)|0);

    for (let y = y0; y <= y1; y++){
      for (let x = x0; x <= x1; x++){
        const dx = x-gx, dy = y-gy, d2 = dx*dx+dy*dy;
        if (d2 >= rad*rad) continue;
        const f = (1-Math.sqrt(d2)/rad)**2 * str;
        const i = y*gw+x;
        velX[i] += nx*f; velY[i] += ny*f;
      }
    }

    // Throttled ring spawn
    mouseRingT += speed;
    const md = Math.hypot(e.clientX-lastRingX, e.clientY-lastRingY);
    if (mouseRingT > CFG.RING_THROTTLE || md > CFG.RING_THROTTLE*0.7){
      mouseRingT = 0; lastRingX = e.clientX; lastRingY = e.clientY;
      const fast = speed > 14;
      spawnRing(e.clientX, e.clientY, {
        strength: fast ? CFG.RING_STRENGTH_F : CFG.RING_STRENGTH_N,
        spd:      fast ? CFG.RING_SPD_F      : CFG.RING_SPD_N,
        maxR:     Math.hypot(W,H) * (fast ? CFG.RING_MAXR_F : CFG.RING_MAXR_N),
      });
    }
  }, { passive: true });

  // ── Render (CPU physics → encode → GPU draw) ─────────────────
  const { SPRING, DAMP, DIFFUSE } = CFG;
  let frameN = 0;

  function render(){
    const N = gw*gh;

    // 1. Spring-damper physics (typed-array loops → JIT-friendly)
    for (let i = 0; i < N; i++){
      velX[i] += -SPRING*dispX[i] - DAMP*velX[i];
      velY[i] += -SPRING*dispY[i] - DAMP*velY[i];
      dispX[i] += velX[i];
      dispY[i] += velY[i];
    }

    // 2. Diffusion every other frame (halves cost)
    if (frameN & 1){
      for (let y = 1; y < gh-1; y++){
        for (let x = 1; x < gw-1; x++){
          const i = y*gw+x;
          const ax = (dispX[i-1]+dispX[i+1]+dispX[i-gw]+dispX[i+gw])*0.25;
          const ay = (dispY[i-1]+dispY[i+1]+dispY[i-gw]+dispY[i+gw])*0.25;
          dispX[i] += DIFFUSE*(ax-dispX[i]);
          dispY[i] += DIFFUSE*(ay-dispY[i]);
        }
      }
    }

    // 3. Encode Float32 → Uint8 for texture upload
    //    byte = clamp((disp/MAX + 0.5)*255, 0, 255)
    const scale = 255 / (MAX_DISP * 2);
    const offset = 0.5 * 255;
    for (let i = 0; i < N; i++){
      let ex = (dispX[i]*scale + offset + 0.5)|0;
      let ey = (dispY[i]*scale + offset + 0.5)|0;
      if (ex < 0) ex = 0; else if (ex > 255) ex = 255;
      if (ey < 0) ey = 0; else if (ey > 255) ey = 255;
      const bi = i*4;
      dispBytes[bi]   = ex;
      dispBytes[bi+1] = ey;
    }

    // 4. Upload displacement field (small texture ≈ 288×162 px for 1440×810)
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, dispTex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gw, gh,
                     gl.RGBA, gl.UNSIGNED_BYTE, dispBytes);

    // 5. GPU draws full-resolution frame in one call — shader does all sampling
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // ── Loop ─────────────────────────────────────────────────────
  let lastTs = 0;
  let bgReadyFired = false;

  function loop(ts){
    // 백그라운드 탭에서는 물리/렌더를 건너뛰어 CPU/GPU 점유율 절감
    if (document.hidden) {
      requestAnimationFrame(loop);
      return;
    }

    const dt = Math.min(ts - lastTs, 50);
    lastTs = ts; frameN++;
    applyRings(dt);
    render();

    // 첫 프레임 렌더 완료 후 transition.js에 신호 전송
    if (!bgReadyFired) {
      bgReadyFired = true;
      requestAnimationFrame(() => {
        document.dispatchEvent(new CustomEvent('bg-ready'));
      });
    }

    requestAnimationFrame(loop);
  }

  // 첫 프레임을 즉시 렌더해서 GPU 파이프라인 워밍업
  // (셰이더 컴파일·텍스처 업로드를 루프 시작 전에 끝냄)
  render();
  requestAnimationFrame(loop);
})();
