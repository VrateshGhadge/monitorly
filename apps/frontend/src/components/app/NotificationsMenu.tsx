import { useEffect, useRef, useState } from "react";
import type { ActivityItem } from "../../types/app";
import { formatLastChecked } from "../../lib/date";
import { BellIcon, MonitorsIcon, AlertsIcon } from "./icons";

interface NotificationsMenuProps {
  activity: ActivityItem[];
}

function ActivityIcon({ kind }: { kind: ActivityItem["kind"] }) {
  if (kind === "alert") return <AlertsIcon size={14} />;
  if (kind === "created") return <MonitorsIcon size={14} />;
  // deleted / updated
  return <MonitorsIcon size={14} />;
}

export default function NotificationsMenu({
  activity,
}: NotificationsMenuProps) {
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(activity.length > 0);
  const ref = useRef<HTMLDivElement | null>(null);

  // Update unread state when new activity arrives
  useEffect(() => {
    if (activity.length > 0) {
      setHasUnread(true);
    }
  }, [activity]);

  // Close on outside click / Escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="popover-anchor" ref={ref}>
      <button
        className="icon-btn"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          setHasUnread(false);
        }}
      >
        <BellIcon />
        {hasUnread && <span className="notif-dot" />}
      </button>

      {open && (
        <div
          className="popover notif-popover"
          role="menu"
          aria-label="Notifications"
        >
          <div className="popover-head">
            <h4>Notifications</h4>
          </div>
          {activity.length === 0 ? (
            <div className="popover-empty">
              <BellIcon size={20} />
              <p>You're all caught up</p>
              <small>New activity will show up here.</small>
            </div>
          ) : (
            <div className="popover-list">
              {activity.slice(0, 8).map((item) => (
                <div className="popover-item" role="menuitem" key={item.id}>
                  <span className={`popover-item-icon icon-${item.kind}`}>
                    <ActivityIcon kind={item.kind} />
                  </span>
                  <div>
                    <p>{item.text}</p>
                    <small>{formatLastChecked(item.time)}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// import { useEffect, useRef, useState } from "react";
// import type { ActivityItem } from "../../types/app";
// import {
//   BellIcon,
//   MonitorsIcon,
//   AlertsIcon,
// } from "./icons";

// interface NotificationsMenuProps {
//   activity: ActivityItem[];
// }

// function ActivityIcon({ kind }: { kind: ActivityItem["kind"] }) {
//   if (kind === "alert") return <AlertsIcon size={14} />;
//   if (kind === "created") return <MonitorsIcon size={14} />;
//   // deleted / updated
//   return <MonitorsIcon size={14} />;
// }

// export default function NotificationsMenu({ activity }: NotificationsMenuProps) {
//   const [open, setOpen] = useState(false);
//   const [hasUnread, setHasUnread] = useState(activity.length > 0);
//   const ref = useRef<HTMLDivElement | null>(null);

//   // Update unread state when new activity arrives
//   useEffect(() => {
//     if (activity.length > 0) {
//       setHasUnread(true);
//     }
//   }, [activity]);

//   // Close on outside click / Escape
//   useEffect(() => {
//     const onClick = (e: MouseEvent) => {
//       if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
//     };
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setOpen(false);
//     };
//     document.addEventListener("mousedown", onClick);
//     document.addEventListener("keydown", onKey);
//     return () => {
//       document.removeEventListener("mousedown", onClick);
//       document.removeEventListener("keydown", onKey);
//     };
//   }, []);

//   return (
//     <div className="popover-anchor" ref={ref}>
//       <button
//         className="icon-btn"
//         aria-label="Notifications"
//         aria-haspopup="true"
//         aria-expanded={open}
//         onClick={() => {
//           setOpen((o) => !o);
//           setHasUnread(false);
//         }}
//       >
//         <BellIcon />
//         {hasUnread && <span className="notif-dot" />}
//       </button>

//       {open && (
//         <div className="popover notif-popover" role="menu" aria-label="Notifications">
//           <div className="popover-head">
//             <h4>Notifications</h4>
//           </div>
//           {activity.length === 0 ? (
//             <div className="popover-empty">
//               <BellIcon size={20} />
//               <p>You're all caught up</p>
//               <small>New activity will show up here.</small>
//             </div>
//           ) : (
//             <div className="popover-list">
//               {activity.slice(0, 8).map((item) => (
//                 <div className="popover-item" role="menuitem" key={item.id}>
//                   <span className={`popover-item-icon icon-${item.kind}`}>
//                     <ActivityIcon kind={item.kind} />
//                   </span>
//                   <div>
//                     <p>{item.text}</p>
//                     <small>{item.time}</small>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// import { useEffect, useRef, useState } from "react";
// import type { ActivityItem } from "../../types/app";
// // import { BellIcon, MonitorsIcon, AlertsIcon, PauseIcon, PlayIcon } from "./icons";
// import {
//   BellIcon,
//   MonitorsIcon,
//   AlertsIcon,
//   // PauseIcon,
//   // PlayIcon,
// } from "./icons";

// interface NotificationsMenuProps {
//   activity: ActivityItem[];
// }

// // function ActivityIcon({ kind }: { kind: ActivityItem["kind"] }) {
// //   if (kind === "alert") return <AlertsIcon size={14} />;
// //   if (kind === "created") return <MonitorsIcon size={14} />;
// //   if (kind === "paused") return <PauseIcon size={14} />;
// //   return <PlayIcon size={14} />;
// // }

// function ActivityIcon({ kind }: { kind: ActivityItem["kind"] }) {
//   if (kind === "alert") return <AlertsIcon size={14} />;
//   if (kind === "created") return <MonitorsIcon size={14} />;

//   // deleted / updated
//   return <MonitorsIcon size={14} />;
// }

// export default function NotificationsMenu({ activity }: NotificationsMenuProps) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     const onClick = (e: MouseEvent) => {
//       if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
//     };
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setOpen(false);
//     };
//     document.addEventListener("mousedown", onClick);
//     document.addEventListener("keydown", onKey);
//     return () => {
//       document.removeEventListener("mousedown", onClick);
//       document.removeEventListener("keydown", onKey);
//     };
//   }, []);

//   return (
//     <div className="popover-anchor" ref={ref}>
//       <button
//         className="icon-btn"
//         aria-label="Notifications"
//         aria-haspopup="true"
//         aria-expanded={open}
//         onClick={() => setOpen((o) => !o)}
//       >
//         <BellIcon />
//         {activity.length > 0 && <span className="notif-dot" />}
//       </button>

//       {open && (
//         <div className="popover notif-popover" role="menu" aria-label="Notifications">
//           <div className="popover-head">
//             <h4>Notifications</h4>
//           </div>
//           {activity.length === 0 ? (
//             <div className="popover-empty">
//               <BellIcon size={20} />
//               <p>You're all caught up</p>
//               <small>New activity will show up here.</small>
//             </div>
//           ) : (
//             <div className="popover-list">
//               {activity.slice(0, 8).map((item) => (
//                 <div className="popover-item" role="menuitem" key={item.id}>
//                   <span className={`popover-item-icon icon-${item.kind}`}>
//                     <ActivityIcon kind={item.kind} />
//                   </span>
//                   <div>
//                     <p>{item.text}</p>
//                     <small>{item.time}</small>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
