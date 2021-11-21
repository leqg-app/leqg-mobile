export function formatHour(hour) {
  const { hours, minutes } = hour;
  return [hours, minutes].map(n => String(n).padStart(2, '0')).join('h');
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toHour(hour, minute) {
  return `${pad2(hour)}h${minute ? pad2(minute) : ''}`;
}

export function secondToTime(seconds) {
  return toHour(Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60));
}

export function inHours(start, end) {
  const date = new Date();
  const now = date.getHours() * 3600 + date.getMinutes() * 60;
  if (start > end) {
    // 17h - 2h
    return now < end || start < now;
  }
  // 10h - 20h
  return start < now && now < end;
}
