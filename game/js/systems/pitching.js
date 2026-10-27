/**
 * game/js/systems/pitching.js
 * 정부지원사업 · VC 피칭 압박 면접 미니게임 & 사후 감사(Audit) · 금융 시스템
 * 기준 문서: docs/design/03_pitching_minigame.md, AGENTS.md, docs/CONVENTIONS.md
 */
window.Systems = window.Systems || {};

(function () {
  /**
   * 프로그램 정의 조회 헬퍼
   */
  function getPitchProgram(programId) {
    const programs = (window.GAME_DATA && window.GAME_DATA.pitchPrograms) || [];
    if (Array.isArray(programs)) {
      return programs.find(p => p.id === programId) || programs[programId] || null;
    }
    return programs[programId] || null;
  }

  /**
   * 총 보유 GPU 대수 계산 (모든 사업장 합산 + 리스 포함 여부)
   */
  function getTotalGpuCount(st) {
    const s = st || window.state;
    if (!s || !Array.isArray(s.offices)) return 0;
    let count = 0;
    s.offices.forEach(off => {
      if (Array.isArray(off.gpus)) {
        count += off.gpus.filter(g => !g.isBroken).length;
      }
    });
    if (Array.isArray(s.leases)) {
      s.leases.forEach(l => {
        count += (l.count || 4);
      });
    }
    return count;
  }

  /**
   * 냉각 업그레이드 여부 확인 (T2 이상 또는 원룸 이외 상위 사업장 보유)
   */
  function checkHasUpgradedCooling(st) {
    const s = st || window.state;
    if (!s || !Array.isArray(s.offices)) return false;
    return s.offices.some(off => {
      const tierNum = parseInt(String(off.coolingTier || 'T1').replace(/\D/g, ''), 10) || 1;
      return tierNum >= 2 || (off.extraCooling && off.extraCooling > 0) || off.presetId !== 'room_sinrim';
    });
  }

  /**
   * 워크로드 배분율 합계(%) 계산
   */
  function getTotalAllocPct(st) {
    const s = st || window.state;
    if (!s || !s.workloadAlloc) return 0;
    const w = s.workloadAlloc;
    return (Number(w.crypto) || 0) + (Number(w.cloud) || 0) + (Number(w.saas) || 0) + (Number(w.corp) || 0);
  }

  /**
   * 질문별 지표(metricCheck) 충족 여부 판정
   */
  function evaluatePitchMetric(metricExpr, st) {
    const state = st || window.state;
    if (!state || !metricExpr) return false;
    const totalGpuCount = getTotalGpuCount(state);
    const hasUpgradedCooling = checkHasUpgradedCooling(state);
    const totalAllocPct = getTotalAllocPct(state);

    try {
      const fn = new Function(
        'state',
        'totalGpuCount',
        'hasUpgradedCooling',
        'totalAllocPct',
        `return Boolean(${metricExpr});`
      );
      return fn(state, totalGpuCount, hasUpgradedCooling, totalAllocPct);
    } catch (e) {
      return false;
    }
  }

  /**
   * 서류 평가(지원 자격), 쿨다운, 참여제한 등 상세 상태 반환
   */
  function getPitchProgramStatus(programId) {
    const state = window.state;
    const program = getPitchProgram(programId);
    if (!state || !program) {
      return { canApply: false, status: 'unavailable', reason: '존재하지 않는 프로그램입니다.' };
    }

    state.grantsState = state.grantsState || {};
    state.vcState = state.vcState || {};
    state.pitchCooldowns = state.pitchCooldowns || {};
    state.flags = state.flags || {};

    // 행정직원 보유 플래그 동기화
    if (Array.isArray(state.employees)) {
      const hasGA = state.employees.some(e => e.jobId === 'ga_staff' || e.jobId === 'admin' || e.role === 'admin');
      if (hasGA) state.flags.hasAdminStaff = true;
    }

    // 1. 이미 합격/승인된 프로그램인지 확인
    if (program.type === 'grant' && state.grantsState[program.id] === 'approved') {
      return { canApply: false, status: 'approved', reason: '이미 선정 완료된 정부지원사업입니다.' };
    }
    if (program.type === 'vc' && state.vcState[program.id] === 'approved') {
      return { canApply: false, status: 'approved', reason: '이미 투자 유치를 완료한 라운드입니다.' };
    }

    // 2. 정부지원사업 참여제한 여부 확인
    if (program.type === 'grant' && state.flags.govBanned) {
      return { canApply: false, status: 'banned', reason: '정부지원사업 참여제한 제재 중입니다.' };
    }

    // 3. 재지원 쿨다운 확인
    const cooldownUntil = state.pitchCooldowns[program.id] || 0;
    if (state.month < cooldownUntil) {
      const remain = cooldownUntil - state.month;
      return { canApply: false, status: 'cooldown', reason: `재지원 대기 기간 (${remain}개월 남음)` };
    }

    // 4. 서류 평가 컷(requireExpr) 판정
    const totalGpuCount = getTotalGpuCount(state);
    let docPassed = false;
    switch (program.id) {
      case 'yechangpae':
        docPassed = !state.flags.bizRegistered;
        break;
      case 'chocangpae':
        docPassed = state.month <= 36 && totalGpuCount >= 5;
        break;
      case 'aivoucher':
        docPassed = state.totalTflops >= 200;
        break;
      case 'tips':
        docPassed = Boolean(state.vcState && state.vcState.seed_round === 'approved');
        break;
      case 'seed_round':
        docPassed = state.totalTflops >= 80;
        break;
      case 'series_a':
        docPassed = state.totalTflops >= 600 && state.monthlyProfit > 0;
        break;
      default:
        docPassed = evaluatePitchMetric(program.requireExpr, state);
        break;
    }

    if (!docPassed) {
      return {
        canApply: false,
        status: 'locked',
        reason: `서류 요건 미달 (${program.requireDesc})`
      };
    }

    return { canApply: true, status: 'available', reason: '서류 통과 가능 (발표평가 진출)' };
  }

  /**
   * 피칭 프로그램 지원 가능 여부 (Boolean 반환)
   */
  function canApplyPitchProgram(programId) {
    return getPitchProgramStatus(programId).canApply;
  }

  /**
   * 프로그램 심사위원 구성에 맞춰 중복 없이 문항(3문항 또는 5문항) 추출
   */
  function selectSessionQuestions(program) {
    const allQuestions = (window.GAME_DATA && window.GAME_DATA.pitchQuestions) || [];
    const judges = program.judges || ['kim', 'park', 'lee'];
    const count = program.questionCount || 5;
    const usedIds = new Set();
    const selected = [];

    // 심사위원 3명이 번갈아 질문하도록 라운드로빈 배정
    for (let i = 0; i < count; i++) {
      const turnJudgeId = judges[i % judges.length];

      // 1순위: 해당 심사위원 전용 질문
      let pool = allQuestions.filter(q => !usedIds.has(q.id) && q.judgeId === turnJudgeId);

      // 2순위: 최 대표(choi)이거나 전용 질문 소진 시 공통 질문(#10) 포함
      if (pool.length === 0) {
        pool = allQuestions.filter(q => !usedIds.has(q.id) && q.judgeId === 'common');
      }

      // 3순위: 세션 내 다른 심사위원 질문 중 미출제 문항 (정부사업에서만 lee 질문 등장 보장)
      if (pool.length === 0) {
        pool = allQuestions.filter(q => {
          if (usedIds.has(q.id)) return false;
          if (program.type === 'vc' && q.judgeId === 'lee') return false;
          return true;
        });
      }

      if (pool.length > 0) {
        const picked = pool[Math.floor(Math.random() * pool.length)];
        usedIds.add(picked.id);
        const assignedJudgeId = (picked.judgeId === 'common' || !window.GAME_DATA.pitchJudges[picked.judgeId])
          ? turnJudgeId
          : picked.judgeId;
        selected.push(Object.assign({}, picked, { assignedJudgeId }));
      }
    }

    return selected;
  }

  /**
   * 피칭 압박 면접 세션 시작
   */
  function startPitchingSession(programId) {
    const state = window.state;
    const check = getPitchProgramStatus(programId);
    if (!check.canApply) {
      if (typeof window.showToast === 'function') {
        window.showToast(`⚠️ 지원 불가: ${check.reason}`);
      }
      return null;
    }

    const program = getPitchProgram(programId);
    const questions = selectSessionQuestions(program);

    // 발표 컨디션(0.9 ~ 1.1): 고스트레스/번아웃(야근 여파) 시 0.9 고정
    let conditionMul = +(0.9 + Math.random() * 0.2).toFixed(2);
    if ((state.ceoStress || 0) >= 75 || (state.burnout || 0) >= 75 || (state.ceoHealth || 100) <= 30) {
      conditionMul = 0.9;
    }

    state.activePitchSession = {
      programId: program.id,
      programName: program.name,
      programType: program.type,
      org: program.org,
      passScore: program.passScore,
      baseAmount: program.baseAmount,
      equityDilution: program.equityDilution || 0,
      judges: program.judges.slice(),
      questionCount: questions.length,
      questions: questions,
      currentIndex: 0,
      rawScore: 0,
      conditionMul: conditionMul,
      conditionLabel: conditionMul <= 0.92
        ? '피로 누적 (전날 야근 ×0.9)'
        : (conditionMul >= 1.05 ? '컨디션 최상 (발표 호조 ×' + conditionMul + ')' : '평범 (×' + conditionMul + ')'),
      history: [],
      finished: false,
      result: null
    };

    if (program.type === 'grant') {
      state.grantsState[program.id] = 'applied';
    }

    // 브라우저 UI 모달 연동
    if (typeof window.openPitchingModal === 'function') {
      window.openPitchingModal(state.activePitchSession);
    } else if (window.Systems && window.Systems.ui && typeof window.Systems.ui.openPitchingModal === 'function') {
      window.Systems.ui.openPitchingModal(state.activePitchSession);
    }

    return state.activePitchSession;
  }

  /**
   * 현재 질문에 대한 답변 제출 ('tech' | 'bluff' | 'honest')
   */
  function submitPitchAnswer(answerType) {
    const state = window.state;
    if (!state || !state.activePitchSession) return null;

    const session = state.activePitchSession;
    if (session.finished) return session.result;

    const validTypes = ['tech', 'bluff', 'honest'];
    const type = validTypes.includes(answerType) ? answerType : 'honest';

    const currentQ = session.questions[session.currentIndex];
    if (!currentQ) {
      return finalizePitchSession();
    }

    const judgesMap = (window.GAME_DATA && window.GAME_DATA.pitchJudges) || {};
    const judge = judgesMap[currentQ.assignedJudgeId] || judgesMap[currentQ.judgeId] || judgesMap.kim;

    // 1. 기본 점수 (답변유형 × 심사위원 성향)
    const baseScore = (judge && judge.scores && typeof judge.scores[type] === 'number')
      ? judge.scores[type]
      : 10;

    // 2. 지표 보정 (충족 시 +5, 미달 시 -10, 기술적 답변에만 적용)
    const metricMet = evaluatePitchMetric(currentQ.metricCheck, state);
    let metricBonus = 0;
    if (type === 'tech') {
      metricBonus = metricMet ? 5 : -10;
    }

    // 3. 심사위원별 특수 규칙 처리
    let specialPenalty = 0;
    const notes = [];

    // (a) 김 교수: 블러핑 간파 확률 50% -> 해당 세션 -15점 추가 감점
    let bluffDetected = false;
    if (judge.id === 'kim' && type === 'bluff') {
      const detectChance = typeof judge.bluffDetectChance === 'number' ? judge.bluffDetectChance : 0.5;
      if (Math.random() < detectChance) {
        bluffDetected = true;
        specialPenalty += (judge.bluffDetectPenalty || -15);
        notes.push('🎓 김 교수가 과장/블러핑을 정면으로 간파했습니다! (-15점)');
      }
    }

    // (b) 이 사무관: 행정직원(서식) 미비 상태에서 서식/규정 문항(#3, #9)에 블러핑할 경우 즉시 -20점
    if (judge.id === 'lee' && !state.flags.hasAdminStaff) {
      if ((currentQ.id === 3 || currentQ.id === 9) && type === 'bluff') {
        specialPenalty += (judge.missingAdminPenalty || -20);
        notes.push('🏛️ 이 사무관이 증빙 서식 미비를 즉시 적발했습니다! (-20점)');
      }
    }

    // (c) 박 심사역: Honest 답변 시 스타트업다운 스케일업 야성/비즈니스 비전 결여로 사업성 감점 (-7점)
    if (judge.id === 'park' && type === 'honest') {
      const noVisionPenalty = (typeof judge.noVisionPenalty === 'number') ? judge.noVisionPenalty : -7;
      specialPenalty += noVisionPenalty;
      notes.push(`💼 박 심사역: "스타트업다운 스케일업 야성이 전혀 없습니다! 비즈니스 비전 결여로 감점합니다." (${noVisionPenalty}점)`);
    }

    // 4. 블러핑 누적(lieMeter) 및 #3 불법 전용 브로커리지 플래그(grantFraud) 처리
    let illegalTriggered = false;
    if (type === 'bluff') {
      state.lieMeter = (state.lieMeter || 0) + 1;
      const ansObj = currentQ.answers && currentQ.answers.bluff;
      if (currentQ.id === 3 || (ansObj && ansObj.isIllegal)) {
        state.flags.grantFraud = true;
        illegalTriggered = true;
        notes.push('⚠️ [위험] 인건비 불법 전용 발언이 기록되었습니다! (감사 적발 시 횡령 배드엔딩 위험)');
      }
    }

    const questionScore = baseScore + metricBonus + specialPenalty;
    session.rawScore += questionScore;

    const stepRecord = {
      questionId: currentQ.id,
      judgeId: judge.id,
      judgeName: judge.name,
      answerType: type,
      metricMet: metricMet,
      baseScore: baseScore,
      metricBonus: metricBonus,
      specialPenalty: specialPenalty,
      questionScore: questionScore,
      bluffDetected: bluffDetected,
      illegalTriggered: illegalTriggered,
      notes: notes
    };

    session.history.push(stepRecord);
    session.currentIndex += 1;

    // 마지막 문항까지 완료했으면 최종 정산 호출
    if (session.currentIndex >= session.questions.length) {
      return finalizePitchSession();
    }

    // 브라우저 UI 갱신 콜백
    if (typeof window.updatePitchingModal === 'function') {
      window.updatePitchingModal(session, stepRecord);
    }

    return stepRecord;
  }

  /**
   * 피칭 세션 최종 점수 산출 및 합격/불합격 처리
   */
  function finalizePitchSession() {
    const state = window.state;
    if (!state || !state.activePitchSession) return null;

    const session = state.activePitchSession;
    if (session.finished && session.result) return session.result;

    const program = getPitchProgram(session.programId);
    if (!program) return null;

    // 3문항 세션과 5문항 세션이 동일하게 0~100점 척도로 환산되도록 정규화 (서류 기본점수 15점 + 문항점수 5문항 환산)
    const count = Math.max(1, session.questionCount || 5);
    const baseDocScore = 15;
    const normalizedScore = baseDocScore + session.rawScore * (5 / count);
    const rawFinal = Math.round(normalizedScore * (session.conditionMul || 1.0));
    const finalScore = typeof window.clamp === 'function'
      ? window.clamp(rawFinal, 0, 100)
      : Math.max(0, Math.min(100, rawFinal));

    const passed = finalScore >= program.passScore;
    let payout = 0;
    let equityDiluted = 0;

    if (passed) {
      // 지원금/투자금 = Math.round(기본액 * (0.8 + (최종점수 - 합격선) / 100))
      payout = Math.round(program.baseAmount * (0.8 + (finalScore - program.passScore) / 100));
      state.money += payout;
      state.totalEarnedAllTime = (state.totalEarnedAllTime || 0) + payout;
      state.reputation = Math.min(100, (state.reputation || 50) + 6);
      state.creditScore = Math.min(1000, (state.creditScore || 750) + 15);

      if (program.type === 'grant') {
        state.grantsState[program.id] = 'approved';
        state.flags.bizRegistered = true;
        state.flags.hasGrant = true;
        state.lastGrantAmount = payout;
        state.totalGrantReceived = (state.totalGrantReceived || 0) + payout;
      } else if (program.type === 'vc') {
        state.vcState[program.id] = 'approved';
        state.flags.bizRegistered = true;
        equityDiluted = program.equityDilution || 0;
        state.ceoEquity = Math.max(0, +(state.ceoEquity - equityDiluted).toFixed(1));
        if (equityDiluted > 0) {
          const impliedVal = Math.round(payout / (equityDiluted / 100));
          state.valuation = Math.max(state.valuation || 0, impliedVal);
        }
      }

      if (typeof window.showToast === 'function') {
        const krwStr = typeof window.formatKRW === 'function' ? window.formatKRW(payout) : `${payout.toLocaleString()}원`;
        window.showToast(`🎉 [${program.name}] 최종 합격! (${finalScore}점) ${krwStr} 입금 완료!`);
      }
    } else {
      if (program.type === 'grant') {
        state.grantsState[program.id] = 'rejected';
      }
      state.pitchCooldowns = state.pitchCooldowns || {};
      state.pitchCooldowns[program.id] = state.month + (program.cooldownMonths || 3);
      state.ceoStress = Math.min(100, (state.ceoStress || 0) + 8);

      if (typeof window.showToast === 'function') {
        window.showToast(`😥 [${program.name}] 발표 평가 탈락 (${finalScore}점 / 합격선 ${program.passScore}점)`);
      }
    }

    session.finished = true;
    session.result = {
      programId: program.id,
      programName: program.name,
      programType: program.type,
      passed: passed,
      rawScore: session.rawScore,
      conditionMul: session.conditionMul,
      finalScore: finalScore,
      passScore: program.passScore,
      payout: payout,
      equityDilution: equityDiluted
    };

    if (typeof window.onPitchingSessionFinalized === 'function') {
      window.onPitchingSessionFinalized(session.result);
    }
    if (typeof window.renderAll === 'function') {
      window.renderAll();
    }

    return session.result;
  }

  /**
   * 월간 사후 감사 / 실사 리스크 판정 (매월 호출)
   * - lieMeter 3~4: 월 15% 감사 확률 (행정직원 보유 시 70% 감소 -> 4.5%)
   * - lieMeter 5+: 월 35% 감사 확률 (행정직원 보유 시 70% 감소 -> 10.5%)
   * - 적발 시 grantFraud가 true이면 auditCaught = true (B3 배드엔딩 트리거)
   * - 그 외에는 지원금 50% 또는 100% 환수 + 정부사업 참여제한(govBanned = true)
   */
  function checkMonthlyAuditRisk() {
    const state = window.state;
    if (!state) return { audited: false };

    state.flags = state.flags || {};

    // 정부사업 참여제한 기간 카운트다운
    if (state.flags.govBanned && typeof state.flags.govBanMonths === 'number' && state.flags.govBanMonths > 0) {
      state.flags.govBanMonths -= 1;
      if (state.flags.govBanMonths <= 0) {
        state.flags.govBanned = false;
      }
    }

    // 행정직원 유무 동기화
    if (Array.isArray(state.employees)) {
      const hasGA = state.employees.some(e => e.jobId === 'ga_staff' || e.jobId === 'admin' || e.role === 'admin');
      if (hasGA) state.flags.hasAdminStaff = true;
    }

    const lies = Number(state.lieMeter) || 0;
    if (lies < 3) {
      return { audited: false, chance: 0 };
    }

    let chance = lies >= 5 ? 0.35 : 0.15;
    if (state.flags.hasAdminStaff) {
      chance *= 0.3; // 70% 감소
    }

    if (Math.random() >= chance) {
      return { audited: false, chance: chance };
    }

    // 감사 적발 발생!
    state.auditCaughtCount = (state.auditCaughtCount || 0) + 1;

    // 1. 불법 답변(#3 인건비 유용/횡령) 플래그가 있는 경우 -> 즉시 B3 배드엔딩 트리거
    if (state.flags.grantFraud) {
      state.flags.auditCaught = true;
      state.flags.govBanned = true;
      state.flags.govBanMonths = 36;
      if (typeof window.showToast === 'function') {
        window.showToast('🚨 [중기부 특별감사] e나라도움 연구비·인건비 불법 전용 적발! 검찰 고발 조치!');
      }
      return {
        audited: true,
        fraudEndingTriggered: true,
        clawback: 0,
        govBanned: true
      };
    }

    // 2. 일반 과장/블러핑 적발: 지원금 50%(3~4회) 또는 100%(5회+) 환수 + 참여제한
    const baseGrant = state.lastGrantAmount || state.totalGrantReceived || 50000000;
    const clawbackRatio = lies >= 5 ? 1.0 : 0.5;
    const clawbackAmount = Math.round(baseGrant * clawbackRatio);

    state.money -= clawbackAmount;
    state.flags.govBanned = true;
    state.flags.govBanMonths = 36;
    state.reputation = Math.max(0, (state.reputation || 50) - (lies >= 5 ? 25 : 15));
    state.creditScore = Math.max(0, (state.creditScore || 700) - (lies >= 5 ? 100 : 50));
    state.ceoStress = Math.min(100, (state.ceoStress || 0) + 20);

    // 중복 폭탄 방지를 위해 거짓말 게이지 차감
    state.lieMeter = Math.max(0, lies - 3);

    if (typeof window.showToast === 'function') {
      const krwStr = typeof window.formatKRW === 'function' ? window.formatKRW(clawbackAmount) : `${clawbackAmount.toLocaleString()}원`;
      window.showToast(`🚨 [현장실사 적발] 발표 지표 과장이 적발되어 지원금 ${krwStr} 환수 및 정부사업 참여가 제한됩니다!`);
    }

    return {
      audited: true,
      fraudEndingTriggered: false,
      clawbackRatio: clawbackRatio,
      clawback: clawbackAmount,
      govBanned: true
    };
  }

  // 전역 및 Systems 네임스페이스 등록
  const pitchingSystem = {
    getPitchProgram,
    getPitchProgramStatus,
    canApplyPitchProgram,
    startPitchingSession,
    submitPitchAnswer,
    finalizePitchSession,
    checkMonthlyAuditRisk,
    evaluatePitchMetric
  };

  window.Systems.pitching = pitchingSystem;
  window.canApplyPitchProgram = canApplyPitchProgram;
  window.getPitchProgramStatus = getPitchProgramStatus;
  window.startPitchingSession = startPitchingSession;
  window.submitPitchAnswer = submitPitchAnswer;
  window.finalizePitchSession = finalizePitchSession;
  window.checkMonthlyAuditRisk = checkMonthlyAuditRisk;
})();
