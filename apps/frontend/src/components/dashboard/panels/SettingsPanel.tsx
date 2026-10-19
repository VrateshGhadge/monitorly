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
    <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px] col-span-full" style={{ marginTop: "13px" }}>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="m-0 text-[11px] font-semibold">Notification preferences</h4>
        <small>DEMO SETTINGS</small>
      </div>
      <div className="flex items-center justify-between border-t border-[#222830] px-1 py-[11px] text-[12px] first:border-t-0">
        <div>
          <b className="font-semibold">Email alerts</b>
          <div className="mt-0.5 text-[10px] text-[#818994]">
            Monitor status changes sent to your inbox
          </div>
        </div>
        <Toggle on={notifications.email} onClick={() => onToggle("email")} />
      </div>
    </div>
  );
}
