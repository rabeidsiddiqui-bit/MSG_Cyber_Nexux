export const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getCurrentDay() {
  const today = new Date();
  return days[today.getDay()];
}

export function parseMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || '0', 10);
}

export function isMarketOpen(market) {
  if (!market || !market.operatingDays) return false;
  
  const currentDay = getCurrentDay();
  if (!market.operatingDays.includes(currentDay)) {
    return false;
  }

  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const openMins = parseMinutes(market.openingTime || '08:00');
  const closeMins = parseMinutes(market.closingTime || '14:00');

  return currentMins >= openMins && currentMins <= closeMins;
}

export function getNextDay(market) {
  if (!market || !market.operatingDays || market.operatingDays.length === 0) {
    return 'Check details';
  }

  const todayIndex = new Date().getDay();
  const dayIndices = market.operatingDays.map(d => days.indexOf(d)).sort((a, b) => a - b);

  for (let i = 0; i < dayIndices.length; i++) {
    const idx = dayIndices[i];
    if (idx === todayIndex) {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const closeMins = parseMinutes(market.closingTime || '14:00');
      if (currentMins < closeMins) return 'Today';
    } else if (idx > todayIndex) {
      return days[idx];
    }
  }

  return days[dayIndices[0]];
}

export function getSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Autumn';
  return 'Winter';
}

export function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}
