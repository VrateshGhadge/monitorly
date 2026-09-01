import { useNavigate } from "react-router-dom";

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
    <header className="app-topbar">
      <div className="app-topbar-left">
        <button
          className="icon-btn app-menu-btn"
          onClick={onOpenMobile}
          aria-label="Open navigation"
        >
          <MenuIcon />
        </button>

        <div className="breadcrumbs">
          {breadcrumb.map((crumb, i) => {
            const isCurrent = i === breadcrumb.length - 1;
            const isClickable = crumb === "Dashboard" || crumb === "Monitors";

            return (
              <span key={`${crumb}-${i}`} className="breadcrumb-item">
                {i > 0 && <ChevronRightIcon size={12} />}

                <button
                  type="button"
                  onClick={() => handleBreadcrumbClick(crumb)}
                  disabled={!isClickable}
                  className={isCurrent ? "breadcrumb-current" : ""}
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

      <div className="app-topbar-right">
        <NotificationsMenu activity={activity} />
      </div>
    </header>
  );
}
