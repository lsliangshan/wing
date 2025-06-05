export function formatDateForSchedule(params: {
  date: string;
  format: string;
}): string {
  if (!params.date) {
    return "";
  }
  const fmt = params.format || "weekday dayPeriod hour:minute";
  const date = new Date(params.date);

  if (
    fmt.includes("weekday") ||
    fmt.includes("dayPeriod") ||
    fmt.includes("hour") ||
    fmt.includes("minute")
  ) {
    const parts = new Intl.DateTimeFormat("zh-CN", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).formatToParts(date);
    const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    return fmt
      .replace("weekday", map.weekday)
      .replace("dayPeriod", map.dayPeriod)
      .replace("hour", map.hour)
      .replace("minute", map.minute)
      .replace("second", map.second);
  }

  const year = `${date.getFullYear()}`;
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  const second = `${date.getSeconds()}`.padStart(2, "0");
  return fmt
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("hh", hour)
    .replace("mm", minute)
    .replace("ss", second);
}
