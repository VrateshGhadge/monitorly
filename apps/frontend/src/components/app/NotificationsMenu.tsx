import { useEffect, useRef, useState } from "react";
import type { ActivityItem } from "../../types/app";
import { formatLastChecked } from "../../lib/date";
import { BellIcon, MonitorsIcon, AlertsIcon } from "./icons";

interface NotificationsMenuProps {
  activity: ActivityItem[];
}

// Replaces the old dynamic `popover-item-icon icon-${kind}` class lookup.
// `deleted` / `updated` had no rule before, so they keep the base styling.
const ICON_TONE: Partial<Record<ActivityItem["kind"], string>> = {
  alert: "text-[#ff9d9d] bg-[rgba(240,100,100,0.08)]",
  created: "text-brand bg-[rgba(80,216,144,0.08)]",
};

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
    <div className="relative" ref={ref}>
      <button
        className="relative inline-flex size-[34px] cursor-pointer items-center justify-center rounded-[7px] border border-line bg-panel-2 text-[#b8bec7] [transition:0.15s] hover:border-[#3a4048] hover:text-white light:text-[#5b6470] light:hover:border-[#c7cbd2] light:hover:text-[#14161a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand focus-visible:rounded-md"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          setHasUnread(false);
        }}
      >
        <BellIcon />
        {hasUnread && (
          <span className="absolute top-[7px] right-2 size-1.5 rounded-full bg-brand [box-shadow:0_0_0_2px_var(--surface2)]" />
        )}
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+10px)] right-0 z-40 w-80 animate-popover overflow-hidden rounded-[10px] border border-line bg-[#141820] text-ink [box-shadow:0_20px_46px_rgba(0,0,0,0.45)] light:bg-white light:[box-shadow:0_16px_34px_rgba(20,22,26,0.1)]"
          role="menu"
          aria-label="Notifications"
        >
          <div className="border-b border-line px-4 py-3.5">
            <h4 className="m-0 text-[13px]">Notifications</h4>
          </div>
          {activity.length === 0 ? (
            <div className="px-5 py-[34px] text-center text-muted [&>svg]:mb-2.5 [&>svg]:text-[#4d545e]">
              <BellIcon size={20} />
              <p className="m-0 text-[13px] font-semibold text-[#c9cdd3]">
                You're all caught up
              </p>
              <small className="text-[11.5px]">
                New activity will show up here.
              </small>
            </div>
          ) : (
            <div className="max-h-[340px] overflow-y-auto p-1.5">
              {activity.slice(0, 8).map((item) => (
                <div
                  className="flex gap-2.5 rounded-[7px] px-2 py-[9px] hover:bg-[#1a1f26] light:hover:bg-[#f1f2f5]"
                  role="menuitem"
                  key={item.id}
                >
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-[7px] bg-panel-2 text-muted ${ICON_TONE[item.kind] ?? ""}`}
                  >
                    <ActivityIcon kind={item.kind} />
                  </span>
                  <div>
                    <p className="m-0 text-[12.5px] leading-[1.4] text-[#dce0e5]">
                      {item.text}
                    </p>
                    <small className="text-[11px] text-[#737c87]">
                      {formatLastChecked(item.time)}
                    </small>
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
