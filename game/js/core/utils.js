/**
 * game/js/core/utils.js
 * 공통 포맷터, 신용등급 계산, 토스트 알림, 모달 헬퍼
 */

function getCreditTier(score) {
  if (score >= 850) return 'AAA';
  if (score >= 750) return 'A';
  if (score >= 650) return 'B';
  if (score >= 550) return 'C';
  return 'D';
}

function formatKRW(val) {
  if (typeof val !== 'number' || isNaN(val)) return '0원';
  const sign = val < 0 ? '-' : '';
  const abs = Math.floor(Math.abs(val));
  if (abs >= 1000000000000) {
    const jo = (abs / 1000000000000).toFixed(2);
    return `${sign}${jo}조 원`;
  }
  if (abs >= 100000000) {
    const eok = (abs / 100000000).toFixed(2);
    return `${sign}${eok}억 원`;
  }
  if (abs >= 10000) {
    const man = Math.floor(abs / 10000).toLocaleString();
    return `${sign}${man}만 원`;
  }
  return `${sign}${abs.toLocaleString()}원`;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function showToast(msg) {
  if (typeof document === 'undefined') return;
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

function getSeasonInfo(calendarMonth) {
  if (calendarMonth === 7 || calendarMonth === 8) {
    return { id: 'summer', name: '🔥 여름 폭염 (전력피크 할증)', electricMul: 1.35, ambientTemp: 31, freeCoolingMul: 0.3 };
  }
  if (calendarMonth === 12 || calendarMonth === 1 || calendarMonth === 2) {
    return { id: 'winter', name: '❄️ 겨울 한파 (외기냉방 호조)', electricMul: 1.0, ambientTemp: 18, freeCoolingMul: 1.6 };
  }
  if (calendarMonth === 6) {
    return { id: 'finals', name: '🎓 기말 논문 시즌 (렌탈 폭증)', electricMul: 1.05, ambientTemp: 26, freeCoolingMul: 0.8 };
  }
  return { id: 'normal', name: '🌿 쾌적한 환절기', electricMul: 1.0, ambientTemp: 23, freeCoolingMul: 1.0 };
}

window.getCreditTier = getCreditTier;
window.formatKRW = formatKRW;
window.clamp = clamp;
window.showToast = showToast;
window.getSeasonInfo = getSeasonInfo;


function spawnFloatingJuice(text, color = '#10b981', anchorId = 'stat-money') {
  if (typeof document === 'undefined') return;
  const anchor = document.getElementById(anchorId);
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'floating-juice';
  el.textContent = text;
  el.style.color = color;
  el.style.left = `${rect.left + Math.random() * 40}px`;
  el.style.top = `${rect.top - 4}px`;
  document.body.appendChild(el);
  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 1250);
}

window.spawnFloatingJuice = spawnFloatingJuice;
