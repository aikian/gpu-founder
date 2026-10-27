/**
 * game/js/ui/modals.js
 * 모든 모달창(신규 사업장 임대, GPU 개별 튜닝 & 인프라 테크트리, 딜레마 이벤트 팝업, 피칭 RPG 미니게임, 멀티 엔딩 & 도감) 관리
 */

function openOfficeModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('office-modal');
  const container = document.getElementById('available-offices-list');
  if (!modal || !container) return;

  const presets = window.GAME_DATA.offices || [];
  container.innerHTML = presets.map(preset => {
    const isAffordable = state.money >= preset.deposit;
    return `
      <div class="finance-item-card" style="margin-bottom: 12px;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h4 style="font-size: 1rem; font-weight: 800;">${preset.name}</h4>
            <span class="text-amber font-mono" style="font-size: 0.85rem;">월세 ${formatKRW(preset.monthlyRent)}</span>
          </div>
          <p class="deal-seller-story" style="margin-top: 6px;">${preset.desc}</p>
        </div>
        <div class="spec-pills" style="display:flex; gap:8px; flex-wrap:wrap;">
          <span class="badge tag-blue">기본 전력: ${(preset.maxPower / 1000).toFixed(0)}kW</span>
          <span class="badge tag-green">기본 냉각: ${preset.coolingRate}°C/s</span>
          <span class="badge tag-purple">최대 랙 슬롯: ${preset.slots}대</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <div>보증금: <b class="text-green font-mono">${formatKRW(preset.deposit)}</b></div>
          <button class="primary-btn" ${isAffordable ? '' : 'disabled'} onclick="leaseNewOffice('${preset.id}')">
            임대차 계약 체결
          </button>
        </div>
      </div>
    `;
  }).join('');

  modal.classList.add('show');
}

function openGpuTuningModal(officeUid, gpuUid) {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('tuning-modal');
  const body = document.getElementById('tuning-modal-body');
  if (!modal || !body) return;

  const office = state.offices.find(o => o.uid === officeUid);
  if (!office) return;
  const gpu = office.gpus.find(g => g.uid === gpuUid);
  if (!gpu) return;

  const spec = window.GAME_DATA.gpus[gpu.model] || {};
  const modsList = window.GAME_DATA.gpuMods || [];
  const hrEff = (window.Systems.hr && typeof window.Systems.hr.getHrEffects === 'function')
    ? window.Systems.hr.getHrEffects()
    : { hasTechnician: false };

  let effSpecs = { tflops: spec.tflops, power: spec.power, heat: spec.heat };
  if (window.Systems.hardware && typeof window.Systems.hardware.getGpuEffectiveSpecs === 'function') {
    effSpecs = window.Systems.hardware.getGpuEffectiveSpecs(gpu, office.temp);
  }

  body.innerHTML = `
    <div class="tuning-gpu-summary" style="background: var(--bg-panel); padding: 14px; border-radius: 10px; margin-bottom: 16px; border: 1px solid var(--border-color);">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h4 style="font-size:1.05rem;">${gpu.isBroken ? '💥 [고장/벽돌] ' : '🔧 '}${spec.name} <span class="sub-desc">#${gpu.uid}</span></h4>
          <span class="sub-desc">보증 잔여: ${gpu.warranty > 0 ? gpu.warranty + '개월 (개조 시 소멸)' : '무상 AS 만료/소멸'} ${hrEff.hasTechnician ? '| 🧑‍🔧 테크니션 보유 (성공률 +15%p)' : ''}</span>
        </div>
        <span class="badge ${gpu.health > 60 ? 'tag-green' : (gpu.health > 25 ? 'tag-amber' : 'tag-red')}">내구도 ${(gpu.health ?? 100).toFixed(0)}%</span>
      </div>
      <div style="display:flex; gap:16px; margin-top:10px; font-size:0.84rem;" class="font-mono">
        <span>실효 연산: <b class="text-cyan">${effSpecs.tflops.toFixed(1)} TF</b></span>
        <span>실효 전력: <b class="text-amber">${Math.round(effSpecs.power)}W</b></span>
        <span>적용 개조: <b>${(gpu.mods || []).length}건</b></span>
      </div>
    </div>
    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px;">
      ${modsList.map(mod => {
        const alreadyApplied = Array.isArray(gpu.mods) && gpu.mods.includes(mod.id);
        const baseChance = Math.min(0.99, (mod.successRate || mod.success || 0.75) + (hrEff.hasTechnician ? 0.15 : 0));
        const isReball = mod.id === 'reball';
        const disabled = (!isReball && gpu.isBroken) || (isReball && !gpu.isBroken) || alreadyApplied || state.money < mod.cost;
        return `
          <div class="finance-item-card" style="padding:12px; gap:8px;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <b style="font-size:0.88rem;">${mod.icon || '🛠️'} ${mod.name}</b>
                <span class="badge tag-blue font-mono">성공 ${(baseChance * 100).toFixed(0)}%</span>
              </div>
              <p class="sub-desc" style="margin-top:4px;">${mod.desc || ''}</p>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
              <span class="font-mono text-amber" style="font-size:0.82rem;">${mod.cost > 0 ? formatKRW(mod.cost) : '무료'}</span>
              <button class="small-btn" ${disabled ? 'disabled' : ''} onclick="handleApplyGpuMod(${office.uid}, ${gpu.uid}, '${mod.id}')">
                ${alreadyApplied ? '적용 완료' : (isReball ? '수리 시도' : '작업 실행')}
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  modal.classList.add('show');
}

function handleApplyGpuMod(officeUid, gpuUid, modId) {
  if (window.Systems.hardware && typeof window.Systems.hardware.applyGpuMod === 'function') {
    window.Systems.hardware.applyGpuMod(officeUid, gpuUid, modId);
    openGpuTuningModal(officeUid, gpuUid);
    if (typeof renderUI === 'function') renderUI();
  }
}

function openGpuMoveModal(officeUid, gpuUid) {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('gpu-move-modal');
  const body = document.getElementById('gpu-move-modal-body');
  if (!modal || !body) return;

  const currentOffice = state.offices.find(o => o.uid === officeUid);
  if (!currentOffice) return;
  const gpu = currentOffice.gpus.find(g => g.uid === gpuUid);
  if (!gpu) return;
  const spec = (window.GAME_DATA.gpus && window.GAME_DATA.gpus[gpu.model]) || { name: gpu.model };

  const otherOffices = state.offices.filter(o => o.uid !== officeUid);

  body.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:14px;">
      <div style="background:var(--bg-panel); padding:12px 14px; border-radius:8px; border:1px solid var(--border-color);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <b>${gpu.isBroken ? '💥 [고장] ' : '⚡ '}${spec.name}</b> <span class="sub-desc font-mono">#${gpu.uid}</span>
            <div class="sub-desc font-mono" style="margin-top:2px;">현재 사업장: <b class="text-cyan">${currentOffice.customName}</b></div>
          </div>
          <span class="badge ${gpu.health > 50 ? 'tag-green' : 'tag-red'}">내구도 ${(gpu.health || 100).toFixed(0)}%</span>
        </div>
      </div>

      <div style="font-size:0.85rem; font-weight:700; color:var(--text-secondary);">이전 배치할 대상 사업장을 선택하세요:</div>

      <div style="display:flex; flex-direction:column; gap:10px; max-height: 48vh; overflow-y: auto;">
        ${otherOffices.map(targetOffice => {
          const preset = (window.GAME_DATA.offices || []).find(p => p.id === targetOffice.presetId) || { slots: 6 };
          const maxSlots = preset.slots;
          const isFull = targetOffice.gpus.length >= maxSlots;
          const freeSlots = Math.max(0, maxSlots - targetOffice.gpus.length);

          return `
            <div class="finance-item-card" style="padding:12px; gap:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <b style="font-size:0.95rem;">${targetOffice.customName}</b>
                  <div class="sub-desc font-mono" style="margin-top:2px;">
                    슬롯: <b>${targetOffice.gpus.length}/${maxSlots}</b> (${freeSlots > 0 ? `여유 <span class="text-green">${freeSlots}칸</span>` : '<span class="text-red">만석</span>'}) · 온도 ${targetOffice.temp.toFixed(1)}°C
                  </div>
                </div>
                <button class="primary-btn" ${isFull ? 'disabled' : ''} onclick="executeGpuMove(${officeUid}, ${targetOffice.uid}, ${gpuUid})">
                  ${isFull ? '슬롯 가득참' : '이곳으로 즉시 이전'}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  modal.classList.add('show');
}

function executeGpuMove(fromOfficeUid, toOfficeUid, gpuUid) {
  if (window.Systems.office && typeof window.Systems.office.transferGpu === 'function') {
    window.Systems.office.transferGpu(fromOfficeUid, toOfficeUid, gpuUid);
  }
  const modal = document.getElementById('gpu-move-modal');
  if (modal) modal.classList.remove('show');
}

window.openGpuMoveModal = openGpuMoveModal;
window.executeGpuMove = executeGpuMove;

function openInfraTechModal(officeUid) {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('infra-modal');
  const body = document.getElementById('infra-modal-body');
  if (!modal || !body) return;

  const office = state.offices.find(o => o.uid === officeUid);
  if (!office) return;

  const coolingList = window.GAME_DATA.coolingTech || [];
  const powerList = window.GAME_DATA.powerTech || [];

  body.innerHTML = `
    <div style="margin-bottom: 16px;">
      <h4 style="margin-bottom: 8px;">❄️ 사업장 쿨링 테크트리 (${office.customName}) — 현재: <span class="text-cyan">${office.coolingTier || 'T1'}</span> (PUE ${office.pue || 1.4})</h4>
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px;">
        ${coolingList.map(c => {
          const isCurrent = office.coolingTier === c.id;
          const canAfford = state.money >= c.cost;
          const onlyChuncheon = (c.id === 'T_SOYANG' && office.presetId !== 'chuncheon_dc');
          return `
            <div class="finance-item-card" style="padding:12px; gap:6px; ${isCurrent ? 'border-color: var(--accent-cyan);' : ''}">
              <div style="display:flex; justify-content:space-between;">
                <b>[${c.id}] ${c.name}</b>
                <span class="badge tag-green">냉각 ${c.coolRate || '+30%'}</span>
              </div>
              <p class="sub-desc">${c.desc || ''} (전력: ${c.powerW}W)</p>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                <span class="font-mono text-amber">${formatKRW(c.cost)}</span>
                <button class="small-btn" ${(isCurrent || !canAfford || onlyChuncheon) ? 'disabled' : ''} onclick="handleUpgradeCoolingTier(${office.uid}, '${c.id}')">
                  ${isCurrent ? '설치됨' : (onlyChuncheon ? '춘천DC 전용' : '도입')}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <div>
      <h4 style="margin-bottom: 8px;">⚡ 전력 수전 & 보조 설비 — 현재: <span class="text-amber">${office.powerTier || 'P1'}</span></h4>
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px;">
        ${powerList.map(p => {
          const isInstalled = office.powerTier === p.id || (p.id === 'solar' && office.hasSolar) || (p.id === 'diesel' && office.hasDieselGen);
          const canAfford = state.money >= p.cost;
          return `
            <div class="finance-item-card" style="padding:12px; gap:6px; ${isInstalled ? 'border-color: var(--accent-amber);' : ''}">
              <div style="display:flex; justify-content:space-between;">
                <b>[${p.id.toUpperCase()}] ${p.name}</b>
                <span class="badge tag-amber">${p.capacityW ? (p.capacityW / 1000) + 'kW' : '보조설비'}</span>
              </div>
              <p class="sub-desc">${p.desc || ''}</p>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                <span class="font-mono text-amber">${formatKRW(p.cost)}</span>
                <button class="small-btn" ${(isInstalled || !canAfford) ? 'disabled' : ''} onclick="handleUpgradePowerTier(${office.uid}, '${p.id}')">
                  ${isInstalled ? '보유중' : '시공'}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  modal.classList.add('show');
}

function handleUpgradeCoolingTier(officeUid, tierId) {
  if (window.Systems.hardware && typeof window.Systems.hardware.upgradeOfficeCoolingTier === 'function') {
    window.Systems.hardware.upgradeOfficeCoolingTier(officeUid, tierId);
    openInfraTechModal(officeUid);
    if (typeof renderUI === 'function') renderUI();
  }
}

function handleUpgradePowerTier(officeUid, powerId) {
  if (window.Systems.hardware && typeof window.Systems.hardware.upgradeOfficePowerTier === 'function') {
    window.Systems.hardware.upgradeOfficePowerTier(officeUid, powerId);
    openInfraTechModal(officeUid);
    if (typeof renderUI === 'function') renderUI();
  }
}

function showEventModal(ev) {
  if (typeof document === 'undefined' || !ev) return;
  const modal = document.getElementById('event-modal');
  const body = document.getElementById('event-modal-body');
  if (!modal || !body) return;

  if (state.speed > 0) {
    state._prevSpeedBeforeModal = state.speed;
    state.speed = 0;
  }

  body.innerHTML = `
    <div style="margin-bottom: 16px;">
      <span class="badge tag-red" style="margin-bottom:8px; display:inline-block;">🚨 스타트업 돌발 딜레마 #${ev.num || ev.id}</span>
      <h3 style="font-size: 1.25rem; margin-bottom: 10px;">${ev.title}</h3>
      <p style="background: var(--bg-panel); padding: 14px; border-radius: 10px; line-height: 1.55; border-left: 4px solid var(--accent-amber);">
        ${ev.text}
      </p>
    </div>
    <div style="display:flex; flex-direction:column; gap: 10px;">
      ${(ev.choices || []).map((ch, idx) => `
        <button class="event-choice-btn" onclick="handleSelectEventChoice('${ev.id}', ${idx})">
          <div style="font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">${ch.label}</div>
          <div class="sub-desc" style="color: var(--accent-cyan);">${ch.desc || ''} ${ch.cost ? `(필요 자금: ${formatKRW(ch.cost)})` : ''}</div>
        </button>
      `).join('')}
    </div>
  `;

  modal.classList.add('show');
}

function handleSelectEventChoice(eventId, choiceIdx) {
  if (window.Systems.events && typeof window.Systems.events.resolveEventChoice === 'function') {
    window.Systems.events.resolveEventChoice(eventId, choiceIdx);
  }
  const modal = typeof document !== 'undefined' ? document.getElementById('event-modal') : null;
  if (modal) modal.classList.remove('show');
  if (!state.gameEnded) {
    state.speed = state._prevSpeedBeforeModal || 1;
  }
  if (typeof renderUI === 'function') renderUI();
  if (typeof renderHrUI === 'function') renderHrUI();
  if (typeof renderFinanceUI === 'function') renderFinanceUI();
}

function renderPitchingModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('pitch-modal');
  const body = document.getElementById('pitch-modal-body');
  if (!modal || !body) return;

  const session = state.activePitchSession;
  if (!session) {
    modal.classList.remove('show');
    return;
  }

  const programs = window.GAME_DATA.pitchPrograms || [];
  const program = (Array.isArray(programs) ? programs.find(p => p.id === session.programId) : programs[session.programId]) || session;
  const judgesMap = window.GAME_DATA.pitchJudges || {};

  if (session.finished || session.completed) {
    const res = session.result || {};
    const finalScore = typeof res.finalScore === 'number' ? res.finalScore : (session.finalScore || 0);
    const passScore = program.passScore || 70;
    const passed = typeof res.passed === 'boolean' ? res.passed : (finalScore >= passScore);
    const payout = res.payout || session.rewardAmount || program.baseAmount || 0;

    body.innerHTML = `
      <div style="text-align:center; padding: 16px;">
        <div style="font-size: 3rem; margin-bottom: 8px;">${passed ? '🎉' : '😢'}</div>
        <h3 style="font-size: 1.35rem; margin-bottom: 6px;">${program.name} — ${passed ? '최종 선정 / 투자 확정!' : '심사 탈락'}</h3>
        <p class="font-mono" style="font-size: 1.1rem; margin-bottom: 12px;">
          최종 환산 점수: <b class="${passed ? 'text-green' : 'text-red'}">${finalScore}점</b> / 합격선 ${passScore}점 (${session.conditionLabel || ''})
        </p>
        <p style="background: var(--bg-panel); padding: 14px; border-radius: 10px; margin-bottom: 16px;">
          ${passed
            ? `축하합니다! 심사위원단을 설득하여 <b>${formatKRW(payout)}</b>이 입금되었습니다! ${res.equityDilution ? `(대표 지분 ${res.equityDilution}% 희석)` : ''}`
            : '심사위원들의 압박 질문을 넘지 못했습니다. 지표(연산력·매출·행정직원)를 보강해 재도전하세요.'}
        </p>
        <button class="primary-btn" onclick="closePitchingModal()">결과 확인 및 복귀</button>
      </div>
    `;
    modal.classList.add('show');
    return;
  }

  const currentQ = session.questions[session.currentIndex];
  const judgeKey = currentQ.assignedJudgeId || currentQ.judgeId || 'kim';
  const judge = judgesMap[judgeKey] || { name: '심사위원', avatar: '👔', title: '평가위원', personality: '' };
  const lastStep = (session.history && session.history.length > 0) ? session.history[session.history.length - 1] : null;

  const passScore = program.passScore || 70;
  const curScore = Math.max(0, Math.round(session.rawScore || session.score || 0));
  const scorePct = Math.min(100, Math.max(0, (curScore / 100) * 100));
  const passPct = Math.min(100, (passScore / 100) * 100);

  const lieCount = state.lieMeter || 0;
  let lieStatus = '<span class="badge tag-green">🟢 청렴안전 (감사 0%)</span>';
  if (lieCount >= 3) {
    lieStatus = `<span class="badge tag-red">🔴 감사 적발 고위험! (${lieCount}회 누적)</span>`;
  } else if (lieCount > 0) {
    lieStatus = `<span class="badge tag-amber">🟡 감사 주의 (${lieCount}회 누적)</span>`;
  }

  body.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; flex-wrap:wrap; gap:6px;">
      <span class="badge tag-purple" style="font-size:0.82rem;">🎤 ${program.name} (${session.currentIndex + 1} / ${session.questions.length}문항)</span>
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="font-mono" style="font-size:0.82rem;">거짓말: ${lieStatus}</span>
      </div>
    </div>

    <!-- Live Pitch Score Gauge -->
    <div class="pitch-score-gauge-box" style="background:var(--bg-panel); padding:10px 14px; border-radius:8px; margin-bottom:12px; border:1px solid var(--border-color);">
      <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;" class="font-mono">
        <span>현재 평가 점수: <b class="text-cyan">${curScore}점</b></span>
        <span>합격 기준선: <b class="text-green">${passScore}점</b></span>
      </div>
      <div style="position:relative; width:100%; height:12px; background:rgba(255,255,255,0.08); border-radius:6px; overflow:hidden;">
        <div style="position:absolute; left:0; top:0; height:100%; width:${scorePct}%; background:${curScore >= passScore ? 'var(--accent-green)' : 'var(--accent-cyan)'}; transition: width 0.3s ease;"></div>
        <div style="position:absolute; left:${passPct}%; top:0; bottom:0; width:2px; background:#fff; box-shadow:0 0 4px #fff;" title="합격선"></div>
      </div>
    </div>

    ${lastStep && lastStep.notes && lastStep.notes.length > 0 ? `
      <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid var(--accent-red); padding: 8px 12px; border-radius: 8px; margin-bottom: 10px; font-size: 0.82rem;">
        ${lastStep.notes.join('<br>')}
      </div>
    ` : ''}

    <div style="background: var(--bg-panel); padding: 16px; border-radius: 10px; margin-bottom: 14px; border: 1px solid var(--border-color);">
      <div style="display:flex; align-items:center; gap: 10px; margin-bottom: 8px;">
        <span style="font-size: 2.2rem;">${judge.avatar || judge.icon || '🎓'}</span>
        <div>
          <div style="display:flex; align-items:center; gap:6px;">
            <b>${judge.name}</b>
            <span class="badge tag-blue font-mono">${judge.title || '평가위원'}</span>
          </div>
          <div class="sub-desc" style="margin-top:2px;">${judge.personality || judge.desc || ''}</div>
        </div>
      </div>
      <p style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-top: 8px; line-height: 1.4;">"${currentQ.question}"</p>
      <div class="sub-desc" style="margin-top: 6px;">📌 관련 회사 지표: <b class="text-cyan">${currentQ.metricLabel || '회사 역량'}</b></div>
    </div>

    <div style="display:flex; flex-direction:column; gap: 10px;">
      <button class="event-choice-btn" onclick="handlePitchAnswer('tech')">
        <div style="font-weight:800; color: var(--accent-cyan);">🔬 [기술적·지표 기반 답변] (지표 충족 시 +5, 미달 시 -10)</div>
        <div style="margin-top:4px;">"${currentQ.answers.tech.text}"</div>
      </button>
      <button class="event-choice-btn" onclick="handlePitchAnswer('bluff')">
        <div style="font-weight:800; color: var(--accent-amber);">🎭 [블러핑·과장 답변] ${currentQ.answers.bluff.isIllegal ? '⚠️(보조금법 위반 위험!)' : '(거짓말 게이지 +1)'}</div>
        <div style="margin-top:4px;">"${currentQ.answers.bluff.text}"</div>
      </button>
      <button class="event-choice-btn" onclick="handlePitchAnswer('honest')">
        <div style="font-weight:800; color: var(--accent-green);">🙇 [솔직한 답변] (안정적 점수, 이 사무관 선호)</div>
        <div style="margin-top:4px;">"${currentQ.answers.honest.text}"</div>
      </button>
    </div>
  `;

  modal.classList.add('show');
}

function handlePitchAnswer(answerType) {
  if (window.Systems.pitching && typeof window.Systems.pitching.submitPitchAnswer === 'function') {
    window.Systems.pitching.submitPitchAnswer(answerType);
    renderPitchingModal();
    if (typeof renderUI === 'function') renderUI();
    if (typeof renderFinanceUI === 'function') renderFinanceUI();
  }
}

function closePitchingModal() {
  state.activePitchSession = null;
  const modal = typeof document !== 'undefined' ? document.getElementById('pitch-modal') : null;
  if (modal) modal.classList.remove('show');
  if (typeof renderUI === 'function') renderUI();
  if (typeof renderFinanceUI === 'function') renderFinanceUI();
}

function showEndingModal(endingObj) {
  if (typeof document === 'undefined' || !endingObj) return;
  const modal = document.getElementById('ending-modal');
  const body = document.getElementById('ending-modal-body');
  if (!modal || !body) return;

  const badgeClass = endingObj.type === 'true' ? 'tag-purple' : (endingObj.type === 'hidden' ? 'tag-amber' : (endingObj.type === 'bad' ? 'tag-red' : 'tag-blue'));
  body.innerHTML = `
    <div style="text-align:center; padding: 14px;">
      <span class="badge ${badgeClass}" style="font-size:0.85rem; padding:4px 12px;">${endingObj.badge || endingObj.type.toUpperCase()} ENDING</span>
      <h2 style="font-size: 1.55rem; margin: 12px 0 6px;">[${endingObj.id}] ${endingObj.title}</h2>
      <p class="sub-desc" style="font-size: 0.95rem; margin-bottom: 16px;">${endingObj.subtitle || ''}</p>
      <div style="background: var(--bg-panel); padding: 18px; border-radius: 12px; text-align:left; line-height: 1.7; margin-bottom: 18px; border: 1px solid var(--border-color); white-space: pre-line;">
        ${endingObj.storyText}
      </div>
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; margin-bottom: 18px; font-size:0.85rem;" class="font-mono">
        <div style="background:var(--bg-panel); padding:10px; border-radius:8px;">최종 기업가치<br><b class="text-green">${formatKRW(state.valuation)}</b></div>
        <div style="background:var(--bg-panel); padding:10px; border-radius:8px;">총 연산력<br><b class="text-cyan">${state.totalTflops.toLocaleString()} TF</b></div>
        <div style="background:var(--bg-panel); padding:10px; border-radius:8px;">생존 개월<br><b>${state.month}개월 (${state.year}.${state.calendarMonth})</b></div>
      </div>
      <div style="display:flex; justify-content:center; gap: 12px;">
        <button class="primary-btn" onclick="resetGame()">🔄 새 스타트업 재창업하기</button>
        <button class="small-btn" onclick="document.getElementById('ending-modal').classList.remove('show')">화면 둘러보기</button>
      </div>
    </div>
  `;

  modal.classList.add('show');
}

window.openOfficeModal = openOfficeModal;
window.openGpuTuningModal = openGpuTuningModal;
window.handleApplyGpuMod = handleApplyGpuMod;
window.openInfraTechModal = openInfraTechModal;
window.handleUpgradeCoolingTier = handleUpgradeCoolingTier;
window.handleUpgradePowerTier = handleUpgradePowerTier;
window.showEventModal = showEventModal;
window.openEventModal = showEventModal;
window.handleSelectEventChoice = handleSelectEventChoice;
window.renderPitchingModal = renderPitchingModal;
window.openPitchingModal = renderPitchingModal;
window.updatePitchingModal = renderPitchingModal;
window.handlePitchAnswer = handlePitchAnswer;
window.closePitchingModal = closePitchingModal;
window.showEndingModal = showEndingModal;
window.openEndingModal = showEndingModal;


function openPnlModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('pnl-modal');
  const body = document.getElementById('pnl-modal-body');
  if (!modal || !body) return;

  const specs = (typeof calculateSpecsGlobalSafe === 'function') ? calculateSpecsGlobalSafe() : {};
  const report = state.lastMonthReport || {
    month: state.month,
    year: state.year,
    calendarMonth: state.calendarMonth,
    revenue: {
      cloud: Math.round((specs.cloudIncomePerSec || 0) * 60),
      saas: Math.round((specs.saasIncomePerSec || 0) * 60),
      corp: Math.round((specs.corpIncomePerSec || 0) * 60),
      cryptoEth: Number(((specs.ethPerSec || 0) * 60).toFixed(5))
    },
    costs: {
      rent: specs.totalRentMonthly || 0,
      electric: specs.monthlyElectricBill || 0,
      payroll: specs.monthlyPayroll || 0,
      interest: specs.monthlyLoanInterest || 0,
      lease: specs.monthlyLeaseCost || 0
    },
    grossRevenue: Math.round((specs.grossCashPerSec || 0) * 60),
    totalCost: specs.totalMonthlyFixedCost || 0,
    netProfit: specs.monthlyProfit || 0,
    cashEnd: Math.round(state.money)
  };

  const ethKrw = Math.round((report.revenue.cryptoEth || 0) * (state.coinPrice || 4200000));
  const isNetProfit = report.netProfit >= 0;
  const burnRate = Math.abs((specs.netCashPerSec || 0) * 60);
  const runwayMonths = !isNetProfit && burnRate > 0 ? (state.money > 0 ? (state.money / burnRate).toFixed(1) : '0') : '흑자 유지중';

  const history = state.monthReports || [];
  const recentHistory = history.slice(-6).reverse();

  body.innerHTML = `
    <div class="pnl-container">
      <!-- P&L Header Summary -->
      <div class="pnl-header-card">
        <div class="pnl-stat-cell">
          <span class="pnl-stat-label">정산 기준 시점</span>
          <span class="pnl-stat-val font-mono">${report.year}년 ${report.calendarMonth}월 (${report.month}/84개월)</span>
        </div>
        <div class="pnl-stat-cell">
          <span class="pnl-stat-label">월간 순손익</span>
          <span class="pnl-stat-val font-mono ${isNetProfit ? 'text-green' : 'text-red'}">
            ${isNetProfit ? '+' : ''}${formatKRW(report.netProfit)}
          </span>
        </div>
        <div class="pnl-stat-cell">
          <span class="pnl-stat-label">보유 현금 잔액</span>
          <span class="pnl-stat-val font-mono">${formatKRW(state.money)}</span>
        </div>
        <div class="pnl-stat-cell">
          <span class="pnl-stat-label">생존 런웨이 (Runway)</span>
          <span class="pnl-stat-val font-mono ${isNetProfit ? 'text-cyan' : (Number(runwayMonths) < 3 ? 'text-red' : 'text-amber')}">
            ${isNetProfit ? '🚀 무한 (흑자)' : `${runwayMonths}개월`}
          </span>
        </div>
      </div>

      <!-- Financial Statement Grid (Revenue vs Expenses) -->
      <div class="pnl-grid-two-col">
        <!-- Revenue Column -->
        <div class="pnl-col">
          <div class="pnl-section-title">
            <span>📈 영업 수익 (Revenue)</span>
            <span class="pnl-col-sub font-mono text-green">+${formatKRW(report.grossRevenue)}/월</span>
          </div>
          <table class="pnl-table">
            <tbody>
              <tr>
                <td>☁️ AI 클라우드 스팟 렌탈 (Vast.ai)</td>
                <td class="font-mono text-green text-right">+${formatKRW(report.revenue.cloud)}</td>
              </tr>
              <tr>
                <td>📱 B2C AI SaaS 정기구독료</td>
                <td class="font-mono text-green text-right">+${formatKRW(report.revenue.saas)}</td>
              </tr>
              <tr>
                <td>🏢 빅테크 LLM 전용 클러스터</td>
                <td class="font-mono text-green text-right">+${formatKRW(report.revenue.corp)}</td>
              </tr>
              <tr>
                <td>⛏️ ETH 채굴 (당월 환산치)</td>
                <td class="font-mono text-cyan text-right">≈ +${formatKRW(ethKrw)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="pnl-subtotal-row">
                <th>월간 총 매출 합계</th>
                <th class="font-mono text-green text-right">+${formatKRW(report.grossRevenue)}</th>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Expenses Column -->
        <div class="pnl-col">
          <div class="pnl-section-title">
            <span>🧾 영업 및 고정비용 (Expenses)</span>
            <span class="pnl-col-sub font-mono text-red">-${formatKRW(report.totalCost)}/월</span>
          </div>
          <table class="pnl-table">
            <tbody>
              <tr>
                <td>⚡ 한전 전기요금 (산업용/누진제)</td>
                <td class="font-mono text-red text-right">-${formatKRW(report.costs.electric)}</td>
              </tr>
              <tr>
                <td>🏢 사업장 월세 및 관리비</td>
                <td class="font-mono text-red text-right">-${formatKRW(report.costs.rent)}</td>
              </tr>
              <tr>
                <td>👥 임직원 인건비 (${state.employees.length}명)</td>
                <td class="font-mono text-red text-right">-${formatKRW(report.costs.payroll)}</td>
              </tr>
              <tr>
                <td>🏦 대출/정책자금 융자 이자</td>
                <td class="font-mono text-red text-right">-${formatKRW(report.costs.interest)}</td>
              </tr>
              <tr>
                <td>🤝 엔터프라이즈 랙 리스료</td>
                <td class="font-mono text-red text-right">-${formatKRW(report.costs.lease)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="pnl-subtotal-row">
                <th>월간 총 고정지출 합계</th>
                <th class="font-mono text-red text-right">-${formatKRW(report.totalCost)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Recent 6-Month Trend Table -->
      <div class="pnl-history-box">
        <h4 style="font-size: 0.88rem; margin-bottom: 8px;">📊 최근 월별 재무 실적 추이</h4>
        ${recentHistory.length === 0 ? `
          <div style="font-size: 0.78rem; color: var(--text-secondary); text-align: center; padding: 12px;">첫 월말 정산(60초 경과) 후부터 실적이 영구 누적됩니다.</div>
        ` : `
          <table class="pnl-history-table">
            <thead>
              <tr>
                <th>정산월</th>
                <th>매출</th>
                <th>지출</th>
                <th>당기순손익</th>
                <th>기말 현금</th>
              </tr>
            </thead>
            <tbody>
              ${recentHistory.map(r => `
                <tr>
                  <td class="font-mono">${r.year}년 ${r.calendarMonth}월</td>
                  <td class="font-mono text-green">+${formatKRW(r.grossRevenue)}</td>
                  <td class="font-mono text-red">-${formatKRW(r.totalCost)}</td>
                  <td class="font-mono ${r.netProfit >= 0 ? 'text-green' : 'text-red'}">
                    ${r.netProfit >= 0 ? '+' : ''}${formatKRW(r.netProfit)}
                  </td>
                  <td class="font-mono">${formatKRW(r.cashEnd)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;

  modal.classList.add('show');
}

function openGuideModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('guide-modal');
  const body = document.getElementById('guide-modal-body');
  if (!modal || !body) return;

  body.innerHTML = `
    <div class="guide-modal-content">
      <div class="guide-intro-banner">
        <h4>⚡ 대표님, 대한민국 1호 AI 하이퍼스케일러 창업을 축하합니다!</h4>
        <p class="sub-desc" style="margin-top:4px;">신림동 고시원 옥탑방에서 시작해 코스닥 상장과 소버린 AI 하이퍼스케일 DC까지 생존하는 필수 5단계 로드맵입니다.</p>
      </div>

      <div class="guide-steps-grid">
        <div class="guide-step-card">
          <div class="guide-step-header">
            <span class="guide-step-badge">STEP 1</span>
            <b>🥕 당근마켓 꿀매물 줍기 & 네고</b>
          </div>
          <p class="sub-desc">신품 GPU는 너무 비쌉니다. [GPU 조달 > 당근 중고]에서 매너온도 높은 동네 이웃의 가성비 중고 그래픽카드(GTX 1080 Ti, RTX 3080 등)를 확보하세요. <b>[💬 네고]</b>를 누르면 가격을 깎을 수 있습니다!</p>
        </div>

        <div class="guide-step-card">
          <div class="guide-step-header">
            <span class="guide-step-badge">STEP 2</span>
            <b>💼 연산력 수익 포트폴리오 배분</b>
          </div>
          <p class="sub-desc">초기 자본금이 부족할 땐 <b>AI 클라우드 스팟 렌탈(70%)</b>과 <b>이더리움 채굴(30%)</b>을 섞어 매초 안정적인 현금 흐름을 만드세요. 6월/12월 대학원 기말 시즌엔 렌탈 수익이 1.4배 뜁니다.</p>
        </div>

        <div class="guide-step-card">
          <div class="guide-step-header">
            <span class="guide-step-badge">STEP 3</span>
            <b>🏛️ 중기부 정부지원사업 발표평가</b>
          </div>
          <p class="sub-desc">[지원사업] 탭에서 <b>예비창업패키지(1억 원)</b> 발표평가에 도전하세요! 김 교수·박 심사역·이 사무관의 압박 질의에 최적의 답변을 골라 합격하면 100% 무상 국고보조금을 받습니다.</p>
        </div>

        <div class="guide-step-card">
          <div class="guide-step-header">
            <span class="guide-step-badge">STEP 4</span>
            <b>🌡️ 서버실 쿨링 업그레이드 & 누진세 방어</b>
          </div>
          <p class="sub-desc">서버실 온도가 83°C를 넘으면 <b>-40% 쓰로틀링</b>이 걸리고, 95°C에선 <b>긴급 셧다운</b>됩니다. [🏗️ 쿨링 테크트리]에서 선풍기·벽걸이 에어컨을 증설하고 지식산업센터로 이사하세요.</p>
        </div>

        <div class="guide-step-card">
          <div class="guide-step-header">
            <span class="guide-step-badge">STEP 5</span>
            <b>👥 팀 빌딩 & VC 시드/시리즈 투자</b>
          </div>
          <p class="sub-desc">AI 모델 연구원, 하드웨어 테크니션, 정부과제 행정 직원을 영입하세요. 직원의 사기와 번아웃을 복지 정책으로 관리하지 않으면 집단 퇴사(배드엔딩)를 겪게 됩니다!</p>
        </div>
      </div>

      <div class="guide-footer-row">
        <span class="sub-desc font-mono">💡 단축키: [Space] 일시정지 · [1][2][3] 배속 · [P] 손익계산서 · [Esc] 모달 닫기</span>
        <button class="primary-btn" onclick="document.getElementById('guide-modal').classList.remove('show');">이해했습니다, 경영 시작!</button>
      </div>
    </div>
  `;

  modal.classList.add('show');
}

window.openPnlModal = openPnlModal;
window.openGuideModal = openGuideModal;

function openQaModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('qa-modal');
  const body = document.getElementById('qa-modal-body');
  if (!modal || !body) return;

  const eventsList = window.GAME_DATA.events || [];
  const endingsList = window.GAME_DATA.endings || [];

  body.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div style="background: var(--bg-panel); padding: 14px; border-radius: 10px; border: 1px solid var(--border-color);">
        <h4 style="margin-bottom: 10px;">⚡ 빠른 자금 · 시간 · 상태 조작</h4>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="small-btn text-green" onclick="state.money += 100000000; spawnFloatingJuice('+1억 원', '#10b981'); renderUI();">+1억 원 지급</button>
          <button class="small-btn text-green" onclick="state.money += 5000000000; spawnFloatingJuice('+50억 원', '#10b981'); renderUI();">+50억 원 지급</button>
          <button class="small-btn text-cyan" onclick="state.coinBalance += 50; renderUI();">+50 ETH 지급</button>
          <button class="small-btn text-amber" onclick="advanceOneMonth(); renderUI();">⏩ +1개월 즉시 정산</button>
          <button class="small-btn" onclick="state.creditScore = 950; state.reputation = 95; state.ceoStress = 0; renderUI();">✨ 신용·평판 MAX / 스트레스 0</button>
          <button class="small-btn" onclick="state.offices[0].gpus.push(createGpuInstance('h100', false, false)); renderUI();">🚀 H100 1대 즉시 장착</button>
        </div>
      </div>

      <div style="background: var(--bg-panel); padding: 14px; border-radius: 10px; border: 1px solid var(--border-color);">
        <h4 style="margin-bottom: 10px;">🎲 랜덤 딜레마 이벤트 28선 즉시 발동 테스트</h4>
        <div style="display:flex; gap:8px; align-items:center;">
          <select id="qa-event-select" class="channel-select" style="flex:1;">
            ${eventsList.map(ev => `<option value="${ev.id}">[#${ev.num || ev.id}] ${ev.title}</option>`).join('')}
          </select>
          <button class="primary-btn" onclick="const id = document.getElementById('qa-event-select').value; document.getElementById('qa-modal').classList.remove('show'); window.Systems.events.triggerEventById(id);">이벤트 팝업 띄우기</button>
        </div>
      </div>

      <div style="background: var(--bg-panel); padding: 14px; border-radius: 10px; border: 1px solid var(--border-color);">
        <h4 style="margin-bottom: 10px;">🏁 멀티 엔딩 8종 즉시 미리보기</h4>
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:8px;">
          ${endingsList.map(ed => `
            <button class="small-btn" onclick="document.getElementById('qa-modal').classList.remove('show'); window.Systems.endings.triggerEndingById('${ed.id}');">
              [${ed.id}] ${ed.title}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  modal.classList.add('show');
}

window.openQaModal = openQaModal;
