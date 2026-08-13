import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  OverviewIcon,
  MonitorsIcon,
  AlertsIcon,
  SettingsIcon,
  LogoutIcon,
} from "./icons";

interface AppSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  monitorsUp: number;
  monitorsTotal: number;
}

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: OverviewIcon, end: true },
  {
    to: "/dashboard/monitors",
    label: "Monitors",
    icon: MonitorsIcon,
    end: false,
  },
  { to: "/dashboard/alerts", label: "Alerts", icon: AlertsIcon, end: false },
];

export default function AppSidebar({
  mobileOpen,
  onCloseMobile,
  monitorsUp,
  monitorsTotal,
}: AppSidebarProps) {
  const { user, signOut } = useAuth();

  return (
    <>
      {mobileOpen && <div className="sidebar-scrim" onClick={onCloseMobile} />}
      <aside className={`app-sidebar${mobileOpen ? " open" : ""}`}>
        <div className="app-sidebar-brand">
          <span className="brand">
            <span className="mark">
              <i></i>
            </span>
            <span className="nav-label">monitorly</span>
          </span>
        </div>

        <div
          className="app-sidebar-status"
          data-tooltip={`${monitorsUp}/${monitorsTotal} monitors up`}
        >
          <span className="status-dot" />
          <span className="nav-label">
            {monitorsUp}/{monitorsTotal} monitors up
          </span>
        </div>

        <div className="app-sidebar-title first nav-label">Workspace</div>
        <nav className="app-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `app-nav-item${isActive ? " active" : ""}`
              }
              onClick={onCloseMobile}
              data-tooltip={item.label}
            >
              <item.icon />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar-title nav-label">Manage</div>
        <nav className="app-nav">
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `app-nav-item${isActive ? " active" : ""}`
            }
            onClick={onCloseMobile}
            data-tooltip="Settings"
          >
            <SettingsIcon />
            <span className="nav-label">Settings</span>
          </NavLink>
        </nav>

        <div className="app-sidebar-bottom">
          <div className="app-sidebar-profile">
            <div
              className="app-sidebar-user"
              data-tooltip={user?.name || "Account"}
            >
              <span className="avatar">{(user?.name || "M")[0]}</span>
              <div className="nav-label">
                <b>{user?.name || "Monitorly user"}</b>
                <small>{user?.email}</small>
              </div>
            </div>
            <button
              className="app-nav-item app-signout"
              onClick={signOut}
              data-tooltip="Log out"
            >
              <LogoutIcon />
              <span className="nav-label">Log out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
