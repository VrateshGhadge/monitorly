//src->pages->dashboard->OverviewPage
import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import type { AppData } from "../../hooks/useAppData";
import HowItWorksModal from "../../components/app/HowItWorksModal";
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

  const [guideOpen, setGuideOpen] = useState(false);

  const handleCreateMonitor = () => {
    if (monitors.length >= monitorLimit) {
      return;
    }

    openCreateModal();
  };

  const firstName = (user?.name || "there").split(" ")[0];

  if (!isLoading && monitors.length === 0) {
    return (
      <div className="mx-auto mt-[9vh] flex max-w-[480px] flex-col items-center text-center">
        <div className="mb-[18px] grid size-[60px] place-items-center rounded-[14px] border border-line bg-[var(--tile-bg)] text-brand light:bg-white">
          <MonitorsIcon size={30} />
        </div>
        <div className="mb-2.5 font-code text-[11px] leading-[normal] tracking-[0.08em] text-brand uppercase">
          Welcome to Monitorly
        </div>
        <h1 className="m-0 mb-2.5 text-[26px] tracking-[-0.9px]">
          Welcome, {firstName}
        </h1>
        <p className="m-0 mb-[26px] text-[14px] leading-[1.65] text-muted">
          Monitor your first website or API in under a minute — we'll check it
          around the clock and email you the moment something breaks.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button icon={<PlusIcon />} onClick={handleCreateMonitor}>
            Create monitor
          </Button>

          <Button variant="ghost" onClick={() => setGuideOpen(true)}>
            Learn how Monitorly works
          </Button>
        </div>

        <HowItWorksModal
          open={guideOpen}
          onClose={() => setGuideOpen(false)}
          onCreate={() => {
            setGuideOpen(false);
            handleCreateMonitor();
          }}
        />
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

      <div className="mb-[22px] grid grid-cols-6 gap-3 [@media(min-width:721px)_and_(max-width:1080px)]:grid-cols-3 [@media(min-width:561px)_and_(max-width:720px)]:grid-cols-2 [@media(max-width:560px)]:grid-cols-1">
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

      <div className="grid grid-cols-[1.5fr_1fr] items-start gap-4 [@media(max-width:1080px)]:grid-cols-1">
        <div className="flex flex-col">
          <ResponseTimeGraph range="day" monitors={monitors} />

          <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px] mt-[13px]" style={{ marginTop: 13 }}>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="m-0 text-[11px] font-semibold">Monitors</h4>
              <small
                className="font-code text-[10px] leading-[normal] text-[#737c87]"
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/dashboard/monitors")}
              >
                VIEW ALL →
              </small>
            </div>
            {monitors.slice(0, 4).map((m) => (
              <div
                className="grid cursor-pointer grid-cols-[9px_1.5fr_0.7fr_0.8fr_0.6fr] items-center gap-2 rounded border-t border-[#222830] px-1 py-2.5 text-[10px] hover:bg-[#161b21]"
                key={m.id}
                onClick={() => navigate("/dashboard/monitors")}
              >
                <i
                  className="mr-1 inline-block size-1.5 rounded-full bg-brand"
                  style={{
                    background:
                      m.status === "up"
                        ? "var(--green)"
                        : m.status === "down"
                          ? "var(--red)"
                          : "var(--muted)",
                  }}
                />
                <b className="text-[11px]">{m.name}</b>
                <span className="text-[#85909a]">{m.type === "API" ? "API" : "Website"}</span>
                <span className="text-[#85909a]">{m.uptimePct}%</span>
                <span
                  className="text-[#85909a]"
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

        <div className="flex flex-col">
          <UptimeHistoryGraph
            monitors={monitors}
            range="day"
            onViewAll={() => navigate("/dashboard/monitors")}
          />

          <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px]" style={{ marginTop: 13 }}>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="m-0 text-[11px] font-semibold">Latest alerts</h4>
              <small
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/dashboard/alerts")}
              >
                VIEW ALL →
              </small>
            </div>
            {alerts.length === 0 ? (
              <p className="mt-0.5 text-[10px] text-[#818994]" style={{ padding: "10px 4px" }}>
                No alerts yet.
              </p>
            ) : (
              alerts.slice(0, 3).map((a) => (
                <div className="flex items-center justify-between border-t border-[#222830] px-1 py-[11px] text-[12px] first:border-t-0" key={a.id}>
                  <div>
                    <b className="font-semibold">{a.monitor}</b>
                    <div className="mt-0.5 text-[10px] text-[#818994]">
                      {" "}
                      {a.message} · {formatDateTime(a.time)}{" "}
                    </div>
                  </div>
                  <span
                    className={`rounded border px-[7px] py-[3px] font-code text-[9px] leading-[normal] ${a.status === "sent" ? "border-[#5c3d1a] text-warning" : "border-[#254d3a] text-brand"}`}
                  >
                    {a.status === "sent" ? "SENT" : "RESOLVED"}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="rounded-[7px] border border-line bg-[#11151a] p-[15px]" style={{ marginTop: 13 }}>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="m-0 text-[11px] font-semibold">Recent activity</h4>
              <small className="font-code text-[10px] leading-[normal] text-[#737c87]">LAST 7 DAYS</small>
            </div>
            {activity.length === 0 ? (
              <p className="mt-0.5 text-[10px] text-[#818994]" style={{ padding: "10px 4px" }}>
                Nothing to show yet.
              </p>
            ) : (
              activity.slice(0, 4).map((item) => (
                <div className="flex items-center justify-between border-t border-[#222830] px-1 py-[11px] text-[12px] first:border-t-0" key={item.id}>
                  <div className="mt-0.5 text-[10px] text-[#818994]">{item.text}</div>
                  <span className="mt-0.5 text-[10px] text-[#818994]">{formatDateTime(item.time)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
