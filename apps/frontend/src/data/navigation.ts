import {
  OverviewIcon,
  MonitorsIcon,
  AlertsIcon,
  SettingsIcon,
} from "../../../frontend/src/components/app/icons";

export const SIDEBAR_ITEMS = [
  { key: "overview", label: "Overview", icon: OverviewIcon },
  { key: "monitors", label: "Monitors", icon: MonitorsIcon },
  { key: "alerts", label: "Alerts", icon: AlertsIcon },
] as const;

export const SIDEBAR_MANAGE = [
  { key: "settings", label: "Settings", icon: SettingsIcon },
] as const;

export type SectionKey =
  | (typeof SIDEBAR_ITEMS)[number]["key"]
  | (typeof SIDEBAR_MANAGE)[number]["key"];
