// src/pages/dashboard/MonitorDetailsPage.tsx
import { useMemo, useState, useEffect } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";

import type { AppData } from "../../hooks/useAppData";

import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import EmptyState from "../../components/ui/EmptyState";

import ResponseTimeGraph from "./ResponseTimeGraph";
import UptimeHistoryGraph from "./UptimeHistoryGraph";
import CheckHistoryPanel from "../../components/dashboard/CheckHistoryPanel";
import type { ResponseRange } from "../../utils/monitorGraphs";
import { formatLastChecked } from "../../lib/date";

import { getMonitorHistory } from "../../api/monitor";

// ---------- Types ----------
interface Incident {
  id: string;
  title: string;
  detail: string;
  ongoing: boolean;
}

// ---------- Helper: format duration ----------
function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);

  if (totalMinutes < 1) {
    return "less than a minute";
  }

  if (totalMinutes < 60) {
    return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }

  return `${hours}h ${minutes}m`;
}

// ---------- Sub‑component: only this updates every 10s ----------
function LastCheckedCard({ date }: { date: string | null }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <StatCard
      label="Last checked"
      value={date ? formatLastChecked(date, now) : "Never"}
    />
  );
}

// ---------- Main Component ----------
export default function MonitorDetailsPage() {
  const { slug } = useParams();
  const { monitors } = useOutletContext<AppData>();

  const monitor = monitors.find((m) => m.slug === slug);

  const [range, setRange] = useState<ResponseRange>("day");
  const [history, setHistory] = useState<
    Array<{
      status: "UP" | "DOWN";
      statusCode: number | null;
      responseTime: number | null;
      errorMessage?: string | null;
      checkedAt: string;
    }>
  >([]);

  // ----- Fetch check history for incidents -----
  useEffect(() => {
    if (!monitor?.id) return;

    let cancelled = false;

    const loadHistory = async () => {
      try {
        const data = await getMonitorHistory(monitor.id);
        if (!cancelled) {
          setHistory(data);
        }
      } catch (error) {
        console.error("Failed to load monitor history", error);
        if (!cancelled) {
          setHistory([]);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [monitor?.id]);

  // ----- Memoize monitor array for graphs -----
  const monitorList = useMemo(() => (monitor ? [monitor] : []), [monitor]);

  // ----- Build real incidents from history -----
  const incidents = useMemo<Incident[]>(() => {
    if (!history.length || !monitor) return [];

    const checks = [...history].sort(
      (a, b) =>
        new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime(),
    );

    const result: Incident[] = [];
    let downSince: string | null = null;

    for (const check of checks) {
      if (check.status === "DOWN" && !downSince) {
        downSince = check.checkedAt;
        continue;
      }

      if (check.status === "UP" && downSince) {
        const start = new Date(downSince).getTime();
        const end = new Date(check.checkedAt).getTime();
        const durationMs = Math.max(0, end - start);

        result.push({
          id: `${downSince}-${check.checkedAt}`,
          title: `${monitor.name} was unreachable`,
          detail: `Recovered after ${formatDuration(durationMs)}`,
          ongoing: false,
        });

        downSince = null;
      }
    }

    // Still down
    if (downSince) {
      result.push({
        id: downSince,
        title: `${monitor.name} is unreachable`,
        detail: `Health checks have been failing · started ${formatLastChecked(
          downSince,
        )}`,
        ongoing: true,
      });
    }

    return result.reverse().slice(0, 10); // most recent first
  }, [history, monitor]);

  // ----- Not found state -----
  if (!monitor) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="page-title">Monitor not found</h1>
        <p className="mt-2 text-[13.5px]" style={{ color: "var(--muted)" }}>
          This monitor may have been deleted, or the link is incorrect.
        </p>
        <Link
          to="/dashboard/monitors"
          className="btn btn-outline mt-6 inline-flex"
        >
          ← Back to Monitors
        </Link>
      </div>
    );
  }

  // ----- Render -----
  return (
    <>
      <Link
        to="/dashboard/monitors"
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--text)]"
      >
        ← Back to Monitors
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="page-title">{monitor.name}</h1>
          <Badge tone={monitor.status === "up" ? "green" : "red"}>
            {monitor.status === "up" ? "Up" : "Down"}
          </Badge>
        </div>
        <p className="table-cell-url mt-2">{monitor.url}</p>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Response time"
          value={monitor.latency ?? "—"}
          unit={monitor.latency ? "ms" : undefined}
        />
        <StatCard label="Uptime" value={monitor.uptimePct} unit="%" />
        <LastCheckedCard date={monitor.lastChecked} />
      </div>

      {/* Response Time Graph */}
      <div className="panel mb-5">
        <div className="panel-head">
          <h4>Response times</h4>
          <div className="flex items-center gap-0.5 rounded-lg border border-[var(--line)] bg-[#0d1014] p-1">
            {(["hour", "day", "month"] as ResponseRange[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  range === r
                    ? "bg-[var(--surface2)] text-[var(--text)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {r === "hour" ? "Hour" : r === "day" ? "Day" : "Month"}
              </button>
            ))}
          </div>
        </div>

        <ResponseTimeGraph monitors={monitorList} range={range} />
      </div>

      {/* Uptime History */}
      <div className="mb-5">
        <UptimeHistoryGraph monitors={monitorList} range="month" />
      </div>

      {/* Check History */}
      <div className="mb-5">
        <CheckHistoryPanel monitorId={monitor.id} />
      </div>

      {/* Recent Incidents */}
      <div className="panel">
        <div className="panel-head">
          <h4>Recent incidents</h4>
          <small>LAST 30 DAYS</small>
        </div>

        {incidents.length === 0 ? (
          <EmptyState
            title="No incidents in the last 30 days."
            description="This monitor has been stable — we'll list any downtime here the moment it happens."
          />
        ) : (
          <div className="flex flex-col">
            {incidents.map((incident) => (
              <div className="row-line" key={incident.id}>
                <div>
                  <b>{incident.title}</b>
                  <div className="row-sub">{incident.detail}</div>
                </div>
                <Badge tone={incident.ongoing ? "red" : "green"}>
                  {incident.ongoing ? "Ongoing" : "Resolved"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// // src/pages/dashboard/MonitorDetailsPage.tsx
// import { useMemo, useState, useEffect } from "react";
// import { Link, useOutletContext, useParams } from "react-router-dom";

// import type { AppData } from "../../hooks/useAppData";

// import Badge from "../../components/ui/Badge";
// import StatCard from "../../components/ui/StatCard";
// import EmptyState from "../../components/ui/EmptyState";

// import ResponseTimeGraph from "./ResponseTimeGraph";
// import UptimeHistoryGraph from "./UptimeHistoryGraph";
// import CheckHistoryPanel from "../../components/dashboard/CheckHistoryPanel";
// import type { ResponseRange } from "../../utils/monitorGraphs";
// import { formatLastChecked } from "../../lib/date";

// import { getMonitorHistory } from "../../api/monitor";

// // ---------- Types ----------
// interface Incident {
//   id: string;
//   title: string;
//   detail: string;
//   ongoing: boolean;
// }

// // ---------- Sub‑component: only this updates every 10s ----------
// function LastCheckedCard({ date }: { date: string | null }) {
//   const [now, setNow] = useState(Date.now());

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setNow(Date.now());
//     }, 10000); // update every 10 seconds – enough for relative timestamps

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <StatCard
//       label="Last checked"
//       value={date ? formatLastChecked(date, now) : "Never"}
//     />
//   );
// }

// // ---------- Helpers ----------
// // function buildIncidents(
// //   status: string,
// //   name: string,
// //   lastChecked: string
// // ): Incident[] {
// //   if (status !== "down") return [];

// //   return [
// //     {
// //       title: `${name} is unreachable`,
// //       detail: `Health checks have been failing · last checked ${lastChecked}`,
// //     },
// //   ];
// // }

// // ---------- Main Component ----------
// export default function MonitorDetailsPage() {
//   const { slug } = useParams();
//   const { monitors } = useOutletContext<AppData>();

//   const monitor = monitors.find((m) => m.slug === slug);

//   const [range, setRange] = useState<ResponseRange>("day");

//   const [history, setHistory] = useState<
//     Array<{
//         status: "UP" | "DOWN";
//         statusCode: number | null;
//         responseTime: number | null;
//         errorMessage?: string | null;
//         checkedAt: string;
//     }>
//     >([]);

//     useEffect(() => {
//   if (!monitor?.id) return;

//   let cancelled = false;

//   const loadHistory = async () => {
//     try {
//       const data = await getMonitorHistory(monitor.id);

//       if (!cancelled) {
//         setHistory(data);
//       }
//     } catch (error) {
//       console.error("Failed to load monitor history", error);

//       if (!cancelled) {
//         setHistory([]);
//       }
//     }
//   };

//   loadHistory();

//   return () => {
//     cancelled = true;
//   };
// }, [monitor?.id]);

//   // Memoize the monitor array so we don't create a new one on every render
//   const monitorList = useMemo(
//     () => (monitor ? [monitor] : []),
//     [monitor]
//   );

//   const incidents = useMemo(
//     () =>
//       buildIncidents(
//         monitor?.status ?? "up",
//         monitor?.name ?? "",
//         monitor?.lastChecked ?? ""
//       ),
//     [monitor?.status, monitor?.name, monitor?.lastChecked]
//   );

//   // ----- Not found state -----
//   if (!monitor) {
//     return (
//       <div className="mx-auto max-w-md py-20 text-center">
//         <h1 className="page-title">Monitor not found</h1>
//         <p className="mt-2 text-[13.5px]" style={{ color: "var(--muted)" }}>
//           This monitor may have been deleted, or the link is incorrect.
//         </p>
//         <Link
//           to="/dashboard/monitors"
//           className="btn btn-outline mt-6 inline-flex"
//         >
//           ← Back to Monitors
//         </Link>
//       </div>
//     );
//   }

//   // ----- Render -----
//   return (
//     <>
//       {/* Back button */}
//       <Link
//         to="/dashboard/monitors"
//         className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--text)]"
//       >
//         ← Back to Monitors
//       </Link>

//       {/* Header */}
//       <div className="mb-6">
//         <div className="flex flex-wrap items-center gap-3">
//           <h1 className="page-title">{monitor.name}</h1>
//           <Badge tone={monitor.status === "up" ? "green" : "red"}>
//             {monitor.status === "up" ? "Up" : "Down"}
//           </Badge>
//         </div>
//         <p className="table-cell-url mt-2">{monitor.url}</p>
//       </div>

//       {/* Stats */}
//       <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
//         <StatCard
//           label="Response time"
//           value={monitor.latency ?? "—"}
//           unit={monitor.latency ? "ms" : undefined}
//         />

//         <StatCard
//           label="Uptime"
//           value={monitor.uptimePct}
//           unit="%"
//         />

//         {/* Only this card updates every 10s */}
//         <LastCheckedCard date={monitor.lastChecked} />
//       </div>

//       {/* Response Time Graph */}
//       <div className="panel mb-5">
//         <div className="panel-head">
//           <h4>Response times</h4>
//           <div className="flex items-center gap-0.5 rounded-lg border border-[var(--line)] bg-[#0d1014] p-1">
//             {(["hour", "day", "month"] as ResponseRange[]).map((r) => (
//               <button
//                 key={r}
//                 type="button"
//                 onClick={() => setRange(r)}
//                 className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
//                   range === r
//                     ? "bg-[var(--surface2)] text-[var(--text)] shadow-sm"
//                     : "text-[var(--muted)] hover:text-[var(--text)]"
//                 }`}
//               >
//                 {r === "hour" ? "Hour" : r === "day" ? "Day" : "Month"}
//               </button>
//             ))}
//           </div>
//         </div>

//         <ResponseTimeGraph monitors={monitorList} range={range} />
//       </div>

//       {/* Uptime History */}
//       <div className="mb-5">
//         <UptimeHistoryGraph monitors={monitorList} range="month" />
//       </div>

//       {/* Check History */}
//       <div className="mb-5">
//         <CheckHistoryPanel monitorId={monitor.id} />
//       </div>

//       {/* Recent Incidents */}
//       <div className="panel">
//         <div className="panel-head">
//           <h4>Recent incidents</h4>
//           <small>LAST 30 DAYS</small>
//         </div>

//         {incidents.length === 0 ? (
//           <EmptyState
//             title="No incidents in the last 30 days."
//             description="This monitor has been stable — we'll list any downtime here the moment it happens."
//           />
//         ) : (
//           <div className="flex flex-col">
//             {incidents.map((incident, i) => (
//               <div className="row-line" key={i}>
//                 <div>
//                   <b>{incident.title}</b>
//                   <div className="row-sub">{incident.detail}</div>
//                 </div>
//                 <Badge tone="red">Ongoing</Badge>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

// // src/pages/dashboard/MonitorDetailsPage.tsx
// import { useMemo, useState, useEffect } from "react";
// import { Link, useOutletContext, useParams } from "react-router-dom";

// import type { AppData } from "../../hooks/useAppData";

// import Badge from "../../components/ui/Badge";
// import StatCard from "../../components/ui/StatCard";
// import EmptyState from "../../components/ui/EmptyState";

// import ResponseTimeGraph from "./ResponseTimeGraph";
// import UptimeHistoryGraph from "./UptimeHistoryGraph";
// import CheckHistoryPanel from "../../components/dashboard/CheckHistoryPanel";
// import type { ResponseRange } from "../../utils/monitorGraphs";
// import { formatLastChecked } from "../../lib/date";

// interface Incident {
//   title: string;
//   detail: string;
// }

// function buildIncidents(status: string, name: string, lastChecked: string): Incident[] {
//   if (status !== "down") return [];

//   return [
//     {
//       title: `${name} is unreachable`,
//       detail: `Health checks have been failing · last checked ${lastChecked}`,
//     },
//   ];
// }

// export default function MonitorDetailsPage() {
//   const { slug } = useParams();
//   const { monitors } = useOutletContext<AppData>();
//   const monitor = monitors.find((m) => m.slug === slug);

//   // Local clock for relative timestamps – updates every second
//   const [now, setNow] = useState(Date.now());
//   const [range, setRange] = useState<ResponseRange>("day");

//   // Update `now` every second to refresh relative time strings
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setNow(Date.now());
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   const incidents = useMemo(
//     () => buildIncidents(monitor?.status ?? "up", monitor?.name ?? "", monitor?.lastChecked ?? ""),
//     [monitor?.status, monitor?.name, monitor?.lastChecked]
//   );

//   if (!monitor) {
//     return (
//       <div className="mx-auto max-w-md py-20 text-center">
//         <h1 className="page-title">Monitor not found</h1>
//         <p className="mt-2 text-[13.5px]" style={{ color: "var(--muted)" }}>
//           This monitor may have been deleted, or the link is incorrect.
//         </p>
//         <Link to="/dashboard/monitors" className="btn btn-outline mt-6 inline-flex">
//           ← Back to Monitors
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Link
//         to="/dashboard/monitors"
//         className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--text)]"
//       >
//         ← Back to Monitors
//       </Link>

//       {/* Header */}
//       <div className="mb-6">
//         <div className="flex flex-wrap items-center gap-3">
//           <h1 className="page-title">{monitor.name}</h1>
//           <Badge tone={monitor.status === "up" ? "green" : "red"}>
//             {monitor.status === "up" ? "Up" : "Down"}
//           </Badge>
//         </div>
//         <p className="table-cell-url mt-2">{monitor.url}</p>
//       </div>

//       {/* Stats */}
//       <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
//         <StatCard
//           label="Response time"
//           value={monitor.latency ?? "—"}
//           unit={monitor.latency ? "ms" : undefined}
//         />
//         <StatCard label="Uptime" value={monitor.uptimePct} unit="%" />
//         <StatCard
//           label="Last checked"
//           // Pass `now` so the relative time updates every second
//           value={formatLastChecked(monitor.lastChecked, now)}
//         />
//       </div>

//       {/* Response Time */}
//       <div className="panel mb-5">
//         <div className="panel-head">
//           <h4>Response times</h4>
//           <div className="flex items-center gap-0.5 rounded-lg border border-[var(--line)] bg-[#0d1014] p-1">
//             {(["hour", "day", "month"] as ResponseRange[]).map((r) => (
//               <button
//                 key={r}
//                 type="button"
//                 onClick={() => setRange(r)}
//                 className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
//                   range === r
//                     ? "bg-[var(--surface2)] text-[var(--text)] shadow-sm"
//                     : "text-[var(--muted)] hover:text-[var(--text)]"
//                 }`}
//               >
//                 {r === "hour" ? "Hour" : r === "day" ? "Day" : "Month"}
//               </button>
//             ))}
//           </div>
//         </div>

//         <ResponseTimeGraph monitors={[monitor]} range={range} />
//       </div>

//       {/* Uptime History */}
//       <div className="mb-5">
//         <UptimeHistoryGraph monitors={[monitor]} range="month" />
//       </div>

//       {/* History (individual checks) */}
//       <div className="mb-5">
//         <CheckHistoryPanel monitorId={monitor.id} />
//       </div>

//       {/* Recent Incidents */}
//       <div className="panel">
//         <div className="panel-head">
//           <h4>Recent incidents</h4>
//           <small>LAST 30 DAYS</small>
//         </div>

//         {incidents.length === 0 ? (
//           <EmptyState
//             title="No incidents in the last 30 days."
//             description="This monitor has been stable — we'll list any downtime here the moment it happens."
//           />
//         ) : (
//           <div className="flex flex-col">
//             {incidents.map((incident, i) => (
//               <div className="row-line" key={i}>
//                 <div>
//                   <b>{incident.title}</b>
//                   <div className="row-sub">{incident.detail}</div>
//                 </div>
//                 <Badge tone="red">Ongoing</Badge>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

// // src/pages/dashboard/MonitorDetailsPage.tsx
// import { useMemo, useState, useEffect } from "react";
// import { Link, useOutletContext, useParams } from "react-router-dom";

// import type { AppData } from "../../hooks/useAppData";

// import Badge from "../../components/ui/Badge";
// import StatCard from "../../components/ui/StatCard";
// import EmptyState from "../../components/ui/EmptyState";

// import ResponseTimeGraph from "./ResponseTimeGraph";
// import UptimeHistoryGraph from "./UptimeHistoryGraph";
// import CheckHistoryPanel from "../../components/dashboard/CheckHistoryPanel";
// import type { ResponseRange } from "../../utils/monitorGraphs";
// import { formatLastChecked } from "@/lib/date";

// interface Incident {
//   title: string;
//   detail: string;
// }

// function buildIncidents(status: string, name: string, lastChecked: string): Incident[] {
//   if (status !== "down") return [];

//   return [
//     {
//       title: `${name} is unreachable`,
//       detail: `Health checks have been failing · last checked ${lastChecked}`,
//     },
//   ];
// }

// export default function MonitorDetailsPage() {
//   const { slug } = useParams();
//   const { monitors } = useOutletContext<AppData>();
//   const monitor = monitors.find((m) => m.slug === slug);

//   const [now, setNow] = useState(Date.now());

//   const [range, setRange] = useState<ResponseRange>("day");

//   const incidents = useMemo(
//     () => buildIncidents(monitor?.status ?? "up", monitor?.name ?? "", monitor?.lastChecked ?? ""),
//     [monitor?.status, monitor?.name, monitor?.lastChecked]
//   );

//   if (!monitor) {
//     return (
//       <div className="mx-auto max-w-md py-20 text-center">
//         <h1 className="page-title">Monitor not found</h1>
//         <p className="mt-2 text-[13.5px]" style={{ color: "var(--muted)" }}>
//           This monitor may have been deleted, or the link is incorrect.
//         </p>
//         <Link to="/dashboard/monitors" className="btn btn-outline mt-6 inline-flex">
//           ← Back to Monitors
//         </Link>
//       </div>
//     );
//   }
//   useEffect(() => {
//     const interval = setInterval(() => {
//         setNow(Date.now());
//     }, 1000);

//     return () => clearInterval(interval);
//     }, []);

//   return (
//     <>
//       <Link
//         to="/dashboard/monitors"
//         className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--text)]"
//       >
//         ← Back to Monitors
//       </Link>

//       {/* Header */}
//       <div className="mb-6">
//         <div className="flex flex-wrap items-center gap-3">
//           <h1 className="page-title">{monitor.name}</h1>
//           <Badge tone={monitor.status === "up" ? "green" : "red"}>
//             {monitor.status === "up" ? "Up" : "Down"}
//           </Badge>
//         </div>
//         <p className="table-cell-url mt-2">{monitor.url}</p>
//       </div>

//       {/* Stats */}
//       <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
//         <StatCard
//           label="Response time"
//           value={monitor.latency ?? "—"}
//           unit={monitor.latency ? "ms" : undefined}
//         />
//         <StatCard label="Uptime" value={monitor.uptimePct} unit="%" />
//         <StatCard label="Last checked" value={formatLastChecked(monitor.lastChecked)} />
//       </div>

//       {/* Response Time */}
//       <div className="panel mb-5">
//         <div className="panel-head">
//           <h4>Response times</h4>
//           <div className="flex items-center gap-0.5 rounded-lg border border-[var(--line)] bg-[#0d1014] p-1">
//             {(["hour", "day", "month"] as ResponseRange[]).map((r) => (
//               <button
//                 key={r}
//                 type="button"
//                 onClick={() => setRange(r)}
//                 className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
//                   range === r
//                     ? "bg-[var(--surface2)] text-[var(--text)] shadow-sm"
//                     : "text-[var(--muted)] hover:text-[var(--text)]"
//                 }`}
//               >
//                 {r === "hour" ? "Hour" : r === "day" ? "Day" : "Month"}
//               </button>
//             ))}
//           </div>
//         </div>

//         <ResponseTimeGraph monitors={[monitor]} range={range} />
//       </div>

//       {/* Uptime History */}
//       <div className="mb-5">
//         <UptimeHistoryGraph
//             monitors={[monitor]}
//             range="month"
//         />
//       </div>

//       {/* History (individual checks) */}
//       <div className="mb-5">
//         <CheckHistoryPanel monitorId={monitor.id} />
//       </div>

//       {/* Recent Incidents */}
//       <div className="panel">
//         <div className="panel-head">
//           <h4>Recent incidents</h4>
//           <small>LAST 30 DAYS</small>
//         </div>

//         {incidents.length === 0 ? (
//           <EmptyState
//             title="No incidents in the last 30 days."
//             description="This monitor has been stable — we'll list any downtime here the moment it happens."
//           />
//         ) : (
//           <div className="flex flex-col">
//             {incidents.map((incident, i) => (
//               <div className="row-line" key={i}>
//                 <div>
//                   <b>{incident.title}</b>
//                   <div className="row-sub">{incident.detail}</div>
//                 </div>
//                 <Badge tone="red">Ongoing</Badge>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

// //src/pages/dashboard/MonitorDetailsPage.tsx
// import { useMemo, useState } from "react";
// import { Link, useOutletContext, useParams } from "react-router-dom";
// import { format } from "date-fns";
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
// } from "recharts";

// import type { AppData } from "../../hooks/useAppData";

// import Badge from "../../components/ui/Badge";
// import StatCard from "../../components/ui/StatCard";
// import EmptyState from "../../components/ui/EmptyState";

// import UptimeHistoryGraph from "./UptimeHistoryGraph";
// import CheckHistoryPanel from "../../components/dashboard/CheckHistoryPanel";

// /* -----------------------------------------------------------------------
//    Mock data generator for the response-time chart.

//    The API doesn't expose per-monitor response-time history yet — only
//    the rolled-up latency already shown on the Monitors table. Until that
//    exists, this builds a believable, *stable* series from the monitor's
//    own id so the chart doesn't reshuffle on every re-render.
// ----------------------------------------------------------------------- */

// function seededRandom(seed: string) {
//   let h = 0;

//   for (let i = 0; i < seed.length; i++) {
//     h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
//   }

//   return () => {
//     h = Math.imul(h ^ (h >>> 15), h | 1);
//     h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
//     return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
//   };
// }

// type ResponseRange = "hour" | "day" | "month";

// interface ResponsePoint {
//   label: string;
//   ms: number;
// }

// const RANGE_CONFIG: Record<
//   ResponseRange,
//   { points: number; stepMs: number; format: (d: Date) => string; panelLabel: string }
// > = {
//   hour: {
//     points: 12, // every 5 minutes, last hour
//     stepMs: 5 * 60 * 1000,
//     format: (d) => format(d, "h:mmaaa"),
//     panelLabel: "LAST HOUR",
//   },
//   day: {
//     points: 24, // hourly, last 24 hours
//     stepMs: 60 * 60 * 1000,
//     format: (d) => format(d, "h:mmaaa"),
//     panelLabel: "LAST 24 HOURS",
//   },
//   month: {
//     points: 30, // daily, last 30 days
//     stepMs: 24 * 60 * 60 * 1000,
//     format: (d) => format(d, "MMM d"),
//     panelLabel: "LAST 30 DAYS",
//   },
// };

// function buildResponseSeries(
//   range: ResponseRange,
//   id: string,
//   latency: number | null
// ): ResponsePoint[] {
//   const rand = seededRandom(`${id}-latency-${range}`);
//   const base = latency ?? 140;
//   const { points, stepMs, format: fmt } = RANGE_CONFIG[range];
//   const now = Date.now();

//   return Array.from({ length: points }, (_, i) => {
//     const t = now - (points - 1 - i) * stepMs;
//     return {
//       label: fmt(new Date(t)),
//       ms: Math.max(8, Math.round(base + (rand() - 0.5) * base * 0.4)),
//     };
//   });
// }

// /** 5 evenly spaced labels under the chart, last one always "Now" / "Today". */
// function buildAxisLabels(series: ResponsePoint[], range: ResponseRange): string[] {
//   if (series.length === 0) return [];

//   const idxs = [0, 0.25, 0.5, 0.75, 1].map((f) =>
//     Math.round(f * (series.length - 1))
//   );
//   const unique = Array.from(new Set(idxs));
//   const labels = unique.map((i) => series[i].label);
//   labels[labels.length - 1] = range === "month" ? "Today" : "Now";
//   return labels;
// }

// interface Incident {
//   title: string;
//   detail: string;
// }

// function buildIncidents(status: string, name: string, lastChecked: string): Incident[] {
//   if (status !== "down") return [];

//   return [
//     {
//       title: `${name} is unreachable`,
//       detail: `Health checks have been failing · last checked ${lastChecked}`,
//     },
//   ];
// }

// function ResponseTooltip({
//   active,
//   payload,
//   label,
// }: {
//   active?: boolean;
//   payload?: { value: number }[];
//   label?: string;
// }) {
//   if (!active || !payload?.length) return null;

//   return (
//     <div
//       style={{
//         background: "#1a1f26",
//         border: "1px solid var(--line)",
//         borderRadius: 6,
//         padding: "6px 9px",
//         font: "10px 'DM Mono', monospace",
//         color: "#e7eaee",
//         boxShadow: "0 8px 20px rgba(0,0,0,.4)",
//       }}
//     >
//       {label} · <b style={{ color: "var(--green)" }}>{payload[0].value}ms</b>
//     </div>
//   );
// }

// export default function MonitorDetailsPage() {
//     //   const { id } = useParams();
//     const { slug } = useParams();
//     const { monitors } = useOutletContext<AppData>();

//     const monitor = monitors.find((m) => m.slug === slug);

//     const [range, setRange] = useState<ResponseRange>("day");

//     const series = useMemo(
//         () => buildResponseSeries(range, monitor?.id ?? "unknown", monitor?.latency ?? null),
//         [range, monitor?.id, monitor?.latency]
//     );

//     const axisLabels = useMemo(() => buildAxisLabels(series, range), [series, range]);

//     const incidents = useMemo(
//         () => buildIncidents(monitor?.status ?? "up", monitor?.name ?? "", monitor?.lastChecked ?? ""),
//         [monitor?.status, monitor?.name, monitor?.lastChecked]
//     );

//     if (!monitor) {
//         return (
//         <div className="mx-auto max-w-md py-20 text-center">
//             <h1 className="page-title">Monitor not found</h1>

//             <p className="mt-2 text-[13.5px]" style={{ color: "var(--muted)" }}>
//             This monitor may have been deleted, or the link is incorrect.
//             </p>

//             <Link to="/dashboard/monitors" className="btn btn-outline mt-6 inline-flex">
//             ← Back to Monitors
//             </Link>
//         </div>
//         );
//     }

//     return (
//         <>
//         <Link
//             to="/dashboard/monitors"
//             className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--text)]"
//         >
//             ← Back to Monitors
//         </Link>

//         {/* Header */}
//         <div className="mb-6">
//             <div className="flex flex-wrap items-center gap-3">
//             <h1 className="page-title">{monitor.name}</h1>

//             <Badge tone={monitor.status === "up" ? "green" : "red"}>
//                 {monitor.status === "up" ? "Up" : "Down"}
//             </Badge>
//             </div>

//             <p className="table-cell-url mt-2">{monitor.url}</p>
//         </div>

//         {/* Stats */}
//         <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             <StatCard
//             label="Response time"
//             value={monitor.latency ?? "—"}
//             unit={monitor.latency ? "ms" : undefined}
//             />

//             <StatCard label="Uptime" value={monitor.uptimePct} unit="%" />

//             <StatCard label="Last checked" value={monitor.lastChecked} />
//         </div>

//         {/* Response Time */}
//         <div className="panel mb-5">
//             <div className="panel-head">
//             <h4>Response times</h4>

//             {/* <div className="range-switch">
//                 {(["hour", "day", "month"] as ResponseRange[]).map((r) => (
//                 <button
//                     key={r}
//                     type="button"
//                     className={range === r ? "active" : ""}
//                     onClick={() => setRange(r)}
//                 >
//                     {r === "hour" ? "Hour" : r === "day" ? "Day" : "Month"}
//                 </button>
//                 ))}
//             </div> */}
//             <div className="flex items-center gap-0.5 rounded-lg border border-[var(--line)] bg-[#0d1014] p-1">
//                 {(["hour", "day", "month"] as ResponseRange[]).map((r) => (
//                 <button
//                     key={r}
//                     type="button"
//                     onClick={() => setRange(r)}
//                     className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
//                     range === r
//                         ? "bg-[var(--surface2)] text-[var(--text)] shadow-sm"
//                         : "text-[var(--muted)] hover:text-[var(--text)]"
//                     }`}
//                 >
//                     {r === "hour" ? "Hour" : r === "day" ? "Day" : "Month"}
//                 </button>
//                 ))}
//             </div>
//             </div>

//             <div style={{ height: 220 }}>
//             <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={series} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
//                 <defs>
//                     <linearGradient id="monitorRespFade" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="0%" stopColor="#50d890" stopOpacity={0.22} />
//                     <stop offset="100%" stopColor="#50d890" stopOpacity={0} />
//                     </linearGradient>
//                 </defs>

//                 <XAxis dataKey="label" hide />
//                 <YAxis hide domain={["dataMin - 20", "dataMax + 20"]} />

//                 <Tooltip
//                     cursor={{ stroke: "#3a4048", strokeDasharray: "3 3" }}
//                     content={<ResponseTooltip />}
//                 />

//                 <Area
//                     type="monotone"
//                     dataKey="ms"
//                     stroke="#50d890"
//                     strokeWidth={2}
//                     fill="url(#monitorRespFade)"
//                     dot={false}
//                     activeDot={{ r: 5, fill: "#50d890", stroke: "#0b0d10", strokeWidth: 2 }}
//                 />
//                 </AreaChart>
//             </ResponsiveContainer>
//             </div>

//             <div className="axis">
//             {axisLabels.map((label, i) => (
//                 <span key={i}>{label}</span>
//             ))}
//             </div>
//         </div>

//         {/* Uptime History */}
//         <div className="mb-5">
//             <UptimeHistoryGraph />
//         </div>

//         {/* History (individual checks) */}
//         <div className="mb-5">
//             <CheckHistoryPanel monitorId={monitor.id} />
//         </div>

//         {/* Recent Incidents */}
//         <div className="panel">
//             <div className="panel-head">
//             <h4>Recent incidents</h4>
//             <small>LAST 30 DAYS</small>
//             </div>

//             {incidents.length === 0 ? (
//             <EmptyState
//                 title="No incidents in the last 30 days."
//                 description="This monitor has been stable — we'll list any downtime here the moment it happens."
//             />
//             ) : (
//             <div className="flex flex-col">
//                 {incidents.map((incident, i) => (
//                 <div className="row-line" key={i}>
//                     <div>
//                     <b>{incident.title}</b>
//                     <div className="row-sub">{incident.detail}</div>
//                     </div>

//                     <Badge tone="red">Ongoing</Badge>
//                 </div>
//                 ))}
//             </div>
//             )}
//         </div>
//         </>
//     );
// }

// import { useMemo } from "react";
// import { Link, useOutletContext, useParams } from "react-router-dom";
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
// } from "recharts";

// import type { AppData } from "../../hooks/useAppData";

// import Badge from "../../components/ui/Badge";
// import StatCard from "../../components/ui/StatCard";
// import EmptyState from "../../components/ui/EmptyState";

// import UptimeHistoryGraph from "./UptimeHistoryGraph";
// import CheckHistoryPanel from "../../components/dashboard/CheckHistoryPanel";

// /* -----------------------------------------------------------------------
//    Mock data generator for the response-time chart.

//    The API doesn't expose per-monitor response-time history yet — only
//    the rolled-up latency already shown on the Monitors table. Until that
//    exists, this builds a believable, *stable* series from the monitor's
//    own id so the chart doesn't reshuffle on every re-render.
// ----------------------------------------------------------------------- */

// function seededRandom(seed: string) {
//   let h = 0;

//   for (let i = 0; i < seed.length; i++) {
//     h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
//   }

//   return () => {
//     h = Math.imul(h ^ (h >>> 15), h | 1);
//     h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
//     return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
//   };
// }

// interface ResponsePoint {
//   hour: string;
//   ms: number;
// }

// function buildResponseSeries(id: string, latency: number | null): ResponsePoint[] {
//   const rand = seededRandom(`${id}-latency`);
//   const base = latency ?? 140;

//   return Array.from({ length: 24 }, (_, i) => ({
//     hour: `${String(i).padStart(2, "0")}:00`,
//     ms: Math.max(8, Math.round(base + (rand() - 0.5) * base * 0.4)),
//   }));
// }

// interface Incident {
//   title: string;
//   detail: string;
// }

// function buildIncidents(status: string, name: string, lastChecked: string): Incident[] {
//   if (status !== "down") return [];

//   return [
//     {
//       title: `${name} is unreachable`,
//       detail: `Health checks have been failing · last checked ${lastChecked}`,
//     },
//   ];
// }

// function ResponseTooltip({
//   active,
//   payload,
//   label,
// }: {
//   active?: boolean;
//   payload?: { value: number }[];
//   label?: string;
// }) {
//   if (!active || !payload?.length) return null;

//   return (
//     <div
//       style={{
//         background: "#1a1f26",
//         border: "1px solid var(--line)",
//         borderRadius: 6,
//         padding: "6px 9px",
//         font: "10px 'DM Mono', monospace",
//         color: "#e7eaee",
//         boxShadow: "0 8px 20px rgba(0,0,0,.4)",
//       }}
//     >
//       {label} · <b style={{ color: "var(--green)" }}>{payload[0].value}ms</b>
//     </div>
//   );
// }

// export default function MonitorDetailsPage() {
//     //   const { id } = useParams();
//     const { slug } = useParams();
//     const { monitors } = useOutletContext<AppData>();

//     const monitor = monitors.find((m) => m.slug === slug);

//     const series = useMemo(
//         () => buildResponseSeries(monitor?.id ?? "unknown", monitor?.latency ?? null),
//         [monitor?.id, monitor?.latency]
//     );

//     const incidents = useMemo(
//         () => buildIncidents(monitor?.status ?? "up", monitor?.name ?? "", monitor?.lastChecked ?? ""),
//         [monitor?.status, monitor?.name, monitor?.lastChecked]
//     );

//     if (!monitor) {
//         return (
//         <div className="mx-auto max-w-md py-20 text-center">
//             <h1 className="page-title">Monitor not found</h1>

//             <p className="mt-2 text-[13.5px]" style={{ color: "var(--muted)" }}>
//             This monitor may have been deleted, or the link is incorrect.
//             </p>

//             <Link to="/dashboard/monitors" className="btn btn-outline mt-6 inline-flex">
//             ← Back to Monitors
//             </Link>
//         </div>
//         );
//     }

//     return (
//         <>
//         <Link
//             to="/dashboard/monitors"
//             className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--text)]"
//         >
//             ← Back to Monitors
//         </Link>

//         {/* Header */}
//         <div className="mb-6">
//             <div className="flex flex-wrap items-center gap-3">
//             <h1 className="page-title">{monitor.name}</h1>

//             <Badge tone={monitor.status === "up" ? "green" : "red"}>
//                 {monitor.status === "up" ? "Up" : "Down"}
//             </Badge>
//             </div>

//             <p className="table-cell-url mt-2">{monitor.url}</p>
//         </div>

//         {/* Stats */}
//         <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             <StatCard
//             label="Response time"
//             value={monitor.latency ?? "—"}
//             unit={monitor.latency ? "ms" : undefined}
//             />

//             <StatCard label="Uptime" value={monitor.uptimePct} unit="%" />

//             <StatCard label="Last checked" value={monitor.lastChecked} />
//         </div>

//         {/* Response Time */}
//         <div className="panel mb-5">
//             <div className="panel-head">
//             <h4>Response time</h4>
//             <small>LAST 24 HOURS</small>
//             </div>

//             <div style={{ height: 220 }}>
//             <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={series} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
//                 <defs>
//                     <linearGradient id="monitorRespFade" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="0%" stopColor="#50d890" stopOpacity={0.22} />
//                     <stop offset="100%" stopColor="#50d890" stopOpacity={0} />
//                     </linearGradient>
//                 </defs>

//                 <XAxis dataKey="hour" hide />
//                 <YAxis hide domain={["dataMin - 20", "dataMax + 20"]} />

//                 <Tooltip
//                     cursor={{ stroke: "#3a4048", strokeDasharray: "3 3" }}
//                     content={<ResponseTooltip />}
//                 />

//                 <Area
//                     type="monotone"
//                     dataKey="ms"
//                     stroke="#50d890"
//                     strokeWidth={2}
//                     fill="url(#monitorRespFade)"
//                     dot={false}
//                     activeDot={{ r: 5, fill: "#50d890", stroke: "#0b0d10", strokeWidth: 2 }}
//                 />
//                 </AreaChart>
//             </ResponsiveContainer>
//             </div>

//             <div className="axis">
//             <span>00:00</span>
//             <span>06:00</span>
//             <span>12:00</span>
//             <span>18:00</span>
//             <span>NOW</span>
//             </div>
//         </div>

//         {/* Uptime History */}
//         <div className="mb-5">
//             <UptimeHistoryGraph />
//         </div>

//         {/* History (individual checks) */}
//         <div className="mb-5">
//             <CheckHistoryPanel monitorId={monitor.id} />
//         </div>

//         {/* Recent Incidents */}
//         <div className="panel">
//             <div className="panel-head">
//             <h4>Recent incidents</h4>
//             <small>LAST 30 DAYS</small>
//             </div>

//             {incidents.length === 0 ? (
//             <EmptyState
//                 title="No incidents in the last 30 days."
//                 description="This monitor has been stable — we'll list any downtime here the moment it happens."
//             />
//             ) : (
//             <div className="flex flex-col">
//                 {incidents.map((incident, i) => (
//                 <div className="row-line" key={i}>
//                     <div>
//                     <b>{incident.title}</b>
//                     <div className="row-sub">{incident.detail}</div>
//                     </div>

//                     <Badge tone="red">Ongoing</Badge>
//                 </div>
//                 ))}
//             </div>
//             )}
//         </div>
//         </>
//     );
// }

// /// here we have to add history of monitor
// import { useMemo } from "react";
// import { Link, useOutletContext, useParams } from "react-router-dom";
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
// } from "recharts";

// import type { AppData } from "../../hooks/useAppData";

// import Badge from "../../components/ui/Badge";
// import StatCard from "../../components/ui/StatCard";
// import EmptyState from "../../components/ui/EmptyState";

// import UptimeHistoryGraph from "./UptimeHistoryGraph";

// /* -----------------------------------------------------------------------
//    Mock data generator for the response-time chart.

//    The API doesn't expose per-monitor response-time history yet — only
//    the rolled-up latency already shown on the Monitors table. Until that
//    exists, this builds a believable, *stable* series from the monitor's
//    own id so the chart doesn't reshuffle on every re-render.
// ----------------------------------------------------------------------- */

// function seededRandom(seed: string) {
//   let h = 0;

//   for (let i = 0; i < seed.length; i++) {
//     h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
//   }

//   return () => {
//     h = Math.imul(h ^ (h >>> 15), h | 1);
//     h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
//     return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
//   };
// }

// interface ResponsePoint {
//   hour: string;
//   ms: number;
// }

// function buildResponseSeries(id: string, latency: number | null): ResponsePoint[] {
//   const rand = seededRandom(`${id}-latency`);
//   const base = latency ?? 140;

//   return Array.from({ length: 24 }, (_, i) => ({
//     hour: `${String(i).padStart(2, "0")}:00`,
//     ms: Math.max(8, Math.round(base + (rand() - 0.5) * base * 0.4)),
//   }));
// }

// interface Incident {
//   title: string;
//   detail: string;
// }

// function buildIncidents(status: string, name: string, lastChecked: string): Incident[] {
//   if (status !== "down") return [];

//   return [
//     {
//       title: `${name} is unreachable`,
//       detail: `Health checks have been failing · last checked ${lastChecked}`,
//     },
//   ];
// }

// function ResponseTooltip({
//   active,
//   payload,
//   label,
// }: {
//   active?: boolean;
//   payload?: { value: number }[];
//   label?: string;
// }) {
//   if (!active || !payload?.length) return null;

//   return (
//     <div
//       style={{
//         background: "#1a1f26",
//         border: "1px solid var(--line)",
//         borderRadius: 6,
//         padding: "6px 9px",
//         font: "10px 'DM Mono', monospace",
//         color: "#e7eaee",
//         boxShadow: "0 8px 20px rgba(0,0,0,.4)",
//       }}
//     >
//       {label} · <b style={{ color: "var(--green)" }}>{payload[0].value}ms</b>
//     </div>
//   );
// }

// export default function MonitorDetailsPage() {
//     //   const { id } = useParams();
//     const { slug } = useParams();
//     const { monitors } = useOutletContext<AppData>();

//     const monitor = monitors.find((m) => m.slug === slug);

//     const series = useMemo(
//         () => buildResponseSeries(monitor?.id ?? "unknown", monitor?.latency ?? null),
//         [monitor?.id, monitor?.latency]
//     );

//     const incidents = useMemo(
//         () => buildIncidents(monitor?.status ?? "up", monitor?.name ?? "", monitor?.lastChecked ?? ""),
//         [monitor?.status, monitor?.name, monitor?.lastChecked]
//     );

//     if (!monitor) {
//         return (
//         <div className="mx-auto max-w-md py-20 text-center">
//             <h1 className="page-title">Monitor not found</h1>

//             <p className="mt-2 text-[13.5px]" style={{ color: "var(--muted)" }}>
//             This monitor may have been deleted, or the link is incorrect.
//             </p>

//             <Link to="/dashboard/monitors" className="btn btn-outline mt-6 inline-flex">
//             ← Back to Monitors
//             </Link>
//         </div>
//         );
//     }

//     return (
//         <>
//         <Link
//             to="/dashboard/monitors"
//             className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--text)]"
//         >
//             ← Back to Monitors
//         </Link>

//         {/* Header */}
//         <div className="mb-6">
//             <div className="flex flex-wrap items-center gap-3">
//             <h1 className="page-title">{monitor.name}</h1>

//             <Badge tone={monitor.status === "up" ? "green" : "red"}>
//                 {monitor.status === "up" ? "Up" : "Down"}
//             </Badge>
//             </div>

//             <p className="table-cell-url mt-2">{monitor.url}</p>
//         </div>

//         {/* Stats */}
//         <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             <StatCard
//             label="Response time"
//             value={monitor.latency ?? "—"}
//             unit={monitor.latency ? "ms" : undefined}
//             />

//             <StatCard label="Uptime" value={monitor.uptimePct} unit="%" />

//             <StatCard label="Last checked" value={monitor.lastChecked} />
//         </div>

//         {/* Response Time */}
//         <div className="panel mb-5">
//             <div className="panel-head">
//             <h4>Response time</h4>
//             <small>LAST 24 HOURS</small>
//             </div>

//             <div style={{ height: 220 }}>
//             <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={series} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
//                 <defs>
//                     <linearGradient id="monitorRespFade" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="0%" stopColor="#50d890" stopOpacity={0.22} />
//                     <stop offset="100%" stopColor="#50d890" stopOpacity={0} />
//                     </linearGradient>
//                 </defs>

//                 <XAxis dataKey="hour" hide />
//                 <YAxis hide domain={["dataMin - 20", "dataMax + 20"]} />

//                 <Tooltip
//                     cursor={{ stroke: "#3a4048", strokeDasharray: "3 3" }}
//                     content={<ResponseTooltip />}
//                 />

//                 <Area
//                     type="monotone"
//                     dataKey="ms"
//                     stroke="#50d890"
//                     strokeWidth={2}
//                     fill="url(#monitorRespFade)"
//                     dot={false}
//                     activeDot={{ r: 5, fill: "#50d890", stroke: "#0b0d10", strokeWidth: 2 }}
//                 />
//                 </AreaChart>
//             </ResponsiveContainer>
//             </div>

//             <div className="axis">
//             <span>00:00</span>
//             <span>06:00</span>
//             <span>12:00</span>
//             <span>18:00</span>
//             <span>NOW</span>
//             </div>
//         </div>

//         {/* Uptime History */}
//         <div className="mb-5">
//             <UptimeHistoryGraph />
//         </div>

//         {/* Recent Incidents */}
//         <div className="panel">
//             <div className="panel-head">
//             <h4>Recent incidents</h4>
//             <small>LAST 30 DAYS</small>
//             </div>

//             {incidents.length === 0 ? (
//             <EmptyState
//                 title="No incidents in the last 30 days."
//                 description="This monitor has been stable — we'll list any downtime here the moment it happens."
//             />
//             ) : (
//             <div className="flex flex-col">
//                 {incidents.map((incident, i) => (
//                 <div className="row-line" key={i}>
//                     <div>
//                     <b>{incident.title}</b>
//                     <div className="row-sub">{incident.detail}</div>
//                     </div>

//                     <Badge tone="red">Ongoing</Badge>
//                 </div>
//                 ))}
//             </div>
//             )}
//         </div>
//         </>
//     );
// }
