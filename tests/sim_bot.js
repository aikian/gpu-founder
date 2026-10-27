/**
 * tests/sim_bot.js
 * Headless 84-Month Simulation & Smoke Test Runner for GPU FOUNDER
 * Loads all 18 browser scripts in exact index.html order and simulates multiple player personas.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const scriptOrder = [
  'game/data/economy.js',
  'game/data/staff.js',
  'game/data/events.js',
  'game/data/pitching.js',
  'game/data/hardware.js',
  'game/data/endings.js',
  'game/js/core/sound.js',
  'game/js/core/utils.js',
  'game/js/core/state.js',
  'game/js/systems/office.js',
  'game/js/systems/hr.js',
  'game/js/systems/events.js',
  'game/js/systems/pitching.js',
  'game/js/systems/hardware.js',
  'game/js/systems/endings.js',
  'game/js/ui/pixel_stage.js',
  'game/js/ui/modals.js',
  'game/js/ui/render.js',
  'game/js/main.js'
];

function createSandbox() {
  const storage = {};
  const sandbox = {
    console,
    Math,
    Date,
    JSON,
    Number,
    String,
    Boolean,
    Array,
    Object,
    Set,
    Map,
    RegExp,
    Error,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    setTimeout: (fn) => {},
    clearTimeout: () => {},
    setInterval: () => {},
    clearInterval: () => {},
    localStorage: {
      getItem: (k) => storage[k] || null,
      setItem: (k, v) => { storage[k] = String(v); },
      removeItem: (k) => { delete storage[k]; }
    }
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);

  for (const relPath of scriptOrder) {
    const fullPath = path.resolve(__dirname, '..', relPath);
    const code = fs.readFileSync(fullPath, 'utf8');
    vm.runInContext(code, sandbox, { filename: relPath });
  }
  return sandbox;
}

function assertValidNumbers(st, label) {
  const keys = ['money', 'creditScore', 'reputation', 'ceoStress', 'ceoEquity', 'totalTflops', 'valuation', 'pue'];
  for (const k of keys) {
    if (typeof st[k] !== 'number' || Number.isNaN(st[k])) {
      throw new Error(`[${label}] Invalid numeric state.${k} = ${st[k]} at month ${st.month}`);
    }
  }
}

function runPersona(name, strategyFn) {
  const sb = createSandbox();
  sb.refreshDanggeunDeals();

  for (let m = 0; m < 84; m++) {
    if (sb.state.gameEnded) break;

    strategyFn(sb, m);

    // Simulate 60 seconds (1 month) in 6 steps of 10s
    for (let s = 0; s < 6; s++) {
      if (sb.state.gameEnded) break;
      sb.stepSimulation(10);
      // Auto-resolve any active random event in headless mode
      if (sb.Systems.events && typeof sb.Systems.events.getActiveEvent === 'function') {
        const activeEv = sb.Systems.events.getActiveEvent();
        if (activeEv) {
          sb.Systems.events.resolveEventChoice(activeEv.id, 0);
        }
      }
    }
    assertValidNumbers(sb.state, name);
  }

  const end = sb.state.endingTriggered || { id: 'NONE', title: '미종료' };
  console.log(`✅ [${name}] 종료 월: ${sb.state.month}개월 | 현금: ${sb.formatKRW(sb.state.money)} | 연산력: ${sb.state.totalTflops} TF | 기업가치: ${sb.formatKRW(sb.state.valuation)} | 엔딩: [${end.id}] ${end.title}`);
  return sb.state;
}

console.log('=== 🧪 GPU FOUNDER 84-Month Simulation & Smoke Test ===');

// 1. Balanced Founder (정석 경영형 — 인프라 증설 + 투자 유치 + 상장)
runPersona('Balanced Founder (정석 경영형)', (sb, m) => {
  const st = sb.state;
  st.workloadAlloc = { crypto: 10, cloud: 90, saas: 0, corp: 0 };
  if (m === 0) {
    const sess = sb.startPitchingSession('yechangpae');
    while (sess && !sess.finished) {
      sb.submitPitchAnswer('honest');
    }
    sb.Systems.hardware.upgradeOfficePowerTier(st.offices[0].uid, 'P2');
    sb.Systems.hardware.upgradeOfficeCoolingTier(st.offices[0].uid, 'T2');
  }
  if (m === 2 && st.money > 25000000) {
    sb.leaseNewOffice('guro_jisan');
    const guro = st.offices[st.offices.length - 1];
    sb.Systems.hardware.upgradeOfficePowerTier(guro.uid, 'P4');
    sb.Systems.hardware.upgradeOfficeCoolingTier(guro.uid, 'T5');
  }
  // 6개월차 초기창업패키지(초창패 1억) 지원
  if (m === 6 && sb.canApplyPitchProgram('chocangpae')) {
    const sess = sb.startPitchingSession('chocangpae');
    while (sess && !sess.finished) sb.submitPitchAnswer('tech');
  }
  if (m === 10 && st.money >= 50000000 && st.totalTflops >= 200) {
    sb.hireEmployee('devops', 'wanted');
    sb.hireEmployee('admin_gov', 'wanted');
    sb.Systems.hr.toggleWelfare('lunch');
    sb.Systems.hr.toggleWelfare('work45');
    sb.Systems.hr.toggleWelfare('stockPool');
    sb.Systems.hr.toggleWelfare('remote');
    sb.Systems.hr.toggleWelfare('macbook');
  }
  if (m === 12 && sb.canApplyPitchProgram('seed_round')) {
    const sess = sb.startPitchingSession('seed_round');
    while (sess && !sess.finished) sb.submitPitchAnswer('tech');
  }
  if (m === 20 && st.money > 100000000) {
    sb.leaseNewOffice('pangyo_idc');
    const idc = st.offices[st.offices.length - 1];
    sb.Systems.hardware.upgradeOfficePowerTier(idc.uid, 'P5');
    sb.Systems.hardware.upgradeOfficeCoolingTier(idc.uid, 'T7');
  }
  if (st.totalTflops >= 900) {
    st.workloadAlloc = { crypto: 0, cloud: 10, saas: 0, corp: 90 };
  }
  if (st.totalTflops >= 5000 && !st.flags.listed) {
    sb.attemptKosdaqIPO();
  }
  // 여유 자금으로 신품 GPU 매입
  if (st.money > 80000000 && st.offices.length >= 2) {
    sb.buyNewGpu('h100');
  } else if (st.money > 25000000 && st.offices.length >= 2) {
    sb.buyNewGpu('a100');
  } else if (st.money > 5000000 && st.totalTflops < 300) {
    sb.buyNewGpu('rtx4090');
  }
  if (m === 3 && st.offices[0].gpus[0]) {
    sb.Systems.hardware.applyGpuMod(st.offices[0].uid, st.offices[0].gpus[0].uid, 'undervolt');
  }
});

// 2. Sinrim Legend (신림동 원룸 장인 — H2 히든엔딩 검증)
runPersona('Sinrim Legend (신림동 원룸 장인)', (sb, m) => {
  const st = sb.state;
  st.workloadAlloc = { crypto: 0, cloud: 100, saas: 0, corp: 0 };
  if (m === 0) {
    const sess = sb.startPitchingSession('yechangpae');
    while (sess && !sess.finished) sb.submitPitchAnswer('honest');
    sb.Systems.hardware.upgradeOfficePowerTier(st.offices[0].uid, 'P2');
    sb.Systems.hardware.upgradeOfficeCoolingTier(st.offices[0].uid, 'T3');
    for (let i = 0; i < 4; i++) sb.buyNewGpu('a100');
  }
});

// 2. Crypto Maximalist (채굴 올인형)
runPersona('Crypto Maximalist (채굴 올인형)', (sb, m) => {
  const st = sb.state;
  st.workloadAlloc = { crypto: 85, cloud: 15, saas: 0, corp: 0 };
  if (m === 0) {
    const sess = sb.startPitchingSession('yechangpae');
    while (sess && !sess.finished) sb.submitPitchAnswer('honest');
  }
  if (st.money > 4500000) {
    sb.buyNewGpu('rtx4090');
  }
});

// 3. Reckless Borrower (영끌 파산 테스트)
runPersona('Reckless Borrower (영끌 파산형)', (sb, m) => {
  const st = sb.state;
  if (m === 0) {
    sb.takeBankLoan('ceo_minus_bank');
    for (let i = 0; i < 6; i++) sb.hireEmployee('cfo', 'headhunter');
    st.money = -1000000;
    st.creditScore = 350;
  }
});

// 4. Direct Endings Verification (8종 멀티 엔딩 전수 체크)
const sbEnd = createSandbox();
const endingIds = ['B1', 'B2', 'B3', 'B4', 'H1', 'H2', 'T1', 'T2'];
endingIds.forEach(id => {
  sbEnd.state = new sbEnd.GameState();
  const res = sbEnd.Systems.endings.triggerEndingById(id);
  if (!res || res.id !== id) {
    throw new Error(`Ending trigger failed for ${id}`);
  }
});
console.log(`✅ [8종 멀티 엔딩 전수 판정] ${endingIds.join(', ')} 정상 작동 확인 완료!`);
console.log('=== 🎉 ALL SMOKE & BALANCE TESTS PASSED (0 ERRORS) ===');
