export function formatHour(hour) {
  const { hours, minutes } = hour;
  return [hours, minutes].map(n => String(n).padStart(2, '0')).join(':');
}

export function secondToTime(seconds) {
  return formatHour({
    hours: Math.floor(seconds / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
  });
}

export function inHours(start, end) {
  const now = date.getHours() * 3600 + date.getMinutes() * 60;
  if (start > end) {
    // 17h - 2h
    return now < end || start < now;
  }
  // 10h - 20h
  return start < now && now < end;
}
