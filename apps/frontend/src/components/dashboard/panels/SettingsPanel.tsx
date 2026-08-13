import type { NotificationPreferences } from "../../../types/dashboard";
import Toggle from "../../common/Toggle";

interface SettingsPanelProps {
  notifications: NotificationPreferences;
  onToggle: (key: keyof NotificationPreferences) => void;
}

export default function SettingsPanel({
  notifications,
  onToggle,
}: SettingsPanelProps) {
  return (
    <div className="panel full-panel" style={{ marginTop: "13px" }}>
      <div className="panel-head">
        <h4>Notification preferences</h4>
        <small>DEMO SETTINGS</small>
      </div>
      <div className="row-line">
        <div>
          <b>Email alerts</b>
          <div className="row-sub">
            Monitor status changes sent to your inbox
          </div>
        </div>
        <Toggle on={notifications.email} onClick={() => onToggle("email")} />
      </div>
    </div>
  );
}
