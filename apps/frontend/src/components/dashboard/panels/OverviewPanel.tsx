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
    <div className="mt-[13px] grid grid-cols-[1.5fr_0.85fr] gap-[13px]">
      <div>
        <ResponseTimeGraph live monitors={monitors} />

        <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px] mt-[13px]">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="m-0 text-[11px] font-semibold">Monitors</h4>
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

        <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px]" style={{ marginTop: "13px" }}>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="m-0 text-[11px] font-semibold">Recent alerts</h4>
            <small
              style={{ cursor: "pointer" }}
              onClick={() => onNavigate("alerts")}
            >
              VIEW ALL →
            </small>
          </div>
          {alerts.slice(0, 2).map((a) => (
            <div className="flex items-center justify-between border-t border-[#222830] px-1 py-[11px] text-[12px] first:border-t-0" key={a.id}>
              <div>
                <b className="font-semibold">{a.monitor}</b>
                <div className="mt-0.5 text-[10px] text-[#818994]">{a.detail}</div>
              </div>
              <span
                className={`rounded border px-[7px] py-[3px] font-code text-[9px] leading-[normal] ${a.status === "sent" ? "border-[#5c3d1a] text-warning" : "border-[#254d3a] text-brand"}`}
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
//     <div className="mt-[13px] grid grid-cols-[1.5fr_0.85fr] gap-[13px]">
//       <div>
//         <ResponseTimeGraph live />

//         <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px] mt-[13px]">
//           <div className="mb-3 flex items-center justify-between">
//             <h4 className="m-0 text-[11px] font-semibold">Monitors</h4>
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

//         <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px]" style={{ marginTop: "13px" }}>
//           <div className="mb-3 flex items-center justify-between">
//             <h4 className="m-0 text-[11px] font-semibold">Recent alerts</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("alerts")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {alerts.slice(0, 2).map((a) => (
//             <div className="flex items-center justify-between border-t border-[#222830] px-1 py-[11px] text-[12px] first:border-t-0" key={a.id}>
//               <div>
//                 <b className="font-semibold">{a.monitor}</b>
//                 <div className="mt-0.5 text-[10px] text-[#818994]">{a.detail}</div>
//               </div>
//               <span className={`rounded border px-[7px] py-[3px] font-code text-[9px] leading-[normal] ${a.status === "sent" ? "border-[#5c3d1a] text-warning" : "border-[#254d3a] text-brand"}`}>
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
//     <div className="mt-[13px] grid grid-cols-[1.5fr_0.85fr] gap-[13px]">
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

//         <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px] mt-[13px]">
//           <div className="mb-3 flex items-center justify-between">
//             <h4 className="m-0 text-[11px] font-semibold">Monitors</h4>
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

//         <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px]" style={{ marginTop: "13px" }}>
//           <div className="mb-3 flex items-center justify-between">
//             <h4 className="m-0 text-[11px] font-semibold">Recent alerts</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("alerts")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {alerts.slice(0, 2).map((a) => (
//             <div className="flex items-center justify-between border-t border-[#222830] px-1 py-[11px] text-[12px] first:border-t-0" key={a.id}>
//               <div>
//                 <b className="font-semibold">{a.monitor}</b>
//                 <div className="mt-0.5 text-[10px] text-[#818994]">{a.detail}</div>
//               </div>
//               <span className={`rounded border px-[7px] py-[3px] font-code text-[9px] leading-[normal] ${a.status === "sent" ? "border-[#5c3d1a] text-warning" : "border-[#254d3a] text-brand"}`}>
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
//     <div className="mt-[13px] grid grid-cols-[1.5fr_0.85fr] gap-[13px]">
//       <div>
//         <ResponseTimeGraph live monitors={monitors} />

//         <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px] mt-[13px]">
//           <div className="mb-3 flex items-center justify-between">
//             <h4 className="m-0 text-[11px] font-semibold">Monitors</h4>
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

//         <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px]" style={{ marginTop: "13px" }}>
//           <div className="mb-3 flex items-center justify-between">
//             <h4 className="m-0 text-[11px] font-semibold">Recent alerts</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("alerts")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {alerts.slice(0, 2).map((a) => (
//             <div className="flex items-center justify-between border-t border-[#222830] px-1 py-[11px] text-[12px] first:border-t-0" key={a.id}>
//               <div>
//                 <b className="font-semibold">{a.monitor}</b>
//                 <div className="mt-0.5 text-[10px] text-[#818994]">{a.detail}</div>
//               </div>
//               <span className={`rounded border px-[7px] py-[3px] font-code text-[9px] leading-[normal] ${a.status === "sent" ? "border-[#5c3d1a] text-warning" : "border-[#254d3a] text-brand"}`}>
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
//     <div className="mt-[13px] grid grid-cols-[1.5fr_0.85fr] gap-[13px]">
//       <div>
//         <ResponseTimeGraph live monitors={monitors} />

//         <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px] mt-[13px]">
//           <div className="mb-3 flex items-center justify-between">
//             <h4 className="m-0 text-[11px] font-semibold">Monitors</h4>
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

//         <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px]" style={{ marginTop: "13px" }}>
//           <div className="mb-3 flex items-center justify-between">
//             <h4 className="m-0 text-[11px] font-semibold">Recent alerts</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("alerts")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {alerts.slice(0, 2).map((a) => (
//             <div className="flex items-center justify-between border-t border-[#222830] px-1 py-[11px] text-[12px] first:border-t-0" key={a.id}>
//               <div>
//                 <b className="font-semibold">{a.monitor}</b>
//                 <div className="mt-0.5 text-[10px] text-[#818994]">{a.detail}</div>
//               </div>
//               <span className={`rounded border px-[7px] py-[3px] font-code text-[9px] leading-[normal] ${a.status === "sent" ? "border-[#5c3d1a] text-warning" : "border-[#254d3a] text-brand"}`}>
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
//     <div className="mt-[13px] grid grid-cols-[1.5fr_0.85fr] gap-[13px]">
//       <div>
//         <ResponseTimeGraph live />

//         <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px] mt-[13px]">
//           <div className="mb-3 flex items-center justify-between">
//             <h4 className="m-0 text-[11px] font-semibold">Monitors</h4>
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

//         <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px]" style={{ marginTop: "13px" }}>
//           <div className="mb-3 flex items-center justify-between">
//             <h4 className="m-0 text-[11px] font-semibold">Recent alerts</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("alerts")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {alerts.slice(0, 2).map((a) => (
//             <div className="flex items-center justify-between border-t border-[#222830] px-1 py-[11px] text-[12px] first:border-t-0" key={a.id}>
//               <div>
//                 <b className="font-semibold">{a.monitor}</b>
//                 <div className="mt-0.5 text-[10px] text-[#818994]">{a.detail}</div>
//               </div>
//               <span className={`rounded border px-[7px] py-[3px] font-code text-[9px] leading-[normal] ${a.status === "sent" ? "border-[#5c3d1a] text-warning" : "border-[#254d3a] text-brand"}`}>
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
//     <div className="mt-[13px] grid grid-cols-[1.5fr_0.85fr] gap-[13px]">
//       <div>
//         <ResponseTimeGraph live monitors={monitors} />

//         <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px] mt-[13px]">
//           <div className="mb-3 flex items-center justify-between">
//             <h4 className="m-0 text-[11px] font-semibold">Monitors</h4>
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

//         <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px]" style={{ marginTop: "13px" }}>
//           <div className="mb-3 flex items-center justify-between">
//             <h4 className="m-0 text-[11px] font-semibold">Recent alerts</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("alerts")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {alerts.slice(0, 2).map((a) => (
//             <div className="flex items-center justify-between border-t border-[#222830] px-1 py-[11px] text-[12px] first:border-t-0" key={a.id}>
//               <div>
//                 <b className="font-semibold">{a.monitor}</b>
//                 <div className="mt-0.5 text-[10px] text-[#818994]">{a.detail}</div>
//               </div>
//               <span className={`rounded border px-[7px] py-[3px] font-code text-[9px] leading-[normal] ${a.status === "sent" ? "border-[#5c3d1a] text-warning" : "border-[#254d3a] text-brand"}`}>
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
//     <div className="mt-[13px] grid grid-cols-[1.5fr_0.85fr] gap-[13px]">
//       <div>
//         <ResponseTimeGraph live />

//         <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px] mt-[13px]">
//           <div className="mb-3 flex items-center justify-between">
//             <h4 className="m-0 text-[11px] font-semibold">Monitors</h4>
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

//         <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px]" style={{ marginTop: "13px" }}>
//           <div className="mb-3 flex items-center justify-between">
//             <h4 className="m-0 text-[11px] font-semibold">Recent alerts</h4>
//             <small style={{ cursor: "pointer" }} onClick={() => onNavigate("alerts")}>
//               VIEW ALL →
//             </small>
//           </div>
//           {alerts.slice(0, 2).map((a) => (
//             <div className="flex items-center justify-between border-t border-[#222830] px-1 py-[11px] text-[12px] first:border-t-0" key={a.id}>
//               <div>
//                 <b className="font-semibold">{a.monitor}</b>
//                 <div className="mt-0.5 text-[10px] text-[#818994]">{a.detail}</div>
//               </div>
//               <span className={`rounded border px-[7px] py-[3px] font-code text-[9px] leading-[normal] ${a.status === "sent" ? "border-[#5c3d1a] text-warning" : "border-[#254d3a] text-brand"}`}>
//                 {a.status === "sent" ? "SENT" : "RESOLVED"}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
