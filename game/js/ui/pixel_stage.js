/**
 * game/js/ui/pixel_stage.js
 * 카이로소프트(Kairosoft) / Game Dev Tycoon 스타일 실시간 2D 픽셀아트 게임 스테이지 렌더러
 * - [모드 1] 🗺️ 서울 스타트업 상가 거리 (Seoul Startup Street Map)
 *   - 실제 길 이동: A/D/W/S, 방향키 또는 캔버스 클릭으로 대표(CEO) 캐릭터가 거리를 직접 활보
 *   - 5대 핵심 상가 & 건물:
 *     1) 🏚️ 신림 상가 & 자취방 1호점 (자취방 서버실 진입)
 *     2) 🔌 용산 전자상가 & 나진 채굴 매장 (당근 중고 GPU 조달 장터)
 *     3) 🏢 구로디지털단지 지식산업센터 (2호점 상가 임대 & 관리)
 *     4) 🏛️ 테헤란로 TIPS 타운 (중기부 지원사업 & VC 피칭장)
 *     5) ⚡ 한국전력공사 지사 & 스타트업 카페 (인재 채용 & 전력)
 *   - 배달 오토바이, 택시, 버스 주행 + 행인/NPC 말풍선 + 상가 근접 시 [Space/클릭] 상호작용
 * - [모드 2] 🖥️ 사업장 서버실 내부 (Server Room View)
 *   - 랙 장착 GPU 도트 그래픽 + 회전 쿨링팬 + 과열 연기 + 차단기 트립 정전 연출
 *   - 근무 중인 직원 도트 캐릭터 애니메이션
 */

(function () {
  const STAGE_W = 320;
  const STAGE_H = 160;
  const STREET_W = 640;

  let stageMode = 'street'; // 'street' or 'room'
  let selectedOfficeIdx = 0;
  let animTick = 0;
  let camX = 0;

  const particles = [];
  const floatingTexts = [];
  const actors = [];
  let snowFlakes = [];

  // Street Player (Founder)
  const streetPlayer = {
    x: 75,
    y: 110,
    targetX: null,
    targetY: null,
    dir: 1, // 1=right, -1=left
    isMoving: false,
    speed: 2.2,
    nearBuilding: null
  };

  // Keyboard state for smooth street movement
  const keysDown = { left: false, right: false, up: false, down: false };

  // Vehicles on the street (Scooters, Taxis, Town Buses)
  const streetVehicles = [
    { type: 'scooter', x: 40, y: 138, speed: 3.4, dir: 1, color: '#06b6d4', boxColor: '#0ea5e9' },
    { type: 'taxi', x: 360, y: 147, speed: 2.5, dir: -1, color: '#f59e0b', boxColor: '#ffffff' },
    { type: 'bus', x: 580, y: 146, speed: 1.8, dir: -1, color: '#10b981', boxColor: '#ffffff' }
  ];

  // Street Pedestrian NPCs
  const streetPedestrians = [
    { x: 195, y: 112, dir: -1, jobId: 'technician', name: '용산 상인', bubble: '채굴장 폐업 GPU 꿀매물!', timer: 120 },
    { x: 345, y: 116, dir: 1, jobId: 'devops', name: '이직 희망자', bubble: '스타트업 스카우트 대기 중', timer: 150 },
    { x: 450, y: 110, dir: -1, jobId: 'admin_gov', name: 'TIPS 주무관', bubble: '사업계획서 심사 중', timer: 180 },
    { x: 575, y: 116, dir: 1, jobId: 'backend', name: '카페 단골', bubble: '아아 마시고 밤샘 코딩', timer: 210 }
  ];

  // 5 Commercial Buildings along the 640px panoramic street
  const STREET_BUILDINGS = [
    {
      id: 'sinrim',
      name: '신림 상가 & 자취방',
      sub: '⚡ 1호점 서버실',
      x: 25,
      w: 105,
      h: 88,
      actionText: '[Space/클릭: 🏚️ 1호점 서버실 입장]',
      onAction: () => {
        selectPixelStageOffice(0);
        if (typeof showToast === 'function') showToast('🏢 신림 1호점 서버실 내부로 입장했습니다.');
      }
    },
    {
      id: 'yongsan',
      name: '용산 전자상가 & 나진',
      sub: '🥕 당근 중고 & 채굴장 매장',
      x: 155,
      w: 105,
      h: 90,
      actionText: '[Space/클릭: 🥕 중고 GPU 장터]',
      onAction: () => {
        const btn = document.querySelector('[data-tab=tab-procure]');
        if (btn) btn.click();
        if (typeof showToast === 'function') showToast('🥕 용산 전자상가 & 당근 중고장터에 도착했습니다.');
      }
    },
    {
      id: 'guro',
      name: '구로 지식산업센터',
      sub: '🏢 벤처 타운 (2호점)',
      x: 285,
      w: 105,
      h: 92,
      actionText: '[Space/클릭: 🏢 구로 사업장 관리]',
      onAction: () => {
        const guroOfficeIdx = (window.state && Array.isArray(window.state.offices))
          ? window.state.offices.findIndex(o => o.presetId === 'guro_jisan')
          : -1;
        if (guroOfficeIdx >= 0) {
          selectPixelStageOffice(guroOfficeIdx);
          if (typeof showToast === 'function') showToast('🏢 구로 지식산업센터 2호점 서버실로 입장했습니다.');
        } else {
          if (typeof openOfficeModal === 'function') openOfficeModal();
          if (typeof showToast === 'function') showToast('🏢 구로 지식산업센터 신규 임대 계약 창을 열었습니다.');
        }
      }
    },
    {
      id: 'tips',
      name: '중기부 TIPS 타운',
      sub: '🏛️ 정부지원금 & VC IR',
      x: 415,
      w: 105,
      h: 92,
      actionText: '[Space/클릭: 🏛️ 지원사업/VC 피칭]',
      onAction: () => {
        const btn = document.querySelector('[data-tab=tab-finance]');
        if (btn) btn.click();
        if (typeof showToast === 'function') showToast('🏛️ 중기부 TIPS 타운 지원사업 센터에 도착했습니다.');
      }
    },
    {
      id: 'kepco',
      name: '한전 지사 & 테헤란 카페',
      sub: '⚡ 전력 & 👥 개발자 채용',
      x: 545,
      w: 90,
      h: 90,
      actionText: '[Space/클릭: 👥 인재 채용 & 복지]',
      onAction: () => {
        const btn = document.querySelector('[data-tab=tab-hr]');
        if (btn) btn.click();
        if (typeof showToast === 'function') showToast('☕ 스타트업 카페 & 개발자 채용 시장에 도착했습니다.');
      }
    }
  ];

  // Initialize snow/dust particles
  for (let i = 0; i < 20; i++) {
    snowFlakes.push({
      x: Math.random() * STREET_W,
      y: Math.random() * STAGE_H,
      s: 0.3 + Math.random() * 0.5
    });
  }

  // 8x10 Pixel Character Sprite Matrix Generator
  const CHAR_SPRITES = {
    idle1: [
      '..HHHH..',
      '.HHHHHH.',
      '.HSSSSH.',
      '.SESESH.',
      '..SSSS..',
      '.TTTTTT.',
      'TTTTTTTT',
      '.TTTTTT.',
      '..PPPP..',
      '..P..P..'
    ],
    walk1: [
      '..HHHH..',
      '.HHHHHH.',
      '.HSSSSH.',
      '.SESESH.',
      '..SSSS..',
      '.TTTTTT.',
      'TTTTTTTT',
      '.TTTTTT.',
      '.PP..PP.',
      'P......P'
    ]
  };

  const JOB_PALETTES = {
    ceo:         { H: '#1e293b', S: '#fde68a', T: '#f59e0b', P: '#334155', E: '#000000', label: '👑대표' },
    devops:      { H: '#0f172a', S: '#fed7aa', T: '#06b6d4', P: '#1e293b', E: '#000000', label: '🖥️인프라' },
    ai_research: { H: '#312e81', S: '#fef3c7', T: '#f8fafc', P: '#475569', E: '#0284c7', label: '🧠AI석박' },
    backend:     { H: '#1e1b4b', S: '#fde68a', T: '#3b82f6', P: '#1e293b', E: '#000000', label: '⚙️백엔드' },
    admin_gov:   { H: '#451a03', S: '#fef08a', T: '#10b981', P: '#374151', E: '#000000', label: '📑행정' },
    marketer:    { H: '#701a75', S: '#fde68a', T: '#ec4899', P: '#312e81', E: '#000000', label: '📢마케터' },
    sales:       { H: '#111827', S: '#fed7aa', T: '#6366f1', P: '#1f2937', E: '#000000', label: '🤝영업' },
    technician:  { H: '#7c2d12', S: '#fcd34d', T: '#f97316', P: '#292524', E: '#000000', label: '🔧테크' },
    intern:      { H: '#27272a', S: '#fef3c7', T: '#84cc16', P: '#3f3f46', E: '#000000', label: '🧹인턴' },
    cfo:         { H: '#374151', S: '#fde68a', T: '#a855f7', P: '#111827', E: '#000000', label: '👔CFO' },
    landlord:    { H: '#581c87', S: '#fca5a5', T: '#ef4444', P: '#7f1d1d', E: '#000000', label: '🚪집주인' }
  };

  const SPEECH_POOL = {
    ceo_normal: ['당근 꿀매물 없나..', 'GPU가 곧 돈이다!', '전기세 아껴야 해', '가즈아 유니콘!!', 'e나라도움 증빙 챙겨!'],
    ceo_hot: ['어우 방이 찜질방이네🔥', '에어컨 더 틀어!!', '써멀 다시 발라야 하나'],
    ceo_trip: ['악!! 두꺼비집 내려갔다!', '차단기 빨리 올려!!⚡'],
    emp_happy: ['오늘 코딩 잘 된다~', '법카 점심 최고!', '가동률 99.9% 유지 중', '모델 학습 순항 중🚀'],
    emp_tired: ['집에 가고 싶다...', '새벽 장애콜 살려줘', '번아웃 올 것 같아💦', '커피 수혈 시급..']
  };

  function drawPixelSprite(ctx, matrix, x, y, scale, palette, flipX = false) {
    for (let r = 0; r < matrix.length; r++) {
      const row = matrix[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[flipX ? (row.length - 1 - c) : c];
        if (ch === '.') continue;
        ctx.fillStyle = palette[ch] || '#fff';
        ctx.fillRect(Math.floor(x + c * scale), Math.floor(y + r * scale), scale, scale);
      }
    }
  }

  function drawPixelRect(ctx, x, y, w, h, fill, border = null) {
    ctx.fillStyle = fill;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
    if (border) {
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.floor(x) + 0.5, Math.floor(y) + 0.5, Math.floor(w) - 1, Math.floor(h) - 1);
    }
  }

  function spawnStageFloatingText(text, color = '#10b981', x = null, y = null) {
    floatingTexts.push({
      text,
      color,
      x: x !== null ? x : (130 + Math.random() * 140),
      y: y !== null ? y : (55 + Math.random() * 35),
      life: 48
    });
  }

  // --- 1. SEOUL STARTUP STREET MAP RENDERING ---
  function updateStreetPlayer() {
    let moving = false;
    let dx = 0;
    let dy = 0;

    // Keyboard Input
    if (keysDown.left) { dx -= 1; streetPlayer.dir = -1; moving = true; }
    if (keysDown.right) { dx += 1; streetPlayer.dir = 1; moving = true; }
    if (keysDown.up) { dy -= 1; moving = true; }
    if (keysDown.down) { dy += 1; moving = true; }

    // Click Target Navigation
    if (!moving && streetPlayer.targetX !== null) {
      const dist = streetPlayer.targetX - streetPlayer.x;
      if (Math.abs(dist) > 2) {
        dx = dist > 0 ? 1 : -1;
        streetPlayer.dir = dx;
        moving = true;
      } else {
        streetPlayer.targetX = null;
      }
      if (streetPlayer.targetY !== null) {
        const distY = streetPlayer.targetY - streetPlayer.y;
        if (Math.abs(distY) > 2) {
          dy = distY > 0 ? 1 : -1;
          moving = true;
        } else {
          streetPlayer.targetY = null;
        }
      }
    }

    if (moving) {
      streetPlayer.x += dx * streetPlayer.speed;
      streetPlayer.y += dy * (streetPlayer.speed * 0.7);
      streetPlayer.isMoving = true;

      // Footstep dust particles
      if (animTick % 6 === 0) {
        particles.push({
          x: streetPlayer.x + (streetPlayer.dir > 0 ? 2 : 12),
          y: streetPlayer.y + 18,
          vx: -dx * 0.4,
          vy: -0.3,
          color: '#94a3b8',
          size: 1.5,
          life: 14
        });
      }
    } else {
      streetPlayer.isMoving = false;
    }

    // Clamp inside sidewalk bounds
    streetPlayer.x = Math.max(15, Math.min(STREET_W - 20, streetPlayer.x));
    streetPlayer.y = Math.max(96, Math.min(125, streetPlayer.y));

    // Smooth Camera Scroll following player
    const targetCamX = Math.max(0, Math.min(STREET_W - STAGE_W, streetPlayer.x - STAGE_W / 2));
    camX += (targetCamX - camX) * 0.15;

    // Check Nearest Building
    let nearest = null;
    let minDist = 55;
    STREET_BUILDINGS.forEach(b => {
      const centerX = b.x + b.w / 2;
      const dist = Math.abs(streetPlayer.x - centerX);
      if (dist < minDist) {
        nearest = b;
        minDist = dist;
      }
    });
    streetPlayer.nearBuilding = nearest;
  }

  function drawStreetMap(ctx, season) {
    // 1. Sky & Distant Seoul Landmarks (Parallax background)
    let skyTop = '#0f172a';
    let skyBot = '#1e3a8a';
    if (season.id === 'summer') { skyTop = '#0284c7'; skyBot = '#38bdf8'; }
    if (season.id === 'winter') { skyTop = '#111827'; skyBot = '#374151'; }

    const grad = ctx.createLinearGradient(0, 0, 0, 92);
    grad.addColorStop(0, skyTop);
    grad.addColorStop(1, skyBot);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, STAGE_W, 92);

    // Distant N-Seoul Tower and skyscrapers silhouette
    const paraOffset = camX * 0.25;
    ctx.fillStyle = '#090d16';
    // N-Tower
    const towerX = 220 - paraOffset;
    if (towerX > -20 && towerX < STAGE_W + 20) {
      ctx.fillRect(towerX, 20, 4, 45);
      ctx.fillRect(towerX - 6, 35, 16, 5);
      ctx.fillRect(towerX - 2, 12, 8, 8);
      // Red blinking tower beacon
      if (Math.floor(animTick / 15) % 2 === 0) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(towerX + 1, 10, 2, 2);
        ctx.fillStyle = '#090d16';
      }
    }
    // Distant skyline blocks
    for (let i = 0; i < 9; i++) {
      const bx = (i * 80 + 30) - paraOffset;
      const bh = 25 + (i % 4) * 12;
      ctx.fillRect(bx, 92 - bh, 40, bh);
    }

    // 2. Commercial Buildings on the Street
    STREET_BUILDINGS.forEach(b => {
      const sx = Math.floor(b.x - camX);
      if (sx + b.w < -20 || sx > STAGE_W + 20) return;

      if (b.id === 'sinrim') {
        // Building 1: Brick building with GS25-style convenience store on 1F, rooftop room on 2F
        drawPixelRect(ctx, sx, 12, b.w, b.h, '#451a03', '#78350f'); // Brick wall
        // Windows with flower pots
        drawPixelRect(ctx, sx + 12, 22, 24, 22, '#fef08a', '#1e293b');
        drawPixelRect(ctx, sx + 50, 22, 24, 22, '#38bdf8', '#1e293b');
        // Air conditioning outdoor unit (실외기) on wall with spinning fan
        drawPixelRect(ctx, sx + 80, 26, 18, 14, '#e2e8f0', '#94a3b8');
        ctx.fillStyle = (Math.floor(animTick / 3) % 2 === 0) ? '#475569' : '#94a3b8';
        ctx.fillRect(sx + 84, 29, 10, 8);

        // 1F Convenience store & Entrance
        drawPixelRect(ctx, sx + 6, 52, b.w - 12, 38, '#0284c7', '#38bdf8');
        drawPixelRect(ctx, sx + 14, 58, 30, 26, '#f8fafc', '#0f172a');
        drawPixelRect(ctx, sx + 58, 56, 26, 32, '#1e293b', '#f59e0b'); // Door

        // Neon Sign
        drawPixelRect(ctx, sx + 10, 4, b.w - 20, 10, '#0f172a', '#f59e0b');
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 7px sans-serif';
        ctx.fillText('⚡ 신림 1호점', sx + 16, 12);

      } else if (b.id === 'yongsan') {
        // Building 2: Yongsan Electronics Mall with GPU clearance boxes
        drawPixelRect(ctx, sx, 10, b.w, b.h, '#1e293b', '#3b82f6');
        // Glass showroom display
        drawPixelRect(ctx, sx + 10, 48, b.w - 20, 40, '#0f172a', '#06b6d4');
        // GPU boxes stacked outside
        drawPixelRect(ctx, sx + 14, 72, 14, 12, '#10b981', '#047857');
        drawPixelRect(ctx, sx + 22, 64, 14, 10, '#f97316', '#c2410c');
        drawPixelRect(ctx, sx + 60, 68, 16, 14, '#8b5cf6', '#6d28d9');

        // Neon Sign
        const neonPulse = (Math.floor(animTick / 8) % 2 === 0);
        drawPixelRect(ctx, sx + 8, 2, b.w - 16, 12, '#0f172a', neonPulse ? '#22c55e' : '#15803d');
        ctx.fillStyle = neonPulse ? '#4ade80' : '#86efac';
        ctx.font = 'bold 7px sans-serif';
        ctx.fillText('🥕 용산 GPU 급처', sx + 14, 11);

      } else if (b.id === 'guro') {
        // Building 3: Guro Jisan Modern Tech Tower
        const isLeased = window.state && Array.isArray(window.state.offices) && window.state.offices.some(o => o.presetId === 'guro_jisan');
        drawPixelRect(ctx, sx, 6, b.w, b.h, '#0f172a', '#38bdf8');
        // Grid Glass curtain wall
        for (let gx = 0; gx < 3; gx++) {
          for (let gy = 0; gy < 3; gy++) {
            const winFill = (Math.floor((animTick + gx * 4 + gy * 7) / 25) % 3 === 0) ? '#67e8f9' : '#1e3a8a';
            drawPixelRect(ctx, sx + 10 + gx * 28, 14 + gy * 20, 22, 14, winFill, '#0284c7');
          }
        }
        // Lobby Entrance
        drawPixelRect(ctx, sx + 34, 66, 32, 26, '#334155', '#64748b');

        // Sign
        drawPixelRect(ctx, sx + 12, 78, b.w - 24, 10, '#1e293b', isLeased ? '#10b981' : '#f59e0b');
        ctx.fillStyle = isLeased ? '#10b981' : '#f59e0b';
        ctx.font = 'bold 6.5px sans-serif';
        ctx.fillText(isLeased ? '🏢 구로 2호점 가동' : '🏢 구로 지산 [임대]', sx + 16, 86);

      } else if (b.id === 'tips') {
        // Building 4: TIPS Startup Town
        drawPixelRect(ctx, sx, 8, b.w, b.h, '#1e1b4b', '#8b5cf6');
        // Modern geometric windows
        drawPixelRect(ctx, sx + 12, 18, b.w - 24, 38, '#312e81', '#a78bfa');
        // Flagpole on roof
        drawPixelRect(ctx, sx + 14, 0, 2, 10, '#94a3b8');
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(sx + 16, 0, 6, 4);

        // Lobby Glass door
        drawPixelRect(ctx, sx + 36, 62, 30, 28, '#0f172a', '#a855f7');

        // Sign
        drawPixelRect(ctx, sx + 8, 48, b.w - 16, 11, '#0f172a', '#c084fc');
        ctx.fillStyle = '#e9d5ff';
        ctx.font = 'bold 7px sans-serif';
        ctx.fillText('🏛️ 중기부 TIPS 타운', sx + 12, 56);

      } else if (b.id === 'kepco') {
        // Building 5: KEPCO Electric Substation & Startup Cafe
        drawPixelRect(ctx, sx, 12, b.w, b.h, '#134e4a', '#14b8a6');
        // High voltage transformer pole on the left
        drawPixelRect(ctx, sx + 6, 0, 4, 30, '#475569');
        drawPixelRect(ctx, sx + 2, 8, 12, 2, '#334155');
        // Warning lightning bolt icon
        ctx.fillStyle = '#eab308';
        ctx.fillText('⚡', sx + 4, 18);

        // 1F Starbucks-style Green Awning Cafe
        drawPixelRect(ctx, sx + 18, 42, b.w - 22, 10, '#047857', '#059669');
        drawPixelRect(ctx, sx + 22, 54, b.w - 30, 32, '#0f172a', '#10b981');
        // Patio umbrella & coffee cup
        ctx.fillStyle = '#f8fafc';
        ctx.fillText('☕', sx + 68, 76);

        // Sign
        drawPixelRect(ctx, sx + 20, 26, b.w - 26, 10, '#0f172a', '#10b981');
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 7px sans-serif';
        ctx.fillText('⚡ 한전 & ☕ 카페', sx + 24, 34);
      }
    });

    // 3. Sidewalk (보도블록, y: 90 ~ 130)
    drawPixelRect(ctx, 0, 90, STAGE_W, 40, '#334155');
    ctx.fillStyle = '#475569';
    for (let ix = -(camX % 16); ix < STAGE_W; ix += 16) {
      ctx.fillRect(ix, 90, 1, 40);
    }
    // Yellow tactile guide blocks (점자블록)
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(0, 124, STAGE_W, 4);

    // Street Lamps along sidewalk
    for (let i = 0; i < 4; i++) {
      const lx = Math.floor((i * 180 + 70) - camX);
      if (lx > -10 && lx < STAGE_W + 10) {
        drawPixelRect(ctx, lx, 60, 3, 34, '#64748b');
        drawPixelRect(ctx, lx - 4, 56, 11, 4, '#fbbf24', '#f59e0b');
        // Soft yellow light cone
        ctx.fillStyle = 'rgba(251, 191, 36, 0.12)';
        ctx.beginPath();
        ctx.moveTo(lx + 1, 60);
        ctx.lineTo(lx - 16, 120);
        ctx.lineTo(lx + 18, 120);
        ctx.fill();
      }
    }

    // Street Trees (가로수)
    for (let i = 0; i < 3; i++) {
      const tx = Math.floor((i * 220 + 135) - camX);
      if (tx > -20 && tx < STAGE_W + 20) {
        drawPixelRect(ctx, tx + 6, 74, 4, 20, '#78350f'); // Trunk
        drawPixelRect(ctx, tx, 48, 16, 26, '#15803d', '#166534'); // Foliage
      }
    }

    // 4. Asphalt Road (차도, y: 130 ~ 160)
    drawPixelRect(ctx, 0, 130, STAGE_W, 30, '#1e293b');
    // White Crosswalks (횡단보도) at x=135 and x=390
    [135, 390].forEach(cwX => {
      const scwX = Math.floor(cwX - camX);
      if (scwX > -30 && scwX < STAGE_W + 30) {
        ctx.fillStyle = '#cbd5e1';
        for (let stripe = 0; stripe < 4; stripe++) {
          ctx.fillRect(scwX + stripe * 7, 132, 4, 26);
        }
      }
    });

    // Yellow Dashed Center Lane
    ctx.fillStyle = '#facc15';
    for (let rx = -(camX % 24); rx < STAGE_W; rx += 24) {
      ctx.fillRect(rx, 144, 14, 2);
    }

    // 5. Vehicles on Road
    streetVehicles.forEach(veh => {
      veh.x += veh.speed * veh.dir;
      if (veh.dir > 0 && veh.x > STREET_W + 40) veh.x = -40;
      if (veh.dir < 0 && veh.x < -40) veh.x = STREET_W + 40;

      const vx = Math.floor(veh.x - camX);
      if (vx < -40 || vx > STAGE_W + 40) return;

      if (veh.type === 'scooter') {
        // Delivery scooter with blue food box
        drawPixelRect(ctx, vx, veh.y, 14, 7, veh.color);
        drawPixelRect(ctx, vx + (veh.dir > 0 ? -4 : 10), veh.y - 6, 8, 7, veh.boxColor); // Food box
        drawPixelRect(ctx, vx + (veh.dir > 0 ? 10 : 2), veh.y - 8, 5, 5, '#1e293b'); // Helmet
        // Wheels
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(vx + 1, veh.y + 6, 4, 4);
        ctx.fillRect(vx + 9, veh.y + 6, 4, 4);
      } else if (veh.type === 'taxi') {
        // Yellow Seoul Taxi
        drawPixelRect(ctx, vx, veh.y, 24, 9, '#f59e0b', '#d97706');
        drawPixelRect(ctx, vx + 5, veh.y - 4, 14, 5, '#38bdf8', '#0f172a');
        drawPixelRect(ctx, vx + 9, veh.y - 6, 6, 2, '#ef4444'); // Taxi roof cap
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(vx + 3, veh.y + 7, 4, 4);
        ctx.fillRect(vx + 17, veh.y + 7, 4, 4);
      } else if (veh.type === 'bus') {
        // Green Seoul Town Bus (마을버스)
        drawPixelRect(ctx, vx, veh.y - 6, 36, 16, '#10b981', '#059669');
        drawPixelRect(ctx, vx + 4, veh.y - 4, 28, 5, '#bae6fd');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(vx + 4, veh.y + 8, 5, 5);
        ctx.fillRect(vx + 26, veh.y + 8, 5, 5);
      }
    });

    // 6. Street Pedestrians
    streetPedestrians.forEach((ped, idx) => {
      ped.x += 0.4 * ped.dir;
      if (ped.x > STREET_W - 40) ped.dir = -1;
      if (ped.x < 30) ped.dir = 1;

      const px = Math.floor(ped.x - camX);
      if (px < -20 || px > STAGE_W + 20) return;

      const palette = JOB_PALETTES[ped.jobId] || JOB_PALETTES.devops;
      const walkFrame = (Math.floor(animTick / 6 + idx) % 2 === 0) ? CHAR_SPRITES.walk1 : CHAR_SPRITES.idle1;
      drawPixelSprite(ctx, walkFrame, px, ped.y, 1.3, palette, ped.dir < 0);

      // Periodic Thought Bubble
      ped.timer--;
      if (ped.timer <= 0) {
        ped.timer = 180 + Math.random() * 120;
      }
      if (ped.timer < 90 && Math.abs(px - (streetPlayer.x - camX)) < 110) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(px - 20, ped.y - 18, ped.bubble.length * 5.2 + 6, 11);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(px - 20 + 0.5, ped.y - 18 + 0.5, ped.bubble.length * 5.2 + 5, 10);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '7px sans-serif';
        ctx.fillText(ped.bubble, px - 17, ped.y - 10);
      }
    });

    // 7. Founder (Player) Character
    const playerSx = Math.floor(streetPlayer.x - camX);
    const playerPalette = JOB_PALETTES.ceo;
    const playerSprite = streetPlayer.isMoving
      ? ((Math.floor(animTick / 4) % 2 === 0) ? CHAR_SPRITES.walk1 : CHAR_SPRITES.idle1)
      : CHAR_SPRITES.idle1;

    drawPixelSprite(ctx, playerSprite, playerSx, streetPlayer.y, 1.5, playerPalette, streetPlayer.dir < 0);

    // Founder Name Badge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(playerSx - 8, streetPlayer.y - 10, 32, 9);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 7px sans-serif';
    ctx.fillText('👑대표(나)', playerSx - 6, streetPlayer.y - 3);

    // 8. Interactive Building Prompt Banner
    if (streetPlayer.nearBuilding) {
      const b = streetPlayer.nearBuilding;
      const promptText = b.actionText;
      const bw = promptText.length * 5.5 + 16;
      const bx = Math.max(10, Math.min(STAGE_W - bw - 10, playerSx - bw / 2 + 8));
      const by = streetPlayer.y - 28;

      const pulse = Math.floor(animTick / 6) % 2 === 0;
      ctx.fillStyle = pulse ? 'rgba(6, 182, 212, 0.92)' : 'rgba(15, 23, 42, 0.92)';
      ctx.fillRect(bx, by, bw, 14);
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, 13);

      ctx.fillStyle = pulse ? '#000' : '#38bdf8';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText(promptText, bx + 7, by + 10);
    }
  }

  // --- 2. SERVER ROOM (INTERIOR) RENDERING ---
  function drawRoomBackground(ctx, office, season) {
    const presetId = office.presetId;

    if (presetId === 'room_sinrim') {
      drawPixelRect(ctx, 0, 0, STAGE_W, 92, '#292524');
      ctx.fillStyle = '#322d2b';
      for (let ix = 0; ix < STAGE_W; ix += 16) ctx.fillRect(ix, 0, 2, 92);
      drawPixelRect(ctx, 0, 92, STAGE_W, STAGE_H - 92, '#78350f');
      ctx.fillStyle = '#92400e';
      for (let iy = 96; iy < STAGE_H; iy += 12) ctx.fillRect(0, iy, STAGE_W, 1);

      const doorShake = (office.landlordAnger > 60 && Math.floor(animTick / 4) % 2 === 0) ? 1 : 0;
      drawPixelRect(ctx, 10 + doorShake, 30, 28, 62, '#451a03', '#78350f');
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(32 + doorShake, 60, 3, 3);

      drawWindowAndSky(ctx, 52, 16, 48, 36, season.id);

      drawPixelRect(ctx, 110, 22, 16, 22, office.isTripped ? '#7f1d1d' : '#334155', '#94a3b8');
      ctx.fillStyle = office.isTripped ? '#ef4444' : '#10b981';
      ctx.fillRect(116, 28, 4, 6);

      drawPixelRect(ctx, 48, 86, 44, 6, '#b45309', '#451a03');
      ctx.fillRect(52, 92, 4, 14);
      ctx.fillRect(84, 92, 4, 14);
      drawPixelRect(ctx, 62, 74, 16, 11, '#0f172a', '#38bdf8');
      ctx.fillStyle = (Math.floor(animTick / 10) % 2 === 0) ? '#38bdf8' : '#10b981';
      ctx.fillRect(65, 77, 8, 2);
      ctx.fillRect(65, 80, 10, 2);

      drawPixelRect(ctx, 82, 81, 5, 5, '#ef4444');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(82, 81, 5, 2);

    } else if (presetId === 'guro_jisan' || presetId === 'gangnam_wework') {
      const isGangnam = presetId === 'gangnam_wework';
      drawPixelRect(ctx, 0, 0, STAGE_W, 92, isGangnam ? '#1e1b4b' : '#1e293b');
      drawPixelRect(ctx, 0, 92, STAGE_W, STAGE_H - 92, isGangnam ? '#312e81' : '#334155');
      ctx.fillStyle = isGangnam ? '#3730a3' : '#3b4963';
      for (let ix = 0; ix < STAGE_W; ix += 24) ctx.fillRect(ix, 92, 1, STAGE_H - 92);

      drawWindowAndSky(ctx, 16, 14, 64, 42, season.id);
      drawWindowAndSky(ctx, 88, 14, 64, 42, season.id);

      for (let d = 0; d < 2; d++) {
        const dx = 22 + d * 62;
        drawPixelRect(ctx, dx, 84, 46, 7, '#cbd5e1', '#475569');
        drawPixelRect(ctx, dx + 14, 72, 18, 12, '#0f172a', '#06b6d4');
      }
    } else {
      const isChuncheon = presetId === 'chuncheon_dc';
      drawPixelRect(ctx, 0, 0, STAGE_W, 92, '#090d16');
      drawPixelRect(ctx, 0, 92, STAGE_W, STAGE_H - 92, '#0f172a');

      ctx.fillStyle = isChuncheon ? '#0d9488' : '#1e3a8a';
      for (let ix = 0; ix < STAGE_W; ix += 20) ctx.fillRect(ix, 92, 1, STAGE_H - 92);

      drawPixelRect(ctx, 0, 10, STAGE_W, 8, isChuncheon ? '#0284c7' : '#1e293b', '#38bdf8');
      ctx.fillStyle = '#7dd3fc';
      for (let px = (animTick % 20); px < STAGE_W; px += 20) {
        ctx.fillRect(px, 12, 8, 4);
      }
    }
  }

  function drawCoolingUnit(ctx, office) {
    const tier = office.coolingTier || 'T1';
    drawPixelRect(ctx, 250, 16, 56, 22, '#e2e8f0', '#64748b');
    drawPixelRect(ctx, 254, 30, 48, 5, '#0f172a');
    ctx.fillStyle = '#0284c7';
    ctx.font = '8px monospace';
    ctx.fillText(`COOL:${tier}`, 254, 26);

    if (!office.isTripped && animTick % 4 === 0) {
      particles.push({
        x: 255 + Math.random() * 45,
        y: 38,
        vx: -0.4 - Math.random() * 0.4,
        vy: 0.6 + Math.random() * 0.4,
        color: '#38bdf8',
        size: 2,
        life: 28
      });
    }
  }

  function drawGpuRacksOnStage(ctx, office) {
    const gpus = office.gpus || [];
    const startX = 148;
    const startY = 46;
    const maxDraw = Math.min(gpus.length, 18);

    for (let c = 0; c < 3; c++) {
      const cabX = startX + c * 52;
      drawPixelRect(ctx, cabX, startY - 6, 48, 76, '#090d16', '#334155');
      ctx.fillStyle = office.isTripped ? '#ef4444' : '#06b6d4';
      ctx.fillRect(cabX + 4, startY - 3, 40, 2);
    }

    for (let i = 0; i < maxDraw; i++) {
      const gpu = gpus[i];
      const col = Math.floor(i / 6);
      const row = i % 6;
      const gx = startX + col * 52 + 4;
      const gy = startY + row * 11 + 2;

      const isDead = gpu.isBroken || office.isTripped;
      const isHighTier = gpu.model === 'h100' || gpu.model === 'b200' || gpu.model === 'a100';
      const bodyColor = isDead ? '#450a0a' : (isHighTier ? '#1e1b4b' : '#1e293b');
      const borderColor = isDead ? '#ef4444' : (isHighTier ? '#a855f7' : '#38bdf8');

      drawPixelRect(ctx, gx, gy, 40, 9, bodyColor, borderColor);

      if (isDead) {
        ctx.fillStyle = '#ef4444';
      } else if (office.temp > 75) {
        ctx.fillStyle = (Math.floor(animTick / 4 + i) % 2 === 0) ? '#f59e0b' : '#ef4444';
      } else {
        ctx.fillStyle = (Math.floor(animTick / 8 + i) % 2 === 0) ? '#10b981' : '#06b6d4';
      }
      ctx.fillRect(gx + 3, gy + 3, 3, 3);

      ctx.fillStyle = isDead ? '#52525b' : '#94a3b8';
      const fanPhase = Math.floor((animTick + i * 3) / 3) % 2;
      if (fanPhase === 0 || isDead) {
        ctx.fillRect(gx + 12, gy + 2, 5, 5);
      } else {
        ctx.fillRect(gx + 11, gy + 3, 7, 3);
      }

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '6px monospace';
      ctx.fillText(gpu.model.substring(0, 4).toUpperCase(), gx + 20, gy + 7);
    }
  }

  function syncActorsWithState() {
    const st = window.state;
    if (!st) return;

    if (actors.length === 0) {
      actors.push({
        id: 'ceo',
        jobId: 'ceo',
        name: '대표(나)',
        x: 56,
        y: 96,
        targetX: 70,
        dir: 1,
        bubble: 'GPU 제국을 세우자!',
        bubbleTimer: 120
      });
    }

    const emps = st.employees || [];
    const desiredCount = 1 + Math.min(10, emps.length);
    while (actors.length < desiredCount) {
      const emp = emps[actors.length - 1];
      actors.push({
        id: emp.uid,
        jobId: emp.jobId || 'devops',
        name: emp.name || '직원',
        x: 40 + Math.random() * 220,
        y: 92 + (actors.length % 3) * 10,
        targetX: 40 + Math.random() * 220,
        dir: 1,
        bubble: '출근했습니다!',
        bubbleTimer: 90
      });
    }
    while (actors.length > desiredCount) {
      actors.pop();
    }
    for (let i = 1; i < actors.length; i++) {
      const emp = emps[i - 1];
      if (emp) {
        actors[i].jobId = emp.jobId;
        actors[i].name = emp.name;
        actors[i].burnout = emp.burnout;
        actors[i].morale = emp.morale;
      }
    }
  }

  function drawWindowAndSky(ctx, x, y, w, h, seasonId) {
    let skyColor = '#1e3a8a';
    if (seasonId === 'summer') skyColor = '#0284c7';
    if (seasonId === 'winter') skyColor = '#1e293b';
    drawPixelRect(ctx, x, y, w, h, skyColor, '#475569');

    if (seasonId === 'summer') {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + w - 16, y + 6, 10, 10);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(x + w - 14, y + 8, 6, 6);
    } else if (seasonId === 'winter') {
      ctx.fillStyle = '#f8fafc';
      snowFlakes.forEach(sf => {
        const sx = x + ((sf.x + animTick * sf.s) % (w - 4)) + 2;
        const sy = y + ((sf.y + animTick * sf.s) % (h - 4)) + 2;
        ctx.fillRect(sx, sy, 2, 2);
      });
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 4, y + h - 14, 10, 14);
      ctx.fillRect(x + 16, y + h - 20, 12, 20);
      ctx.fillRect(x + 30, y + h - 11, 14, 11);
      ctx.fillStyle = '#fef08a';
      if (Math.floor(animTick / 20) % 2 === 0) ctx.fillRect(x + 10, y + 6, 2, 2);
      ctx.fillRect(x + 28, y + 8, 2, 2);
    }

    ctx.fillStyle = '#334155';
    ctx.fillRect(x + Math.floor(w / 2), y, 2, h);
    ctx.fillRect(x, y + Math.floor(h / 2), w, 2);
  }

  function updateAndDrawActors(ctx, office) {
    syncActorsWithState();

    actors.forEach((act, idx) => {
      const isMoving = Math.abs(act.targetX - act.x) > 2;
      if (isMoving) {
        act.dir = act.targetX > act.x ? 1 : -1;
        act.x += act.dir * 0.75;
      } else if (Math.random() < 0.008) {
        act.targetX = 40 + Math.random() * 220;
      }

      const palette = JOB_PALETTES[act.jobId] || JOB_PALETTES.devops;
      const sprite = isMoving
        ? ((Math.floor(animTick / 5) % 2 === 0) ? CHAR_SPRITES.walk1 : CHAR_SPRITES.idle1)
        : CHAR_SPRITES.idle1;

      drawPixelSprite(ctx, sprite, act.x, act.y, 1.5, palette, act.dir < 0);

      // Speech bubble timer
      act.bubbleTimer = (act.bubbleTimer || 0) - 1;
      if (act.bubbleTimer <= 0) {
        act.bubbleTimer = 180 + Math.random() * 180;
        let pool = SPEECH_POOL.emp_happy;
        if (act.jobId === 'ceo') {
          pool = office.isTripped ? SPEECH_POOL.ceo_trip : (office.temp > 75 ? SPEECH_POOL.ceo_hot : SPEECH_POOL.ceo_normal);
        } else if (act.burnout > 50) {
          pool = SPEECH_POOL.emp_tired;
        }
        act.bubble = pool[Math.floor(Math.random() * pool.length)];
      }

      if (act.bubble && act.bubbleTimer > 80) {
        const bw = act.bubble.length * 5.2 + 8;
        const bx = Math.max(4, Math.min(STAGE_W - bw - 4, act.x - bw / 3));
        const by = act.y - 14;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(bx, by, bw, 11);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, 10);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '7px sans-serif';
        ctx.fillText(act.bubble, bx + 4, by + 8);
      }
    });
  }

  function updateAndDrawParticles(ctx) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size || 2, p.size || 2);
      if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= 0.35;
      ft.life--;
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(Math.floor(ft.x - 2), Math.floor(ft.y - 8), ft.text.length * 5.5 + 4, 10);
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 8px monospace';
      ctx.fillText(ft.text, Math.floor(ft.x), Math.floor(ft.y));
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
  }

  // --- 3. MAIN RENDER LOOP ---
  function renderPixelStage() {
    if (typeof document === 'undefined') return;
    const canvas = document.getElementById('pixel-stage-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const st = window.state;
    if (!st) return;

    animTick++;
    ctx.clearRect(0, 0, STAGE_W, STAGE_H);

    const season = typeof window.getSeasonInfo === 'function' ? window.getSeasonInfo(st.calendarMonth) : { id: 'normal' };

    if (stageMode === 'street') {
      updateStreetPlayer();
      drawStreetMap(ctx, season);
      updateAndDrawParticles(ctx);

      const titleEl = document.getElementById('pixel-stage-title');
      if (titleEl) {
        titleEl.textContent = '🕹️ 🗺️ 서울 스타트업 상가 거리 (A/D 키 또는 클릭 이동)';
      }
    } else {
      // Room View
      if (!Array.isArray(st.offices) || st.offices.length === 0) return;
      if (selectedOfficeIdx >= st.offices.length) selectedOfficeIdx = 0;
      const office = st.offices[selectedOfficeIdx] || st.offices[0];

      // Income Floating Text
      if (st.speed > 0 && animTick % Math.max(15, Math.floor(60 / st.speed)) === 0) {
        const specs = typeof window.calculateSpecsGlobalSafe === 'function' ? window.calculateSpecsGlobalSafe() : { grossCashPerSec: 0, ethPerSec: 0 };
        if (specs.grossCashPerSec > 0 && !office.isTripped) {
          spawnStageFloatingText(`+${window.formatKRW(specs.grossCashPerSec)}/s`, '#10b981');
        }
      }

      drawRoomBackground(ctx, office, season);
      drawCoolingUnit(ctx, office);
      drawGpuRacksOnStage(ctx, office);
      updateAndDrawActors(ctx, office);
      updateAndDrawParticles(ctx);

      if (office.isTripped) {
        ctx.fillStyle = 'rgba(127, 29, 29, 0.38)';
        ctx.fillRect(0, 0, STAGE_W, STAGE_H);
        if (Math.floor(animTick / 10) % 2 === 0) {
          drawPixelRect(ctx, 78, 60, 164, 24, '#450a0a', '#ef4444');
          ctx.fillStyle = '#fecaca';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText('⚡ 정전 발생! [클릭하여 차단기 복구]', 86, 75);
        }
      }

      const titleEl = document.getElementById('pixel-stage-title');
      if (titleEl) {
        titleEl.textContent = `🕹️ 🖥️ 서버실 내부: ${office.customName}`;
      }
    }
  }

  function selectPixelStageStreet() {
    stageMode = 'street';
    renderPixelStageTabs();
  }

  function selectPixelStageOffice(idx) {
    stageMode = 'room';
    selectedOfficeIdx = idx;
    renderPixelStageTabs();
  }

  function renderPixelStageTabs() {
    if (typeof document === 'undefined') return;
    const tabBar = document.getElementById('pixel-stage-office-tabs');
    if (!tabBar || !window.state) return;

    let html = `
      <button class="pixel-office-tab ${stageMode === 'street' ? 'active' : ''}" onclick="selectPixelStageStreet()" title="서울 스타트업 상가 거리 도보 탐방">
        🗺️ 서울 상가 거리
      </button>
    `;

    html += window.state.offices.map((o, idx) => `
      <button class="pixel-office-tab ${stageMode === 'room' && idx === selectedOfficeIdx ? 'active' : ''}" onclick="selectPixelStageOffice(${idx})" title="${o.customName} 내부 뷰">
        🏢 ${o.customName.substring(0, 7)}.. (${o.gpus.length}대)
      </button>
    `).join('');

    if (tabBar.innerHTML !== html) tabBar.innerHTML = html;
  }

  // Canvas Click & Keyboard Controls setup
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
      const canvas = document.getElementById('pixel-stage-canvas');
      if (canvas) {
        canvas.addEventListener('click', (e) => {
          if (stageMode === 'street') {
            const rect = canvas.getBoundingClientRect();
            const scaleX = STAGE_W / rect.width;
            const scaleY = STAGE_H / rect.height;
            const clickX = (e.clientX - rect.left) * scaleX;
            const clickY = (e.clientY - rect.top) * scaleY;
            const worldClickX = clickX + camX;

            // Check if clicked directly on an interactive building
            const clickedB = STREET_BUILDINGS.find(b => worldClickX >= b.x && worldClickX <= b.x + b.w && clickY <= 125);
            if (clickedB) {
              streetPlayer.targetX = clickedB.x + clickedB.w / 2;
              streetPlayer.targetY = 112;
              if (Math.abs(streetPlayer.x - (clickedB.x + clickedB.w / 2)) < 65) {
                clickedB.onAction();
              }
            } else {
              streetPlayer.targetX = Math.max(15, Math.min(STREET_W - 15, worldClickX));
              streetPlayer.targetY = Math.max(96, Math.min(125, clickY));
            }
          } else {
            // Room click
            const st = window.state;
            if (!st || !st.offices[selectedOfficeIdx]) return;
            const off = st.offices[selectedOfficeIdx];
            if (off.isTripped && typeof window.resetOfficeBreaker === 'function') {
              window.resetOfficeBreaker(off.uid);
              spawnStageFloatingText('🔌 차단기 복구 완료!', '#38bdf8', 110, 50);
            } else {
              spawnStageFloatingText('⚡ 서버실 점검 완료!', '#facc15', 120, 70);
            }
          }
        });
      }

      // Keyboard Controls for Street Movement
      window.addEventListener('keydown', (e) => {
        if (stageMode !== 'street') return;
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) return;

        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          keysDown.left = true;
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          keysDown.right = true;
        } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
          keysDown.up = true;
        } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
          keysDown.down = true;
        } else if (e.code === 'Space' || e.code === 'KeyE') {
          if (streetPlayer.nearBuilding) {
            e.preventDefault();
            streetPlayer.nearBuilding.onAction();
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysDown.left = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') keysDown.right = false;
        if (e.code === 'ArrowUp' || e.code === 'KeyW') keysDown.up = false;
        if (e.code === 'ArrowDown' || e.code === 'KeyS') keysDown.down = false;
      });
    });
  }

  window.renderPixelStage = renderPixelStage;
  window.renderPixelStageTabs = renderPixelStageTabs;
  window.selectPixelStageStreet = selectPixelStageStreet;
  window.selectPixelStageOffice = selectPixelStageOffice;
  window.spawnStageFloatingText = spawnStageFloatingText;
})();
