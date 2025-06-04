export function formatDateForSchedule(params: {
  date: string;
  showWeekday: boolean;
  showDayPeriod: boolean;
}): string {
  if (!params.date) {
    return "";
  }
  const date = new Date(params.date);
  const parts = new Intl.DateTimeFormat("zh-CN", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  let result = "";
  if (params.showWeekday) {
    result += `${map.weekday} `;
  }
  if (params.showDayPeriod) {
    result += `${map.dayPeriod} `;
  }
  result += `${map.hour.padStart(2, "0")}:${map.minute}`;
  return result;
}
