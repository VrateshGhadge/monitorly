import type { Monitor, AlertEvent } from "../../../types/dashboard";
import type { SectionKey } from "../../../data/navigation";
import MonitorRow from "../MonitorRow";
import ResponseTimeGraph from "../ResponseTimeGraph";
import UptimeHistoryGraph from "../UptimeHistoryGraph";

interface OverviewPanelProps {
  monitors: Monitor[];
  alerts: AlertEvent[];
  onToggleMonitor: (id: string) => void;
  onNavigate: (section: SectionKey) => void;
}

export default function OverviewPanel({
  monitors,
  alerts,
  onToggleMonitor,
  onNavigate,
}: OverviewPanelProps) {
  return (
    <div className="dash-grid">
      <div>
        <ResponseTimeGraph live monitors={monitors} />

        <div className="panel monitor-list">
          <div className="panel-head">
            <h4>Monitors</h4>
            <small
              style={{ cursor: "pointer" }}
              onClick={() => onNavigate("monitors")}
            >
              VIEW ALL →
            </small>
          </div>
          {monitors.slice(0, 3).map((m) => (
            <MonitorRow key={m.id} monitor={m} onToggle={onToggleMonitor} />
          ))}
        </div>
      </div>

      <div>
        <UptimeHistoryGraph
          live
          monitors={monitors}
          onViewAll={() => onNavigate("monitors")}
        />

        <div className="panel" style={{ marginTop: "13px" }}>
          <div className="panel-head">
            <h4>Recent alerts</h4>
            <small
              style={{ cursor: "pointer" }}
              onClick={() => onNavigate("alerts")}
            >
              VIEW ALL →
            </small>
          </div>
          {alerts.slice(0, 2).map((a) => (
            <div className="row-line" key={a.id}>
              <div>
                <b>{a.monitor}</b>
                <div className="row-sub">{a.detail}</div>
              </div>
              <span
                className={`hb-status${a.status === "sent" ? " late" : ""}`}
              >
                {a.status === "sent" ? "SENT" : "RESOLVED"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// import type { Monitor, AlertEvent } from "../../../types/dashboard";
// import type { SectionKey } from "../../../data/navigation";
// import MonitorRow from "../MonitorRow";
// import ResponseTimeGraph from "../ResponseTimeGraph";
// import UptimeHistoryGraph from "../UptimeHistoryGraph";

// interface OverviewPanelProps {
//   monitors: Monitor[];
//   alerts: AlertEvent[];
//   onToggleMonitor: (id: string) => void;
//   onNavigate: (section: SectionKey) => void;
// }

// export default function OverviewPanel({ monitors, alerts, onToggleMonitor, onNavigate }: OverviewPanelProps) {
//   return (
//     <div className="dash-grid">
//       <div>
//         <ResponseTimeGraph live />

//         <div className="panel monitor-list">
//           <div className="panel-head">
//             <h4>Monitors</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("monitors")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {monitors.slice(0, 3).map((m) => (
//             <MonitorRow key={m.id} monitor={m} onToggle={onToggleMonitor} />
//           ))}
//         </div>
//       </div>

//       <div>
//         <UptimeHistoryGraph live />

//         <div className="panel" style={{ marginTop: "13px" }}>
//           <div className="panel-head">
//             <h4>Recent alerts</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("alerts")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {alerts.slice(0, 2).map((a) => (
//             <div className="row-line" key={a.id}>
//               <div>
//                 <b>{a.monitor}</b>
//                 <div className="row-sub">{a.detail}</div>
//               </div>
//               <span className={`hb-status${a.status === "sent" ? " late" : ""}`}>
//                 {a.status === "sent" ? "SENT" : "RESOLVED"}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useState } from "react";
// import type { AppMonitor } from "../../../types/app";
// import type { AlertEvent } from "../../../types/dashboard";
// import type { SectionKey } from "../../../data/navigation";

// type ResponseRange = "hour" | "day" | "month";

// import MonitorRow from "../MonitorRow";
// import ResponseTimeGraph from "../ResponseTimeGraph";
// import UptimeHistoryGraph from "../UptimeHistoryGraph";

// interface OverviewPanelProps {
//   monitors: AppMonitor[];
//   alerts: AlertEvent[];
//   onToggleMonitor: (id: string) => void;
//   onNavigate: (section: SectionKey) => void;
// }

// export default function OverviewPanel({ monitors, alerts, onToggleMonitor, onNavigate }: OverviewPanelProps) {
//   const [range, setRange] = useState<ResponseRange>("day");

//   return (
//     <div className="dash-grid">
//       <div>
//         {/* --- Range switcher --- */}
//         <div className="range-tabs" style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
//           <button
//             className={range === "hour" ? "active" : ""}
//             onClick={() => setRange("hour")}
//           >
//             Hour
//           </button>
//           <button
//             className={range === "day" ? "active" : ""}
//             onClick={() => setRange("day")}
//           >
//             Day
//           </button>
//           <button
//             className={range === "month" ? "active" : ""}
//             onClick={() => setRange("month")}
//           >
//             Month
//           </button>
//         </div>

//         <ResponseTimeGraph monitors={monitors}  />

//         <div className="panel monitor-list">
//           <div className="panel-head">
//             <h4>Monitors</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("monitors")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {monitors.slice(0, 3).map((m) => (
//             <MonitorRow key={m.id} monitor={m} onToggle={onToggleMonitor} />
//           ))}
//         </div>
//       </div>

//       <div>
//         <UptimeHistoryGraph
//           monitors={monitors}
//           range={range}
//           onViewAll={() => onNavigate("monitors")}
//         />

//         <div className="panel" style={{ marginTop: "13px" }}>
//           <div className="panel-head">
//             <h4>Recent alerts</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("alerts")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {alerts.slice(0, 2).map((a) => (
//             <div className="row-line" key={a.id}>
//               <div>
//                 <b>{a.monitor}</b>
//                 <div className="row-sub">{a.detail}</div>
//               </div>
//               <span className={`hb-status${a.status === "sent" ? " late" : ""}`}>
//                 {a.status === "sent" ? "SENT" : "RESOLVED"}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// //src->components->dashboard->panels->OverviewPanel
// import type { AppMonitor } from "../../../types/app";
// import type { AlertEvent } from "../../../types/dashboard";
// import type { SectionKey } from "../../../data/navigation";
// import MonitorRow from "../MonitorRow";
// import ResponseTimeGraph from "../ResponseTimeGraph";
// import UptimeHistoryGraph from "../UptimeHistoryGraph";

// interface OverviewPanelProps {
//   monitors: AppMonitor[];
//   alerts: AlertEvent[];
//   onToggleMonitor: (id: string) => void;
//   onNavigate: (section: SectionKey) => void;
// }

// export default function OverviewPanel({ monitors, alerts, onToggleMonitor, onNavigate }: OverviewPanelProps) {
//   return (
//     <div className="dash-grid">
//       <div>
//         <ResponseTimeGraph live monitors={monitors} />

//         <div className="panel monitor-list">
//           <div className="panel-head">
//             <h4>Monitors</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("monitors")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {monitors.slice(0, 3).map((m) => (
//             <MonitorRow key={m.id} monitor={m} onToggle={onToggleMonitor} />
//           ))}
//         </div>
//       </div>

//       <div>
//         <UptimeHistoryGraph live monitors={monitors} onViewAll={() => onNavigate("monitors")} />

//         <div className="panel" style={{ marginTop: "13px" }}>
//           <div className="panel-head">
//             <h4>Recent alerts</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("alerts")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {alerts.slice(0, 2).map((a) => (
//             <div className="row-line" key={a.id}>
//               <div>
//                 <b>{a.monitor}</b>
//                 <div className="row-sub">{a.detail}</div>
//               </div>
//               <span className={`hb-status${a.status === "sent" ? " late" : ""}`}>
//                 {a.status === "sent" ? "SENT" : "RESOLVED"}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// import type { Monitor, AlertEvent } from "../../../types/dashboard";
// import type { SectionKey } from "../../../data/navigation";
// import MonitorRow from "../MonitorRow";
// import ResponseTimeGraph from "../ResponseTimeGraph";
// import UptimeHistoryGraph from "../UptimeHistoryGraph";

// interface OverviewPanelProps {
//   monitors: Monitor[];
//   alerts: AlertEvent[];
//   onToggleMonitor: (id: string) => void;
//   onNavigate: (section: SectionKey) => void;
// }

// export default function OverviewPanel({ monitors, alerts, onToggleMonitor, onNavigate }: OverviewPanelProps) {
//   return (
//     <div className="dash-grid">
//       <div>
//         <ResponseTimeGraph live monitors={monitors} />

//         <div className="panel monitor-list">
//           <div className="panel-head">
//             <h4>Monitors</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("monitors")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {monitors.slice(0, 3).map((m) => (
//             <MonitorRow key={m.id} monitor={m} onToggle={onToggleMonitor} />
//           ))}
//         </div>
//       </div>

//       <div>
//         <UptimeHistoryGraph live monitors={monitors} onViewAll={() => onNavigate("monitors")} />

//         <div className="panel" style={{ marginTop: "13px" }}>
//           <div className="panel-head">
//             <h4>Recent alerts</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("alerts")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {alerts.slice(0, 2).map((a) => (
//             <div className="row-line" key={a.id}>
//               <div>
//                 <b>{a.monitor}</b>
//                 <div className="row-sub">{a.detail}</div>
//               </div>
//               <span className={`hb-status${a.status === "sent" ? " late" : ""}`}>
//                 {a.status === "sent" ? "SENT" : "RESOLVED"}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// import type { Monitor, AlertEvent } from "../../../types/dashboard";
// import type { SectionKey } from "../../../data/navigation";
// import MonitorRow from "../MonitorRow";
// import ResponseTimeGraph from "../ResponseTimeGraph";
// import UptimeHistoryGraph from "../UptimeHistoryGraph";

// interface OverviewPanelProps {
//   monitors: Monitor[];
//   alerts: AlertEvent[];
//   onToggleMonitor: (id: string) => void;
//   onNavigate: (section: SectionKey) => void;
// }

// export default function OverviewPanel({ monitors, alerts, onToggleMonitor, onNavigate }: OverviewPanelProps) {
//   return (
//     <div className="dash-grid">
//       <div>
//         <ResponseTimeGraph live />

//         <div className="panel monitor-list">
//           <div className="panel-head">
//             <h4>Monitors</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("monitors")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {monitors.slice(0, 3).map((m) => (
//             <MonitorRow key={m.id} monitor={m} onToggle={onToggleMonitor} />
//           ))}
//         </div>
//       </div>

//       <div>
//         <UptimeHistoryGraph live />

//         <div className="panel" style={{ marginTop: "13px" }}>
//           <div className="panel-head">
//             <h4>Recent alerts</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("alerts")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {alerts.slice(0, 2).map((a) => (
//             <div className="row-line" key={a.id}>
//               <div>
//                 <b>{a.monitor}</b>
//                 <div className="row-sub">{a.detail}</div>
//               </div>
//               <span className={`hb-status${a.status === "sent" ? " late" : ""}`}>
//                 {a.status === "sent" ? "SENT" : "RESOLVED"}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// import type { Monitor, AlertEvent } from "../../../types/dashboard";
// import type { SectionKey } from "../../../data/navigation";
// import MonitorRow from "../MonitorRow";
// import ResponseTimeGraph from "../ResponseTimeGraph";
// import UptimeHistoryGraph from "../UptimeHistoryGraph";

// interface OverviewPanelProps {
//   monitors: Monitor[];
//   alerts: AlertEvent[];
//   onToggleMonitor: (id: string) => void;
//   onNavigate: (section: SectionKey) => void;
// }

// export default function OverviewPanel({ monitors, alerts, onToggleMonitor, onNavigate }: OverviewPanelProps) {
//   return (
//     <div className="dash-grid">
//       <div>
//         <ResponseTimeGraph live monitors={monitors} />

//         <div className="panel monitor-list">
//           <div className="panel-head">
//             <h4>Monitors</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("monitors")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {monitors.slice(0, 3).map((m) => (
//             <MonitorRow key={m.id} monitor={m} onToggle={onToggleMonitor} />
//           ))}
//         </div>
//       </div>

//       <div>
//         <UptimeHistoryGraph live monitors={monitors} />

//         <div className="panel" style={{ marginTop: "13px" }}>
//           <div className="panel-head">
//             <h4>Recent alerts</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("alerts")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {alerts.slice(0, 2).map((a) => (
//             <div className="row-line" key={a.id}>
//               <div>
//                 <b>{a.monitor}</b>
//                 <div className="row-sub">{a.detail}</div>
//               </div>
//               <span className={`hb-status${a.status === "sent" ? " late" : ""}`}>
//                 {a.status === "sent" ? "SENT" : "RESOLVED"}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// import type { Monitor, AlertEvent } from "../../../types/dashboard";
// import type { SectionKey } from "../../../data/navigation";
// import MonitorRow from "../MonitorRow";
// import ResponseTimeGraph from "../ResponseTimeGraph";
// import UptimeHistoryGraph from "../UptimeHistoryGraph";

// interface OverviewPanelProps {
//   monitors: Monitor[];
//   alerts: AlertEvent[];
//   onToggleMonitor: (id: string) => void;
//   onNavigate: (section: SectionKey) => void;
// }

// export default function OverviewPanel({ monitors, alerts, onToggleMonitor, onNavigate }: OverviewPanelProps) {
//   return (
//     <div className="dash-grid">
//       <div>
//         <ResponseTimeGraph live />

//         <div className="panel monitor-list">
//           <div className="panel-head">
//             <h4>Monitors</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("monitors")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {monitors.slice(0, 3).map((m) => (
//             <MonitorRow key={m.id} monitor={m} onToggle={onToggleMonitor} />
//           ))}
//         </div>
//       </div>

//       <div>
//         <UptimeHistoryGraph live />

//         <div className="panel" style={{ marginTop: "13px" }}>
//           <div className="panel-head">
//             <h4>Recent alerts</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("alerts")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {alerts.slice(0, 2).map((a) => (
//             <div className="row-line" key={a.id}>
//               <div>
//                 <b>{a.monitor}</b>
//                 <div className="row-sub">{a.detail}</div>
//               </div>
//               <span className={`hb-status${a.status === "sent" ? " late" : ""}`}>
//                 {a.status === "sent" ? "SENT" : "RESOLVED"}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
