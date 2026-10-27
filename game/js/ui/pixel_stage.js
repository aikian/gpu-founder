/**
 * game/js/ui/pixel_stage.js
 * 실시간 2D 픽셀아트 게임 스테이지 렌더러 (고해상도 800x320 완벽 비율 & 선명한 한글 폰트)
 * - [모드 1] 🗺️ 서울 스타트업 상가 거리 (Seoul Startup Street Map - 1400px 파노라마)
 *   - 조작: A/D/W/S 또는 방향키(←,→,↑,↓), 캔버스 클릭으로 대표(CEO) 도트 캐릭터 직접 이동
 *   - 5대 핵심 상가 & 건물:
 *     1) 🏚️ 신림 상가 & 자취방 1호점 (서버실 내부 입장)
 *     2) 🔌 용산 전자상가 & 나진 채굴 매점 (당근 중고 GPU 장터)
 *     3) 🏢 구로디지털단지 지식산업센터 (2호점 상가 임대 & 관리)
 *     4) 🏛️ 테헤란로 TIPS 스타트업 타운 (지원사업 & VC 피칭)
 *     5) ⚡ 한국전력공사 지사 & 스타트업 카페 (인재 채용 & 복지)
 *   - 살아 움직이는 거리: 배달 오토바이, 서울 택시, 버스 + 행인/NPC 말풍선
 *   - 상가 접근 시: 13px 선명한 네온 상호작용 배너 [Space / 클릭: 상가 입장]
 * - [모드 2] 🖥️ 사업장 서버실 내부 (Server Room 800x320)
 *   - 42U 서버랙 + 회전 쿨링팬 + 실시간 멀티컬러 LED + 과열 연기 + 차단기 트립 정전 연출
 */

(function () {
  const STAGE_W = 800;
  const STAGE_H = 320;
  const STREET_W = 1400;

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
    x: 120,
    y: 215,
    targetX: null,
    targetY: null,
    dir: 1, // 1=right, -1=left
    isMoving: false,
    speed: 3.8,
    nearBuilding: null
  };

  // Keyboard state for smooth street movement
  const keysDown = { left: false, right: false, up: false, down: false };

  // Vehicles on the street (Scooters, Taxis, Buses)
  const streetVehicles = [
    { type: 'scooter', x: 60, y: 265, speed: 4.8, dir: 1, color: '#06b6d4', boxColor: '#0ea5e9' },
    { type: 'taxi', x: 720, y: 285, speed: 3.4, dir: -1, color: '#f59e0b', boxColor: '#ffffff' },
    { type: 'bus', x: 1250, y: 280, speed: 2.4, dir: -1, color: '#10b981', boxColor: '#ffffff' }
  ];

  // Street Pedestrian NPCs
  const streetPedestrians = [
    { x: 380, y: 215, dir: -1, jobId: 'technician', name: '용산 상인', bubble: '채굴장 폐업 GPU 꿀매물!', timer: 120 },
    { x: 690, y: 220, dir: 1, jobId: 'devops', name: '이직 희망자', bubble: '스타트업 스카우트 대기 중', timer: 150 },
    { x: 920, y: 215, dir: -1, jobId: 'admin_gov', name: 'TIPS 주무관', bubble: '사업계획서 심사 중', timer: 180 },
    { x: 1220, y: 220, dir: 1, jobId: 'backend', name: '카페 단골', bubble: '아아 마시고 밤샘 코딩', timer: 210 }
  ];

  // 5 Commercial Buildings along the 1400px panoramic street
  const STREET_BUILDINGS = [
    {
      id: 'sinrim',
      name: '신림 상가 & 자취방',
      sub: '⚡ 1호점 서버실',
      x: 40,
      w: 210,
      h: 165,
      actionText: '[Space/클릭: 🏚️ 1호점 서버실 입장]',
      onAction: () => {
        selectPixelStageOffice(0);
        if (typeof showToast === 'function') showToast('🏢 신림 1호점 서버실 내부로 입장했습니다.');
      }
    },
    {
      id: 'yongsan',
      name: '용산 전자상가 & 나진',
      sub: '🥕 당근 중고 & 채굴장 폐업',
      x: 290,
      w: 220,
      h: 165,
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
      x: 550,
      w: 230,
      h: 168,
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
      x: 820,
      w: 230,
      h: 170,
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
      x: 1090,
      w: 260,
      h: 168,
      actionText: '[Space/클릭: 👥 인재 채용 & 복지]',
      onAction: () => {
        const btn = document.querySelector('[data-tab=tab-hr]');
        if (btn) btn.click();
        if (typeof showToast === 'function') showToast('☕ 스타트업 카페 & 개발자 채용 시장에 도착했습니다.');
      }
    }
  ];

  // Initialize snow particles
  for (let i = 0; i < 28; i++) {
    snowFlakes.push({
      x: Math.random() * STREET_W,
      y: Math.random() * STAGE_H,
      s: 0.4 + Math.random() * 0.6
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
    ceo_normal: ['당근 꿀매물 없나..', 'GPU가 곧 국력이다!', '전기세 아껴야 해', '가즈아 유니콘!!', 'e나라도움 증빙 챙겨!'],
    ceo_hot: ['어우 방이 찜질방이네🔥', '에어컨 더 틀어!!', '써멀 다시 발라야 하나'],
    ceo_trip: ['악!! 두꺼비집 내려갔다!', '차단기 빨리 올려!!⚡'],
    emp_happy: ['오늘 모델 학습 순항 중!', '법카 점심 최고!', '가동률 99.9% 달성', 'LLM 사전학습 완료!'],
    emp_tired: ['퇴근하고 싶다...', '새벽 장애콜 살려줘', '번아웃 올 것 같아💦', '커피 수혈 시급..']
  };

  function drawPixelSprite(ctx, matrix, x, y, scale, palette, flipX = false) {
    for (let r = 0; r < matrix.length; r++) {
      const row = matrix[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[flipX ? (row.length - 1 - c) : c];
        if (ch === '.') continue;
        ctx.fillStyle = palette[ch] || '#fff';
        ctx.fillRect(Math.floor(x + c * scale), Math.floor(y + r * scale), Math.ceil(scale), Math.ceil(scale));
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
      x: x !== null ? x : (350 + Math.random() * 200),
      y: y !== null ? y : (110 + Math.random() * 40),
      life: 52
    });
  }

  // --- 1. SEOUL STARTUP STREET MAP RENDERING ---
  function updateStreetPlayer() {
    let moving = false;
    let dx = 0;
    let dy = 0;

    if (keysDown.left) { dx -= 1; streetPlayer.dir = -1; moving = true; }
    if (keysDown.right) { dx += 1; streetPlayer.dir = 1; moving = true; }
    if (keysDown.up) { dy -= 1; moving = true; }
    if (keysDown.down) { dy += 1; moving = true; }

    if (!moving && streetPlayer.targetX !== null) {
      const dist = streetPlayer.targetX - streetPlayer.x;
      if (Math.abs(dist) > 3) {
        dx = dist > 0 ? 1 : -1;
        streetPlayer.dir = dx;
        moving = true;
      } else {
        streetPlayer.targetX = null;
      }
      if (streetPlayer.targetY !== null) {
        const distY = streetPlayer.targetY - streetPlayer.y;
        if (Math.abs(distY) > 3) {
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

      if (animTick % 5 === 0) {
        particles.push({
          x: streetPlayer.x + (streetPlayer.dir > 0 ? 4 : 20),
          y: streetPlayer.y + 26,
          vx: -dx * 0.6,
          vy: -0.4,
          color: '#94a3b8',
          size: 2,
          life: 14
        });
      }
    } else {
      streetPlayer.isMoving = false;
    }

    streetPlayer.x = Math.max(25, Math.min(STREET_W - 35, streetPlayer.x));
    streetPlayer.y = Math.max(195, Math.min(245, streetPlayer.y));

    // Smooth camera scroll
    const targetCamX = Math.max(0, Math.min(STREET_W - STAGE_W, streetPlayer.x - STAGE_W / 2));
    camX += (targetCamX - camX) * 0.18;

    // Check Nearest Building
    let nearest = null;
    let minDist = 95;
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
    let skyTop = '#0a1128';
    let skyBot = '#1e3a8a';
    if (season.id === 'summer') { skyTop = '#0284c7'; skyBot = '#38bdf8'; }
    if (season.id === 'winter') { skyTop = '#111827'; skyBot = '#374151'; }

    const grad = ctx.createLinearGradient(0, 0, 0, 180);
    grad.addColorStop(0, skyTop);
    grad.addColorStop(1, skyBot);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, STAGE_W, 180);

    // Distant N-Seoul Tower and skyscrapers silhouette
    const paraOffset = camX * 0.22;
    ctx.fillStyle = '#060a14';
    // N-Tower
    const towerX = 450 - paraOffset;
    if (towerX > -30 && towerX < STAGE_W + 30) {
      ctx.fillRect(towerX, 35, 6, 95);
      ctx.fillRect(towerX - 10, 65, 26, 9);
      ctx.fillRect(towerX - 4, 20, 14, 15);
      if (Math.floor(animTick / 15) % 2 === 0) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(towerX + 1, 16, 4, 4);
        ctx.fillStyle = '#060a14';
      }
    }
    // Skyline blocks
    for (let i = 0; i < 11; i++) {
      const bx = (i * 125 + 40) - paraOffset;
      const bh = 45 + (i % 4) * 22;
      ctx.fillRect(bx, 180 - bh, 65, bh);
    }

    // 2. Commercial Buildings on the Street
    STREET_BUILDINGS.forEach(b => {
      const sx = Math.floor(b.x - camX);
      if (sx + b.w < -30 || sx > STAGE_W + 30) return;

      if (b.id === 'sinrim') {
        // Building 1: Brick building with GS25-style convenience store on 1F, rooftop room on 2F
        drawPixelRect(ctx, sx, 25, b.w, b.h, '#381c10', '#632912'); // Brick wall
        // Windows
        drawPixelRect(ctx, sx + 20, 45, 48, 42, '#fef08a', '#1e293b');
        drawPixelRect(ctx, sx + 95, 45, 48, 42, '#38bdf8', '#1e293b');
        // Air conditioning outdoor unit (실외기) on wall with spinning fan
        drawPixelRect(ctx, sx + 155, 52, 34, 26, '#e2e8f0', '#94a3b8');
        ctx.fillStyle = (Math.floor(animTick / 3) % 2 === 0) ? '#475569' : '#94a3b8';
        ctx.fillRect(sx + 162, 58, 20, 14);

        // 1F Convenience store & Entrance
        drawPixelRect(ctx, sx + 12, 105, b.w - 24, 75, '#0284c7', '#38bdf8');
        drawPixelRect(ctx, sx + 25, 118, 65, 52, '#f8fafc', '#0f172a');
        drawPixelRect(ctx, sx + 115, 114, 52, 64, '#1e293b', '#f59e0b'); // Door

        // Neon Sign Board
        drawPixelRect(ctx, sx + 20, 10, b.w - 40, 22, '#0f172a', '#f59e0b');
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px Pretendard, sans-serif';
        ctx.fillText('⚡ 신림 1호점 (자취방)', sx + 32, 26);

      } else if (b.id === 'yongsan') {
        // Building 2: Yongsan Electronics Mall with GPU clearance boxes
        drawPixelRect(ctx, sx, 20, b.w, b.h, '#1e293b', '#3b82f6');
        // Glass showroom display
        drawPixelRect(ctx, sx + 18, 95, b.w - 36, 82, '#0f172a', '#06b6d4');
        // GPU boxes stacked outside
        drawPixelRect(ctx, sx + 28, 142, 28, 24, '#10b981', '#047857');
        drawPixelRect(ctx, sx + 42, 126, 26, 20, '#f97316', '#c2410c');
        drawPixelRect(ctx, sx + 125, 134, 32, 28, '#8b5cf6', '#6d28d9');

        // Neon Sign
        const neonPulse = (Math.floor(animTick / 8) % 2 === 0);
        drawPixelRect(ctx, sx + 16, 8, b.w - 32, 24, '#0f172a', neonPulse ? '#22c55e' : '#15803d');
        ctx.fillStyle = neonPulse ? '#4ade80' : '#86efac';
        ctx.font = 'bold 12px Pretendard, sans-serif';
        ctx.fillText('🥕 용산 전자상가 [GPU 급처]', sx + 24, 25);

      } else if (b.id === 'guro') {
        // Building 3: Guro Jisan Modern Tech Tower
        const isLeased = window.state && Array.isArray(window.state.offices) && window.state.offices.some(o => o.presetId === 'guro_jisan');
        drawPixelRect(ctx, sx, 15, b.w, b.h, '#0f172a', '#38bdf8');
        // Grid Glass curtain wall
        for (let gx = 0; gx < 3; gx++) {
          for (let gy = 0; gy < 3; gy++) {
            const winFill = (Math.floor((animTick + gx * 4 + gy * 7) / 25) % 3 === 0) ? '#67e8f9' : '#1e3a8a';
            drawPixelRect(ctx, sx + 20 + gx * 58, 30 + gy * 38, 44, 28, winFill, '#0284c7');
          }
        }
        // Lobby Entrance
        drawPixelRect(ctx, sx + 75, 130, 65, 52, '#334155', '#64748b');

        // Sign
        drawPixelRect(ctx, sx + 22, 150, b.w - 44, 22, '#1e293b', isLeased ? '#10b981' : '#f59e0b');
        ctx.fillStyle = isLeased ? '#10b981' : '#f59e0b';
        ctx.font = 'bold 12px Pretendard, sans-serif';
        ctx.fillText(isLeased ? '🏢 구로 2호점 가동 중' : '🏢 구로 지산 402호 [임대]', sx + 32, 166);

      } else if (b.id === 'tips') {
        // Building 4: TIPS Startup Town
        drawPixelRect(ctx, sx, 18, b.w, b.h, '#1e1b4b', '#8b5cf6');
        drawPixelRect(ctx, sx + 22, 38, b.w - 44, 75, '#312e81', '#a78bfa');
        // Flagpole on roof
        drawPixelRect(ctx, sx + 28, 4, 3, 18, '#94a3b8');
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(sx + 31, 4, 12, 8);

        // Lobby Glass door
        drawPixelRect(ctx, sx + 75, 125, 62, 55, '#0f172a', '#a855f7');

        // Sign
        drawPixelRect(ctx, sx + 18, 95, b.w - 36, 22, '#0f172a', '#c084fc');
        ctx.fillStyle = '#e9d5ff';
        ctx.font = 'bold 12px Pretendard, sans-serif';
        ctx.fillText('🏛️ 중기부 TIPS 타운', sx + 34, 111);

      } else if (b.id === 'kepco') {
        // Building 5: KEPCO Electric Substation & Startup Cafe
        drawPixelRect(ctx, sx, 22, b.w, b.h, '#134e4a', '#14b8a6');
        // High voltage transformer pole
        drawPixelRect(ctx, sx + 12, 0, 8, 55, '#475569');
        drawPixelRect(ctx, sx + 4, 16, 24, 4, '#334155');
        ctx.fillStyle = '#eab308';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('⚡', sx + 8, 38);

        // 1F Starbucks-style Green Awning Cafe
        drawPixelRect(ctx, sx + 40, 85, b.w - 48, 20, '#047857', '#059669');
        drawPixelRect(ctx, sx + 48, 108, b.w - 64, 64, '#0f172a', '#10b981');
        ctx.fillStyle = '#f8fafc';
        ctx.font = '16px monospace';
        ctx.fillText('☕', sx + 155, 150);

        // Sign
        drawPixelRect(ctx, sx + 42, 55, b.w - 52, 22, '#0f172a', '#10b981');
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 12px Pretendard, sans-serif';
        ctx.fillText('⚡ 한전 & ☕ 스타트업 카페', sx + 50, 71);
      }
    });

    // 3. Sidewalk (보도블록, y: 180 ~ 255)
    drawPixelRect(ctx, 0, 180, STAGE_W, 75, '#334155');
    ctx.fillStyle = '#475569';
    for (let ix = -(camX % 32); ix < STAGE_W; ix += 32) {
      ctx.fillRect(ix, 180, 2, 75);
    }
    // Yellow tactile guide blocks (점자블록)
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(0, 244, STAGE_W, 8);

    // Street Lamps along sidewalk
    for (let i = 0; i < 5; i++) {
      const lx = Math.floor((i * 280 + 110) - camX);
      if (lx > -20 && lx < STAGE_W + 20) {
        drawPixelRect(ctx, lx, 115, 6, 68, '#64748b');
        drawPixelRect(ctx, lx - 8, 108, 22, 8, '#fbbf24', '#f59e0b');
        ctx.fillStyle = 'rgba(251, 191, 36, 0.14)';
        ctx.beginPath();
        ctx.moveTo(lx + 3, 115);
        ctx.lineTo(lx - 32, 240);
        ctx.lineTo(lx + 38, 240);
        ctx.fill();
      }
    }

    // Street Trees (가로수)
    for (let i = 0; i < 4; i++) {
      const tx = Math.floor((i * 350 + 240) - camX);
      if (tx > -30 && tx < STAGE_W + 30) {
        drawPixelRect(ctx, tx + 12, 145, 8, 40, '#78350f'); // Trunk
        drawPixelRect(ctx, tx, 95, 32, 52, '#15803d', '#166534'); // Foliage
      }
    }

    // 4. Asphalt Road (차도, y: 255 ~ 320)
    drawPixelRect(ctx, 0, 255, STAGE_W, 65, '#1e293b');
    // White Crosswalks (횡단보도) at x=260 and x=780
    [260, 780].forEach(cwX => {
      const scwX = Math.floor(cwX - camX);
      if (scwX > -60 && scwX < STAGE_W + 60) {
        ctx.fillStyle = '#cbd5e1';
        for (let stripe = 0; stripe < 5; stripe++) {
          ctx.fillRect(scwX + stripe * 14, 258, 8, 58);
        }
      }
    });

    // Yellow Dashed Center Lane
    ctx.fillStyle = '#facc15';
    for (let rx = -(camX % 48); rx < STAGE_W; rx += 48) {
      ctx.fillRect(rx, 285, 26, 4);
    }

    // 5. Vehicles on Road
    streetVehicles.forEach(veh => {
      veh.x += veh.speed * veh.dir;
      if (veh.dir > 0 && veh.x > STREET_W + 60) veh.x = -60;
      if (veh.dir < 0 && veh.x < -60) veh.x = STREET_W + 60;

      const vx = Math.floor(veh.x - camX);
      if (vx < -60 || vx > STAGE_W + 60) return;

      if (veh.type === 'scooter') {
        drawPixelRect(ctx, vx, veh.y, 28, 14, veh.color);
        drawPixelRect(ctx, vx + (veh.dir > 0 ? -8 : 20), veh.y - 12, 16, 14, veh.boxColor); // Food box
        drawPixelRect(ctx, vx + (veh.dir > 0 ? 20 : 4), veh.y - 16, 10, 10, '#1e293b'); // Helmet
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(vx + 2, veh.y + 12, 8, 8);
        ctx.fillRect(vx + 18, veh.y + 12, 8, 8);
      } else if (veh.type === 'taxi') {
        drawPixelRect(ctx, vx, veh.y, 48, 18, '#f59e0b', '#d97706');
        drawPixelRect(ctx, vx + 10, veh.y - 8, 28, 10, '#38bdf8', '#0f172a');
        drawPixelRect(ctx, vx + 18, veh.y - 12, 12, 4, '#ef4444');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(vx + 6, veh.y + 14, 8, 8);
        ctx.fillRect(vx + 34, veh.y + 14, 8, 8);
      } else if (veh.type === 'bus') {
        drawPixelRect(ctx, vx, veh.y - 12, 72, 32, '#10b981', '#059669');
        drawPixelRect(ctx, vx + 8, veh.y - 8, 56, 10, '#bae6fd');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(vx + 8, veh.y + 16, 10, 10);
        ctx.fillRect(vx + 52, veh.y + 16, 10, 10);
      }
    });

    // 6. Street Pedestrians
    streetPedestrians.forEach((ped, idx) => {
      ped.x += 0.5 * ped.dir;
      if (ped.x > STREET_W - 60) ped.dir = -1;
      if (ped.x < 50) ped.dir = 1;

      const px = Math.floor(ped.x - camX);
      if (px < -30 || px > STAGE_W + 30) return;

      const palette = JOB_PALETTES[ped.jobId] || JOB_PALETTES.devops;
      const walkFrame = (Math.floor(animTick / 6 + idx) % 2 === 0) ? CHAR_SPRITES.walk1 : CHAR_SPRITES.idle1;
      drawPixelSprite(ctx, walkFrame, px, ped.y, 2.4, palette, ped.dir < 0);

      // Thought Bubble in 12px font
      ped.timer--;
      if (ped.timer <= 0) ped.timer = 180 + Math.random() * 120;
      if (ped.timer < 90 && Math.abs(px - (streetPlayer.x - camX)) < 160) {
        ctx.font = 'bold 11px Pretendard, sans-serif';
        const txtW = ctx.measureText(ped.bubble).width;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(px - 10, ped.y - 28, txtW + 14, 20);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(px - 10 + 0.5, ped.y - 28 + 0.5, txtW + 13, 19);
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(ped.bubble, px - 3, ped.y - 14);
      }
    });

    // 7. Founder (Player) Character
    const playerSx = Math.floor(streetPlayer.x - camX);
    const playerPalette = JOB_PALETTES.ceo;
    const playerSprite = streetPlayer.isMoving
      ? ((Math.floor(animTick / 4) % 2 === 0) ? CHAR_SPRITES.walk1 : CHAR_SPRITES.idle1)
      : CHAR_SPRITES.idle1;

    drawPixelSprite(ctx, playerSprite, playerSx, streetPlayer.y, 2.7, playerPalette, streetPlayer.dir < 0);

    // Founder Name Badge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(playerSx - 12, streetPlayer.y - 18, 54, 16);
    ctx.strokeStyle = '#f59e0b';
    ctx.strokeRect(playerSx - 11.5, streetPlayer.y - 17.5, 53, 15);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px Pretendard, sans-serif';
    ctx.fillText('👑 대표(나)', playerSx - 8, streetPlayer.y - 6);

    // 8. Interactive Building Prompt Banner (Bold 13px Neon Prompt)
    if (streetPlayer.nearBuilding) {
      const b = streetPlayer.nearBuilding;
      const promptText = b.actionText;
      ctx.font = 'bold 13px Pretendard, sans-serif';
      const bw = ctx.measureText(promptText).width + 24;
      const bx = Math.max(15, Math.min(STAGE_W - bw - 15, playerSx - bw / 2 + 12));
      const by = streetPlayer.y - 48;

      const pulse = Math.floor(animTick / 6) % 2 === 0;
      ctx.fillStyle = pulse ? 'rgba(6, 182, 212, 0.95)' : 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(bx, by, bw, 24);
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx + 1, by + 1, bw - 2, 22);

      ctx.fillStyle = pulse ? '#000000' : '#38bdf8';
      ctx.fillText(promptText, bx + 12, by + 17);
    }
  }

  // --- 2. SERVER ROOM (INTERIOR) RENDERING (800x320) ---
  function drawRoomBackground(ctx, office, season) {
    const presetId = office.presetId;

    if (presetId === 'room_sinrim') {
      drawPixelRect(ctx, 0, 0, STAGE_W, 180, '#292524');
      ctx.fillStyle = '#322d2b';
      for (let ix = 0; ix < STAGE_W; ix += 32) ctx.fillRect(ix, 0, 3, 180);
      drawPixelRect(ctx, 0, 180, STAGE_W, STAGE_H - 180, '#78350f');
      ctx.fillStyle = '#92400e';
      for (let iy = 188; iy < STAGE_H; iy += 24) ctx.fillRect(0, iy, STAGE_W, 2);

      // Door on left
      const doorShake = (office.landlordAnger > 60 && Math.floor(animTick / 4) % 2 === 0) ? 2 : 0;
      drawPixelRect(ctx, 20 + doorShake, 60, 56, 120, '#451a03', '#78350f');
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(64 + doorShake, 120, 6, 6);

      // Window
      drawWindowAndSky(ctx, 104, 32, 96, 72, season.id);

      // Breaker Box
      drawPixelRect(ctx, 220, 44, 32, 44, office.isTripped ? '#7f1d1d' : '#334155', '#94a3b8');
      ctx.fillStyle = office.isTripped ? '#ef4444' : '#10b981';
      ctx.fillRect(232, 56, 8, 12);

      // Folding Desk & Laptop
      drawPixelRect(ctx, 96, 172, 88, 12, '#b45309', '#451a03');
      ctx.fillRect(104, 184, 8, 28);
      ctx.fillRect(168, 184, 8, 28);
      // Dual Monitor
      drawPixelRect(ctx, 124, 148, 32, 22, '#0f172a', '#38bdf8');
      ctx.fillStyle = (Math.floor(animTick / 10) % 2 === 0) ? '#38bdf8' : '#10b981';
      ctx.fillRect(130, 154, 16, 4);
      ctx.fillRect(130, 160, 20, 4);

    } else if (presetId === 'guro_jisan' || presetId === 'gangnam_wework') {
      const isGangnam = presetId === 'gangnam_wework';
      drawPixelRect(ctx, 0, 0, STAGE_W, 180, isGangnam ? '#1e1b4b' : '#1e293b');
      drawPixelRect(ctx, 0, 180, STAGE_W, STAGE_H - 180, isGangnam ? '#312e81' : '#334155');
      ctx.fillStyle = isGangnam ? '#3730a3' : '#3b4963';
      for (let ix = 0; ix < STAGE_W; ix += 48) ctx.fillRect(ix, 180, 2, STAGE_H - 180);

      drawWindowAndSky(ctx, 32, 28, 128, 84, season.id);
      drawWindowAndSky(ctx, 176, 28, 128, 84, season.id);

      for (let d = 0; d < 2; d++) {
        const dx = 44 + d * 124;
        drawPixelRect(ctx, dx, 168, 92, 14, '#cbd5e1', '#475569');
        drawPixelRect(ctx, dx + 28, 144, 36, 24, '#0f172a', '#06b6d4');
      }
    } else {
      const isChuncheon = presetId === 'chuncheon_dc';
      drawPixelRect(ctx, 0, 0, STAGE_W, 180, '#090d16');
      drawPixelRect(ctx, 0, 180, STAGE_W, STAGE_H - 180, '#0f172a');

      ctx.fillStyle = isChuncheon ? '#0d9488' : '#1e3a8a';
      for (let ix = 0; ix < STAGE_W; ix += 40) ctx.fillRect(ix, 180, 2, STAGE_H - 180);

      drawPixelRect(ctx, 0, 20, STAGE_W, 16, isChuncheon ? '#0284c7' : '#1e293b', '#38bdf8');
      ctx.fillStyle = '#7dd3fc';
      for (let px = (animTick % 40); px < STAGE_W; px += 40) {
        ctx.fillRect(px, 24, 16, 8);
      }
    }
  }

  function drawCoolingUnit(ctx, office) {
    const tier = office.coolingTier || 'T1';
    drawPixelRect(ctx, 580, 32, 180, 44, '#e2e8f0', '#64748b');
    drawPixelRect(ctx, 590, 60, 160, 10, '#0f172a');
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`COOLING UNIT [${tier}]`, 590, 52);

    if (!office.isTripped && animTick % 3 === 0) {
      particles.push({
        x: 590 + Math.random() * 150,
        y: 76,
        vx: -0.8 - Math.random() * 0.8,
        vy: 1.2 + Math.random() * 0.8,
        color: '#38bdf8',
        size: 3,
        life: 28
      });
    }
  }

  function drawGpuRacksOnStage(ctx, office) {
    const gpus = office.gpus || [];
    const startX = 330;
    const startY = 70;
    const maxDraw = Math.min(gpus.length, 18);

    for (let c = 0; c < 3; c++) {
      const cabX = startX + c * 105;
      drawPixelRect(ctx, cabX, startY - 12, 96, 165, '#090d16', '#334155');
      ctx.fillStyle = office.isTripped ? '#ef4444' : '#06b6d4';
      ctx.fillRect(cabX + 8, startY - 6, 80, 4);
    }

    for (let i = 0; i < maxDraw; i++) {
      const gpu = gpus[i];
      const col = Math.floor(i / 6);
      const row = i % 6;
      const gx = startX + col * 105 + 8;
      const gy = startY + row * 24 + 4;

      const isDead = gpu.isBroken || office.isTripped;
      const isHighTier = gpu.model === 'h100' || gpu.model === 'b200' || gpu.model === 'a100';
      const bodyColor = isDead ? '#450a0a' : (isHighTier ? '#1e1b4b' : '#1e293b');
      const borderColor = isDead ? '#ef4444' : (isHighTier ? '#a855f7' : '#38bdf8');

      drawPixelRect(ctx, gx, gy, 80, 20, bodyColor, borderColor);

      if (isDead) {
        ctx.fillStyle = '#ef4444';
      } else if (office.temp > 75) {
        ctx.fillStyle = (Math.floor(animTick / 4 + i) % 2 === 0) ? '#f59e0b' : '#ef4444';
      } else {
        ctx.fillStyle = (Math.floor(animTick / 8 + i) % 2 === 0) ? '#10b981' : '#06b6d4';
      }
      ctx.fillRect(gx + 6, gy + 6, 8, 8);

      ctx.fillStyle = isDead ? '#52525b' : '#94a3b8';
      const fanPhase = Math.floor((animTick + i * 3) / 3) % 2;
      if (fanPhase === 0 || isDead) {
        ctx.fillRect(gx + 24, gy + 5, 10, 10);
      } else {
        ctx.fillRect(gx + 22, gy + 7, 14, 6);
      }

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(gpu.model.substring(0, 5).toUpperCase(), gx + 42, gy + 14);
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
        x: 120,
        y: 195,
        targetX: 150,
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
        x: 80 + Math.random() * 450,
        y: 185 + (actors.length % 3) * 20,
        targetX: 80 + Math.random() * 450,
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
      ctx.fillRect(x + w - 32, y + 12, 20, 20);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(x + w - 28, y + 16, 12, 12);
    } else if (seasonId === 'winter') {
      ctx.fillStyle = '#f8fafc';
      snowFlakes.forEach(sf => {
        const sx = x + ((sf.x + animTick * sf.s) % (w - 8)) + 4;
        const sy = y + ((sf.y + animTick * sf.s) % (h - 8)) + 4;
        ctx.fillRect(sx, sy, 4, 4);
      });
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 8, y + h - 28, 20, 28);
      ctx.fillRect(x + 32, y + h - 40, 24, 40);
      ctx.fillRect(x + 60, y + h - 22, 28, 22);
      ctx.fillStyle = '#fef08a';
      if (Math.floor(animTick / 20) % 2 === 0) ctx.fillRect(x + 20, y + 12, 4, 4);
      ctx.fillRect(x + 56, y + 16, 4, 4);
    }

    ctx.fillStyle = '#334155';
    ctx.fillRect(x + Math.floor(w / 2), y, 4, h);
    ctx.fillRect(x, y + Math.floor(h / 2), w, 4);
  }

  function updateAndDrawActors(ctx, office) {
    syncActorsWithState();

    actors.forEach((act, idx) => {
      const isMoving = Math.abs(act.targetX - act.x) > 4;
      if (isMoving) {
        act.dir = act.targetX > act.x ? 1 : -1;
        act.x += act.dir * 1.4;
      } else if (Math.random() < 0.008) {
        act.targetX = 80 + Math.random() * 450;
      }

      const palette = JOB_PALETTES[act.jobId] || JOB_PALETTES.devops;
      const sprite = isMoving
        ? ((Math.floor(animTick / 5) % 2 === 0) ? CHAR_SPRITES.walk1 : CHAR_SPRITES.idle1)
        : CHAR_SPRITES.idle1;

      drawPixelSprite(ctx, sprite, act.x, act.y, 2.6, palette, act.dir < 0);

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
        ctx.font = 'bold 11px Pretendard, sans-serif';
        const txtW = ctx.measureText(act.bubble).width;
        const bw = txtW + 16;
        const bx = Math.max(8, Math.min(STAGE_W - bw - 8, act.x - bw / 3));
        const by = act.y - 28;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(bx, by, bw, 20);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, 19);
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(act.bubble, bx + 8, by + 14);
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
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size || 3, p.size || 3);
      if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= 0.6;
      ft.life--;
      ctx.font = 'bold 13px Pretendard, monospace';
      const tw = ctx.measureText(ft.text).width;
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(Math.floor(ft.x - 4), Math.floor(ft.y - 14), tw + 8, 18);
      ctx.strokeStyle = ft.color;
      ctx.strokeRect(Math.floor(ft.x - 3.5), Math.floor(ft.y - 13.5), tw + 7, 17);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, Math.floor(ft.x), Math.floor(ft.y));
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
  }

  // --- 3. MAIN RENDER LOOP (800x320) ---
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
        titleEl.textContent = '🕹️ 🗺️ 서울 스타트업 상가 거리 (A/D 키 또는 클릭 이동 · [Space] 상가 진입)';
      }
    } else {
      if (!Array.isArray(st.offices) || st.offices.length === 0) return;
      if (selectedOfficeIdx >= st.offices.length) selectedOfficeIdx = 0;
      const office = st.offices[selectedOfficeIdx] || st.offices[0];

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
        ctx.fillStyle = 'rgba(127, 29, 29, 0.45)';
        ctx.fillRect(0, 0, STAGE_W, STAGE_H);
        if (Math.floor(animTick / 10) % 2 === 0) {
          drawPixelRect(ctx, 220, 130, 360, 48, '#450a0a', '#ef4444');
          ctx.fillStyle = '#fecaca';
          ctx.font = 'bold 15px Pretendard, sans-serif';
          ctx.fillText('⚡ 정전 발생! [클릭하여 차단기 즉시 복구]', 250, 160);
        }
      }

      const titleEl = document.getElementById('pixel-stage-title');
      if (titleEl) {
        titleEl.textContent = `🕹️ 🖥️ 서버실 내부: ${office.customName} (가동 ${office.gpus.length}대 · ${office.temp.toFixed(1)}°C)`;
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
        🏢 ${o.customName.substring(0, 8)} (${o.gpus.length}대)
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

            const clickedB = STREET_BUILDINGS.find(b => worldClickX >= b.x && worldClickX <= b.x + b.w && clickY <= 245);
            if (clickedB) {
              streetPlayer.targetX = clickedB.x + clickedB.w / 2;
              streetPlayer.targetY = 215;
              if (Math.abs(streetPlayer.x - (clickedB.x + clickedB.w / 2)) < 110) {
                clickedB.onAction();
              }
            } else {
              streetPlayer.targetX = Math.max(30, Math.min(STREET_W - 30, worldClickX));
              streetPlayer.targetY = Math.max(195, Math.min(245, clickY));
            }
          } else {
            const st = window.state;
            if (!st || !st.offices[selectedOfficeIdx]) return;
            const off = st.offices[selectedOfficeIdx];
            if (off.isTripped && typeof window.resetOfficeBreaker === 'function') {
              window.resetOfficeBreaker(off.uid);
              spawnStageFloatingText('🔌 차단기 복구 완료!', '#38bdf8', 350, 110);
            } else {
              spawnStageFloatingText('⚡ 서버실 점검 완료!', '#facc15', 380, 140);
            }
          }
        });
      }

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
