import { Temporal, toTemporalInstant } from "temporal-polyfill";

const SERVICE_DAY_START: Temporal.PlainTime =
  Temporal.PlainTime.from("03:00:00");
const SERVICE_DAY_END: Temporal.PlainTime = Temporal.PlainTime.from("02:59:59");

export function isCurrentServiceDay(d: Temporal.PlainDate): boolean {
  return Temporal.PlainDate.compare(d, currentServiceDay()) === 0;
}

export function currentServiceDay(): Temporal.PlainDate {
  return toServiceDate(Temporal.Now.instant());
}

export function toServiceDate(i: Temporal.Instant): Temporal.PlainDate {
  const local = i.toZonedDateTimeISO("US/Pacific");

  const offset =
    Temporal.PlainTime.compare(SERVICE_DAY_END, local.toPlainTime()) > 0
      ? -1
      : 0;

  return local.toPlainDate().add({ days: offset });
}

export function dateToPlainDate(date: Date): Temporal.PlainDate {
  return toTemporalInstant
    .call(date)
    .toZonedDateTimeISO(Temporal.Now.timeZoneId())
    .toPlainDate();
}

export function serviceDateToTimeRange(serviceDate: Temporal.PlainDate) {
  return {
    start: serviceDate.toPlainDateTime(SERVICE_DAY_START),
    end: serviceDate
      .add(Temporal.Duration.from({ days: 1 }))
      .toPlainDateTime(SERVICE_DAY_END),
  };
}
