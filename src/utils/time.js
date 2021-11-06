export function formatHour(hour) {
  const { hours, minutes } = hour;
  return [hours, minutes].map(n => String(n).padStart(2, '0')).join(':');
}

export function secondToTime(seconds) {
  return formatHour({
    hours: Math.floor(seconds / 3600),
    minutes: seconds % 3600,
  });
}
