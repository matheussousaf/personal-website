// Front-matter dates like `2024-05-13` parse as UTC midnight (gray-matter may
// hand us a Date). Formatting in UTC keeps the calendar day stable across
// server and visitor time zones, avoiding off-by-one days and hydration drift.
const formats = {
  short: new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }),
  long: new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }),
};

export function toIsoDate(value: string | Date): string | undefined {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? undefined
    : date.toISOString().slice(0, 10);
}

export function PostDate({
  value,
  format = "short",
  className,
}: {
  value: string | Date;
  format?: keyof typeof formats;
  className?: string;
}) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return <span className={className}>{String(value)}</span>;
  }

  return (
    <time dateTime={toIsoDate(date)} className={className}>
      {formats[format].format(date)}
    </time>
  );
}
