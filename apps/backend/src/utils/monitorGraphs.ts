import { MonitorStatus } from "@repo/db";

type Check = {
  status: MonitorStatus;
  responseTime: number | null;
  checkedAt: Date;
};

export function calculateAverageResponse(checks: Check[]): number | null {
  const valid = checks.filter((c) => c.responseTime !== null);

  if (valid.length === 0) {
    return null;
  }

  const total = valid.reduce((sum, c) => sum + (c.responseTime ?? 0), 0);

  return Math.round(total / valid.length);
}

export function calculateUptimePercentage(checks: Check[]): number {
  if (checks.length === 0) {
    return 100;
  }

  const successful = checks.filter((c) => c.status === MonitorStatus.UP).length;

  return Number(((successful / checks.length) * 100).toFixed(2));
}

export function getLastChecked(checks: Check[]): Date | null {
  if (checks.length === 0) {
    return null;
  }

  return checks[checks.length - 1]!.checkedAt;
}

/**
 * Placeholder.
 * We'll build this next.
 */
// export function buildResponseGraphs(
//   checks: Check[]
// ) {
//   return {
//     hour: [],
//     day: [],
//     month: [],
//   };
// }

export function buildResponseGraphs(checks: Check[]) {
  const now = Date.now();

  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  return {
    hour: checks
      .filter(
        (check) =>
          check.responseTime !== null &&
          check.checkedAt.getTime() >= oneHourAgo,
      )
      .map((check) => ({
        timestamp: check.checkedAt,
        value: check.responseTime,
      })),

    day: checks
      .filter(
        (check) =>
          check.responseTime !== null && check.checkedAt.getTime() >= oneDayAgo,
      )
      .map((check) => ({
        timestamp: check.checkedAt,
        value: check.responseTime,
      })),

    month: checks
      .filter(
        (check) =>
          check.responseTime !== null &&
          check.checkedAt.getTime() >= thirtyDaysAgo,
      )
      .map((check) => ({
        timestamp: check.checkedAt,
        value: check.responseTime,
      })),
  };
}

/**
 * Placeholder.
 * We'll build this after response graphs.
 */
// export function buildUptimeGraphs(
//   checks: Check[]
// ) {
//   return {
//     hour: [],
//     day: [],
//     month: [],
//   };
// }

export function buildUptimeGraphs(checks: Check[]) {
  const now = Date.now();

  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  return {
    hour: checks
      .filter((check) => new Date(check.checkedAt).getTime() >= oneHourAgo)
      .map((check) => ({
        timestamp: check.checkedAt,
        status: check.status,
      })),

    day: checks
      .filter((check) => new Date(check.checkedAt).getTime() >= oneDayAgo)
      .map((check) => ({
        timestamp: check.checkedAt,
        status: check.status,
      })),

    month: checks
      .filter((check) => new Date(check.checkedAt).getTime() >= thirtyDaysAgo)
      .map((check) => ({
        timestamp: check.checkedAt,
        status: check.status,
      })),
  };
}
