export const APP_TIMEZONE = "Africa/Tunis";

export type ParsedLocalDateTime = {
  requestedStartAt: Date;
  requestedLocalDate: string;
  requestedLocalTime: string;
  isWeekendRequest: boolean;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

export function parseRequestedDateTime(
  requestedDate: string,
  requestedTime: string,
  now = new Date()
): ParsedLocalDateTime | null {
  if (!DATE_PATTERN.test(requestedDate) || !TIME_PATTERN.test(requestedTime)) {
    return null;
  }

  const [year, month, day] = requestedDate.split("-").map(Number);
  const [hour, minute] = requestedTime.split(":").map(Number);

  if (
    !isValidDateParts(year, month, day) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  const requestedStartAt = zonedTimeToUtc(year, month, day, hour, minute, APP_TIMEZONE);
  const roundTrip = getZonedParts(requestedStartAt, APP_TIMEZONE);

  if (
    roundTrip.year !== year ||
    roundTrip.month !== month ||
    roundTrip.day !== day ||
    roundTrip.hour !== hour ||
    roundTrip.minute !== minute
  ) {
    return null;
  }

  if (requestedStartAt.getTime() <= now.getTime()) {
    return null;
  }

  return {
    requestedStartAt,
    requestedLocalDate: requestedDate,
    requestedLocalTime: requestedTime,
    isWeekendRequest: isWeekendDate(year, month, day),
  };
}

export function isWeekendDate(year: number, month: number, day: number): boolean {
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return weekday === 0 || weekday === 6;
}

function isValidDateParts(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const firstOffset = getTimeZoneOffsetMs(new Date(utcGuess), timeZone);
  const firstUtc = utcGuess - firstOffset;
  const secondOffset = getTimeZoneOffsetMs(new Date(firstUtc), timeZone);

  return new Date(utcGuess - secondOffset);
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return asUtc - date.getTime();
}

function getZonedParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value])
  );
  const hour = Number(parts.hour) === 24 ? 0 : Number(parts.hour);

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour,
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}
