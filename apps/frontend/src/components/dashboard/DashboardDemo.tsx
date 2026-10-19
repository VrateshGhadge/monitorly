import { useDashboardState } from "../../hooks/useDashboardState";
import Sidebar from "./Sidebar";
import MetricsBar from "./MetricsBar";
import OverviewPanel from "./panels/OverviewPanel";
import MonitorsPanel from "./panels/MonitorsPanel";
import AlertsPanel from "./panels/AlertsPanel";
import SettingsPanel from "./panels/SettingsPanel";
import MobileDashboardDemo from "./MobileDashboardDemo";

export default function DashboardDemo() {
  const {
    activeSection,
    setActiveSection,
    monitors,
    toggleMonitor,
    alerts,
    notifications,
    toggleNotification,
    monitorsUp,
    monitorsTotal,
    avgUptime,
    avgResponse,
    activeAlerts,
  } = useDashboardState();

  return (
    <>
      <div
        className="mx-auto mt-[50px] grid h-[700px] max-w-[1090px] grid-cols-[192px_1fr] overflow-hidden rounded-[11px] border border-[#2b3038] bg-[#0e1115] text-left shadow-[0_20px_50px_rgba(0,0,0,0.32)] [@media(max-width:1080px)]:grid-cols-[178px_1fr] [@media(max-width:599px)]:hidden"
        aria-label="Monitorly dashboard preview (interactive demo)"
      >
      <Sidebar
        activeSection={activeSection}
        onSelect={setActiveSection}
        monitorsTotal={monitorsTotal}
      />

      <div className="h-full overflow-hidden px-7 py-6">
        <div className="mb-[22px] flex items-center justify-between">
          <div>
            <h3 className="m-0 text-[17px] tracking-[-0.5px]">Good morning, Helena</h3>
            <span className="text-[11px] text-muted">Wednesday, May 22 · Acme Engineering</span>
          </div>
          <span className="rounded-[4px] border border-[#254d3a] px-[7px] py-[5px] font-code text-[10px] leading-[normal] text-brand">● LIVE</span>
        </div>

        <MetricsBar
          monitorsUp={monitorsUp}
          monitorsTotal={monitorsTotal}
          avgUptime={avgUptime}
          avgResponse={avgResponse}
          activeAlerts={activeAlerts}
        />

        {activeSection === "overview" && (
          <OverviewPanel
            monitors={monitors}
            alerts={alerts}
            onToggleMonitor={toggleMonitor}
            onNavigate={setActiveSection}
          />
        )}

        {activeSection === "monitors" && (
          <MonitorsPanel monitors={monitors} onToggleMonitor={toggleMonitor} />
        )}

        {activeSection === "alerts" && <AlertsPanel alerts={alerts} />}

        {activeSection === "settings" && (
          <SettingsPanel
            notifications={notifications}
            onToggle={toggleNotification}
          />
        )}
        </div>
      </div>

      <MobileDashboardDemo />
    </>
  );
}
