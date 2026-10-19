import { useNavigate } from "react-router-dom";

import { cn } from "../../lib/utils";
import type { ActivityItem } from "../../types/app";
import { MenuIcon, ChevronRightIcon } from "./icons";
import NotificationsMenu from "./NotificationsMenu";

interface AppTopbarProps {
  onOpenMobile: () => void;
  breadcrumb: string[];
  activity: ActivityItem[];
}

export default function AppTopbar({
  onOpenMobile,
  breadcrumb,
  activity,
}: AppTopbarProps) {
  const navigate = useNavigate();

  const handleBreadcrumbClick = (crumb: string) => {
    if (crumb === "Dashboard") {
      navigate("/dashboard");
      return;
    }

    if (crumb === "Monitors") {
      navigate("/dashboard/monitors");
    }
  };

  return (
    <header className="sticky top-0 z-[15] flex h-16 items-center gap-5 border-b border-line bg-[rgba(11,13,16,0.85)] px-[26px] backdrop-blur-[10px] light:bg-[rgba(255,255,255,0.9)] [@media(max-width:860px)]:gap-3 [@media(max-width:860px)]:px-3.5">
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <button
          className="relative hidden size-[34px] cursor-pointer items-center justify-center rounded-[7px] border border-line bg-panel-2 text-[#b8bec7] [transition:0.15s] hover:border-[#3a4048] hover:text-white light:text-[#5b6470] light:hover:border-[#c7cbd2] light:hover:text-[#14161a] [@media(max-width:860px)]:inline-flex focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand focus-visible:rounded-md"
          onClick={onOpenMobile}
          aria-label="Open navigation"
        >
          <MenuIcon />
        </button>

        <div className="flex min-w-0 items-center gap-1.5 overflow-hidden text-[13px] whitespace-nowrap text-muted">
          {breadcrumb.map((crumb, i) => {
            const isCurrent = i === breadcrumb.length - 1;
            const isClickable = crumb === "Dashboard" || crumb === "Monitors";

            return (
              <span
                key={`${crumb}-${i}`}
                className="flex min-w-0 items-center gap-1.5"
              >
                {i > 0 && <ChevronRightIcon size={12} />}

                <button
                  type="button"
                  onClick={() => handleBreadcrumbClick(crumb)}
                  disabled={!isClickable}
                  className={cn(
                    "min-w-0 truncate border-0 bg-transparent px-0 py-0.5 text-inherit [font:inherit]",
                    isCurrent && "font-bold text-ink",
                  )}
                  style={{
                    cursor: isClickable ? "pointer" : "default",
                  }}
                >
                  {crumb}
                </button>
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <NotificationsMenu activity={activity} />
      </div>
    </header>
  );
}
