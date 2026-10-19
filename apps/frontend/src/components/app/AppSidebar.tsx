import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
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

// Tailwind's built-in z scale stops at 50; the design uses 55/60.
const SIDEBAR_BASE =
  "sticky top-0 flex h-screen w-[236px] shrink-0 flex-col overflow-x-hidden overflow-y-auto border-r border-line bg-[#0d1014] px-3 py-4 [transition:width_0.25s_cubic-bezier(0.4,0,0.2,1)] light:bg-white";

const SIDEBAR_NARROW =
  "[@media(max-width:860px)]:fixed [@media(max-width:860px)]:left-0 [@media(max-width:860px)]:z-[60] [@media(max-width:860px)]:w-[250px] [@media(max-width:860px)]:[transition:transform_0.2s_ease,box-shadow_0.2s_ease]";

// The active item's left bar is a ::before in the original CSS; expressed here
// as a Tailwind `before:` variant so the element needs no custom class.
const NAV_ITEM_BASE =
  "relative flex w-full cursor-pointer items-center gap-2.5 rounded-[7px] border border-transparent px-2.5 py-2 text-left text-[13px] font-semibold text-[#a6aeb8] no-underline [transition:background_0.15s_ease,color_0.15s_ease,transform_0.15s_ease] hover:bg-[#161b21] hover:text-[#e3e6ea] light:hover:bg-[#eef0f3] light:hover:text-[#14161a] [&>svg]:m-0 [&>svg]:block [&>svg]:shrink-0 before:absolute before:top-1/2 before:left-[-10px] before:h-4 before:w-[3px] before:-translate-y-1/2 before:rounded-r-[3px] before:bg-brand before:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand focus-visible:rounded-md";

const NAV_ITEM_ACTIVE =
  "border-line bg-[#1a1f26] text-[#f1f3f4] light:bg-[#eef2ef] light:text-[#0f1113] before:content-['']";

const NAV_LABEL =
  "max-w-[180px] overflow-hidden whitespace-nowrap opacity-100 [transition:opacity_0.15s_ease,max-width_0.22s_ease,margin_0.22s_ease]";

export default function AppSidebar({
  mobileOpen,
  onCloseMobile,
  monitorsUp,
  monitorsTotal,
}: AppSidebarProps) {
  const { user, signOut } = useAuth();

  return (
    <>
      {mobileOpen && (
        <div
          className="hidden [@media(max-width:860px)]:fixed [@media(max-width:860px)]:inset-0 [@media(max-width:860px)]:z-[55] [@media(max-width:860px)]:block [@media(max-width:860px)]:bg-[rgba(6,7,9,0.6)]"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={cn(
          SIDEBAR_BASE,
          SIDEBAR_NARROW,
          mobileOpen
            ? "[@media(max-width:860px)]:translate-x-0 [@media(max-width:860px)]:shadow-[20px_0_50px_rgba(0,0,0,0.5)]"
            : "[@media(max-width:860px)]:-translate-x-full [@media(max-width:860px)]:shadow-[0_0_0_rgba(0,0,0,0)]",
        )}
      >
        <div className="flex items-center justify-between gap-1.5 px-2 pt-1.5 pb-[18px]">
          <span className="flex items-center gap-[10px] text-[17px] font-extrabold tracking-[-0.6px] [@media(max-width:560px)]:text-[16px] [@media(max-width:560px)]:tracking-[-0.5px]">
            <span className="grid size-[23px] place-items-center rounded-[7px] border-2 border-brand [&>i]:block [&>i]:size-[7px] [&>i]:rounded-full [&>i]:bg-brand">
              <i></i>
            </span>
            <span className={NAV_LABEL}>monitorly</span>
          </span>
        </div>

        <div
          className="relative mb-[18px] flex shrink-0 items-center gap-[7px] rounded-[7px] border border-[#254d3a] bg-[rgba(80,216,144,0.05)] px-2.5 py-2 font-code text-[11px] leading-[normal] text-[#9aa2ac] light:border-[#bfe6cf] light:bg-[rgba(47,174,116,0.08)] light:text-[#3f4650]"
          data-tooltip={`${monitorsUp}/${monitorsTotal} monitors up`}
        >
          <span className="mr-1 inline-block size-1.5 rounded-full bg-brand" />
          <span className={NAV_LABEL}>
            {monitorsUp}/{monitorsTotal} monitors up
          </span>
        </div>

        <div
          className={cn(
            "mx-2.5 mb-1.5 overflow-hidden font-code text-[10px] leading-[normal] tracking-[0.09em] whitespace-nowrap text-[#616974] uppercase opacity-100 [transition:opacity_0.15s_ease,max-height_0.2s_ease,margin_0.2s_ease]",
            NAV_LABEL,
            "mt-0",
          )}
        >
          Workspace
        </div>
        <nav className="flex shrink-0 flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(NAV_ITEM_BASE, isActive && NAV_ITEM_ACTIVE)
              }
              onClick={onCloseMobile}
              data-tooltip={item.label}
            >
              <item.icon />
              <span className={NAV_LABEL}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div
          className={cn(
            "mx-2.5 mb-1.5 mt-4 overflow-hidden font-code text-[10px] leading-[normal] tracking-[0.09em] whitespace-nowrap text-[#616974] uppercase opacity-100 [transition:opacity_0.15s_ease,max-height_0.2s_ease,margin_0.2s_ease]",
            NAV_LABEL,
          )}
        >
          Manage
        </div>
        <nav className="flex shrink-0 flex-col gap-0.5">
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              cn(NAV_ITEM_BASE, isActive && NAV_ITEM_ACTIVE)
            }
            onClick={onCloseMobile}
            data-tooltip="Settings"
          >
            <SettingsIcon />
            <span className={NAV_LABEL}>Settings</span>
          </NavLink>
        </nav>

        <div className="mt-auto shrink-0 pt-3">
          <div className="flex flex-col gap-0.5 rounded-[9px] border-t border-line px-1.5 pt-2.5 pb-1">
            <div
              className="relative flex items-center gap-2.5 rounded-[7px] p-1.5 [transition:background_0.15s_ease] hover:bg-[#161b21]"
              data-tooltip={user?.name || "Account"}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[#254d3a] bg-[#1a2320] text-[12px] font-extrabold text-brand light:border-[#bfe6cf] light:bg-[#e5f6ec] light:text-[#1f8a54]">
                {(user?.name || "M")[0]}
              </span>
              <div className={NAV_LABEL}>
                <b className="block text-[12.5px] leading-[1.3]">
                  {user?.name || "Monitorly user"}
                </b>
                <small className="block max-w-[140px] truncate text-[11px] text-muted">
                  {user?.email}
                </small>
              </div>
            </div>
            <button
              className={cn(
                NAV_ITEM_BASE,
                "mt-px text-[#9aa2ac] hover:bg-[rgba(240,100,100,0.08)] hover:text-[#ff9d9d]",
              )}
              onClick={signOut}
              data-tooltip="Log out"
            >
              <LogoutIcon />
              <span className={NAV_LABEL}>Log out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
