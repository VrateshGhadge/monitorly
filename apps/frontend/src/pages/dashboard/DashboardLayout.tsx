import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "../../components/app/AppSidebar";
import AppTopbar from "../../components/app/AppTopbar";
import CreateMonitorModal from "../../components/app/CreateMonitorModal";
import { useAppData } from "../../hooks/useAppData";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../lib/api";

const CRUMB_LABELS: Record<string, string> = {
  monitors: "Monitors",
  alerts: "Alerts",
  settings: "Settings",
};

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { showToast } = useToast();
  const appData = useAppData(false);
  const location = useLocation();

  const segments = location.pathname.split("/").filter(Boolean).slice(1);
  const breadcrumb = segments.map((segment, index) => {
    // Dashboard / monitors / :id
    if (segments[0] === "monitors" && index === 1) {
      const monitor = appData.monitors.find((m) => m.slug === segment);
      return monitor?.name ?? "Loading...";
    }
    return CRUMB_LABELS[segment] ?? segment;
  });
  breadcrumb.unshift("Dashboard");

  return (
    <div className="app-shell">
      <AppSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        monitorsUp={appData.monitorsUp}
        monitorsTotal={appData.monitorsTotal}
      />
      <div className="app-main">
        <AppTopbar
          onOpenMobile={() => setMobileOpen(true)}
          breadcrumb={breadcrumb}
          activity={appData.activity}
        />
        <div className="app-content">
          <Outlet context={appData} />
        </div>
      </div>

      <CreateMonitorModal
        open={appData.createModalOpen || !!appData.editingMonitor}
        initialValues={
          appData.editingMonitor
            ? {
                name: appData.editingMonitor.name,
                url: appData.editingMonitor.url,
                type: appData.editingMonitor.type,
                method: appData.editingMonitor.method,
                emailAlerts: appData.editingMonitor.emailAlerts,
              }
            : undefined
        }
        onClose={() => {
          appData.closeCreateModal();
          appData.closeEditModal();
        }}
        onCreate={async (monitor) => {
          try {
            await appData.addMonitor(monitor);
            appData.closeCreateModal();
            showToast(`${monitor.name} created`);
          } catch (error) {
            showToast(
              getErrorMessage(
                error,
                "Unable to create monitor. Please try again.",
              ),
              "error",
            );
          }
        }}
        onUpdate={async (monitor) => {
          if (!appData.editingMonitor) return;
          await appData.updateMonitor(appData.editingMonitor.id, monitor);
          appData.closeCreateModal();
          appData.closeEditModal();
          showToast(`${monitor.name} updated`);
        }}
      />
    </div>
  );
}
