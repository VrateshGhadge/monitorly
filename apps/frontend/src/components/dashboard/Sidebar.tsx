import { cn } from "../../lib/utils";
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
    <aside className="border-r border-line bg-[#0d1014] px-[11px] py-[18px]">
      <div className="flex items-center gap-[7px] px-[9px] pt-1 pb-5 text-[14px] font-extrabold">
        <span className="size-[15px] rounded-[4px] border-[1.5px] border-brand"></span> monitorly
      </div>

      <div className="mx-[9px] mt-[15px] mb-[7px] font-code text-[10px] leading-[normal] tracking-[0.09em] text-[#616974] uppercase">Workspace</div>

      {SIDEBAR_ITEMS.map((item) => (
        <div
          key={item.key}
          className={cn(
            "mx-0 my-px flex cursor-pointer items-center gap-[9px] rounded-[5px] border border-transparent px-[9px] py-[7px] text-[12px] text-[#a6aeb8] transition-[0.15s] hover:bg-[#161b21] hover:text-[#e3e6ea] [&>svg]:size-3.5 [&>svg]:stroke-[1.8]",
            activeSection === item.key && "bg-[#1a1f26] text-[#f1f3f4]",
          )}
          onClick={() => onSelect(item.key)}
        >
          {item.icon && <item.icon />}
          <span>{item.label}</span>

          {item.key === "monitors" && (
            <span style={{ marginLeft: "auto" }}>{monitorsTotal}</span>
          )}
        </div>
      ))}

      <div className="mx-[9px] mt-[15px] mb-[7px] font-code text-[10px] leading-[normal] tracking-[0.09em] text-[#616974] uppercase">Manage</div>

      {SIDEBAR_MANAGE.map((item) => (
        <div
          key={item.key}
          className={cn(
            "mx-0 my-px flex cursor-pointer items-center gap-[9px] rounded-[5px] border border-transparent px-[9px] py-[7px] text-[12px] text-[#a6aeb8] transition-[0.15s] hover:bg-[#161b21] hover:text-[#e3e6ea] [&>svg]:size-3.5 [&>svg]:stroke-[1.8]",
            activeSection === item.key && "bg-[#1a1f26] text-[#f1f3f4]",
          )}
          onClick={() => onSelect(item.key)}
        >
          {item.icon && <item.icon />}
          <span>{item.label}</span>
        </div>
      ))}

      <div className="px-[9px] pt-2 font-code text-[9px] leading-[normal] text-[#4c545e]">Click around — it's live</div>
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
