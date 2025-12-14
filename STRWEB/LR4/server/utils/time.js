export function getClientTimeZone(req) {
  const tz = req.headers["x-timezone"];
  return typeof tz === "string" && tz.trim() ? tz.trim() : "UTC";
}

export function formatUtcAndTz(date, timeZone) {
  const d = date instanceof Date ? date : new Date(date);
  const utc = d.toISOString();

  let local = utc;
  try {
    local = new Intl.DateTimeFormat("ru-RU", {
      timeZone,
      dateStyle: "medium",
      timeStyle: "medium"
    }).format(d);
  } catch {
    // if invalid timezone, fall back to UTC ISO
    local = utc;
  }

  return { utc, timeZone, local };
}



