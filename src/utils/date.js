function utcDate(time = 0) {
  const offsetTimezone = new Date().getTimezoneOffset() * 60000;
  if (time) {
    return new Date(time - offsetTimezone);
  }
  return new Date(offsetTimezone);
}

export { utcDate };
