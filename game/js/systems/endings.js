/**
 * game/js/systems/endings.js
 * 기업가치(Valuation) 산출, 8종 멀티 엔딩(B1~B4, H1~H2, T1~T2) 및 84개월 만기 등급 판정, 엔딩 컬렉션 저장
 * 기준 문서: docs/design/05_endings.md
 */
window.Systems = window.Systems || {};

(function () {
  const STORAGE_KEY = 'GPU_TYCOON_ENDINGS_COLLECTION';

  /**
   * CFO 재직 여부에 따른 기업가치 평가 보너스 조회
   */
  function getCfoValuationBonus() {
    const st = window.state;
    if (!st || !Array.isArray(st.employees)) return 0;

    if (typeof window.getActiveHrEffects === 'function') {
      const hr = window.getActiveHrEffects();
      if (hr && typeof hr.valuationBonus === 'number') {
        return hr.valuationBonus;
      }
    }

    const hasCfo = st.employees.some(e => e && !e.isFake && e.jobId === 'cfo');
    return hasCfo ? 0.25 : 0;
  }

  /**
   * 기업가치(Valuation) 실시간 산출
   * 공식 (05_endings.md):
   *   기업가치 = ((연 순이익 * 15) + GPU 자산 평가액 + 코인 평가액 - 총 부채)
   *             * 평판보정(0.8~1.3) * (state.flags.listed ? 1.5 : 1.0) * (1 + cfoValuationBonus)
   */
  function calculateCompanyValuation() {
    const st = window.state;
    if (!st) return 0;

    // 1. 연간 순이익 환산 (직전 월 순이익 * 12, 적자일 경우 0으로 하한 처리하되 현금성 자산 반영)
    const annualProfit = Math.max(0, (st.monthlyProfit || 0) * 12);
    const profitMultipleVal = annualProfit * 15;

    // 2. GPU 하드웨어 자산 평가액 합산
    const gpuCatalog = (window.GAME_DATA && window.GAME_DATA.gpus) || {};
    let gpuAssetVal = 0;
    if (Array.isArray(st.offices)) {
      st.offices.forEach(office => {
        if (!office || !Array.isArray(office.gpus)) return;
        office.gpus.forEach(gpu => {
          if (!gpu || gpu.permDead) return;
          const spec = gpuCatalog[gpu.model] || { newPrice: 280000, scrapVal: 60000 };
          if (gpu.isBroken || gpu.health <= 0) {
            gpuAssetVal += spec.scrapVal;
          } else {
            const healthRatio = Math.max(0.2, Math.min(1.0, (gpu.health || 100) / 100));
            const modPenalty = Array.isArray(gpu.mods) && gpu.mods.length > 0 ? 0.70 : 1.0;
            const unitVal = Math.max(spec.scrapVal, spec.newPrice * (0.35 + 0.65 * healthRatio) * modPenalty);
            gpuAssetVal += unitVal;
          }
        });
      });
    }

    // 3. 크립토 코인 지갑 평가액 + 보유 현금 자산
    const coinVal = Math.max(0, (st.coinBalance || 0) * (st.coinPrice || 0));
    const cashReserve = Math.max(0, st.money || 0);

    // 4. 총 부채 (대출 원금 합계)
    let totalDebt = 0;
    if (Array.isArray(st.loans)) {
      st.loans.forEach(loan => {
        if (loan && typeof loan.principal === 'number') {
          totalDebt += loan.principal;
        }
      });
    }

    // 5. 평판 보정 (0.8 ~ 1.3), 코스닥 상장 여부(1.5x), CFO 보너스
    const rep = Math.max(0, Math.min(100, typeof st.reputation === 'number' ? st.reputation : 50));
    const repMultiplier = 0.8 + (rep / 100) * 0.5;
    const listedMultiplier = (st.flags && st.flags.listed) ? 1.5 : 1.0;
    const cfoBonus = getCfoValuationBonus();

    const baseNetWorth = profitMultipleVal + gpuAssetVal + coinVal + cashReserve - totalDebt;
    const rawValuation = Math.max(10000000, baseNetWorth * repMultiplier * listedMultiplier * (1 + cfoBonus));
    const finalValuation = Math.round(rawValuation);

    st.valuation = finalValuation;
    return finalValuation;
  }

  /**
   * 84개월 만기 시 기업가치 기준 등급(S/A/B/C/D) 반환
   */
  function getExpirationGrade(valuation) {
    const val = typeof valuation === 'number' ? valuation : calculateCompanyValuation();
    const grades = (window.GAME_DATA && window.GAME_DATA.expirationGrades) || [
      { grade: 'S', minValuation: 500000000000, title: '🦄 데카콘 직전의 K-유니콘', desc: '' },
      { grade: 'A', minValuation: 100000000000, title: '🦄 유니콘 (코스닥 상장사)', desc: '' },
      { grade: 'B', minValuation: 10000000000, title: '🚀 시리즈 B 성공한 탄탄한 스타트업', desc: '' },
      { grade: 'C', minValuation: 1000000000, title: '🏢 흑자 내는 강소기업', desc: '' },
      { grade: 'D', minValuation: -Infinity, title: '🥲 "그래도 망하진 않았다"', desc: '' }
    ];

    for (let i = 0; i < grades.length; i++) {
      if (val >= grades[i].minValuation) {
        return grades[i];
      }
    }
    return grades[grades.length - 1];
  }

  /**
   * 로컬 스토리지에 해금된 엔딩 ID 저장 및 조회
   */
  function getUnlockedEndings() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function recordUnlockedEnding(endingId) {
    if (!endingId) return;
    try {
      if (typeof localStorage === 'undefined') return;
      const list = getUnlockedEndings();
      if (!list.includes(endingId)) {
        list.push(endingId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      }
    } catch (e) {
      // file:// 시크릿 모드 등 스토리지 제한 환경 무시
    }
  }

  /**
   * 엔딩 확정 처리 및 모달 오픈
   */
  function finalizeEnding(endingObj) {
    const st = window.state;
    if (!st || !endingObj) return null;

    st.gameEnded = true;
    st.endingTriggered = endingObj;
    st.speed = 0;

    recordUnlockedEnding(endingObj.id);

    if (typeof window.openEndingModal === 'function') {
      window.openEndingModal(endingObj);
    } else if (typeof document !== 'undefined') {
      const modal = document.getElementById('modal-ending');
      if (modal) {
        modal.classList.remove('hidden');
      }
    }

    return endingObj;
  }

  /**
   * 특정 엔딩 ID로 즉시 엔딩 트리거 (이벤트 또는 디버그용)
   */
  function triggerEndingById(endingId) {
    const catalog = (window.GAME_DATA && window.GAME_DATA.endings) || [];
    const found = catalog.find(e => e.id === endingId);
    if (!found) return null;
    const val = calculateCompanyValuation();
    const gradeInfo = getExpirationGrade(val);
    const enriched = Object.assign({}, found, {
      valuation: val,
      grade: gradeInfo.grade,
      gradeTitle: gradeInfo.title
    });
    return finalizeEnding(enriched);
  }

  /**
   * 매 틱/매월 멀티 엔딩 조건 검사 (B1~B4, H1~H2, T1~T2 및 84개월 기간 만료)
   */
  function checkEndings() {
    const st = window.state;
    if (!st) return null;
    if (st.gameEnded && st.endingTriggered) return st.endingTriggered;

    const valuation = calculateCompanyValuation();
    const flags = st.flags || {};
    const offices = Array.isArray(st.offices) ? st.offices : [];
    const employees = Array.isArray(st.employees) ? st.employees : [];
    const realEmployeeCount = employees.filter(e => e && !e.isFake).length;

    // 춘천 하이퍼스케일 DC 보유 여부 동기화
    const hasChuncheonDC = Boolean(flags.hasChuncheonDC || offices.some(o => o && o.presetId === 'chuncheon_dc'));
    if (hasChuncheonDC && st.flags) {
      st.flags.hasChuncheonDC = true;
    }

    // 코인 지갑 평가액
    const coinValue = (st.coinBalance || 0) * (st.coinPrice || 0);

    // 1. 배드 엔딩 (B1 ~ B4) 우선 판정
    // B1: 현금 < 0 상태 3개월 지속 AND 신용점수 < 400
    if ((st.cashNegativeMonths || 0) >= 3 && (st.creditScore || 0) < 400) {
      return triggerEndingById('B1');
    }

    // B2: 전기요금 3개월 연속 체납
    if ((st.electricUnpaidMonths || 0) >= 3) {
      return triggerEndingById('B2');
    }

    // B3: 정부지원금 부정수급/횡령 AND 감사 적발
    if (flags.grantFraud && flags.auditCaught) {
      return triggerEndingById('B3');
    }

    // B4: 직원 전원 퇴사(과거 채용 이력 있음) AND 대표 스트레스 100 도달
    if (realEmployeeCount === 0 && flags.hadEmployees && (st.ceoStress || 0) >= 100) {
      return triggerEndingById('B4');
    }

    // 2. 트루 엔딩 (T2, T1) 판정
    // T2: 춘천 DC 보유 AND 연산력 >= 200,000 TF AND PUE <= 1.15 AND 코스닥 상장 완료 AND 감사 적발 0회
    if (
      hasChuncheonDC &&
      (st.totalTflops || 0) >= 200000 &&
      (st.pue || 1.45) <= 1.15 &&
      Boolean(flags.listed) &&
      (st.auditCaughtCount || 0) === 0 &&
      !flags.auditCaught
    ) {
      return triggerEndingById('T2');
    }

    // T1: 연산력 >= 50,000 TFLOPS AND 기업가치 >= 1조 AND 대표 지분 >= 30% AND M&A 제안 수락
    if (
      (st.totalTflops || 0) >= 50000 &&
      valuation >= 1000000000000 &&
      (st.ceoEquity || 0) >= 30 &&
      Boolean(flags.acceptedMnA)
    ) {
      return triggerEndingById('T1');
    }

    // 3. 히든 엔딩 (H1, H2) 판정
    // H1: 코인 지갑 평가액 >= 100억 AND 한 번도 코인 매도 안 함 AND 채굴 배분 80%+ 12개월 유지
    if (
      coinValue >= 10000000000 &&
      (st.coinSellCount || 0) === 0 &&
      (st.miningAllocMonths || 0) >= 12
    ) {
      return triggerEndingById('H1');
    }

    // H2: 사무실 이전 없이 신림동 원룸 1곳만으로 누적 순이익 10억 달성 AND 집주인 분노 100 한 번도 미도달
    if (
      offices.length === 1 &&
      offices[0].presetId === 'room_sinrim' &&
      (st.totalProfit || 0) >= 1000000000 &&
      !flags.landlordMaxed &&
      (offices[0].landlordAnger || 0) < 100
    ) {
      return triggerEndingById('H2');
    }

    // 4. 84개월(7년) 기간 만료 최종 평가 엔딩
    if ((st.month || 0) >= 84) {
      const gradeInfo = getExpirationGrade(valuation);
      const expEnding = {
        id: `EXP_${gradeInfo.grade}`,
        type: 'expiration',
        grade: gradeInfo.grade,
        title: gradeInfo.title,
        subtitle: '「7년(84개월) 창업 대장정 최종 성적표」',
        badge: `⏳ 84개월 만기 완료 [등급: ${gradeInfo.grade}]`,
        conditionDesc: '84개월(7년) 생존 및 경영 기간 만료',
        storyText: [
          gradeInfo.desc,
          `최종 산출 기업가치: ${typeof window.formatKRW === 'function' ? window.formatKRW(valuation) : valuation.toLocaleString() + '원'}`,
          `총 가동 연산력: ${(st.totalTflops || 0).toLocaleString()} TFLOPS · 대표 지분율: ${st.ceoEquity || 0}%`
        ].join('\n\n'),
        valuation
      };
      return finalizeEnding(expEnding);
    }

    return null;
  }

  const endingsSystem = {
    calculateCompanyValuation,
    getExpirationGrade,
    getUnlockedEndings,
    recordUnlockedEnding,
    triggerEndingById,
    checkEndings
  };

  window.Systems.endings = endingsSystem;
  window.calculateCompanyValuation = calculateCompanyValuation;
  window.getExpirationGrade = getExpirationGrade;
  window.getUnlockedEndings = getUnlockedEndings;
  window.triggerEndingById = triggerEndingById;
  window.checkEndings = checkEndings;
})();
