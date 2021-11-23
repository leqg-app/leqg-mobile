export function formatHour(hour) {
  const { hours, minutes } = hour;
  return [hours, minutes].map(n => String(n).padStart(2, '0')).join('h');
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

export function secondToTime(seconds) {
  if (!seconds) {
    return '00h';
  }
  const hour = Math.floor(seconds / 3600);
  const minute = Math.floor((seconds % 3600) / 60);
  return `${hour}h${minute ? pad2(minute) : ''}`;
}

export function secondToHour(seconds) {
  if (!seconds) {
    return '00:00';
  }
  return `${Math.floor(seconds / 3600)}:${pad2(
    Math.floor((seconds % 3600) / 60),
  )}`;
}

export function toHours(seconds) {
  return Math.floor(seconds / 3600);
}

export function toMinutes(seconds) {
  return pad2(Math.floor((seconds % 3600) / 60));
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
