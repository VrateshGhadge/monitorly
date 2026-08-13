import { useDashboardState } from "../../hooks/useDashboardState";
import Sidebar from "./Sidebar";
import MetricsBar from "./MetricsBar";
import OverviewPanel from "./panels/OverviewPanel";
import MonitorsPanel from "./panels/MonitorsPanel";
import AlertsPanel from "./panels/AlertsPanel";
import SettingsPanel from "./panels/SettingsPanel";

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
    <div
      className="app"
      aria-label="Monitorly dashboard preview (interactive demo)"
    >
      <Sidebar
        activeSection={activeSection}
        onSelect={setActiveSection}
        monitorsTotal={monitorsTotal}
      />

      <div className="dash">
        <div className="dash-head">
          <div>
            <h3>Good morning, Helena</h3>
            <span>Wednesday, May 22 · Acme Engineering</span>
          </div>
          <span className="live">● LIVE</span>
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
  );
}
