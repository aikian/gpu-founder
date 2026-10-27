/**
 * game/js/ui/render.js
 * 60FPS DOM 파괴(Thrashing) 방지 스마트 렌더링 엔진:
 * 카드 구조가 바뀔 때만 innerHTML을 갱신하고, 매 프레임 수치는 ID 타겟팅으로 부드럽게 업데이트합니다.
 */

let _lastOfficesSig = '';
let _lastEndingsSig = '';
let _draggedGpu = null;

function handleGpuDragStart(event, officeUid, gpuUid) {
  _draggedGpu = { officeUid, gpuUid };
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', JSON.stringify({ officeUid, gpuUid }));
    event.dataTransfer.effectAllowed = 'move';
  }
  if (event.currentTarget) {
    event.currentTarget.classList.add('is-dragging');
  }
  document.querySelectorAll('.office-drop-zone').forEach(dz => {
    const targetUid = Number(dz.dataset.officeUid);
    if (targetUid !== officeUid) {
      dz.style.display = 'flex';
    }
  });
}

function handleGpuDragEnd(event) {
  if (event.currentTarget) {
    event.currentTarget.classList.remove('is-dragging');
  }
  _draggedGpu = null;
  document.querySelectorAll('.office-drop-zone').forEach(dz => {
    dz.style.display = 'none';
  });
  document.querySelectorAll('.office-card').forEach(card => {
    card.classList.remove('drop-hover-target');
  });
}

function handleOfficeDragOver(event, targetOfficeUid) {
  if (!_draggedGpu || _draggedGpu.officeUid === targetOfficeUid) return;
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  const card = document.getElementById(`office-card-${targetOfficeUid}`);
  if (card && !card.classList.contains('drop-hover-target')) {
    card.classList.add('drop-hover-target');
  }
}

function handleOfficeDragLeave(event, targetOfficeUid) {
  const card = document.getElementById(`office-card-${targetOfficeUid}`);
  if (card) {
    const rect = card.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX >= rect.right ||
        event.clientY < rect.top || event.clientY >= rect.bottom) {
      card.classList.remove('drop-hover-target');
    }
  }
}

function handleOfficeDrop(event, targetOfficeUid) {
  event.preventDefault();
  document.querySelectorAll('.office-card').forEach(card => {
    card.classList.remove('drop-hover-target');
  });
  document.querySelectorAll('.office-drop-zone').forEach(dz => {
    dz.style.display = 'none';
  });

  let data = _draggedGpu;
  if (!data && event.dataTransfer) {
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
    } catch (e) {}
  }
  _draggedGpu = null;

  if (!data || data.officeUid === targetOfficeUid) return;

  if (window.Systems.office && typeof window.Systems.office.transferGpu === 'function') {
    window.Systems.office.transferGpu(data.officeUid, targetOfficeUid, data.gpuUid);
  }
}

window.handleGpuDragStart = handleGpuDragStart;
window.handleGpuDragEnd = handleGpuDragEnd;
window.handleOfficeDragOver = handleOfficeDragOver;
window.handleOfficeDragLeave = handleOfficeDragLeave;
window.handleOfficeDrop = handleOfficeDrop;

function getOfficeSceneMeta(presetId) {
  switch (presetId) {
    case 'room_sinrim':
      return { icon: '🏚️', badge: '가정용 단상 · 누진세 주의', bg: 'linear-gradient(135deg, #1e1b2e, #2a1f2d)' };
    case 'guro_jisan':
      return { icon: '🏢', badge: '산업용 전력 · 벤처인증', bg: 'linear-gradient(135deg, #102038, #193254)' };
    case 'gangnam_wework':
      return { icon: '🏙️', badge: '테헤란로 역세권 · IR 특화', bg: 'linear-gradient(135deg, #1b1838, #2d225a)' };
    case 'pangyo_idc':
      return { icon: '🖥️', badge: '항온항습 · 이중화 UPS', bg: 'linear-gradient(135deg, #0d262e, #123e4a)' };
    case 'chuncheon_dc':
      return { icon: '🌊', badge: '소양강 친환경 하이퍼스케일', bg: 'linear-gradient(135deg, #0a2926, #0f473e)' };
    default:
      return { icon: '🏢', badge: '서버실', bg: 'linear-gradient(135deg, #111c33, #172a4a)' };
  }
}

function renderUI() {
  if (typeof document === 'undefined') return;
  const specs = calculateSpecsGlobalSafe();
  if (window.Systems.endings && typeof window.Systems.endings.calculateCompanyValuation === 'function') {
    state.valuation = window.Systems.endings.calculateCompanyValuation();
  }

  // Row 1: Calendar & Season
  const season = getSeasonInfo(state.calendarMonth);
  const dateEl = document.getElementById('stat-date-badge');
  if (dateEl) {
    dateEl.textContent = `📅 ${state.year}년 ${state.calendarMonth}월 (${state.month}/84개월) · ${season.name}`;
  }

  // Speed Buttons Active State
  [0, 1, 2, 4].forEach(sp => {
    const btn = document.getElementById(`speed-btn-${sp}`);
    if (btn) {
      if (state.speed === sp) btn.classList.add('active-speed');
      else btn.classList.remove('active-speed');
    }
  });

  // Month Progress Bar (0 ~ 60s)
  const dayProg = clamp(state.dayProgress || 0, 0, 60);
  const remainSec = Math.max(0, Math.ceil(60 - dayProg));
  const timerLbl = document.getElementById('month-timer-label');
  if (timerLbl) timerLbl.textContent = `${remainSec}s`;
  const monthFill = document.getElementById('month-progress-fill');
  if (monthFill) monthFill.style.width = `${(dayProg / 60) * 100}%`;

  // Row 2: 6 KPI Cards
  const moneyEl = document.getElementById('stat-money');
  if (moneyEl) moneyEl.textContent = formatKRW(state.money);

  const netEl = document.getElementById('stat-net-income');
  if (netEl) {
    if (specs.netCashPerSec >= 0) {
      netEl.textContent = `+${formatKRW(specs.netCashPerSec)}/초 (흑자)`;
      netEl.className = 'kpi-sub net-profit text-green font-mono';
    } else {
      const burnPerMonth = Math.abs(specs.netCashPerSec * 60);
      const runwayMonths = burnPerMonth > 0 ? (state.money > 0 ? (state.money / burnPerMonth).toFixed(1) : '0') : '∞';
      netEl.textContent = `-${formatKRW(Math.abs(specs.netCashPerSec))}/초 (런웨이 ${runwayMonths}개월)`;
      netEl.className = 'kpi-sub net-profit text-red font-mono';
    }
  }

  const tfEl = document.getElementById('stat-total-tflops');
  if (tfEl) tfEl.textContent = `${specs.totalTflops.toLocaleString()} TFLOPS`;
  const gpuSumEl = document.getElementById('stat-gpu-summary');
  if (gpuSumEl) gpuSumEl.textContent = `가동 ${specs.totalGpuCount}대 · PUE ${specs.avgPue}`;

  const coinEl = document.getElementById('stat-coin');
  const coinVal = Math.floor(state.coinBalance * state.coinPrice);
  if (coinEl) coinEl.textContent = `${state.coinBalance.toFixed(4)} ETH`;
  const coinValEl = document.getElementById('stat-coin-value');
  if (coinValEl) coinValEl.textContent = `≈ ${formatKRW(coinVal)}`;

  const fixedEl = document.getElementById('stat-fixed-costs');
  if (fixedEl) fixedEl.textContent = `-${formatKRW(specs.totalMonthlyFixedCost)}/월`;
  const loanBalEl = document.getElementById('stat-loan-balance');
  if (loanBalEl) {
    loanBalEl.textContent = `전기 ${formatKRW(specs.monthlyElectricBill)} · 급여 ${formatKRW(specs.monthlyPayroll)}`;
  }

  const ceoEl = document.getElementById('stat-ceo-status');
  if (ceoEl) {
    ceoEl.textContent = `지분 ${state.ceoEquity.toFixed(0)}% · 스트레스 ${Math.round(state.ceoStress)}%`;
  }
  const hrMiniEl = document.getElementById('stat-hr-mini');
  if (hrMiniEl) {
    hrMiniEl.textContent = `직원 ${state.employees.length}명 · 사기 ${Math.round(state.morale)}%`;
  }

  const valEl = document.getElementById('stat-valuation');
  if (valEl) {
    valEl.textContent = formatKRW(state.valuation);
  }
  const ipoBadge = document.getElementById('stat-ipo-badge');
  if (ipoBadge) {
    ipoBadge.textContent = state.flags.listed ? '🏆 코스닥 상장법인' : (state.flags.bizRegistered ? '법인사업자' : '예비창업자');
    ipoBadge.className = state.flags.listed ? 'kpi-sub font-mono text-amber' : 'kpi-sub font-mono';
  }

  // Credit & Reputation Badge
  state.creditTier = getCreditTier(state.creditScore);
  const creditEl = document.getElementById('stat-credit-score');
  if (creditEl) {
    creditEl.textContent = `신용 ${state.creditTier} (${state.creditScore}) · 평판 ${Math.round(state.reputation)}`;
  }

  // Capacity & Badges on Nav Tabs
  let totalSlots = 0;
  let totalMaxPower = 0;
  state.offices.forEach(off => {
    const preset = window.GAME_DATA.offices.find(p => p.id === off.presetId) || window.GAME_DATA.offices[0];
    totalSlots += preset.slots;
    let maxP = preset.maxPower + (off.extraPower || 0);
    if (window.GAME_DATA.powerTech && off.powerTier) {
      const pt = window.GAME_DATA.powerTech.find(p => p.id === off.powerTier);
      if (pt && pt.capacityW) maxP = Math.max(maxP, pt.capacityW + (off.extraPower || 0));
    }
    totalMaxPower += maxP;
  });

  const offBadge = document.getElementById('office-count-badge');
  if (offBadge) offBadge.textContent = state.offices.length;
  const slotBadge = document.getElementById('slot-avail-badge');
  if (slotBadge) slotBadge.textContent = `${specs.totalGpuCount}/${totalSlots}`;
  const hrBadge = document.getElementById('hr-count-badge');
  if (hrBadge) hrBadge.textContent = state.employees.length;

  const capInfoEl = document.getElementById('procure-capacity-info');
  if (capInfoEl) {
    const freeSlots = Math.max(0, totalSlots - specs.totalGpuCount);
    const freePower = Math.max(0, totalMaxPower - specs.totalPowerUsage);
    capInfoEl.innerHTML = `📦 랙 슬롯: <b>${specs.totalGpuCount}/${totalSlots}대</b> (여유 <b class="${freeSlots > 0 ? 'text-green' : 'text-red'}">${freeSlots}칸</b>) · ⚡ 전력 여유: <b class="${freePower > 300 ? 'text-cyan' : 'text-red'}">${freePower.toLocaleString()}W</b>`;
  }

  // Startup Milestone Quest Tracker
  renderMilestoneQuest(specs);

  // Live 2D Pixel Art Stage Viewport
  if (typeof window.renderPixelStage === 'function') window.renderPixelStage();
  if (typeof window.renderPixelStageTabs === 'function') window.renderPixelStageTabs();

  // Sub-sections
  renderWorkloadUI(specs);
  renderOfficesList();
  renderMarketTab(coinVal);
}

function renderMilestoneQuest(specs) {
  const banner = document.getElementById('quest-banner');
  if (!banner) return;
  state.milestones = state.milestones || {};

  const quests = [
    {
      id: 'm1_grant',
      check: () => Boolean(state.flags && state.flags.bizRegistered),
      text: '🎯 <b>STEP 1/6:</b> [지원사업] 탭에서 예비창업패키지 발표평가에 합격해 법인을 설립하세요! (보상 +200만)',
      reward: () => { state.money += 2000000; showToast('🎉 [마일스톤 1 달성] 법인 설립 축하금 +200만 원 지급!'); }
    },
    {
      id: 'm2_gpu3',
      check: () => specs.totalGpuCount >= 3,
      text: '🎯 <b>STEP 2/6:</b> [GPU 조달] 탭에서 가동 GPU를 3대 이상 확보하세요! (보상 +300만)',
      reward: () => { state.money += 3000000; showToast('🎉 [마일스톤 2 달성] 초기 클러스터 구축 보너스 +300만 원!'); }
    },
    {
      id: 'm3_hire',
      check: () => state.employees.length >= 1,
      text: '🎯 <b>STEP 3/6:</b> [인사·복지] 탭에서 첫 직원을 채용해 팀을 꾸리세요! (보상 +500만 · 평판+10)',
      reward: () => { state.money += 5000000; state.reputation = clamp(state.reputation + 10, 0, 100); showToast('🎉 [마일스톤 3 달성] 첫 팀원 영입 축하금 +500만 원!'); }
    },
    {
      id: 'm4_office2',
      check: () => state.offices.some(o => o.presetId !== 'room_sinrim'),
      text: '🎯 <b>STEP 4/6:</b> 원룸을 벗어나 구로 지식산업센터 이상의 신규 사업장을 임대하세요! (보상 +1,000만)',
      reward: () => { state.money += 10000000; showToast('🎉 [마일스톤 4 달성] 지식산업센터 입주 축하금 +1,000만 원!'); }
    },
    {
      id: 'm5_vc',
      check: () => specs.totalTflops >= 200 && state.vcState && state.vcState.seed_round === 'approved',
      text: '🎯 <b>STEP 5/6:</b> 연산력 200 TF 달성 및 Seed VC 투자를 유치하세요! (보상 신용+40)',
      reward: () => { state.creditScore = clamp(state.creditScore + 40, 0, 1000); showToast('🎉 [마일스톤 5 달성] VC 시드 투자 유치 성공! 신용점수 +40!'); }
    },
    {
      id: 'm6_ipo',
      check: () => Boolean(state.flags && state.flags.listed),
      text: '🎯 <b>STEP 6/6:</b> 연산력 5,000 TF를 돌파하고 코스닥(KOSDAQ) 상장(IPO)에 성공하세요!',
      reward: () => { state.reputation = 100; showToast('🏆 [전 마일스톤 달성] 코스닥 상장사 등극! 소버린 AI 트루엔딩에 도전하세요!'); }
    }
  ];

  for (const q of quests) {
    if (!state.milestones[q.id]) {
      if (q.check()) {
        state.milestones[q.id] = true;
        q.reward();
      } else {
        if (banner.innerHTML !== q.text) banner.innerHTML = q.text;
        return;
      }
    }
  }

  const finalTxt = '👑 <b>최종 목표:</b> 춘천 하이퍼스케일 DC + 20만 TF + PUE 1.15 이하로 [소버린 AI 트루엔딩] 달성!';
  if (banner.innerHTML !== finalTxt) banner.innerHTML = finalTxt;
}

function computeOfficesSignature() {
  return state.offices.map(o => {
    const gpuSig = o.gpus.map(g => `${g.uid}:${g.model}:${g.isBroken ? 1 : 0}:${(g.mods || []).length}:${g.clockMul}`).join(',');
    return `${o.uid}|${o.presetId}|${o.coolingTier}|${o.powerTier}|${o.upsCount}|${o.hasSolar ? 1 : 0}|${o.isTripped ? 1 : 0}|${o.thermalShutdown ? 1 : 0}|${o.temp > 75 ? 1 : 0}|[${gpuSig}]`;
  }).join(';;');
}

function forceRebuildOffices() {
  _lastOfficesSig = '';
  renderOfficesList();
}

function renderOfficesList() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('offices-list');
  if (!container) return;

  const sig = computeOfficesSignature();
  if (sig !== _lastOfficesSig) {
    _lastOfficesSig = sig;
    container.innerHTML = state.offices.map((office, idx) => {
      const preset = window.GAME_DATA.offices.find(p => p.id === office.presetId) || window.GAME_DATA.offices[0];
      const scene = getOfficeSceneMeta(office.presetId);
      const maxSlots = preset.slots;
      const brokenCount = office.gpus.filter(g => (g.isBroken || g.isBricked) && !g.permDead).length;

      return `
        <div class="office-card ${office.thermalShutdown ? 'shutdown-active' : ''}" 
             id="office-card-${office.uid}" 
             data-office-uid="${office.uid}"
             ondragover="handleOfficeDragOver(event, ${office.uid})"
             ondragleave="handleOfficeDragLeave(event, ${office.uid})"
             ondrop="handleOfficeDrop(event, ${office.uid})"
             style="${office.isTripped ? 'border-color: var(--accent-red);' : ''}">
          <div class="office-scene-banner" style="background: ${scene.bg};">
            <div class="office-scene-left">
              <div class="office-scene-icon">${scene.icon}</div>
              <div>
                <div class="office-title">${office.customName}</div>
                <span class="sub-desc">${scene.badge} · 쿨링 [${office.coolingTier || 'T1'}] · 수전 [${office.powerTier || 'P1'}] · PUE <b id="off-pue-${office.uid}">${office.pue || 1.4}</b></span>
              </div>
            </div>
            <div class="office-rent">월세 ${formatKRW(office.customRent || preset.monthlyRent)}</div>
          </div>

          <div class="office-drop-zone font-mono" id="drop-zone-${office.uid}" data-office-uid="${office.uid}" style="display:none;">
            🚚 여기에 드롭하여 이 사업장으로 이전 장착 (빈 슬롯: ${Math.max(0, maxSlots - office.gpus.length)}개)
          </div>

          ${office.thermalShutdown ? `
            <div class="thermal-shutdown-banner">
              🚨 <b>[긴급 열 보호 셧다운 발동]</b> 95°C 초과로 하드웨어 보호 중! (냉각 복구 중... 연산 일시 중지)
            </div>
          ` : ''}

          <div class="office-status-bars">
            <div class="bar-row">
              <div class="bar-labels">
                <span>⚡ IT 소비전력: <b id="off-pwr-txt-${office.uid}">0W / 0W</b></span>
                <span id="off-pwr-pct-${office.uid}">0%</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" id="off-pwr-bar-${office.uid}" style="width: 0%;"></div>
              </div>
            </div>

            <div class="bar-row">
              <div class="bar-labels">
                <span>🌡️ 서버실 온도: <b id="off-temp-txt-${office.uid}">${office.temp.toFixed(1)}°C</b> ${office.upsCount > 0 ? `(🔋UPS ${office.upsCount})` : ''} ${office.hasSolar ? '☀️태양광' : ''}</span>
                <span id="off-temp-status-${office.uid}">정상</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" id="off-temp-bar-${office.uid}" style="width: 28%;"></div>
              </div>
            </div>

            ${preset.landlordNotice ? `
              <div class="bar-row">
                <div class="bar-labels">
                  <span>🚪 집주인 눈치/항의 게이지:</span>
                  <span class="text-amber font-mono" id="off-anger-txt-${office.uid}">0%</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill warning" id="off-anger-bar-${office.uid}" style="width: 0%;"></div>
                </div>
              </div>
            ` : ''}
          </div>

          <div>
            <div class="bar-labels" style="margin-bottom: 6px;">
              <span>🖥️ 서버 랙 슬롯 가동 현황 (<b>${office.gpus.length}</b> / ${maxSlots}슬롯) <span class="fan-spin">🌀</span></span>
              <div style="display:flex; gap:6px;">
                ${(office.dust || 0) > 30 ? `<button class="small-btn text-cyan font-mono" onclick="cleanOfficeDust(${office.uid})" title="먼지 청소 및 써멀 재도포 (15만 원)">🧹 먼지청소 (${Math.round(office.dust)}%)</button>` : ''}
                ${brokenCount > 0 ? `<button class="small-btn text-amber font-mono" onclick="repairAllBrokenGpus(${office.uid})" title="고장 GPU ${brokenCount}대 일괄 리볼링">🛠️ 고장 ${brokenCount}대 일괄 수리</button>` : ''}
                ${office.isTripped ? `<button class="small-btn text-red" onclick="resetOfficeBreaker(${office.uid})">🔌 차단기 수동 복구</button>` : ''}
              </div>
            </div>
            <div class="visual-rack-box" style="margin-bottom: 8px;">
              ${Array.from({ length: Math.min(maxSlots, 24) }).map((_, sIdx) => {
                const g = office.gpus[sIdx];
                if (!g) return `<div class="rack-slot-unit" title="빈 슬롯"></div>`;
                const isDead = g.isBroken || office.isTripped || office.thermalShutdown;
                const isHot = office.temp > 75;
                const cls = isDead ? 'broken-gpu' : (isHot ? 'hot-gpu' : 'active-gpu');
                const ledCls = isDead ? 'dead' : (isHot ? 'hot' : '');
                return `
                  <div class="rack-slot-unit ${cls} ${isDead ? '' : 'draggable-gpu'}" 
                       draggable="${!isDead}"
                       ondragstart="handleGpuDragStart(event, ${office.uid}, ${g.uid})"
                       ondragend="handleGpuDragEnd(event)"
                       title="${g.model.toUpperCase()} (#${g.uid}) - 내구 ${Math.round(g.health || 100)}% (다른 사업장으로 드래그 이동 가능)">
                    <span class="led-dot ${ledCls}"></span>
                    <span>${g.isMining ? '⛏' : '⚡'}</span>
                  </div>
                `;
              }).join('')}
              ${maxSlots > 24 ? `<span class="sub-desc font-mono">+${maxSlots - 24}슬롯</span>` : ''}
            </div>
            <div class="office-gpus-grid">
              ${office.gpus.length === 0 ? '<div style="font-size: 0.76rem; color: var(--text-secondary); text-align: center; padding: 22px 0;">장착된 GPU가 없습니다. [🛒 GPU 조달] 탭에서 그래픽카드를 확보하세요!</div>' : ''}
              ${office.gpus.map(gpu => {
                const spec = window.GAME_DATA.gpus[gpu.model] || { name: gpu.model, tflops: 0 };
                const hp = Math.round(gpu.health ?? 100);
                const modBadge = (gpu.mods && gpu.mods.length > 0) ? `<span class="badge tag-purple">+${gpu.mods.length}개조</span>` : '';
                return `
                  <div class="office-gpu-item draggable-gpu-card"
                       draggable="true"
                       ondragstart="handleGpuDragStart(event, ${office.uid}, ${gpu.uid})"
                       ondragend="handleGpuDragEnd(event)"
                       title="드래그하여 다른 사업장으로 이동할 수 있습니다.">
                    <div style="display:flex; align-items:center; gap:6px;">
                      <span class="drag-handle-icon" title="드래그 이동 손잡이">⠿</span>
                      <div>
                        <b>${gpu.isBroken ? '💥 [고장] ' : ''}${spec.name}</b> ${gpu.isMining ? '<span class="badge tag-amber">채굴판</span>' : ''}
                        ${modBadge}
                        <span class="sub-desc font-mono" id="gpu-hp-${gpu.uid}" style="margin-left:4px;">(내구 ${hp}%)</span>
                      </div>
                    </div>
                    <div style="display: flex; gap: 5px; align-items: center;">
                      <span class="font-mono text-cyan" style="margin-right:4px;">${Math.round(spec.tflops * (gpu.clockMul || 1))} TF</span>
                      ${state.offices.length > 1 ? `<button class="small-btn text-cyan" onclick="openGpuMoveModal(${office.uid}, ${gpu.uid})" title="다른 사업장으로 이전">🚚 이전</button>` : ''}
                      <button class="small-btn" onclick="openGpuTuningModal(${office.uid}, ${gpu.uid})">🔧 튜닝</button>
                      <button class="small-btn text-red" onclick="sellGpuFromOffice(${office.uid}, ${gpu.uid})">매각</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="office-actions-row">
            <button class="primary-btn" style="flex:1;" onclick="openInfraTechModal(${office.uid})">🏗️ 쿨링 · 전력 테크트리 업그레이드</button>
            ${idx > 0 ? `<button class="small-btn text-red" onclick="terminateOfficeLease(${office.uid})">임대 해지</button>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // Live numeric updates inside existing Office Cards (no DOM destruction!)
  state.offices.forEach(office => {
    const preset = window.GAME_DATA.offices.find(p => p.id === office.presetId) || window.GAME_DATA.offices[0];
    let maxPower = preset.maxPower + (office.extraPower || 0);
    if (window.GAME_DATA.powerTech && office.powerTier) {
      const pt = window.GAME_DATA.powerTech.find(p => p.id === office.powerTier);
      if (pt && pt.capacityW) maxPower = Math.max(maxPower, pt.capacityW + (office.extraPower || 0));
    }

    let officePower = 0;
    office.gpus.forEach(gpu => {
      if (!gpu.isBroken) {
        if (window.Systems.hardware && typeof window.Systems.hardware.getGpuEffectiveSpecs === 'function') {
          officePower += window.Systems.hardware.getGpuEffectiveSpecs(gpu, office.temp).power;
        } else {
          const spec = window.GAME_DATA.gpus[gpu.model];
          if (spec) officePower += spec.power;
        }
      }
      const hpEl = document.getElementById(`gpu-hp-${gpu.uid}`);
      if (hpEl) hpEl.textContent = `(내구 ${Math.round(gpu.health ?? 100)}%)`;
    });
    officePower = Math.round(officePower);

    const powerPct = Math.min(100, Math.round((officePower / maxPower) * 100));
    const isPowerOver = officePower > maxPower;

    const pueEl = document.getElementById(`off-pue-${office.uid}`);
    if (pueEl) pueEl.textContent = office.pue || 1.4;

    const pwrTxt = document.getElementById(`off-pwr-txt-${office.uid}`);
    if (pwrTxt) pwrTxt.textContent = `${officePower.toLocaleString()}W / ${maxPower.toLocaleString()}W`;

    const pwrPct = document.getElementById(`off-pwr-pct-${office.uid}`);
    if (pwrPct) {
      pwrPct.textContent = isPowerOver ? '⚠️ 과부하 위험' : `${powerPct}%`;
      pwrPct.className = isPowerOver ? 'text-red font-mono' : 'font-mono';
    }

    const pwrBar = document.getElementById(`off-pwr-bar-${office.uid}`);
    if (pwrBar) {
      pwrBar.style.width = `${powerPct}%`;
      pwrBar.className = `bar-fill ${isPowerOver ? 'danger' : ''}`;
    }

    const tempTxt = document.getElementById(`off-temp-txt-${office.uid}`);
    if (tempTxt) tempTxt.textContent = `${office.temp.toFixed(1)}°C`;

    const tempStatus = document.getElementById(`off-temp-status-${office.uid}`);
    if (tempStatus) {
      if (office.thermalShutdown) {
        tempStatus.textContent = '🚨 긴급 열 보호 셧다운 중 (냉각 대기)';
        tempStatus.className = 'text-red font-mono';
      } else if (office.temp > 83) {
        tempStatus.textContent = '🔥 83°C 초과 스로틀링 (-30% 성능 저하)';
        tempStatus.className = 'text-red font-mono';
      } else if (office.temp > 75) {
        tempStatus.textContent = '⚠️ 고온 주의 (내구도 마모 위험)';
        tempStatus.className = 'text-amber font-mono';
      } else {
        tempStatus.textContent = '쾌적 (정상)';
        tempStatus.className = 'text-green font-mono';
      }
    }

    const tempBar = document.getElementById(`off-temp-bar-${office.uid}`);
    if (tempBar) {
      tempBar.style.width = `${Math.min(100, office.temp)}%`;
      tempBar.className = `bar-fill ${office.temp > 75 ? 'danger' : (office.temp > 58 ? 'warning' : '')}`;
    }

    const angerTxt = document.getElementById(`off-anger-txt-${office.uid}`);
    if (angerTxt) angerTxt.textContent = `${Math.round(office.landlordAnger || 0)}%`;
    const angerBar = document.getElementById(`off-anger-bar-${office.uid}`);
    if (angerBar) angerBar.style.width = `${Math.min(100, office.landlordAnger || 0)}%`;
  });
}

function renderDanggeunDeals() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('used-deals-grid');
  if (!container) return;

  const dongnes = ['관악구 신림동', '구로디지털단지', '강남역 2번출구', '역삼동 테헤란로', '판교역 IT밸리', '봉천동 고시촌', '가산디지털단지'];
  const sellerAvatars = ['🧑‍💻', '👨‍🏫', '👩‍💻', '🧑‍🔧', '🧔', '👩‍🎓'];

  container.innerHTML = state.currentDeals.map((deal, dIdx) => {
    const spec = window.GAME_DATA.gpus[deal.model] || { tflops: 4, power: 120 };
    const tempNum = parseFloat(deal.mannerTemp) || 36.5;

    let mannerClass = 'manner-temp-normal';
    let mannerLabel = `매너온도 ${deal.mannerTemp}°C`;
    if (tempNum >= 65) {
      mannerClass = 'manner-temp-high';
      mannerLabel = `✨ 매너온도 ${deal.mannerTemp}°C (꿀매물)`;
    } else if (tempNum >= 42) {
      mannerClass = 'manner-temp-good';
      mannerLabel = `😊 매너온도 ${deal.mannerTemp}°C`;
    } else if (tempNum < 32) {
      mannerClass = 'manner-temp-low';
      mannerLabel = `⚠️ 매너온도 ${deal.mannerTemp}°C (채굴주의)`;
    }

    const dongneIdx = Math.abs(deal.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % dongnes.length;
    const dongne = dongnes[dongneIdx];
    const avatar = sellerAvatars[dIdx % sellerAvatars.length];
    const discountPct = Math.max(0, Math.round((1 - deal.price / deal.originalPrice) * 100));

    return `
      <div class="deal-card">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="danggeun-badge">🥕 ${dongne}</span>
              <span style="font-size:1.05rem;" title="판매자 프로필">${avatar}</span>
            </div>
            <span class="manner-temp ${mannerClass}">${mannerLabel}</span>
          </div>
          <h4 class="deal-title">${deal.name}</h4>
          <div style="display:flex; gap:6px; margin: 5px 0; flex-wrap:wrap;">
            <span class="badge tag-blue font-mono">${spec.tflops} TF</span>
            <span class="badge tag-green font-mono">${spec.power}W</span>
            ${deal.isMining ? '<span class="badge tag-amber font-mono">⛏️ 채굴출신</span>' : '<span class="badge tag-green font-mono">🎮 개인게이밍</span>'}
            ${deal.negoDone ? '<span class="badge tag-purple font-mono">네고반영됨</span>' : '<span class="badge tag-blue font-mono">네고가능</span>'}
          </div>
          <p class="deal-seller-story">"${deal.story}"</p>
        </div>
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size: 0.74rem; color: var(--text-secondary);">
            <span style="text-decoration: line-through;">신품 ${formatKRW(deal.originalPrice)}</span>
            <span class="font-mono text-cyan">${discountPct}% 할인</span>
          </div>
          <div class="deal-price">${formatKRW(deal.price)}</div>
        </div>
        <div class="deal-btn-row">
          <button class="nego-btn" ${deal.negoDone ? 'disabled' : ''} onclick="negoDanggeunDeal('${deal.id}')">
            ${deal.negoDone ? '네고 완료' : '💬 네고 찔러보기'}
          </button>
          <button class="buy-now-btn" onclick="buyDanggeunDeal('${deal.id}')">바로 구매</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderNewGpus() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('new-gpu-grid');
  if (!container) return;
  const gpus = window.GAME_DATA.gpus || {};
  container.innerHTML = Object.keys(gpus).map(key => {
    const gpu = gpus[key];
    return `
      <div class="deal-card">
        <div>
          <span class="tag tag-blue">공식 총판 신품 (무상 AS ${gpu.warrantyMonths || 24}개월)</span>
          <h4 class="deal-title" style="margin-top: 6px;">${gpu.name}</h4>
          <p class="deal-seller-story">정품 시리얼 등록 및 세금계산서 즉시 발행. 초기 내구도 100% 보장.</p>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <span class="badge tag-green font-mono">연산력: ${gpu.tflops.toLocaleString()} TF</span>
          <span class="badge tag-amber font-mono">소비전력: ${gpu.power}W</span>
        </div>
        <div class="deal-price">${formatKRW(gpu.newPrice)}</div>
        <button class="primary-btn" onclick="buyNewGpu('${key}')">📦 신품 발주 구매</button>
      </div>
    `;
  }).join('');
}

function renderLeaseGpus() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('lease-gpu-grid');
  if (!container) return;
  const leaseOptions = window.GAME_DATA.leaseOptions || [];
  container.innerHTML = leaseOptions.map(l => `
    <div class="deal-card">
      <div>
        <span class="tag tag-purple">엔터프라이즈 리스/렌탈</span>
        <h4 class="deal-title" style="margin-top: 6px;">${l.name}</h4>
        <p class="deal-seller-story">보증금 납부 후 월 리스료로 고성능 서버 4대를 즉시 투입합니다.</p>
      </div>
      <div>
        <span class="badge tag-purple font-mono">합산 연산력: ${l.tflops.toLocaleString()} TFLOPS</span>
      </div>
      <div>
        <div style="font-size: 0.78rem; color: var(--text-secondary);">보증금: ${formatKRW(l.deposit)}</div>
        <div class="deal-price" style="font-size: 1.05rem; color: var(--accent-purple);">월 ${formatKRW(l.monthly)}/월</div>
      </div>
      <button class="primary-btn" onclick="leaseGpuServer('${l.model}', ${l.deposit}, ${l.monthly})">🤝 리스 계약 체결</button>
    </div>
  `).join('');
}

function renderWorkloadUI(specs) {
  if (typeof document === 'undefined') return;
  const alloc = state.workloadAlloc;
  const totalAlloc = alloc.crypto + alloc.cloud + alloc.saas + alloc.corp;
  const pctEl = document.getElementById('alloc-total-pct');
  if (pctEl) pctEl.textContent = `${totalAlloc}%`;

  const statusEl = document.getElementById('alloc-status-text');
  if (statusEl) {
    if (totalAlloc === 100) {
      statusEl.textContent = '✅ 연산력 100% 최적 가동 중';
      statusEl.style.color = 'var(--accent-green)';
    } else {
      statusEl.textContent = `여유 연산력 ${Math.max(0, 100 - totalAlloc)}% 대기 중`;
      statusEl.style.color = 'var(--text-secondary)';
    }
  }

  // Update visual stacked bar & slider positions
  ['crypto', 'cloud', 'saas', 'corp'].forEach(k => {
    const seg = document.getElementById(`alloc-bar-${k}`);
    if (seg) seg.style.width = `${alloc[k]}%`;
    const sl = document.getElementById(`slider-${k}`);
    if (sl && document.activeElement !== sl) sl.value = alloc[k];
    const vl = document.getElementById(`val-${k}`);
    if (vl) vl.textContent = `${alloc[k]}%`;
  });

  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };
  setTxt('wl-crypto-tflops', `${specs.cryptoTflops.toLocaleString()} TFLOPS`);
  setTxt('wl-crypto-rate', `+${specs.ethPerSec.toFixed(5)} ETH/초`);
  setTxt('wl-cloud-tflops', `${specs.cloudTflops.toLocaleString()} TFLOPS`);
  setTxt('wl-cloud-rate', `+${formatKRW(specs.cloudIncomePerSec)}/초`);
  setTxt('saas-users', `${state.saasUsers.toLocaleString()}명`);
  setTxt('wl-saas-rate', `+${formatKRW(specs.saasIncomePerSec)}/초`);
  setTxt('wl-corp-tflops', `${specs.corpTflops.toLocaleString()} TFLOPS`);
  setTxt('wl-corp-rate', specs.corpIncomePerSec > 0 ? `+${formatKRW(specs.corpIncomePerSec)}/초` : '할당 800 TF 이상 시 계약 활성');

  const modBox = document.getElementById('active-modifiers-bar');
  if (modBox) {
    if (!state.modifiers || state.modifiers.length === 0) {
      modBox.innerHTML = `<span class="sub-desc">✨ 현재 적용 중인 일시적 시장/이벤트 변동 효과가 없습니다.</span>`;
    } else {
      modBox.innerHTML = state.modifiers.map(m => `
        <span class="badge tag-amber">${m.name || m.stat}: ${m.mul ? '×' + m.mul : ''}${m.add ? (m.add > 0 ? '+' + m.add : m.add) : ''} (${m.months}개월 남음)</span>
      `).join(' ');
    }
  }
}

function renderHrUI() {
  if (typeof document === 'undefined') return;
  const rosterEl = document.getElementById('hr-roster-list');
  const hireEl = document.getElementById('hr-jobs-grid');
  const welfareEl = document.getElementById('hr-welfare-grid');
  if (!rosterEl || !hireEl || !welfareEl) return;

  const jobs = window.GAME_DATA.jobs || [];
  const channels = window.GAME_DATA.channels || [];
  const policies = window.GAME_DATA.welfarePolicies || [];
  const hrEff = (window.Systems.hr && typeof window.Systems.hr.getHrEffects === 'function')
    ? window.Systems.hr.getHrEffects()
    : { monthlyPayroll: 0, monthlyWelfareCost: 0 };

  const summaryEl = document.getElementById('hr-summary-pill');
  if (summaryEl) {
    summaryEl.innerHTML = `재직 <b>${state.employees.length}명</b> · 평균 사기 <b class="text-green">${Math.round(state.morale)}%</b> · 번아웃 <b class="text-amber">${Math.round(state.burnout)}%</b> · 월 인건비+복지 <b class="text-red">${formatKRW((hrEff.monthlyPayroll || 0) + (hrEff.monthlyWelfareCost || 0))}/월</b>`;
  }

  if (state.employees.length === 0) {
    rosterEl.innerHTML = `<div class="sub-desc" style="padding:22px; text-align:center; background: var(--bg-panel); border-radius: 8px;">아직 채용한 직원이 없습니다. 우측 직군 목록에서 첫 엔지니어나 행정 전담 직원을 영입하세요!</div>`;
  } else {
    rosterEl.innerHTML = state.employees.map(emp => {
      const job = jobs.find(j => j.id === emp.jobId) || { name: emp.jobId, icon: '👤' };
      return `
        <div class="finance-item-card" style="padding:12px; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <b>${job.icon || '👤'} ${emp.name}</b> <span class="badge tag-blue">${job.name}</span>
              ${emp.isFake ? '<span class="badge tag-red">물경력 의심</span>' : ''}
            </div>
            <span class="font-mono text-amber">월 ${formatKRW(emp.salary)}</span>
          </div>
          <div style="display:flex; gap:12px; font-size:0.78rem; flex-wrap:wrap;" class="font-mono">
            <span>숙련도: <b class="text-cyan">${Math.round(emp.skill)}</b></span>
            <span>사기: <b class="${emp.morale < 35 ? 'text-red' : 'text-green'}">${Math.round(emp.morale)}%</b></span>
            <span>번아웃: <b class="${emp.burnout > 70 ? 'text-red' : 'text-amber'}">${Math.round(emp.burnout)}%</b></span>
            <span>충성도: <b>${Math.round(emp.loyalty)}%</b></span>
            <span>지분: <b>${emp.stockOption || 0}%</b></span>
          </div>
          <div style="display:flex; gap:6px; justify-content:flex-end;">
            <button class="small-btn" onclick="window.Systems.hr.giveBonusOrStock(${emp.uid}, 'bonus'); renderHrUI(); renderUI();">💵 상여금</button>
            <button class="small-btn" onclick="window.Systems.hr.giveBonusOrStock(${emp.uid}, 'stock'); renderHrUI(); renderUI();">📜 스톡옵션 +1%</button>
            <button class="small-btn text-red" onclick="window.Systems.hr.fireEmployee(${emp.uid}); renderHrUI(); renderUI();">해고</button>
          </div>
        </div>
      `;
    }).join('');
  }

  const selectedChannelEl = document.getElementById('hr-channel-select');
  if (selectedChannelEl && selectedChannelEl.options.length === 0) {
    selectedChannelEl.innerHTML = channels.map(ch => `
      <option value="${ch.id}">${ch.name} (${ch.desc || '기본 채용'})</option>
    `).join('');
  }

  hireEl.innerHTML = jobs.map(job => `
    <div class="finance-item-card" style="padding:12px; gap:8px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b>${job.icon || '👨‍💻'} ${job.name}</b>
          <span class="font-mono text-green" style="font-size:0.8rem;">월 ${formatKRW(job.salary)}</span>
        </div>
        <p class="sub-desc" style="margin-top:4px;">${job.desc || ''}</p>
        <p class="sub-desc text-amber" style="margin-top:2px;">⚠️ ${job.riskDesc || ''}</p>
      </div>
      <button class="primary-btn" onclick="handleHireClick('${job.id}')">채용 영입 실행</button>
    </div>
  `).join('');

  welfareEl.innerHTML = policies.map(pol => {
    const isActive = !!(state.welfare && state.welfare[pol.id]);
    return `
      <div class="finance-item-card" style="padding:11px 14px; flex-direction:row; align-items:center; justify-content:space-between; ${isActive ? 'border-color: var(--accent-green);' : ''}">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <b>${pol.name}</b>
            <span class="badge ${isActive ? 'tag-green' : 'tag-blue'}">${pol.isToggle ? (isActive ? '시행 중' : '미시행') : '일회성'}</span>
          </div>
          <p class="sub-desc" style="margin-top:2px;">${pol.desc || ''}</p>
        </div>
        <button class="small-btn" onclick="window.Systems.hr.toggleWelfare('${pol.id}'); renderHrUI(); renderUI();">
          ${pol.isToggle ? (isActive ? '중단' : '시행') : '실행'}
        </button>
      </div>
    `;
  }).join('');
}

function handleHireClick(jobId) {
  const selectEl = document.getElementById('hr-channel-select');
  const channelId = selectEl ? selectEl.value : 'wanted';
  if (window.Systems.hr && typeof window.Systems.hr.hireEmployee === 'function') {
    window.Systems.hr.hireEmployee(jobId, channelId);
    renderHrUI();
    renderUI();
  }
}

function renderFinanceUI() {
  if (typeof document === 'undefined') return;
  const grantsEl = document.getElementById('grants-list');
  const loansEl = document.getElementById('loans-list');
  const vcEl = document.getElementById('vc-rounds-list');
  if (!grantsEl || !loansEl || !vcEl) return;

  const programsRaw = window.GAME_DATA.pitchPrograms || [];
  const programs = Array.isArray(programsRaw) ? programsRaw : Object.values(programsRaw);
  const grantPrograms = programs.filter(p => p && p.type === 'grant');
  const vcPrograms = programs.filter(p => p && p.type === 'vc');

  grantsEl.innerHTML = grantPrograms.map(prog => {
    const st = (state.grantsState && state.grantsState[prog.id]) || 'available';
    const check = (window.Systems.pitching && typeof window.Systems.pitching.getPitchProgramStatus === 'function')
      ? window.Systems.pitching.getPitchProgramStatus(prog.id)
      : { canApply: true, reason: '' };
    const isApproved = st === 'approved';

    return `
      <div class="finance-item-card">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="tag tag-green">${prog.questionCount}문항 / 합격 ${prog.passScore}점</span>
            <span class="font-mono sub-desc">${prog.requireDesc || ''}</span>
          </div>
          <h4 style="font-size: 0.96rem; margin-top: 6px;">${prog.name}</h4>
          <p class="deal-seller-story" style="margin-top: 6px;">${prog.desc || ''}</p>
        </div>
        <div class="grant-reward">기본 ${formatKRW(prog.baseAmount)}</div>
        <button class="primary-btn" ${(isApproved || !check.canApply) ? 'disabled' : ''} onclick="handleStartPitch('${prog.id}')">
          ${isApproved ? '✅ 선정 및 수령 완료' : (check.canApply ? '🎤 발표평가 피칭 입장' : `${check.reason}`)}
        </button>
      </div>
    `;
  }).join('');

  const loanOptions = window.GAME_DATA.loans || [];
  loansEl.innerHTML = loanOptions.map(opt => {
    const activeLoan = state.loans.find(l => l.id === opt.id);
    return `
      <div class="finance-item-card">
        <div>
          <span class="tag tag-blue">최소 신용등급 ${opt.minCredit} (${opt.minCreditScore}점+)</span>
          <h4 style="font-size: 0.96rem; margin-top: 6px;">${opt.name}</h4>
          <p class="deal-seller-story" style="margin-top: 6px;">한도: ${formatKRW(opt.principal)} · 연 금리: ${(opt.interestRate * 100).toFixed(1)}%</p>
        </div>
        <div class="grant-reward" style="color: var(--accent-cyan);">${formatKRW(opt.principal)}</div>
        ${activeLoan
          ? `<button class="small-btn text-green" onclick="repayBankLoan('${opt.id}')">💸 원금 전액 상환 (${formatKRW(activeLoan.balance)})</button>`
          : `<button class="primary-btn" onclick="takeBankLoan('${opt.id}')">🏦 대출 심사 및 실행</button>`
        }
      </div>
    `;
  }).join('');

  vcEl.innerHTML = vcPrograms.map(vc => {
    const st = (state.vcState && state.vcState[vc.id]) || 'available';
    const check = (window.Systems.pitching && typeof window.Systems.pitching.getPitchProgramStatus === 'function')
      ? window.Systems.pitching.getPitchProgramStatus(vc.id)
      : { canApply: true, reason: '' };
    const isApproved = st === 'approved';
    const dilution = vc.equityDilution || vc.dilution || vc.equityGiven || 12;

    return `
      <div class="finance-item-card">
        <div>
          <span class="tag tag-purple">지분 ${dilution}% 희석 · 합격 ${vc.passScore}점</span>
          <h4 style="font-size: 0.96rem; margin-top: 6px;">${vc.name}</h4>
          <p class="deal-seller-story" style="margin-top: 6px;">${vc.desc || ''} (${vc.requireDesc || ''})</p>
        </div>
        <div class="grant-reward" style="color: var(--accent-purple);">${formatKRW(vc.baseAmount)}</div>
        <button class="primary-btn" ${(isApproved || !check.canApply) ? 'disabled' : ''} onclick="handleStartPitch('${vc.id}')">
          ${isApproved ? '🦄 투자 유치 완료' : (check.canApply ? '🎤 VC 압박 면접 피칭 시작' : `${check.reason}`)}
        </button>
      </div>
    `;
  }).join('') + `
    <div class="finance-item-card" style="border-color: var(--accent-amber);">
      <div>
        <span class="tag tag-amber">한국거래소 (KRX) 기술특례 상장</span>
        <h4 style="font-size: 0.96rem; margin-top: 6px;">🔔 코스닥(KOSDAQ) IPO 상장 공모</h4>
        <p class="deal-seller-story" style="margin-top: 6px;">요건: 연산력 5,000 TF 이상, 월 순이익 흑자, 신용 A(750점+). 상장 시 기업가치 1.5배 리레이팅!</p>
      </div>
      <div class="grant-reward" style="color: var(--accent-amber);">기업가치 ×1.5배</div>
      <button class="primary-btn" ${state.flags.listed ? 'disabled' : ''} onclick="attemptKosdaqIPO()">
        ${state.flags.listed ? '🏆 코스닥 상장 기업' : '🔔 상장 예비심사 청구 (IPO)'}
      </button>
    </div>
  `;
}

function handleStartPitch(programId) {
  if (window.Systems.pitching && typeof window.Systems.pitching.startPitchingSession === 'function') {
    const started = window.Systems.pitching.startPitchingSession(programId);
    if (started) {
      renderPitchingModal();
    }
  }
}

function renderMarketTab(coinVal) {
  if (typeof document === 'undefined') return;
  const priceEl = document.getElementById('current-coin-price');
  if (priceEl) priceEl.textContent = formatKRW(state.coinPrice);
  const ethEl = document.getElementById('market-wallet-eth');
  if (ethEl) ethEl.textContent = `${state.coinBalance.toFixed(4)} ETH`;
  const krwEl = document.getElementById('market-wallet-krw');
  if (krwEl) krwEl.textContent = formatKRW(coinVal);

  const endingsBox = document.getElementById('endings-collection-grid');
  if (endingsBox && window.GAME_DATA.endings) {
    let unlocked = [];
    try {
      unlocked = JSON.parse(localStorage.getItem('GPU_TYCOON_ENDINGS_COLLECTION') || '[]');
    } catch (e) {}

    const endSig = unlocked.join(',');
    if (endSig !== _lastEndingsSig || endingsBox.innerHTML === '') {
      _lastEndingsSig = endSig;
      endingsBox.innerHTML = window.GAME_DATA.endings.map(ed => {
        const isCleared = unlocked.includes(ed.id);
        return `
          <div style="background: var(--bg-panel); padding: 10px 12px; border-radius: 8px; border: 1px solid ${isCleared ? 'var(--accent-green)' : 'var(--border-color)'}; font-size:0.8rem;">
            <div style="display:flex; justify-content:space-between;">
              <b>[${ed.id}] ${isCleared ? ed.title : '??? (미발견 엔딩)'}</b>
              <span class="badge ${ed.type === 'true' ? 'tag-purple' : (ed.type === 'hidden' ? 'tag-amber' : 'tag-red')}">${ed.type.toUpperCase()}</span>
            </div>
            <div class="sub-desc" style="margin-top:4px;">조건 힌트: ${ed.conditionDesc || ''}</div>
          </div>
        `;
      }).join('');
    }
  }
}

function drawCryptoChart() {
  if (typeof document === 'undefined') return;
  const canvas = document.getElementById('crypto-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  const history = state.coinPriceHistory;
  if (!history || history.length < 2) return;

  const min = Math.min(...history) * 0.98;
  const max = Math.max(...history) * 1.02;

  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2.5;
  ctx.beginPath();

  for (let i = 0; i < history.length; i++) {
    const x = (i / (history.length - 1)) * (w - 20) + 10;
    const y = h - ((history[i] - min) / Math.max(1, max - min)) * (h - 30) - 15;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.lineTo(w - 10, h);
  ctx.lineTo(10, h);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
  grad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
  ctx.fillStyle = grad;
  ctx.fill();
}

window.renderUI = renderUI;
window.forceRebuildOffices = forceRebuildOffices;
window.renderOfficesList = renderOfficesList;
window.renderDanggeunDeals = renderDanggeunDeals;
window.renderNewGpus = renderNewGpus;
window.renderLeaseGpus = renderLeaseGpus;
window.renderWorkloadUI = renderWorkloadUI;
window.renderHrUI = renderHrUI;
window.handleHireClick = handleHireClick;
window.renderFinanceUI = renderFinanceUI;
window.handleStartPitch = handleStartPitch;
window.renderMarketTab = renderMarketTab;
window.drawCryptoChart = drawCryptoChart;
