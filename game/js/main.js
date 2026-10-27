/**
 * game/js/main.js
 * 메인 게임 루프 (1초 틱 & 60초 월간 정산), 세이브/로드, DOM 이벤트 바인딩
 */

let lastTick = Date.now();
let newsTimer = 0;

function advanceOneMonth() {
  state.month += 1;
  state.calendarMonth += 1;
  if (state.calendarMonth > 12) {
    state.calendarMonth = 1;
    state.year += 1;
  }

  const specs = calculateSpecsGlobalSafe();

  // 누적 순이익 및 현금/단전/채굴 유지 개월 추적
  if (specs.netCashPerSec > 0) {
    state.totalProfit = (state.totalProfit || 0) + Math.round(specs.netCashPerSec * 60);
  }
  if (state.money < 0) {
    state.cashNegativeMonths = (state.cashNegativeMonths || 0) + 1;
    state.creditScore = clamp(state.creditScore - 35, 0, 1000);
  } else {
    state.cashNegativeMonths = 0;
    if (state.creditScore < 950) {
      state.creditScore = clamp(state.creditScore + 3, 0, 1000);
    }
  }

  // 전기요금 체납 판정
  if (state.money < 0 && specs.monthlyElectricBill > 0) {
    state.electricUnpaidMonths = (state.electricUnpaidMonths || 0) + 1;
  } else {
    state.electricUnpaidMonths = 0;
  }

  // 코인 채굴 80% 이상 유지 개월 추적 (H1 엔딩용)
  if ((state.workloadAlloc.crypto || 0) >= 80) {
    state.miningAllocMonths = (state.miningAllocMonths || 0) + 1;
  }

  // 리스 계약 잔여 개월 차감 및 만료 회수
  if (Array.isArray(state.leases)) {
    const expired = [];
    state.leases = state.leases.filter(l => {
      l.remainingMonths -= 1;
      if (l.remainingMonths <= 0) {
        expired.push(l);
        return false;
      }
      return true;
    });
    expired.forEach(l => {
      state.offices.forEach(off => {
        off.gpus = off.gpus.filter(g => !g.isLeased || g.model !== l.model);
      });
      showToast(`⌛ [${l.model}] 3개월 엔터프라이즈 리스 계약이 만료되어 장비가 반환되었습니다.`);
    });
  }

  // 월말 손익 결산 리포트 생성 및 저장 (P&L Report)
  const report = {
    month: state.month,
    year: state.year,
    calendarMonth: state.calendarMonth,
    revenue: {
      cloud: Math.round(specs.cloudIncomePerSec * 60),
      saas: Math.round(specs.saasIncomePerSec * 60),
      corp: Math.round(specs.corpIncomePerSec * 60),
      cryptoEth: Number((specs.ethPerSec * 60).toFixed(5))
    },
    costs: {
      rent: specs.totalRentMonthly,
      electric: specs.monthlyElectricBill,
      payroll: specs.monthlyPayroll,
      interest: specs.monthlyLoanInterest,
      lease: specs.monthlyLeaseCost
    },
    grossRevenue: Math.round(specs.grossCashPerSec * 60),
    totalCost: specs.totalMonthlyFixedCost,
    netProfit: specs.monthlyProfit,
    cashEnd: Math.round(state.money)
  };
  state.lastMonthReport = report;
  state.monthReports = state.monthReports || [];
  state.monthReports.push(report);
  if (state.monthReports.length > 24) state.monthReports.shift();

  // GPU 무상 보증기간(AS) 차감
  state.offices.forEach(off => {
    off.gpus.forEach(g => {
      if (g.warranty > 0) g.warranty = Math.max(0, g.warranty - 1);
    });
  });

  // 정부지원사업 참여제한 기간 차감
  if (state.flags.govBanMonths > 0) {
    state.flags.govBanMonths -= 1;
    if (state.flags.govBanMonths <= 0) state.flags.govBanned = false;
  }

  // 1. 기간형 Modifier 차감
  if (typeof tickModifiersMonthly === 'function') {
    tickModifiersMonthly();
  }

  // 2. 인사(HR) 월급/사기/번아웃/퇴사 정산
  if (window.Systems.hr && typeof window.Systems.hr.settleMonthlyHR === 'function') {
    window.Systems.hr.settleMonthlyHR();
  }

  // 3. 피칭 거짓말(Lie Meter) 사후 감사 판정
  if (window.Systems.pitching && typeof window.Systems.pitching.checkMonthlyAuditRisk === 'function') {
    window.Systems.pitching.checkMonthlyAuditRisk();
  }

  // 4. 엔딩 도달 여부 판정
  if (window.Systems.endings && typeof window.Systems.endings.checkEndings === 'function') {
    const ended = window.Systems.endings.checkEndings();
    if (ended) return;
  }

  // 5. 월간 랜덤 딜레마 이벤트 체크
  if (window.Systems.events && typeof window.Systems.events.checkMonthlyEvents === 'function') {
    window.Systems.events.checkMonthlyEvents();
  }

  if (typeof renderHrUI === 'function') renderHrUI();
  if (typeof renderFinanceUI === 'function') renderFinanceUI();
}

function stepSimulation(dtReal) {
  if (state.gameEnded) return;
  const speed = state.speed ?? 1;
  if (speed <= 0) return;

  const dt = dtReal * speed;
  const specs = calculateSpecsGlobalSafe();

  // 1. 현금 및 코인 실시간 누적
  const cashDelta = specs.netCashPerSec * dt;
  state.money += cashDelta;
  if (cashDelta > 0) state.totalEarnedAllTime += cashDelta;
  state.coinBalance += specs.ethPerSec * dt;

  // 2. 월 경과 타이머 (60초 = 1게임월)
  state.dayProgress = (state.dayProgress || 0) + dt;
  while (state.dayProgress >= 60) {
    state.dayProgress -= 60;
    advanceOneMonth();
    if (state.gameEnded) return;
  }

  // 3. 코인 시세 랜덤 워크
  if (Math.random() < 0.25 * dt) {
    const changePct = (Math.random() * 0.042) - 0.02;
    state.coinPrice = Math.max(1200000, Math.floor(state.coinPrice * (1 + changePct)));
    state.coinPriceHistory.push(state.coinPrice);
    if (state.coinPriceHistory.length > 30) state.coinPriceHistory.shift();
    if (typeof drawCryptoChart === 'function') drawCryptoChart();
  }

  // 4. 당근마켓 매물 갱신 타이머
  state.usedRefreshTimer -= dt;
  if (state.usedRefreshTimer <= 0) {
    state.usedRefreshTimer = 18;
    refreshDanggeunDeals();
  }
  if (typeof document !== 'undefined') {
    const timerEl = document.getElementById('used-refresh-timer');
    if (timerEl) timerEl.textContent = `${Math.ceil(state.usedRefreshTimer)}s`;
  }

  // 5. 하드웨어 내구도 마모 틱
  if (window.Systems.hardware && typeof window.Systems.hardware.tickHardwareWear === 'function') {
    window.Systems.hardware.tickHardwareWear(dt);
  }

  // 6. 사업장별 발열·전력·집주인 눈치 시뮬레이션
  const season = getSeasonInfo(state.calendarMonth);
  const heatMod = getStatModifier('heat');

  state.offices.forEach(office => {
    const preset = window.GAME_DATA.offices.find(p => p.id === office.presetId) || window.GAME_DATA.offices[0];
    let maxPower = preset.maxPower + (office.extraPower || 0);
    if (window.GAME_DATA.powerTech && office.powerTier) {
      const pt = window.GAME_DATA.powerTech.find(p => p.id === office.powerTier);
      if (pt && pt.capacityW) maxPower = Math.max(maxPower, pt.capacityW + (office.extraPower || 0));
    }

    let coolingRate = preset.coolingRate + (office.extraCooling || 0);
    if (window.GAME_DATA.coolingTech && office.coolingTier) {
      const ct = window.GAME_DATA.coolingTech.find(c => c.id === office.coolingTier);
      if (ct) {
        if (ct.id === 'T5b') {
          coolingRate = (season.id === 'winter' ? (ct.winterCoolRate || 60) : (ct.summerCoolRate || 12)) + (office.extraCooling || 0);
        } else if (ct.coolRate) {
          coolingRate = Math.max(coolingRate, ct.coolRate + (office.extraCooling || 0));
        }
      }
    }

    let officePower = 0;
    let officeHeatGen = 0;

    office.gpus.forEach(gpu => {
      if (!gpu.isBroken) {
        if (window.Systems.hardware && typeof window.Systems.hardware.getGpuEffectiveSpecs === 'function') {
          const eff = window.Systems.hardware.getGpuEffectiveSpecs(gpu, office.temp);
          officePower += eff.power;
          officeHeatGen += eff.heat;
        } else {
          const spec = window.GAME_DATA.gpus[gpu.model];
          if (spec) {
            officePower += spec.power;
            officeHeatGen += spec.heat;
          }
        }
      }
    });

    officeHeatGen *= heatMod.mul;

    // 차단기 트립 판정
    if (!office.isTripped && officePower > maxPower) {
      if (Math.random() < 0.25 * dt) {
        if (office.upsCount > 0) {
          showToast(`🔋 [${office.customName}] 전력 피크를 UPS가 방어했습니다! 수전 용량을 증설하세요.`);
        } else {
          office.isTripped = true;
          const hrEff = (window.Systems.hr && typeof window.Systems.hr.getHrEffects === 'function') ? window.Systems.hr.getHrEffects() : {};
          office.tripTimer = 8.0 * (hrEff.recoveryTimeMul || 1.0);
          state.ceoStress = clamp(state.ceoStress + 4, 0, 100);
          if (window.sound) window.sound.playAlarm();
          showToast(`🚨 [${office.customName}] 두꺼비집 차단기 트립! 과부하로 정전 발생!`);
        }
      }
    }

    if (office.isTripped) {
      office.tripTimer -= dt;
      office.temp = Math.max(season.ambientTemp, office.temp - 8.0 * dt);
      if (office.tripTimer <= 0) {
        office.isTripped = false;
        showToast(`🔌 [${office.customName}] 차단기 복구 완료! 서버 재가동.`);
      }
    } else if (office.thermalShutdown) {
      office.thermalTimer -= dt;
      office.temp = Math.max(season.ambientTemp, office.temp - 6.0 * dt);
      if (office.thermalTimer <= 0) {
        office.thermalShutdown = false;
        showToast(`❄️ [${office.customName}] 온도 정상화! 열 보호 셧다운이 해제되었습니다.`);
      }
    } else {
      // 계약 B: 열 평형 수렴 모델 (Target Temperature Equilibrium)
      const heatRatio = officeHeatGen / Math.max(coolingRate, 0.5);
      const targetTemp = Math.min(105, season.ambientTemp + 35 * heatRatio);
      office.temp += (targetTemp - office.temp) * (1 - Math.exp(-dt / 20));
      office.temp = clamp(office.temp, season.ambientTemp, 105.0);

      // 95도 이상 도달 시 하드웨어 보호 긴급 셧다운 (15초)
      if (office.temp >= 95) {
        office.thermalShutdown = true;
        office.thermalTimer = 15.0;
        state.ceoStress = clamp(state.ceoStress + 5, 0, 100);
        if (window.sound) window.sound.playAlarm();
        showToast(`🔥 [${office.customName}] 95°C 초고온 도달! 하드웨어 보호를 위해 긴급 열 셧다운이 발동되었습니다!`);
      }

      // 원룸 집주인 항의 게이지
      if (preset.landlordNotice) {
        if (officePower > 1400 || office.temp > 46) {
          office.landlordAnger = Math.min(100, (office.landlordAnger || 0) + 1.4 * dt);
          if (office.landlordAnger >= 100) {
            state.flags.landlordMaxed = true;
            office.landlordAnger = 50;
            state.ceoStress = clamp(state.ceoStress + 8, 0, 100);
            office.customRent = (office.customRent || preset.monthlyRent) + 200000;
            if (window.sound) window.sound.playAlarm();
            showToast('🚪 쾅쾅쾅! 집주인 아줌마: "총각! 계량기 터지겠어! 다음 달부터 월세 20만원 올려받을 테니 그리 알아!"');
          }
        } else {
          office.landlordAnger = Math.max(0, (office.landlordAnger || 0) - 1.0 * dt);
        }
      }
    }
  });
}

function gameLoop() {
  const now = Date.now();
  const dtReal = Math.min(0.25, (now - lastTick) / 1000);
  lastTick = now;

  stepSimulation(dtReal);

  newsTimer += dtReal;
  if (newsTimer > 18) {
    newsTimer = 0;
    const list = window.GAME_DATA.newsTicker || [];
    if (list.length > 0 && typeof document !== 'undefined') {
      const ev = list[Math.floor(Math.random() * list.length)];
      const tickerEl = document.getElementById('news-ticker');
      if (tickerEl) tickerEl.textContent = ev;
    }
  }

  renderUI();
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(gameLoop);
  }
}

// --- Save / Load / Reset ---
function saveGame() {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('GPU_STARTUP_TYCOON_KOREA_V2', JSON.stringify(state));
  showToast('💾 게임 진행 데이터가 안전하게 저장되었습니다.');
}

function loadGame() {
  if (typeof localStorage === 'undefined') return;
  const data = localStorage.getItem('GPU_STARTUP_TYCOON_KOREA_V2');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      const fresh = new GameState();
      Object.assign(fresh, parsed);
      fresh.flags = Object.assign(new GameState().flags, parsed.flags || {});
      fresh.welfare = Object.assign(new GameState().welfare, parsed.welfare || {});
      window.state = fresh;
      state = fresh;
      showToast('📂 저장된 스타트업 데이터를 불러왔습니다.');
    } catch (e) {
      console.error('loadGame error:', e);
    }
  }
}

function resetGame() {
  if (typeof confirm === 'function' && !confirm('정말로 폐업 신고하고 초기 자본금으로 재창업하시겠습니까? (달성한 엔딩 도감은 유지됩니다)')) {
    return;
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('GPU_STARTUP_TYCOON_KOREA_V2');
  }
  window.state = new GameState();
  state = window.state;
  const endModal = typeof document !== 'undefined' ? document.getElementById('ending-modal') : null;
  if (endModal) endModal.classList.remove('show');
  refreshDanggeunDeals();
  renderUI();
  renderNewGpus();
  renderLeaseGpus();
  renderHrUI();
  renderFinanceUI();
  showToast('🔄 재창업 완료! 당근마켓 GTX 1060 한 장으로 다시 시작합니다.');
}

function setGameSpeed(sp) {
  state.speed = sp;
  renderUI();
}

window.advanceOneMonth = advanceOneMonth;
window.stepSimulation = stepSimulation;
window.saveGame = saveGame;
window.loadGame = loadGame;
window.resetGame = resetGame;
window.setGameSpeed = setGameSpeed;

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    // Main Nav Tabs
    const navTabs = document.querySelectorAll('.nav-tab-btn');
    navTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        navTabs.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.dataset.tab);
        if (target) target.classList.add('active');
        if (btn.dataset.tab === 'tab-hr') renderHrUI();
        if (btn.dataset.tab === 'tab-finance') renderFinanceUI();
      });
    });

    // Procure Subtabs
    const subTabs = document.querySelectorAll('.sub-tab-btn');
    subTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        subTabs.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.procure-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.dataset.sub);
        if (target) target.classList.add('active');
      });
    });

    // Workload Sliders (Auto-balancing so sum <= 100%)
    const sliderKeys = ['crypto', 'cloud', 'saas', 'corp'];
    const setupSlider = (sliderId, valId, key) => {
      const slider = document.getElementById(sliderId);
      const valEl = document.getElementById(valId);
      if (!slider || !valEl) return;
      slider.value = state.workloadAlloc[key];
      valEl.textContent = `${slider.value}%`;

      slider.addEventListener('input', (e) => {
        const val = clamp(parseInt(e.target.value, 10) || 0, 0, 100);
        state.workloadAlloc[key] = val;

        const otherKeys = sliderKeys.filter(k => k !== key);
        const otherSum = otherKeys.reduce((acc, k) => acc + (state.workloadAlloc[k] || 0), 0);
        if (val + otherSum > 100) {
          let excess = (val + otherSum) - 100;
          for (const ok of otherKeys) {
            if (excess <= 0) break;
            const cur = state.workloadAlloc[ok] || 0;
            if (cur > 0) {
              const deduct = Math.min(cur, excess);
              state.workloadAlloc[ok] -= deduct;
              excess -= deduct;
            }
          }
        }
        renderUI();
      });
    };

    loadGame();
    setupSlider('slider-crypto', 'val-crypto', 'crypto');
    setupSlider('slider-cloud', 'val-cloud', 'cloud');
    setupSlider('slider-saas', 'val-saas', 'saas');
    setupSlider('slider-corp', 'val-corp', 'corp');

    // SaaS Marketing Button
    const mktBtn = document.getElementById('saas-marketing-btn');
    if (mktBtn) {
      mktBtn.addEventListener('click', () => {
        if (window.sound) window.sound.init();
        const cost = 1000000;
        if (state.money >= cost) {
          state.money -= cost;
          const hrEff = (window.Systems.hr && typeof window.Systems.hr.getHrEffects === 'function') ? window.Systems.hr.getHrEffects() : {};
          const addedUsers = Math.round(500 * (1 + (hrEff.marketingEffBonus || 0)));
          state.saasUsers += addedUsers;
          if (window.sound) window.sound.playCash();
          showToast(`📢 AI 서비스 SNS 마케팅 집행! 활성 구독자 +${addedUsers.toLocaleString()}명 유입!`);
          renderUI();
        } else {
          showToast('❌ 마케팅 집행비 100만 원이 부족합니다.');
        }
      });
    }

    // Office Modal
    const openLeaseBtn = document.getElementById('open-lease-modal-btn');
    if (openLeaseBtn) openLeaseBtn.addEventListener('click', openOfficeModal);
    const closeOfficeBtn = document.getElementById('close-office-modal');
    if (closeOfficeBtn) {
      closeOfficeBtn.addEventListener('click', () => {
        document.getElementById('office-modal').classList.remove('show');
      });
    }

    // Exchange Sell All
    const sellCoinBtn = document.getElementById('sell-all-coin-btn');
    if (sellCoinBtn) sellCoinBtn.addEventListener('click', sellAllCoins);

    // Danggeun Force Refresh
    const refreshBtn = document.getElementById('force-refresh-market-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        if (window.sound) window.sound.init();
        if (state.money >= 50000) {
          state.money -= 50000;
          refreshDanggeunDeals();
          showToast('🥕 퀵비 5만 원을 지불하고 당근 꿀매물을 즉시 새로고침했습니다.');
        } else {
          showToast('❌ 잔고가 부족합니다.');
        }
      });
    }

    // Header Controls
    const pnlBtn = document.getElementById('pnl-btn');
    if (pnlBtn && typeof openPnlModal === 'function') pnlBtn.addEventListener('click', openPnlModal);
    const guideBtn = document.getElementById('guide-btn');
    if (guideBtn && typeof openGuideModal === 'function') guideBtn.addEventListener('click', openGuideModal);

    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveGame);
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', resetGame);
    const soundBtn = document.getElementById('sound-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        if (window.sound) {
          window.sound.enabled = !window.sound.enabled;
          soundBtn.textContent = window.sound.enabled ? '🔊' : '🔇';
          showToast(window.sound.enabled ? '효과음 켜짐' : '효과음 꺼짐');
        }
      });
    }

    // Keyboard Shortcuts: Space (Pause/Resume), 1/2/3 (Speed), P (P&L), Esc (Close Modal)
    window.addEventListener('keydown', (e) => {
      // Ignore if user is typing in an input or select
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setGameSpeed(state.speed === 0 ? (state._prevSpeedBeforeModal || 1) : 0);
        showToast(state.speed === 0 ? '⏸ 일시정지됨' : `▶ ${state.speed}배속 재생`);
      } else if (e.code === 'Digit1' || e.code === 'Numpad1') {
        setGameSpeed(1);
        showToast('▶ 1배속');
      } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
        setGameSpeed(2);
        showToast('⏩ 2배속');
      } else if (e.code === 'Digit3' || e.code === 'Digit4' || e.code === 'Numpad3' || e.code === 'Numpad4') {
        setGameSpeed(4);
        showToast('⚡ 4배속 (초고속)');
      } else if (e.code === 'KeyP') {
        if (typeof openPnlModal === 'function') openPnlModal();
      } else if (e.code === 'Escape') {
        const modals = document.querySelectorAll('.modal-overlay.show');
        if (modals.length > 0) {
          modals.forEach(m => m.classList.remove('show'));
        }
      }
    });

    refreshDanggeunDeals();
    renderNewGpus();
    renderLeaseGpus();
    renderHrUI();
    renderFinanceUI();
    drawCryptoChart();
    renderUI();

    setInterval(saveGame, 30000);
    requestAnimationFrame(gameLoop);
  });
}
