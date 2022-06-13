export function formatHour(hour) {
  const { hours, minutes } = hour;
  return [hours, minutes].map(n => String(n).padStart(2, '0')).join('h');
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

export function minutesToTime(minutes, options = {}) {
  const { short = false } = options;
  if (!minutes) {
    return short ? '00h' : '00:00';
  }
  const hour = Math.floor(minutes / 60);
  const minute = Math.floor((minutes % 60) / 60);
  if (short && minute === 0) {
    return `${hour}h`;
  }
  return `${short ? hour : pad2(hour)}:${pad2(minute)}`;
}

export function inHours(start, end) {
  const date = new Date();
  const now = date.getHours() * 60 + date.getMinutes();
  if (start > end) {
    // 17h - 2h
    return now < end || start < now;
  }
  // 10h - 20h
  return start < now && now < end;
}
