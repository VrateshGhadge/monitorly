// import type { HistoryStatus } from "../types/dashboard";

// /** Deterministic "downtime minutes" for a given day, used to size/label the incident bar chart. */
// export function downtimeMinutes(status: HistoryStatus, index: number): number {
//   if (status === "ok") return 0;
//   if (status === "warn") return 15 + ((index * 7) % 30);
//   return 45 + ((index * 13) % 90);
// }

// import type { HistoryStatus } from "../types/dashboard";
// import { initialHistory } from "../data/incidentHistory";

// /** Deterministic "downtime minutes" for a given day, used to size/label the incident bar chart. */
// export function downtimeMinutes(status: HistoryStatus, index: number): number {
//   if (status === "ok") return 0;
//   if (status === "warn") return 15 + ((index * 7) % 30);
//   return 45 + ((index * 13) % 90);
// }

// /**
//  * Builds a per-monitor 30-day history row.
//  *
//  * - `live` (marketing demo only): rotates the canned demo incident pattern per
//  *   row so multiple monitors don't look identical, purely for visual variety.
//  * - Real product (`live` false, the default): never fabricates historical
//  *   incidents. Every day is "ok" except, honestly, today — which reflects the
//  *   monitor's actual current status if it's down.
//  */
// export function buildMonitorHistory(
//   index: number,
//   status: "up" | "down" | string | undefined,
//   live: boolean
// ): HistoryStatus[] {
//   if (live) {
//     const len = initialHistory.length;
//     const shift = (index * 5) % len;
//     const rotated = initialHistory.slice(shift).concat(initialHistory.slice(0, shift));
//     if (status === "down") {
//       rotated[rotated.length - 1] = "down";
//     }
//     return rotated;
//   }

//   const flat: HistoryStatus[] = initialHistory.map(() => "ok");
//   if (status === "down") {
//     flat[flat.length - 1] = "down";
//   }
//   return flat;
// }

// import type { HistoryStatus } from "../types/dashboard";
// import { initialHistory } from "../data/incidentHistory";

// /** Deterministic "downtime minutes" for a given day, used to size/label the incident bar chart. */
// export function downtimeMinutes(status: HistoryStatus, index: number): number {
//   if (status === "ok") return 0;
//   if (status === "warn") return 15 + ((index * 7) % 30);
//   return 45 + ((index * 13) % 90);
// }

// /**
//  * Builds a per-monitor 30-day history row.
//  *
//  * - `live` (marketing demo only): rotates the canned demo incident pattern per
//  *   row so multiple monitors don't look identical, purely for visual variety.
//  * - Real product (`live` false, the default): never fabricates historical
//  *   incidents. Every day is "ok" except, honestly, today — which reflects the
//  *   monitor's actual current status if it's down.
//  */
// export function buildMonitorHistory(
//   index: number,
//   status: "up" | "down" | string | undefined,
//   live: boolean
// ): HistoryStatus[] {
//   if (live) {
//     const len = initialHistory.length;
//     const shift = (index * 5) % len;
//     const rotated = initialHistory.slice(shift).concat(initialHistory.slice(0, shift));
//     if (status === "down") {
//       rotated[rotated.length - 1] = "down";
//     }
//     return rotated;
//   }

//   const flat: HistoryStatus[] = initialHistory.map(() => "ok");
//   if (status === "down") {
//     flat[flat.length - 1] = "down";
//   }
//   return flat;
// }

// import type { HistoryStatus } from "../types/dashboard";
// import { initialHistory } from "../data/incidentHistory";

// /** Deterministic "downtime minutes" for a given day, used to size/label the incident bar chart. */
// export function downtimeMinutes(status: HistoryStatus, index: number): number {
//   if (status === "ok") return 0;
//   if (status === "warn") return 15 + ((index * 7) % 30);
//   return 45 + ((index * 13) % 90);
// }

// /**
//  * Builds a per-monitor 30-day history row.
//  *
//  * - `live` (marketing demo only): rotates the canned demo incident pattern per
//  *   row so multiple monitors don't look identical, purely for visual variety.
//  * - Real product (`live` false, the default): never fabricates historical
//  *   incidents. Every day is "ok" except, honestly, today — which reflects the
//  *   monitor's actual current status if it's down.
//  */
// export function buildMonitorHistory(
//   index: number,
//   status: "up" | "down" | string | undefined,
//   live: boolean
// ): HistoryStatus[] {
//   if (live) {
//     const len = initialHistory.length;
//     const shift = (index * 5) % len;
//     const rotated = initialHistory.slice(shift).concat(initialHistory.slice(0, shift));
//     if (status === "down") {
//       rotated[rotated.length - 1] = "down";
//     }
//     return rotated;
//   }

//   const flat: HistoryStatus[] = initialHistory.map(() => "ok");
//   if (status === "down") {
//     flat[flat.length - 1] = "down";
//   }
//   return flat;
// }

import type { HistoryStatus } from "../types/dashboard";
import { initialHistory } from "../data/incidentHistory";

/** Deterministic "downtime minutes" for a given day, used to size/label the incident bar chart. */
export function downtimeMinutes(status: HistoryStatus, index: number): number {
  if (status === "ok") return 0;
  if (status === "warn") return 15 + ((index * 7) % 30);
  return 45 + ((index * 13) % 90);
}

/**
 * Builds a per-monitor 30-day history row.
 *
 * - `live` (marketing demo only): rotates the canned demo incident pattern per
 *   row so multiple monitors don't look identical, purely for visual variety.
 * - Real product (`live` false, the default): never fabricates historical
 *   incidents. Every day is "ok" except, honestly, today — which reflects the
 *   monitor's actual current status if it's down.
 */
// export function buildMonitorHistory(
//   index: number,
//   status: "up" | "down" | string | undefined,
//   live: boolean
// ): HistoryStatus[] {
//   if (live) {
//     const len = initialHistory.length;
//     const shift = (index * 5) % len;
//     const rotated = initialHistory.slice(shift).concat(initialHistory.slice(0, shift));
//     if (status === "down") {
//       rotated[rotated.length - 1] = "down";
//     }
//     return rotated;
//   }

//   const flat: HistoryStatus[] = initialHistory.map(() => "ok");
//   if (status === "down") {
//     flat[flat.length - 1] = "down";
//   }
//   return flat;
// }

export function buildMonitorHistory(
  index: number,
  status: "up" | "down" | string | undefined,
  _live: boolean,
): HistoryStatus[] {
  const len = initialHistory.length;
  const shift = (index * 5) % len;
  const rotated = initialHistory
    .slice(shift)
    .concat(initialHistory.slice(0, shift));

  if (status === "down") {
    rotated[rotated.length - 1] = "down";
  }

  return rotated;
}
