/**
 * game/js/systems/hr.js
 * 인사 · 채용 · 스톡옵션 · 복지 · 번아웃 · 매월 급여 및 이직 판정 시스템
 * (01_hr_hiring_burnout.md 및 CONVENTIONS.md 준수)
 */

window.Systems = window.Systems || {};

function getJobDef(jobId) {
  const jobs = (window.GAME_DATA && window.GAME_DATA.jobs) || [];
  return jobs.find(j => j.id === jobId) || null;
}

function getChannelDef(channelId) {
  const channels = (window.GAME_DATA && window.GAME_DATA.channels) || [];
  return channels.find(c => c.id === channelId) || null;
}

function getWelfareDef(policyId) {
  const policies = (window.GAME_DATA && window.GAME_DATA.welfarePolicies) || [];
  return policies.find(p => p.id === policyId) || null;
}

function pickKoreanName(existingEmployees) {
  const names = (window.GAME_DATA && window.GAME_DATA.koreanNames) || ['김개발', '이엔지', '박리서'];
  const used = new Set((existingEmployees || []).map(e => e.name));
  const available = names.filter(n => !used.has(n));
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  const base = names[Math.floor(Math.random() * names.length)];
  return `${base}${Math.floor(Math.random() * 90 + 10)}`;
}

/**
 * 재직 중인 직원 목록을 기준으로 state.morale, state.burnout, state.flags.hasAdminStaff 갱신
 */
function syncHrAggregates() {
  const s = window.state;
  if (!s) return;
  const emps = s.employees || [];
  s.flags.hasAdminStaff = emps.some(e => e.jobId === 'admin_gov');

  if (emps.length === 0) {
    s.morale = clamp(s.morale, 0, 100);
    s.burnout = 0;
    return;
  }

  let sumMorale = 0;
  let sumBurnout = 0;
  emps.forEach(e => {
    e.morale = clamp(Math.round(e.morale), 0, 100);
    e.burnout = clamp(Math.round(e.burnout), 0, 100);
    e.skill = clamp(Math.round(e.skill), 1, 100);
    e.loyalty = clamp(Math.round(e.loyalty), 0, 100);
    sumMorale += e.morale;
    sumBurnout += e.burnout;
  });

  s.morale = clamp(Math.round(sumMorale / emps.length), 0, 100);
  s.burnout = clamp(Math.round(sumBurnout / emps.length), 0, 100);
}

/**
 * 채용 비용 계산 헬퍼
 */
function calcHireCost(job, channel) {
  if (!job || !channel) return 0;
  let cost = channel.cost || 0;
  if (channel.costSalaryRatio && channel.costSalaryRatio > 0) {
    const annualSalary = job.salary * (channel.salaryMul || 1.0) * 12;
    cost += Math.round(annualSalary * channel.costSalaryRatio);
  }
  return cost;
}

/**
 * 직원 채용 실행
 * @param {string} jobId
 * @param {string} channelId
 */
function hireEmployee(jobId, channelId) {
  const s = window.state;
  if (!s) return { ok: false, reason: '상태가 초기화되지 않았습니다.' };

  const job = getJobDef(jobId);
  const channel = getChannelDef(channelId || 'wanted');
  if (!job || !channel) {
    return { ok: false, reason: '유효하지 않은 직군 또는 채용 채널입니다.' };
  }

  // 산학협력(lab) 등 특정 직군 제한 검증
  if (Array.isArray(channel.jobs) && channel.jobs.length > 0 && !channel.jobs.includes(jobId)) {
    if (typeof window.showToast === 'function') {
      window.showToast(`⚠️ [${channel.name}] 채널은 해당 직군을 채용할 수 없습니다.`);
    }
    return { ok: false, reason: '해당 채널로 채용할 수 없는 직군입니다.' };
  }

  // 졸업 시즌(2월/8월) 제한 검증
  if (Array.isArray(channel.months) && channel.months.length > 0 && !channel.months.includes(s.calendarMonth)) {
    if (typeof window.showToast === 'function') {
      window.showToast(`🎓 [${channel.name}]은 졸업 시즌(2월, 8월)에만 오픈됩니다! (현재 ${s.calendarMonth}월)`);
    }
    return { ok: false, reason: '졸업 시즌(2월, 8월)에만 이용 가능한 채널입니다.' };
  }

  const upfrontCost = calcHireCost(job, channel);
  if (s.money < upfrontCost) {
    if (typeof window.showToast === 'function') {
      window.showToast(`💸 채용 비용이 부족합니다! (필요: ${window.formatKRW(upfrontCost)})`);
    }
    return { ok: false, reason: '채용 비용이 부족합니다.' };
  }

  s.money -= upfrontCost;

  // 숙련도(skill) 산출
  const [minSkill, maxSkill] = channel.skillRange || [30, 70];
  let skill = Math.floor(minSkill + Math.random() * (maxSkill - minSkill + 1));

  // 주 4.5일제 채용 품질 보너스 (+10)
  if (s.welfare && s.welfare.work45) {
    skill += 10;
  }
  // 블라인드 폭로 등 채용 품질 modifier 반영
  if (typeof window.getStatModifier === 'function') {
    const hireMod = window.getStatModifier('hireQuality');
    skill = Math.round(skill * hireMod.mul + hireMod.add);
  }
  skill = clamp(skill, 1, 100);

  // 물경력(isFake) 판정 (헤드헌터 15% 확률)
  const isFake = Boolean(channel.fakeRisk && Math.random() < channel.fakeRisk);

  // 급여 산출
  const salaryMul = channel.salaryMul || 1.0;
  const salary = Math.round(job.salary * salaryMul);

  // 초기 충성도 산출
  let loyalty = 50 + (channel.loyaltyBonus || 0);
  if (s.welfare && s.welfare.stockPool) {
    loyalty += 25;
  }
  loyalty = clamp(loyalty, 0, 100);

  // CFO 채용 시 스톡옵션 2% 요구 반영
  let initialStockOption = 0;
  if (jobId === 'cfo' && s.ceoEquity >= 2) {
    s.ceoEquity = Math.max(0, Number((s.ceoEquity - 2).toFixed(2)));
    initialStockOption = 2;
    loyalty = clamp(loyalty + 15, 0, 100);
  }

  const emp = {
    uid: s.empUidCounter++,
    jobId: job.id,
    name: pickKoreanName(s.employees),
    skill,
    morale: 75,
    burnout: 10,
    loyalty,
    salary,
    stockOption: initialStockOption,
    monthsEmployed: 0,
    growthMul: channel.growthMul || 1.0,
    isFake,
    channelId: channel.id
  };

  s.employees.push(emp);
  s.flags.hadEmployees = true;
  syncHrAggregates();

  // 경쟁사 인력 빼오기(poach) 시 20% 확률로 내용증명(법무 비용/평판 하락) 발생
  if (channel.lawsuitRisk && Math.random() < channel.lawsuitRisk) {
    const legalFee = 5000000;
    s.money -= legalFee;
    s.reputation = clamp(s.reputation - 5, 0, 100);
    s.ceoStress = clamp(s.ceoStress + 8, 0, 100);
    if (typeof window.showToast === 'function') {
      window.showToast(`⚖️ 경쟁사에서 영업비밀 침해 내용증명을 보냈습니다! (법무대응 -500만 원, 평판 -5)`);
    }
  } else if (typeof window.showToast === 'function') {
    const fakeNotice = isFake ? ' (⚠️ 면접 때와 달리 실무가 어설픕니다...)' : '';
    window.showToast(`🎉 [${job.name}] ${emp.name}(숙련도 ${emp.skill}) 채용 완료!${fakeNotice}`);
  }

  return { ok: true, employee: emp, cost: upfrontCost };
}

/**
 * 직원 해고 (권고사직: 위로금 1개월치 지급 시 사기 타격 완화, 미지급 시 잔류 직원 사기 -5)
 * @param {number} empUid
 */
function fireEmployee(empUid) {
  const s = window.state;
  if (!s) return { ok: false };

  const idx = s.employees.findIndex(e => e.uid === Number(empUid));
  if (idx === -1) return { ok: false, reason: '직원을 찾을 수 없습니다.' };

  const emp = s.employees[idx];
  const severance = emp.salary;
  s.employees.splice(idx, 1);

  if (s.money >= severance) {
    s.money -= severance;
    s.employees.forEach(other => {
      other.morale = clamp(other.morale - 3, 0, 100);
    });
    if (typeof window.showToast === 'function') {
      window.showToast(`👋 ${emp.name} 권고사직 처리 완료 (위로금 ${window.formatKRW(severance)} 지급)`);
    }
  } else {
    s.employees.forEach(other => {
      other.morale = clamp(other.morale - 5, 0, 100);
    });
    s.reputation = clamp(s.reputation - 3, 0, 100);
    if (typeof window.showToast === 'function') {
      window.showToast(`👋 ${emp.name} 해고 완료 (잔류 직원 사기 -5)`);
    }
  }

  syncHrAggregates();

  // 직원 전멸 + 대표 스트레스 100 도달 시 체크는 엔딩 시스템 및 월간 정산과 연동
  return { ok: true, fired: emp };
}

/**
 * 직원 개별 보너스 또는 스톡옵션 부여
 * @param {number} empUid
 * @param {'bonus'|'stock'} type
 */
function giveBonusOrStock(empUid, type) {
  const s = window.state;
  if (!s) return { ok: false };

  const emp = s.employees.find(e => e.uid === Number(empUid));
  if (!emp) return { ok: false, reason: '직원을 찾을 수 없습니다.' };

  if (type === 'bonus') {
    const bonusCost = emp.salary;
    if (s.money < bonusCost) {
      if (typeof window.showToast === 'function') {
        window.showToast(`💸 특별 성과급 자금이 부족합니다! (필요: ${window.formatKRW(bonusCost)})`);
      }
      return { ok: false, reason: '자금이 부족합니다.' };
    }
    s.money -= bonusCost;
    emp.morale = clamp(emp.morale + 20, 0, 100);
    emp.burnout = clamp(emp.burnout - 15, 0, 100);
    emp.loyalty = clamp(emp.loyalty + 5, 0, 100);
    syncHrAggregates();
    if (typeof window.showToast === 'function') {
      window.showToast(`💰 ${emp.name}에게 성과급 ${window.formatKRW(bonusCost)} 지급! (사기 +20, 번아웃 -15)`);
    }
    return { ok: true, type: 'bonus', employee: emp };
  }

  if (type === 'stock') {
    if (s.ceoEquity < 1) {
      if (typeof window.showToast === 'function') {
        window.showToast(`📉 부여할 대표 지분이 부족합니다! (현재 지분: ${s.ceoEquity}%)`);
      }
      return { ok: false, reason: '대표 지분이 부족합니다.' };
    }
    if (emp.stockOption >= 10) {
      if (typeof window.showToast === 'function') {
        window.showToast(`⚠️ 개인당 스톡옵션 한도(10%)에 도달했습니다.`);
      }
      return { ok: false, reason: '개인당 스톡옵션 한도 초과' };
    }
    s.ceoEquity = Math.max(0, Number((s.ceoEquity - 1).toFixed(2)));
    emp.stockOption = Number((emp.stockOption + 1).toFixed(2));
    emp.loyalty = clamp(emp.loyalty + 25, 0, 100);
    emp.morale = clamp(emp.morale + 15, 0, 100);
    syncHrAggregates();
    if (typeof window.showToast === 'function') {
      window.showToast(`📜 ${emp.name}에게 스톡옵션 1% 부여! (충성도 +25, 사기 +15)`);
    }
    return { ok: true, type: 'stock', employee: emp };
  }

  return { ok: false, reason: '알 수 없는 보상 유형입니다.' };
}

/**
 * 사내 복지 / 조직문화 정책 토글 또는 1회성 발동
 * @param {string} policyId
 */
function toggleWelfare(policyId) {
  const s = window.state;
  if (!s) return { ok: false };

  const policy = getWelfareDef(policyId);
  if (!policy) return { ok: false, reason: '존재하지 않는 복지 정책입니다.' };

  s.welfare = s.welfare || {};

  // 1) 토글형 정책 (lunch, remote, work45)
  if (policy.isToggle) {
    s.welfare[policyId] = !s.welfare[policyId];
    const active = s.welfare[policyId];
    if (active) {
      s.employees.forEach(e => {
        e.morale = clamp(e.morale + 4, 0, 100);
      });
    } else {
      s.employees.forEach(e => {
        e.morale = clamp(e.morale - 4, 0, 100);
      });
    }
    syncHrAggregates();
    if (typeof window.showToast === 'function') {
      window.showToast(`${active ? '✅' : '⏹️'} [${policy.name}] ${active ? '활성화' : '해제'} 완료`);
    }
    return { ok: true, active };
  }

  // 2) 영구 1회성 장비/스톡옵션 풀 설정 (macbook, stockPool)
  if (policyId === 'macbook') {
    if (s.welfare.macbook) {
      if (typeof window.showToast === 'function') {
        window.showToast('💻 이미 최고급 맥북/듀얼모니터 장비 지원이 적용되어 있습니다.');
      }
      return { ok: false, reason: '이미 적용된 정책입니다.' };
    }
    const count = Math.max(1, s.employees.length);
    const totalCost = policy.oneTimeCostPerEmp * count;
    if (s.money < totalCost) {
      if (typeof window.showToast === 'function') {
        window.showToast(`💸 장비 구매 비용이 부족합니다! (필요: ${window.formatKRW(totalCost)})`);
      }
      return { ok: false, reason: '자금 부족' };
    }
    s.money -= totalCost;
    s.welfare.macbook = true;
    s.employees.forEach(e => {
      e.morale = clamp(e.morale + 6, 0, 100);
    });
    syncHrAggregates();
    if (typeof window.showToast === 'function') {
      window.showToast(`💻 맥북/듀얼모니터 보급 완료! (-${window.formatKRW(totalCost)}, 숙련도 성장 +10%)`);
    }
    return { ok: true };
  }

  if (policyId === 'stockPool') {
    if (s.welfare.stockPool) {
      if (typeof window.showToast === 'function') {
        window.showToast('📜 이미 전사 스톡옵션 풀(10%)이 설정되어 있습니다.');
      }
      return { ok: false, reason: '이미 적용된 정책입니다.' };
    }
    if (s.ceoEquity < policy.equityCost) {
      if (typeof window.showToast === 'function') {
        window.showToast(`📉 출연할 대표 지분이 부족합니다! (필요: ${policy.equityCost}%)`);
      }
      return { ok: false, reason: '대표 지분 부족' };
    }
    s.ceoEquity = Math.max(0, Number((s.ceoEquity - policy.equityCost).toFixed(2)));
    s.welfare.stockPool = true;
    s.employees.forEach(e => {
      e.loyalty = clamp(e.loyalty + 25, 0, 100);
      e.morale = clamp(e.morale + 10, 0, 100);
    });
    syncHrAggregates();
    if (typeof window.showToast === 'function') {
      window.showToast('📜 전사 스톡옵션 풀 10% 설정 완료! (전 직원 충성도 +25)');
    }
    return { ok: true };
  }

  // 3) 반복 실행 가능한 액션형 문화 (dinner_forced, family_slogan)
  if (policyId === 'dinner_forced') {
    if (s.money < policy.flatCost) {
      if (typeof window.showToast === 'function') {
        window.showToast(`💸 회식비가 부족합니다! (필요: ${window.formatKRW(policy.flatCost)})`);
      }
      return { ok: false, reason: '회식비 부족' };
    }
    s.money -= policy.flatCost;
    s.ceoStress = clamp(s.ceoStress - 5, 0, 100); // 대표는 즐거움
    s.employees.forEach(e => {
      const isSenior = e.jobId === 'cfo' || e.skill >= 80;
      const delta = isSenior ? 2 : -3;
      e.morale = clamp(e.morale + delta, 0, 100);
    });
    syncHrAggregates();
    if (typeof window.showToast === 'function') {
      window.showToast('🍻 강제 회식 실시! 대표 스트레스 -5, MZ 직원 사기 -3 (시니어 +2)');
    }
    return { ok: true };
  }

  if (policyId === 'family_slogan') {
    s.employees.forEach(e => {
      e.morale = clamp(e.morale - 10, 0, 100);
    });
    if (s.employees.length === 0) {
      s.morale = clamp(s.morale - 10, 0, 100);
    }
    syncHrAggregates();
    if (typeof window.showToast === 'function') {
      window.showToast('😇 "우리는 가족 같은 회사입니다!" → 전 직원 사기 -10');
    }
    return { ok: true };
  }

  return { ok: false };
}

/**
 * 전체 재직 직원 및 복지 정책으로부터 파생되는 종합 HR 보너스 계산
 */
function getHrEffects() {
  const s = window.state;
  const result = {
    uptimeBonus: 0,
    recoveryTimeMul: 1.0,
    saasIncomeBonus: 0,
    researchSpeedBonus: 0,
    cloudIncomeBonus: 0,
    bugRateReduction: 0,
    grantAuditRiskReduction: 0,
    grantPassRateBonus: 0,
    marketingEffBonus: 0,
    churnReduction: 0,
    corpIncomeBonus: 0,
    gpuFailRateReduction: 0,
    modSuccessBonus: 0,
    loanRateReduction: 0,
    valuationBonus: 0,
    hasAdminStaff: false,
    hasTechnician: false,
    monthlyPayroll: 0,
    monthlyWelfareCost: 0
  };

  if (!s) return result;
  const emps = s.employees || [];
  const welfare = s.welfare || {};

  // 1) 인턴(intern)의 모든 직군 업무 보조 배율 합산 (allAssist: 기본 10% * 숙련도비율)
  let internAssistMul = 1.0;
  emps.forEach(e => {
    if (e.jobId === 'intern') {
      const job = getJobDef('intern');
      const baseAssist = (job && job.effects && job.effects.allAssist) || 0.10;
      const skillFactor = (e.skill || 50) / 50;
      const moraleFactor = e.morale < 30 ? 0.7 : 1.0;
      const fakeFactor = e.isFake ? 0.3 : 1.0;
      internAssistMul += baseAssist * skillFactor * moraleFactor * fakeFactor;
    }
  });

  // 주 4.5일제 생산성 배율 (-10%)
  const work45Mul = welfare.work45 ? 0.90 : 1.0;

  let recoveryReductionSum = 0;

  // 2) 각 직원별 효과 및 급여 합산
  emps.forEach(e => {
    const job = getJobDef(e.jobId);
    if (!job) return;

    // 정부 인건비 보조금 반영 (인턴 50% 지원 등)
    const subsidy = job.govSubsidy || 0;
    result.monthlyPayroll += Math.round(e.salary * (1 - subsidy));

    if (e.jobId === 'admin_gov') result.hasAdminStaff = true;
    if (e.jobId === 'technician') result.hasTechnician = true;

    const skillFactor = (e.skill || 50) / 50;
    const moraleFactor = e.morale < 30 ? 0.7 : 1.0;
    const fakeFactor = e.isFake ? 0.3 : 1.0;
    const effMul = skillFactor * moraleFactor * fakeFactor * internAssistMul * work45Mul;

    const eff = job.effects || {};
    if (eff.uptime) result.uptimeBonus += eff.uptime * effMul;
    if (eff.recoveryTime) recoveryReductionSum += Math.abs(eff.recoveryTime) * effMul;
    if (eff.saasIncome) result.saasIncomeBonus += eff.saasIncome * effMul;
    if (eff.researchSpeed) result.researchSpeedBonus += eff.researchSpeed * effMul;
    if (eff.cloudIncome) result.cloudIncomeBonus += eff.cloudIncome * effMul;
    if (eff.bugRate) result.bugRateReduction += Math.abs(eff.bugRate) * effMul;
    if (eff.grantAuditRisk) result.grantAuditRiskReduction += Math.abs(eff.grantAuditRisk) * effMul;
    if (eff.grantPassRate) result.grantPassRateBonus += eff.grantPassRate * effMul;
    if (eff.marketingEff) result.marketingEffBonus += eff.marketingEff * effMul;
    if (eff.churn) result.churnReduction += Math.abs(eff.churn) * effMul;
    if (eff.corpIncome) result.corpIncomeBonus += eff.corpIncome * effMul;
    if (eff.gpuFailRate) result.gpuFailRateReduction += Math.abs(eff.gpuFailRate) * effMul;
    if (eff.modSuccess) result.modSuccessBonus += eff.modSuccess * effMul;
    if (eff.loanRate) result.loanRateReduction += Math.abs(eff.loanRate) * effMul;
    if (eff.valuation) result.valuationBonus += eff.valuation * effMul;
  });

  // 상한선 캡핑 (과도한 100% 초과 방지)
  result.uptimeBonus = clamp(result.uptimeBonus, 0, 0.50);
  result.bugRateReduction = clamp(result.bugRateReduction, 0, 0.85);
  result.grantAuditRiskReduction = clamp(result.grantAuditRiskReduction, 0, 0.90);
  result.grantPassRateBonus = clamp(result.grantPassRateBonus, 0, 0.45);
  result.churnReduction = clamp(result.churnReduction, 0, 0.75);
  result.gpuFailRateReduction = clamp(result.gpuFailRateReduction, 0, 0.85);
  result.modSuccessBonus = clamp(result.modSuccessBonus, 0, 0.45);
  result.loanRateReduction = clamp(result.loanRateReduction, 0, 0.03);

  // 장애 복구시간 배율 계산 (재택근무 시 대응속도 20% 페널티)
  let recMul = Math.max(0.25, 1.0 - Math.min(0.75, recoveryReductionSum));
  if (welfare.remote) {
    recMul *= 1.20;
  }
  result.recoveryTimeMul = Number(recMul.toFixed(2));

  // 월간 복지 비용 합산 (점심 식대 인당 20만 원)
  if (welfare.lunch) {
    result.monthlyWelfareCost += 200000 * emps.length;
  }

  return result;
}

/**
 * 매 게임월(60초) 호출되는 인사 정산 함수
 * - 급여 및 복지비 지출 / 임금체불 페널티
 * - 근속월수, 숙련도 성장, 번아웃 누적, 공식 기반 사기(morale) 변동
 * - 퇴사 확률 판정 및 B4 배드엔딩 조건 연동
 */
function settleMonthlyHR() {
  const s = window.state;
  if (!s) return { payrollPaid: 0, quitList: [] };

  const emps = s.employees || [];
  const hrEff = getHrEffects();
  const totalCost = hrEff.monthlyPayroll + hrEff.monthlyWelfareCost;
  const quitList = [];

  if (emps.length === 0) {
    syncHrAggregates();
    return { payrollPaid: 0, quitList };
  }

  // 1) 급여 및 복지비 정산 (잔고 부족 시 임금체불/마이너스 통장 처리)
  let unpaidSalary = false;
  if (s.money >= totalCost) {
    s.money -= totalCost;
  } else {
    // 현금이 부족한 경우: 차액만큼 마이너스 처리하되 임금체불 충격(사기 -20, 신용점수 하락)
    s.money -= totalCost;
    unpaidSalary = true;
    s.creditScore = clamp(s.creditScore - 30, 0, 1000);
    s.creditTier = typeof window.getCreditTier === 'function' ? window.getCreditTier(s.creditScore) : s.creditTier;
    s.ceoStress = clamp(s.ceoStress + 12, 0, 100);
    if (typeof window.showToast === 'function') {
      window.showToast('🚨 월급날 잔고 부족! 마통/체불 충격으로 직원 사기 급락 및 대표 신용도 -30');
    }
  }

  // 회사 분위기 보정 (복지 토글 합산)
  let companyMoodBonus = 0;
  if (s.welfare && s.welfare.lunch) companyMoodBonus += 5;
  if (s.welfare && s.welfare.remote) companyMoodBonus += 8;
  if (s.welfare && s.welfare.work45) companyMoodBonus += 12;

  const macbookGrowthMul = (s.welfare && s.welfare.macbook) ? 1.10 : 1.0;

  // 서버 과열/차단기 내려감 여부에 따른 야근/장애 스트레스 가중치
  const hasServerCrisis = (s.offices || []).some(o => o.isTripped || o.temp >= 80);

  // 2) 개별 직원 월간 스탯 업데이트 및 퇴사 판정
  const remainingEmployees = [];

  emps.forEach(emp => {
    const job = getJobDef(emp.jobId);
    const marketSalary = job ? job.salary : emp.salary;
    const burnoutRate = job ? job.burnoutRate : 1.0;

    emp.monthsEmployed = (emp.monthsEmployed || 0) + 1;

    // 숙련도 성장 (기본 월 1.2 * 채널 성장배율 * 맥북 보너스)
    const rawSkillGain = 1.2 * (emp.growthMul || 1.0) * macbookGrowthMul;
    emp.skill = clamp(Math.round(emp.skill + rawSkillGain), 1, 100);

    // 인턴 3개월 경과 시 정규직 전환(월급 현실화) 자동 요구 반영
    if (emp.jobId === 'intern' && emp.monthsEmployed === 3) {
      emp.salary += 800000;
      emp.loyalty = clamp(emp.loyalty + 10, 0, 100);
      if (typeof window.showToast === 'function') {
        window.showToast(`📋 인턴 ${emp.name}이(가) 3개월 수습 종료 후 정식 계약으로 전환되었습니다.`);
      }
    }

    // 번아웃 누적 (주 4.5일제 시 완화, 서버 장애 시 DevOps 등 가중)
    let monthlyBurnoutDelta = 3.0 * burnoutRate;
    if (hasServerCrisis && (emp.jobId === 'devops' || emp.jobId === 'technician')) {
      monthlyBurnoutDelta += 5.0;
    }
    if (s.welfare && s.welfare.work45) {
      monthlyBurnoutDelta -= 4.0;
    }
    if (s.welfare && s.welfare.remote) {
      monthlyBurnoutDelta -= 1.5;
    }
    emp.burnout = clamp(Math.round(emp.burnout + monthlyBurnoutDelta), 0, 100);

    // 급여 만족도 공식: ((salary / 시장가) - 1.0) * 20
    const salarySatisfaction = ((emp.salary / marketSalary) - 1.0) * 20;

    // 매달 정산 공식 (01_hr_hiring_burnout.md):
    // morale += (회사 분위기 보정) - (burnout × 0.1) + (급여 만족도)
    let moraleDelta = companyMoodBonus - (emp.burnout * 0.1) + salarySatisfaction;
    if (unpaidSalary) {
      moraleDelta -= 20;
    }
    emp.morale = clamp(Math.round(emp.morale + moraleDelta), 0, 100);

    // 퇴사 확률(월, %) = max(0, (40 - morale) * 0.8 + (burnout - 70) * 1.2 - loyalty * 0.3)
    let quitChancePct = 0;
    if (emp.morale < 40) {
      quitChancePct += (40 - emp.morale) * 0.8;
    }
    if (emp.burnout > 70) {
      quitChancePct += (emp.burnout - 70) * 1.2;
    }
    quitChancePct -= (emp.loyalty || 0) * 0.3;

    // morale < 10 또는 burnout >= 90 위기 상황 추가 보정
    if (emp.morale < 10) quitChancePct += 15;
    if (emp.burnout >= 90) quitChancePct += 15;

    quitChancePct = Math.max(0, quitChancePct);

    const roll = Math.random() * 100;
    if (roll < quitChancePct) {
      quitList.push(emp);
    } else {
      remainingEmployees.push(emp);
    }
  });

  // 3) 퇴사자 발생 시 후속 처리 (리퍼럴 추천인 사기 하락, 대표 스트레스 상승)
  if (quitList.length > 0) {
    s.employees = remainingEmployees;
    quitList.forEach(q => {
      s.ceoStress = clamp(s.ceoStress + 8, 0, 100);
      // 지인 추천(referral) 직원이 퇴사하면 남은 직원(추천인) 사기 -15
      if (q.channelId === 'referral' && s.employees.length > 0) {
        const refTarget = s.employees[Math.floor(Math.random() * s.employees.length)];
        refTarget.morale = clamp(refTarget.morale - 15, 0, 100);
      }
    });

    if (typeof window.showToast === 'function') {
      const names = quitList.map(q => q.name).join(', ');
      window.showToast(`💔 퇴사 발생: ${names}님이 사직서를 제출하고 회사를 떠났습니다! (대표 스트레스 상승)`);
    }
  }

  syncHrAggregates();

  // 4) B4 배드엔딩 조건 점검 보조 (전원 퇴사 + 대표 스트레스 100)
  if (s.flags.hadEmployees && s.employees.length === 0) {
    s.ceoStress = clamp(s.ceoStress + 10, 0, 100);
    if (s.ceoStress >= 100 && window.Systems && window.Systems.endings && typeof window.Systems.endings.checkEndings === 'function') {
      window.Systems.endings.checkEndings();
    }
  }

  return {
    payrollPaid: totalCost,
    unpaidSalary,
    quitList
  };
}

const hrSystem = {
  hireEmployee,
  fireEmployee,
  giveBonusOrStock,
  toggleWelfare,
  getHrEffects,
  settleMonthlyHR,
  syncHrAggregates,
  calcHireCost
};

window.Systems.hr = hrSystem;
window.hireEmployee = hireEmployee;
window.fireEmployee = fireEmployee;
window.giveBonusOrStock = giveBonusOrStock;
window.toggleWelfare = toggleWelfare;
window.getHrEffects = getHrEffects;
window.settleMonthlyHR = settleMonthlyHR;
