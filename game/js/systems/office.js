/**
 * game/js/systems/office.js
 * 사업장 운영, GPU 조달(당근/신품/리스), 글로벌 스펙 연산, 대출/상장/거래소 시스템
 */

window.Systems = window.Systems || {};

function getOfficeWithAvailableSlot() {
  for (const office of state.offices) {
    const preset = window.GAME_DATA.offices.find(p => p.id === office.presetId) || window.GAME_DATA.offices[0];
    if (office.gpus.length < preset.slots) {
      return office;
    }
  }
  return null;
}

function createGpuInstance(modelKey, isMining = false, isBroken = false) {
  const spec = window.GAME_DATA.gpus[modelKey] || window.GAME_DATA.gpus.gtx1060;
  return {
    uid: state.gpuUidCounter++,
    model: modelKey,
    health: isBroken ? 0 : (isMining ? Math.floor(60 + Math.random() * 25) : 100),
    efficiency: 1.0,
    clockMul: 1.0,
    tempOffset: 0,
    wearMul: isMining ? 1.3 : 1.0,
    miningMul: 1.0,
    mods: [],
    warranty: isMining ? 0 : (spec.warrantyMonths || 24),
    isMining: !!isMining,
    isBroken: !!isBroken
  };
}

function calculateGlobalSpecs() {
  const hrEffects = (window.Systems.hr && typeof window.Systems.hr.getHrEffects === 'function')
    ? window.Systems.hr.getHrEffects()
    : {
        uptimeBonus: 0,
        recoveryTimeMul: 1,
        saasIncomeBonus: 0,
        cloudIncomeBonus: 0,
        corpIncomeBonus: 0,
        marketingEffBonus: 0,
        loanRateReduction: 0,
        valuationBonus: 0,
        monthlyPayroll: 0,
        monthlyWelfareCost: 0
      };

  const season = getSeasonInfo(state.calendarMonth);
  const tflopsMod = getStatModifier('tflops');
  const powerMod = getStatModifier('power');
  const rentMod = getStatModifier('rent');
  const elecPriceMod = getStatModifier('electricPrice');

  let totalTflops = 0;
  let totalItPowerW = 0;
  let totalCoolingPowerW = 0;
  let totalRentMonthly = 0;
  let totalGpuCount = 0;
  let weightedPueSum = 0;

  state.offices.forEach(office => {
    const preset = window.GAME_DATA.offices.find(p => p.id === office.presetId) || window.GAME_DATA.offices[0];
    const officeRent = (office.customRent || preset.monthlyRent) * rentMod.mul + rentMod.add;
    const officeMaint = preset.maintenanceFee || 0;
    totalRentMonthly += Math.max(0, Math.round(officeRent + officeMaint));

    let officeItPower = 0;
    office.gpus.forEach(gpu => {
      totalGpuCount++;
      if (!gpu.isBroken && !office.isTripped && !office.thermalShutdown) {
        let effTf = 0;
        let effPower = 0;
        if (window.Systems.hardware && typeof window.Systems.hardware.getGpuEffectiveSpecs === 'function') {
          const eff = window.Systems.hardware.getGpuEffectiveSpecs(gpu, office.temp);
          effTf = eff.tflops;
          effPower = eff.power;
        } else {
          const spec = window.GAME_DATA.gpus[gpu.model];
          if (spec) {
            effTf = spec.tflops * (gpu.clockMul || 1.0) * (gpu.health < 30 ? 0.7 : 1.0);
            effPower = spec.power * Math.pow(gpu.clockMul || 1.0, 2) / (gpu.efficiency || 1.0);
          }
        }
        totalTflops += effTf;
        officeItPower += effPower;
      }
    });

    totalItPowerW += officeItPower;

    let officePue = 1.4;
    if (window.Systems.hardware && typeof window.Systems.hardware.calculateOfficePUE === 'function') {
      officePue = window.Systems.hardware.calculateOfficePUE(office);
    } else {
      const coolPower = Math.max(50, (preset.coolingRate + (office.extraCooling || 0)) * 80);
      officePue = officeItPower > 0 ? clamp((officeItPower + coolPower) / officeItPower, 1.05, 2.5) : 1.3;
    }
    office.pue = officePue;
    weightedPueSum += officePue * Math.max(100, officeItPower);
    totalCoolingPowerW += officeItPower * Math.max(0.05, officePue - 1.0);
  });

  // Apply HR uptime & global modifiers to TFLOPS
  totalTflops = totalTflops * (1 + (hrEffects.uptimeBonus || 0)) * tflopsMod.mul + tflopsMod.add;
  totalTflops = Math.max(0, totalTflops);

  const avgPue = totalItPowerW > 0
    ? clamp((totalItPowerW + totalCoolingPowerW) / totalItPowerW, 1.05, 2.5)
    : 1.35;
  state.pue = Number(avgPue.toFixed(2));
  if (state.pue <= 1.2 && totalItPowerW >= 5000) {
    state.flags.greenDcCertified = true;
  }

  // Electricity Bill Calculation (Monthly)
  let kwhPrice = 145 * season.electricMul * elecPriceMod.mul;
  if (state.flags.greenDcCertified) kwhPrice *= 0.9;
  const hasSolarAny = state.offices.some(o => o.hasSolar);
  if (hasSolarAny) kwhPrice *= 0.9;

  // 신림동 주택용 누진제 3단계 계산 (200kWh 이하 120원, 201~400kWh 215원, 400kWh 초과 307원)
  let sinrimElectricCost = 0;
  let otherElectricCost = 0;

  state.offices.forEach(office => {
    const preset = window.GAME_DATA.offices.find(p => p.id === office.presetId) || window.GAME_DATA.offices[0];
    let officeItW = 0;
    office.gpus.forEach(g => {
      if (!g.isBroken && !office.isTripped && !office.thermalShutdown) {
        const sp = window.GAME_DATA.gpus[g.model];
        if (sp) officeItW += sp.power * (g.clockMul || 1.0);
      }
    });
    const officePue = office.pue || 1.35;
    const monthlyKwh = (officeItW * officePue * powerMod.mul * 720) / 1000;

    if (office.presetId === 'room_sinrim') {
      if (monthlyKwh <= 200) {
        sinrimElectricCost = monthlyKwh * 120;
      } else if (monthlyKwh <= 400) {
        sinrimElectricCost = (200 * 120) + ((monthlyKwh - 200) * 215);
      } else {
        sinrimElectricCost = (200 * 120) + (200 * 215) + ((monthlyKwh - 400) * 307);
      }
      sinrimElectricCost *= season.electricMul * elecPriceMod.mul;
    } else {
      otherElectricCost += monthlyKwh * kwhPrice;
      // 한전 상가/산업용 계약전력 피크 초과 과징금 (초과 사용량 160% 할증)
      let maxPower = preset.maxPower + (office.extraPower || 0);
      if (window.GAME_DATA.powerTech && office.powerTier) {
        const pt = window.GAME_DATA.powerTech.find(p => p.id === office.powerTier);
        if (pt && pt.capacityW) maxPower = Math.max(maxPower, pt.capacityW + (office.extraPower || 0));
      }
      if (officeItW > maxPower) {
        const overW = officeItW - maxPower;
        const overKwh = (overW * officePue * powerMod.mul * 720) / 1000;
        otherElectricCost += overKwh * kwhPrice * 1.6;
      }
    }
  });

  const monthlyElectricBill = Math.round(sinrimElectricCost + otherElectricCost);

  // Loan Interests
  let monthlyLoanInterest = 0;
  state.loans.forEach(loan => {
    const effRate = Math.max(0.01, loan.interestRate - (hrEffects.loanRateReduction || 0));
    monthlyLoanInterest += Math.floor(loan.balance * (effRate / 12));
  });

  // Lease Monthly Costs
  let monthlyLeaseCost = 0;
  if (Array.isArray(state.leases)) {
    state.leases.forEach(l => {
      monthlyLeaseCost += l.monthly;
    });
  }

  const monthlyPayroll = (hrEffects.monthlyPayroll || 0) + (hrEffects.monthlyWelfareCost || 0);
  const totalMonthlyFixedCost = totalRentMonthly + monthlyElectricBill + monthlyLoanInterest + monthlyLeaseCost + monthlyPayroll;
  const fixedCostPerSec = totalMonthlyFixedCost / 60;

  // Workload Revenue Calculations
  const alloc = state.workloadAlloc;
  const totalPct = alloc.crypto + alloc.cloud + alloc.saas + alloc.corp;
  const normFactor = totalPct > 100 ? (100 / totalPct) : 1.0;

  const cryptoTflops = totalTflops * ((alloc.crypto * normFactor) / 100);
  const cloudTflops = totalTflops * ((alloc.cloud * normFactor) / 100);
  const saasTflops = totalTflops * ((alloc.saas * normFactor) / 100);
  const corpTflops = totalTflops * ((alloc.corp * normFactor) / 100);

  const cryptoMod = getStatModifier('cryptoIncome');
  const cloudMod = getStatModifier('cloudIncome');
  const saasMod = getStatModifier('saasIncome');
  const corpMod = getStatModifier('corpIncome');
  const allIncomeMod = getStatModifier('allIncome');

  // 1. Crypto Mining (1 TF -> ~0.000025 ETH/sec)
  const ethPerSec = cryptoTflops * 0.000025 * cryptoMod.mul * allIncomeMod.mul;

  // 2. Cloud Spot Rental (Finals months 6 & 12 boost demand x1.4, ~850 KRW/sec per 10 TF - 밸런스 조정)
  const finalsBoost = (state.calendarMonth === 6 || state.calendarMonth === 12) ? 1.4 : 1.0;
  const cloudIncomePerSec = (cloudTflops / 10) * 850 * (1 + (hrEffects.cloudIncomeBonus || 0)) * finalsBoost * cloudMod.mul * allIncomeMod.mul;

  // 3. Proprietary AI SaaS (High margin when paired with marketing & AI researcher)
  const supportedUsers = Math.floor(saasTflops * 45);
  const activeSaaSUsers = Math.min(state.saasUsers, Math.max(10, supportedUsers));
  const saasIncomePerSec = activeSaaSUsers * 5.2 * (1 + (hrEffects.saasIncomeBonus || 0)) * saasMod.mul * allIncomeMod.mul;

  // 4. Enterprise LLM Cluster (unlocks at >= 800 TFLOPS)
  let corpIncomePerSec = 0;
  if (corpTflops >= 800) {
    corpIncomePerSec = (corpTflops / 100) * 21000 * (1 + (hrEffects.corpIncomeBonus || 0)) * corpMod.mul * allIncomeMod.mul;
  }

  const grossCashPerSec = cloudIncomePerSec + saasIncomePerSec + corpIncomePerSec;
  const netCashPerSec = grossCashPerSec - fixedCostPerSec;

  state.totalTflops = Math.round(totalTflops);
  state.monthlyProfit = Math.round(netCashPerSec * 60);

  return {
    totalTflops: Math.round(totalTflops),
    totalPowerUsage: Math.round(totalItPowerW),
    totalCoolingPowerW: Math.round(totalCoolingPowerW),
    avgPue: state.pue,
    totalRentMonthly,
    monthlyElectricBill,
    monthlyLoanInterest,
    monthlyLeaseCost,
    monthlyPayroll,
    totalMonthlyFixedCost,
    fixedCostPerSec,
    totalGpuCount,
    cryptoTflops: Math.round(cryptoTflops),
    cloudTflops: Math.round(cloudTflops),
    saasTflops: Math.round(saasTflops),
    corpTflops: Math.round(corpTflops),
    ethPerSec,
    cloudIncomePerSec,
    saasIncomePerSec,
    corpIncomePerSec,
    grossCashPerSec,
    netCashPerSec
  };
}

function calculateSpecsGlobalSafe() {
  try {
    return calculateGlobalSpecs();
  } catch (e) {
    console.error('calculateGlobalSpecs error:', e);
    return {
      totalTflops: 0, totalPowerUsage: 0, totalCoolingPowerW: 0, avgPue: 1.4,
      totalRentMonthly: 0, monthlyElectricBill: 0, monthlyLoanInterest: 0, monthlyLeaseCost: 0, monthlyPayroll: 0,
      totalMonthlyFixedCost: 0, fixedCostPerSec: 0, totalGpuCount: 0,
      cryptoTflops: 0, cloudTflops: 0, saasTflops: 0, corpTflops: 0,
      ethPerSec: 0, cloudIncomePerSec: 0, saasIncomePerSec: 0, corpIncomePerSec: 0,
      grossCashPerSec: 0, netCashPerSec: 0
    };
  }
}

// --- Danggeun Market ---
function refreshDanggeunDeals() {
  const models = ['gtx1060', 'gtx1060', 'rtx3060', 'rtx3060', 'rtx4090', 'a100'];
  const stories = window.GAME_DATA.danggeunStories || [];
  const newDeals = [];

  for (let i = 0; i < 4; i++) {
    const modelKey = models[Math.floor(Math.random() * models.length)];
    const spec = window.GAME_DATA.gpus[modelKey];
    const story = stories[Math.floor(Math.random() * stories.length)] || { text: '급처합니다.', discount: 0.3, isMining: false };
    const price = Math.round(spec.newPrice * (1 - story.discount));
    const manner = (36.5 + (Math.random() * 25 - 5)).toFixed(1);

    newDeals.push({
      id: Math.random().toString(36).substring(2, 9),
      model: modelKey,
      name: spec.name,
      price: price,
      originalPrice: spec.newPrice,
      mannerTemp: manner,
      story: story.text,
      isMining: !!story.isMining,
      isBroken: !!story.isBroken,
      negoDone: false
    });
  }

  state.currentDeals = newDeals;
  if (typeof renderDanggeunDeals === 'function') renderDanggeunDeals();
}

function buyDanggeunDeal(dealId) {
  if (window.sound) window.sound.init();
  const deal = state.currentDeals.find(d => d.id === dealId);
  if (!deal) return;

  const targetOffice = getOfficeWithAvailableSlot();
  if (!targetOffice) {
    showToast('❌ 모든 사업장의 랙 슬롯이 가득 찼습니다! 새 사무실을 임대하세요.');
    return;
  }

  if (state.money < deal.price) {
    showToast('❌ 현금이 부족합니다!');
    return;
  }

  state.money -= deal.price;
  if (window.sound) window.sound.playCash();

  const isActuallyBroken = deal.isBroken || (Math.random() < 0.05);
  targetOffice.gpus.push(createGpuInstance(deal.model, deal.isMining, isActuallyBroken));
  state.currentDeals = state.currentDeals.filter(d => d.id !== dealId);

  if (isActuallyBroken) {
    if (window.sound) window.sound.playAlarm();
    showToast('🚨 헉! 택배 상자에 냉납/벽돌 그래픽카드가 들어있었습니다! (리볼링 수리 필요)');
  } else {
    showToast(`🥕 당근마켓 직거래 성공! ${deal.name} 장착 완료.`);
  }

  if (typeof renderUI === 'function') renderUI();
  if (typeof renderDanggeunDeals === 'function') renderDanggeunDeals();
}

function negoDanggeunDeal(dealId) {
  if (window.sound) window.sound.init();
  const deal = state.currentDeals.find(d => d.id === dealId);
  if (!deal || deal.negoDone) return;

  deal.negoDone = true;
  if (Math.random() < 0.6) {
    const discount = Math.round(deal.price * 0.15);
    deal.price -= discount;
    if (window.sound) window.sound.playBeep(880, 0.1);
    showToast(`🎉 네고 성공! "쿨거래 조건으로 깎아드립니다." (-${formatKRW(discount)})`);
  } else {
    if (window.sound) window.sound.playBeep(300, 0.15, 'sawtooth');
    showToast('😤 판매자: "네고 사절이라고 적었을 텐데요. 차단합니다."');
  }
  if (typeof renderDanggeunDeals === 'function') renderDanggeunDeals();
}

function buyNewGpu(modelKey) {
  if (window.sound) window.sound.init();
  const spec = window.GAME_DATA.gpus[modelKey];
  if (!spec) return;

  const targetOffice = getOfficeWithAvailableSlot();
  if (!targetOffice) {
    showToast('❌ 모든 사업장의 슬롯이 가득 찼습니다! 새 사무실을 추가 임대하세요.');
    return;
  }

  if (state.money < spec.newPrice) {
    showToast('❌ 잔고가 부족합니다. 지원사업이나 대출을 활용하세요!');
    return;
  }

  state.money -= spec.newPrice;
  targetOffice.gpus.push(createGpuInstance(modelKey, false, false));

  if (window.sound) window.sound.playCash();
  showToast(`📦 공식 총판에서 ${spec.name} 신품(무상 AS ${spec.warrantyMonths}개월) 입고 완료!`);
  if (typeof renderUI === 'function') renderUI();
}

function leaseGpuServer(modelKey, deposit, monthly) {
  if (window.sound) window.sound.init();
  const targetOffice = getOfficeWithAvailableSlot();
  if (!targetOffice) {
    showToast('❌ 장착할 사업장 슬롯이 부족합니다!');
    return;
  }

  if (state.money < deposit) {
    showToast(`❌ 리스 보증금 ${formatKRW(deposit)}이 부족합니다!`);
    return;
  }

  state.money -= deposit;
  if (window.sound) window.sound.playCash();

  for (let i = 0; i < 4; i++) {
    const preset = window.GAME_DATA.offices.find(p => p.id === targetOffice.presetId) || window.GAME_DATA.offices[0];
    if (targetOffice.gpus.length < preset.slots) {
      const inst = createGpuInstance(modelKey, false, false);
      inst.isLeased = true;
      targetOffice.gpus.push(inst);
    }
  }

  state.leases.push({
    id: 'lease_' + Date.now(),
    model: modelKey,
    monthly: monthly,
    remainingMonths: 3
  });

  showToast(`🤝 엔터프라이즈 리스 체결! ${targetOffice.customName}에 고성능 서버가 투입되었습니다.`);
  if (typeof renderUI === 'function') renderUI();
}

function sellGpuFromOffice(officeUid, gpuUid) {
  if (window.sound) window.sound.init();
  const office = state.offices.find(o => o.uid === officeUid);
  if (!office) return;

  const idx = office.gpus.findIndex(g => g.uid === gpuUid);
  if (idx !== -1) {
    const gpu = office.gpus[idx];
    const spec = window.GAME_DATA.gpus[gpu.model];
    const isModded = Array.isArray(gpu.mods) && gpu.mods.length > 0;
    let refund = gpu.isBroken ? Math.round(spec.scrapVal * 0.25) : spec.scrapVal;
    if (isModded) refund = Math.round(refund * 0.7); // 개조품 감가 30%
    state.money += refund;
    office.gpus.splice(idx, 1);
    if (window.sound) window.sound.playCash();
    showToast(`💰 ${spec.name} 매각 완료 (+${formatKRW(refund)}${isModded ? ', 개조 감가 30% 적용' : ''})`);
    if (typeof renderUI === 'function') renderUI();
  }
}

function transferGpu(fromOfficeUid, toOfficeUid, gpuUid) {
  if (fromOfficeUid === toOfficeUid) return { ok: false, message: '동일한 사업장입니다.' };
  const fromOffice = state.offices.find(o => o.uid === fromOfficeUid);
  const toOffice = state.offices.find(o => o.uid === toOfficeUid);
  if (!fromOffice || !toOffice) return { ok: false, message: '사업장을 찾을 수 없습니다.' };

  const toPreset = (window.GAME_DATA.offices || []).find(p => p.id === toOffice.presetId) || { slots: 6 };
  if (toOffice.gpus.length >= toPreset.slots) {
    if (typeof showToast === 'function') {
      showToast(`❌ [${toOffice.customName}] 랙 슬롯이 가득 찼습니다! (최대 ${toPreset.slots}대)`);
    }
    return { ok: false, message: '대상 사업장 슬롯 부족' };
  }

  const gpuIdx = fromOffice.gpus.findIndex(g => g.uid === gpuUid);
  if (gpuIdx === -1) return { ok: false, message: 'GPU를 찾을 수 없습니다.' };

  const gpu = fromOffice.gpus.splice(gpuIdx, 1)[0];
  toOffice.gpus.push(gpu);

  const spec = (window.GAME_DATA.gpus && window.GAME_DATA.gpus[gpu.model]) || { name: gpu.model };
  if (window.sound && typeof window.sound.playBeep === 'function') {
    window.sound.playBeep(520, 0.12);
  }
  if (typeof showToast === 'function') {
    showToast(`🚚 [${spec.name} #${gpu.uid}] 이전 완료: ${fromOffice.customName} ➔ ${toOffice.customName}`);
  }
  if (typeof forceRebuildOffices === 'function') forceRebuildOffices();
  if (typeof renderUI === 'function') renderUI();
  return { ok: true };
}

function cleanOfficeDust(officeUid) {
  if (window.sound) window.sound.init();
  const office = state.offices.find(o => o.uid === officeUid);
  if (!office) return;
  const cost = 150000;
  if (state.money < cost) {
    showToast('❌ 청소 및 써멀 재도포 비용(15만 원)이 부족합니다.');
    return;
  }
  state.money -= cost;
  office.dust = 0;
  if (window.sound) window.sound.playBeep(640, 0.1);
  showToast(`🧹 [${office.customName}] 서버실 먼지 청소 및 써멀구리스 재도포 완료! 쿨링 효율이 정상화되었습니다.`);
  if (typeof forceRebuildOffices === 'function') forceRebuildOffices();
  if (typeof renderUI === 'function') renderUI();
}

function leaseNewOffice(presetId) {
  if (window.sound) window.sound.init();
  const preset = window.GAME_DATA.offices.find(p => p.id === presetId);
  if (!preset) return;

  if (state.money < preset.deposit) {
    showToast('❌ 임대 보증금이 부족합니다.');
    return;
  }

  state.money -= preset.deposit;
  const defaultPowerTier = presetId === 'chuncheon_dc' ? 'P5' : (presetId === 'pangyo_idc' ? 'P4' : (presetId === 'guro_jisan' ? 'P3' : 'P1'));
  const defaultCoolingTier = presetId === 'chuncheon_dc' ? 'T6' : (presetId === 'pangyo_idc' ? 'T5' : (presetId === 'guro_jisan' ? 'T3' : 'T1'));

  state.offices.push({
    uid: state.officeUidCounter++,
    presetId: presetId,
    customName: `${preset.name} (${state.offices.length + 1}호점)`,
    gpus: [],
    coolingTier: defaultCoolingTier,
    powerTier: defaultPowerTier,
    upsCount: presetId === 'pangyo_idc' ? 2 : 0,
    hasSolar: false,
    hasDieselGen: false,
    extraCooling: 0,
    extraPower: 0,
    temp: 25.0,
    pue: 1.35,
    isTripped: false,
    tripTimer: 0,
    landlordAnger: 0
  });

  if (presetId === 'chuncheon_dc') {
    state.flags.hasChuncheonDC = true;
  }
  if (presetId !== 'room_sinrim') {
    state.flags.bizRegistered = true;
  }

  if (window.sound) window.sound.playCash();
  const modal = typeof document !== 'undefined' ? document.getElementById('office-modal') : null;
  if (modal) modal.classList.remove('show');
  showToast(`🏢 축하합니다! [${preset.name}] 신규 임대 계약이 체결되었습니다!`);
  if (typeof renderUI === 'function') renderUI();
}

function terminateOfficeLease(officeUid) {
  if (state.offices.length <= 1) {
    showToast('❌ 마지막 본사 사업장은 해지할 수 없습니다.');
    return;
  }
  const office = state.offices.find(o => o.uid === officeUid);
  if (!office) return;
  if (office.gpus.length > 0) {
    showToast('⚠️ 사업장 내의 GPU를 모두 먼저 매각하거나 정리해야 합니다!');
    return;
  }

  const preset = window.GAME_DATA.offices.find(p => p.id === office.presetId);
  const depositRefund = preset ? preset.deposit : 0;
  state.money += depositRefund;
  state.offices = state.offices.filter(o => o.uid !== officeUid);
  state.flags.hasChuncheonDC = state.offices.some(o => o.presetId === 'chuncheon_dc');
  showToast(`🏢 ${office.customName} 계약 해지 및 보증금 ${formatKRW(depositRefund)} 반환 완료.`);
  if (typeof renderUI === 'function') renderUI();
}

function takeBankLoan(loanId) {
  if (window.sound) window.sound.init();
  const opt = window.GAME_DATA.loans.find(l => l.id === loanId);
  if (!opt) return;
  if (state.loans.some(l => l.id === loanId)) {
    showToast('⚠️ 이미 이용 중인 대출 상품입니다.');
    return;
  }
  if (state.creditScore < (opt.minCreditScore || 500)) {
    showToast(`❌ 신용점수가 부족합니다! (최소 ${opt.minCreditScore}점 필요)`);
    return;
  }

  state.money += opt.principal;
  state.loans.push({
    id: opt.id,
    name: opt.name,
    principal: opt.principal,
    balance: opt.principal,
    interestRate: opt.interestRate
  });

  if (window.sound) window.sound.playCash();
  showToast(`🏦 [대출 실행] ${opt.name} 승인! ${formatKRW(opt.principal)} 입금 완료.`);
  if (typeof renderUI === 'function') renderUI();
  if (typeof renderFinanceUI === 'function') renderFinanceUI();
}

function repayBankLoan(loanId) {
  if (window.sound) window.sound.init();
  const idx = state.loans.findIndex(l => l.id === loanId);
  if (idx === -1) return;
  const loan = state.loans[idx];
  if (state.money < loan.balance) {
    showToast(`❌ 상환 원금 ${formatKRW(loan.balance)}이 부족합니다.`);
    return;
  }
  state.money -= loan.balance;
  state.loans.splice(idx, 1);
  state.creditScore = clamp(state.creditScore + 25, 0, 1000);
  if (window.sound) window.sound.playCash();
  showToast(`🎉 [${loan.name}] 전액 상환 완료! 신용점수 +25점 상승!`);
  if (typeof renderUI === 'function') renderUI();
  if (typeof renderFinanceUI === 'function') renderFinanceUI();
}

function attemptKosdaqIPO() {
  if (window.sound) window.sound.init();
  if (state.flags.listed) {
    showToast('이미 코스닥에 상장된 기업입니다.');
    return;
  }
  const specs = calculateSpecsGlobalSafe();
  if (specs.totalTflops < 5000 || state.monthlyProfit <= 0 || state.creditScore < 750) {
    showToast('❌ 상장 요건 미달: 연산력 5,000 TF 이상, 월 흑자 경영, 신용등급 A(750점) 이상 필요!');
    return;
  }
  const ipoProceeds = Math.max(3000000000, Math.round(state.valuation * 0.15));
  state.flags.listed = true;
  state.money += ipoProceeds;
  state.ceoEquity = Math.max(10, Number((state.ceoEquity * 0.85).toFixed(1)));
  state.reputation = clamp(state.reputation + 25, 0, 100);
  if (window.sound) window.sound.playSuccess();
  showToast(`🔔 [코스닥 기술특례 상장 성공!] 공모자금 ${formatKRW(ipoProceeds)} 유입! 기업가치 1.5배 리레이팅!`);
  if (typeof renderUI === 'function') renderUI();
  if (typeof renderFinanceUI === 'function') renderFinanceUI();
}

function sellAllCoins() {
  if (window.sound) window.sound.init();
  if (state.coinBalance <= 0.0001) {
    showToast('⚠️ 지갑에 매도할 코인이 없습니다!');
    return;
  }
  const earn = Math.floor(state.coinBalance * state.coinPrice);
  state.money += earn;
  state.coinSellCount = (state.coinSellCount || 0) + 1;
  if (window.sound) window.sound.playCash();
  showToast(`📈 시장가 전액 매도 체결! ${state.coinBalance.toFixed(4)} ETH 환전 (+${formatKRW(earn)})`);
  state.coinBalance = 0.0;
  if (typeof renderUI === 'function') renderUI();
}

function repairAllBrokenGpus(officeUid) {
  if (window.sound) window.sound.init();
  const office = state.offices.find(o => o.uid === officeUid);
  if (!office) return;
  const brokenGpus = office.gpus.filter(g => (g.isBroken || g.isBricked) && !g.permDead);
  if (brokenGpus.length === 0) {
    showToast('ℹ️ 현재 사업장에 수리가 필요한 고장난 GPU가 없습니다.');
    return;
  }
  const reballMod = (window.GAME_DATA.gpuMods || []).find(m => m.id === 'reball') || { cost: 150000 };
  const totalCost = brokenGpus.length * (reballMod.cost || 150000);
  if (state.money < totalCost) {
    showToast(`❌ 자금이 부족합니다. (필요: ${formatKRW(totalCost)}, 보유: ${formatKRW(state.money)})`);
    return;
  }
  let successCount = 0;
  brokenGpus.forEach(g => {
    if (window.Systems.hardware && typeof window.Systems.hardware.applyGpuMod === 'function') {
      const res = window.Systems.hardware.applyGpuMod(office.uid, g.uid, 'reball');
      if (res && res.ok) successCount += 1;
    }
  });
  if (window.sound) window.sound.playBeep(600, 0.15);
  showToast(`🔧 [일괄 리볼링 수리] ${brokenGpus.length}대 중 ${successCount}대 부활 성공!`);
  if (typeof forceRebuildOffices === 'function') forceRebuildOffices();
  if (typeof renderUI === 'function') renderUI();
}

window.Systems.office = {
  getOfficeWithAvailableSlot,
  createGpuInstance,
  calculateGlobalSpecs,
  calculateSpecsGlobalSafe,
  refreshDanggeunDeals,
  buyDanggeunDeal,
  negoDanggeunDeal,
  repairAllBrokenGpus,
  transferGpu,
  cleanOfficeDust,
  buyNewGpu,
  leaseGpuServer,
  sellGpuFromOffice,
  leaseNewOffice,
  terminateOfficeLease,
  takeBankLoan,
  repayBankLoan,
  attemptKosdaqIPO,
  sellAllCoins
};

window.getOfficeWithAvailableSlot = getOfficeWithAvailableSlot;
window.createGpuInstance = createGpuInstance;
window.calculateGlobalSpecs = calculateGlobalSpecs;
window.calculateSpecsGlobalSafe = calculateSpecsGlobalSafe;
window.refreshDanggeunDeals = refreshDanggeunDeals;
window.buyDanggeunDeal = buyDanggeunDeal;
window.negoDanggeunDeal = negoDanggeunDeal;
window.repairAllBrokenGpus = repairAllBrokenGpus;
window.transferGpu = transferGpu;
window.cleanOfficeDust = cleanOfficeDust;
window.buyNewGpu = buyNewGpu;
window.leaseGpuServer = leaseGpuServer;
window.sellGpuFromOffice = sellGpuFromOffice;
window.leaseNewOffice = leaseNewOffice;
window.terminateOfficeLease = terminateOfficeLease;
window.takeBankLoan = takeBankLoan;
window.repayBankLoan = repayBankLoan;
window.attemptKosdaqIPO = attemptKosdaqIPO;
window.sellAllCoins = sellAllCoins;


function resetOfficeBreaker(officeUid) {
  if (window.sound) window.sound.init();
  const office = state.offices.find(o => o.uid === officeUid);
  if (!office || !office.isTripped) return;
  office.isTripped = false;
  office.tripTimer = 0;
  if (window.sound) window.sound.playBeep(750, 0.08);
  showToast(`🔌 [${office.customName}] 차단기를 수동으로 즉시 복구했습니다! 수전 설비 증설을 권장합니다.`);
  if (typeof renderUI === 'function') renderUI();
}

window.Systems.office.resetOfficeBreaker = resetOfficeBreaker;
window.resetOfficeBreaker = resetOfficeBreaker;
