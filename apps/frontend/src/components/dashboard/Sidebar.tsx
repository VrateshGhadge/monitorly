import {
  SIDEBAR_ITEMS,
  SIDEBAR_MANAGE,
  type SectionKey,
} from "../../data/navigation";

interface SidebarProps {
  activeSection: SectionKey;
  onSelect: (key: SectionKey) => void;
  monitorsTotal: number;
}

export default function Sidebar({
  activeSection,
  onSelect,
  monitorsTotal,
}: SidebarProps) {
  return (
    <aside className="side">
      <div className="side-brand">
        <span className="small-mark"></span> monitorly
      </div>

      <div className="side-title">Workspace</div>

      {SIDEBAR_ITEMS.map((item) => (
        <div
          key={item.key}
          className={`side-item${activeSection === item.key ? " active" : ""}`}
          onClick={() => onSelect(item.key)}
        >
          {item.icon && <item.icon />}
          <span>{item.label}</span>

          {item.key === "monitors" && (
            <span style={{ marginLeft: "auto" }}>{monitorsTotal}</span>
          )}
        </div>
      ))}

      <div className="side-title">Manage</div>

      {SIDEBAR_MANAGE.map((item) => (
        <div
          key={item.key}
          className={`side-item${activeSection === item.key ? " active" : ""}`}
          onClick={() => onSelect(item.key)}
        >
          {item.icon && <item.icon />}
          <span>{item.label}</span>
        </div>
      ))}

      <div className="sidebar-hint">Click around — it's live</div>
    </aside>
  );
}

// import { SIDEBAR_ITEMS, SIDEBAR_MANAGE, type SectionKey } from "../../data/navigation";

// interface SidebarProps {
//   activeSection: SectionKey;
//   onSelect: (key: SectionKey) => void;
//   monitorsTotal: number;
// }

// export default function Sidebar({ activeSection, onSelect, monitorsTotal }: SidebarProps) {
//   return (
//     <aside className="side">
//       <div className="side-brand"><span className="small-mark"></span> monitorly</div>
//       <div className="side-title">Workspace</div>
//       {/* {SIDEBAR_ITEMS.map((item) => (
//         <div
//           key={item.key}
//           className={`side-item${activeSection === item.key ? " active" : ""}`}
//           onClick={() => onSelect(item.key)}
//         >
//           {item.icon && <item.icon />}
//           {item.key === "monitors" && <span style={{ marginLeft: "auto" }}>{monitorsTotal}</span>}
//         </div>
//       ))} */}

//       {SIDEBAR_ITEMS.map((item) => (
//         <div
//           key={item.key}
//           className={`side-item${activeSection === item.key ? " active" : ""}`}
//           onClick={() => onSelect(item.key)}
//         >
//           {item.icon && <item.icon />}
//           <span>{item.key === "overview" ? "Overview" : "Monitors"}</span>

//           {item.key === "monitors" && (
//             <span style={{ marginLeft: "auto" }}>{monitorsTotal}</span>
//           )}
//         </div>
//       ))}

//       <div className="side-title">Manage</div>
//       {/* {SIDEBAR_MANAGE.map((item) => (
//         <div
//           key={item.key}
//           className={`side-item${activeSection === item.key ? " active" : ""}`}
//           onClick={() => onSelect(item.key)}
//         >
//           {item.icon && <item.icon />}
//         </div>
//       ))} */}

//       {SIDEBAR_MANAGE.map((item) => (
//         <div
//           key={item.key}
//           className={`side-item${activeSection === item.key ? " active" : ""}`}
//           onClick={() => onSelect(item.key)}
//         >
//           {item.icon && <item.icon />}
//           <span>Settings</span>
//         </div>
//       ))}
//       <div className="sidebar-hint">Click around — it's live</div>
//     </aside>
//   );
// }
