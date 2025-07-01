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

export function formatTimeRange(start: number, end: number): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  // 获取当前日期的零点时间
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 计算 startDate 与今天的天数差
  const diffDays = Math.floor(
    (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const parts = new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(startDate);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));

  // 确定日期描述
  let dayLabel = "";
  if (diffDays === 0) {
    dayLabel = `今天（${map.month}月${map.day}日）`;
  } else if (diffDays === 1) {
    dayLabel = `明天（${map.month}月${map.day}日）`;
  } else if (diffDays === 2) {
    dayLabel = `后天（${map.month}月${map.day}日）`;
  } else {
    dayLabel = `${map.month}月${map.day}日`;
  }

  // 确定时间段
  const startHour = startDate.getHours();
  let period = "";
  if (startHour < 12) {
    period = "上午";
  } else if (startHour < 19) {
    period = "下午";
  } else {
    period = "晚上";
  }

  // 格式化时间
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const timeRange = `${formatTime(startDate)}-${formatTime(endDate)}`;

  return `${dayLabel}${period} ${timeRange} `;
}

export function getDayOfWeek(
  date: number
):
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday" {
  const day = new Date(date).getDay();
  let d:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday" = "monday";
  switch (day) {
    case 0:
      d = "sunday";
      break;
    case 1:
      d = "monday";
      break;
    case 2:
      d = "tuesday";
      break;
    case 3:
      d = "wednesday";
      break;
    case 4:
      d = "thursday";
      break;
    case 5:
      d = "friday";
      break;
    case 6:
      d = "saturday";
      break;
    default:
      d = "monday";
      break;
  }
  return d;
}
