//src->pages->dashboard->OverviewPage
import { useOutletContext, useNavigate } from "react-router-dom";
import type { AppData } from "../../hooks/useAppData";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { StatCardSkeleton } from "../../components/ui/Skeleton";
import ResponseTimeGraph from "./ResponseTimeGraph";
import UptimeHistoryGraph from "./UptimeHistoryGraph";
import { useAuth } from "../../context/AuthContext";
import { PlusIcon, MonitorsIcon } from "../../components/app/icons";

function formatDateTime(dateString: string) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export default function OverviewPage() {
  const data = useOutletContext<AppData>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    monitors,
    alerts,
    activity,
    isLoading,
    monitorsUp,
    monitorsTotal,
    avgUptime,
    avgResponse,
    alertsSentCount,
    monitorLimit,
    openCreateModal,
  } = data;

  const handleCreateMonitor = () => {
    if (monitors.length >= monitorLimit) {
      return;
    }

    openCreateModal();
  };

  const firstName = (user?.name || "there").split(" ")[0];

  if (!isLoading && monitors.length === 0) {
    return (
      <div className="onboarding-empty">
        <div className="onboarding-icon">
          <MonitorsIcon size={30} />
        </div>
        <div className="page-eyebrow">Welcome to Monitorly</div>
        <h1>Welcome, {firstName}</h1>
        <p>
          Monitor your first website or API in under a minute — we'll check it
          around the clock and email you the moment something breaks.
        </p>
        <div className="onboarding-actions">
          <Button icon={<PlusIcon />} onClick={handleCreateMonitor}>
            Create monitor
          </Button>
          <a className="btn btn-ghost" href="/#product">
            Learn how Monitorly works
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`Good to see you, ${firstName}`}
        description="Monitor all your websites and APIs from one dashboard."
        actions={
          <>
            <Badge tone="green">Live</Badge>
            <Button
              icon={<PlusIcon />}
              onClick={handleCreateMonitor}
              disabled={monitors.length >= monitorLimit}
            >
              New monitor
            </Button>
          </>
        }
      />

      <div className="stat-grid">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total monitors" value={monitorsTotal} />
            <StatCard
              label="Active monitors"
              value={monitorsUp}
              trend={{ direction: "up", label: "healthy" }}
            />
            <StatCard
              label="Down monitors"
              value={data.monitorsDown}
              tone={data.monitorsDown > 0 ? "bad" : "default"}
              trend={
                data.monitorsDown > 0
                  ? { direction: "down", label: "needs attention" }
                  : undefined
              }
            />
            <StatCard label="Alerts sent" value={alertsSentCount} unit="· 7d" />
            <StatCard label="Avg response" value={avgResponse} unit="ms" />
            <StatCard
              label="Uptime"
              value={avgUptime}
              unit="%"
              trend={{ direction: "flat", label: "30 days" }}
            />
          </>
        )}
      </div>

      <div className="overview-grid">
        <div className="overview-col">
          <ResponseTimeGraph range="day" monitors={monitors} />

          <div className="panel monitor-list" style={{ marginTop: 13 }}>
            <div className="panel-head">
              <h4>Monitors</h4>
              <small
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/dashboard/monitors")}
              >
                VIEW ALL →
              </small>
            </div>
            {monitors.slice(0, 4).map((m) => (
              <div
                className="monitor-row"
                key={m.id}
                onClick={() => navigate("/dashboard/monitors")}
              >
                <i
                  className="status-dot"
                  style={{
                    background:
                      m.status === "up"
                        ? "var(--green)"
                        : m.status === "down"
                          ? "var(--red)"
                          : "var(--muted)",
                  }}
                />
                <b>{m.name}</b>
                <span>{m.type === "API" ? "API" : "Website"}</span>
                <span>{m.uptimePct}%</span>
                <span
                  style={{
                    color: m.status === "down" ? "var(--red)" : undefined,
                  }}
                >
                  {m.latency ? `${m.latency}ms` : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="overview-col">
          <UptimeHistoryGraph
            monitors={monitors}
            range="day"
            onViewAll={() => navigate("/dashboard/monitors")}
          />

          <div className="panel" style={{ marginTop: 13 }}>
            <div className="panel-head">
              <h4>Latest alerts</h4>
              <small
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/dashboard/alerts")}
              >
                VIEW ALL →
              </small>
            </div>
            {alerts.length === 0 ? (
              <p className="row-sub" style={{ padding: "10px 4px" }}>
                No alerts yet.
              </p>
            ) : (
              alerts.slice(0, 3).map((a) => (
                <div className="row-line" key={a.id}>
                  <div>
                    <b>{a.monitor}</b>
                    <div className="row-sub">
                      {" "}
                      {a.message} · {formatDateTime(a.time)}{" "}
                    </div>
                  </div>
                  <span
                    className={`hb-status${a.status === "sent" ? " late" : ""}`}
                  >
                    {a.status === "sent" ? "SENT" : "RESOLVED"}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="panel" style={{ marginTop: 13 }}>
            <div className="panel-head">
              <h4>Recent activity</h4>
              <small>LAST 7 DAYS</small>
            </div>
            {activity.length === 0 ? (
              <p className="row-sub" style={{ padding: "10px 4px" }}>
                Nothing to show yet.
              </p>
            ) : (
              activity.slice(0, 4).map((item) => (
                <div className="row-line" key={item.id}>
                  <div className="row-sub">{item.text}</div>
                  <span className="row-sub">{formatDateTime(item.time)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
