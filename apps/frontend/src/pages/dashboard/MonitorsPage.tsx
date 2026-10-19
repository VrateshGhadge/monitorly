// src/pages/dashboard/MonitorsPage.tsx
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import type { AppData } from "../../hooks/useAppData";

import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Dropdown from "../../components/ui/Dropdown";
import EmptyState from "../../components/ui/EmptyState";
import { TableRowSkeleton } from "../../components/ui/Skeleton";

import { useToast } from "../../context/ToastContext";
import { Pencil } from "lucide-react";

import { formatLastChecked } from "../../lib/date";

import {
  PlusIcon,
  SearchIcon,
  TrashIcon,
  MonitorsIcon,
} from "../../components/app/icons";

import type { MonitorStatus } from "../../types/app";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "up", label: "Up" },
  { value: "down", label: "Down" },
];

const PAGE_SIZE = 6;

function StatusPill({ status }: { status: MonitorStatus }) {
  if (status === "up") {
    return <Badge tone="green">Up</Badge>;
  }
  return <Badge tone="red">Down</Badge>;
}

export default function MonitorsPage() {
  const {
    monitors,
    isLoading,
    deleteMonitor,
    openCreateModal,
    openEditModal,
    monitorLimit,
  } = useOutletContext<AppData>();

  const { showToast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 👇 handler that checks the limit before opening the modal
  const handleCreateMonitor = () => {
    if (monitors.length >= monitorLimit) {
      // No toast – backend already protects the limit and will show an error
      return;
    }
    openCreateModal();
  };

  const filtered = useMemo(() => {
    return monitors.filter((m) => {
      const matchesSearch =
        !search.trim() ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.url.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || m.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [monitors, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetPage = () => setPage(1);

  return (
    <>
      <PageHeader
        eyebrow="Monitors"
        title="Monitors"
        description={`${monitors.length} endpoint${monitors.length === 1 ? "" : "s"} being monitored.`}
        actions={
          <Button
            icon={<PlusIcon />}
            onClick={handleCreateMonitor}
            disabled={monitors.length >= monitorLimit}
          >
            New monitor
          </Button>
        }
      />

      <div className="overflow-hidden rounded-[10px] border border-line bg-panel">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3.5">
          <div className="flex min-w-[200px] flex-1 items-center gap-[9px] rounded-[7px] border border-line bg-[#0d1014] px-[11px] py-2 text-[#7c828c] light:bg-white light:text-[#14161a] [&>input]:flex-1 [&>input]:border-0 [&>input]:bg-transparent [&>input]:text-[13px] [&>input]:text-ink [&>input]:outline-none [&>input::placeholder]:text-[#5b6169]">
            <SearchIcon size={15} />
            <input
              placeholder="Search by name or URL..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
            />
          </div>
          <Dropdown
            size="sm"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(v) => {
              setStatus(v);
              resetPage();
            }}
          />
        </div>

        {isLoading ? (
          <div className="w-full">
            <div className="grid grid-cols-[90px_1.4fr_1.6fr_0.8fr_0.9fr_0.7fr_90px] gap-2.5 border-b border-line px-4 py-2.5 font-code text-[10px] leading-[normal] tracking-[0.06em] text-[#6f7782] uppercase [@media(max-width:720px)]:hidden">
              <span>Status</span>
              <span>Name</span>
              <span>URL</span>
              <span>Response</span>
              <span>Last checked</span>
              <span>Uptime</span>
              <span></span>
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} columns={7} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<MonitorsIcon size={26} />}
            title={
              monitors.length === 0
                ? "No monitors yet"
                : "No monitors match your filters"
            }
            description={
              monitors.length === 0
                ? "You haven't created any monitors yet. Add your first URL to start tracking uptime and response time."
                : "Try a different search term or status filter."
            }
            action={
              monitors.length === 0 ? (
                <Button
                  icon={<PlusIcon />}
                  onClick={handleCreateMonitor} // 👈 also changed for consistency
                >
                  Create your first monitor
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setStatus("all");
                    resetPage();
                  }}
                >
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-[90px_1.4fr_1.6fr_0.8fr_0.9fr_0.7fr_90px] gap-2.5 border-b border-line px-4 py-2.5 font-code text-[10px] leading-[normal] tracking-[0.06em] text-[#6f7782] uppercase [@media(max-width:720px)]:hidden">
              <span>Status</span>
              <span>Name</span>
              <span>URL</span>
              <span>Response</span>
              <span>Last checked</span>
              <span>Uptime</span>
              <span></span>
            </div>

            {pageItems.map((m) => (
              <div
                className="grid grid-cols-[90px_1.4fr_1.6fr_0.8fr_0.9fr_0.7fr_90px] items-center gap-2.5 border-b border-[#1b2027] px-4 py-[13px] text-[13px] [transition:0.12s] last:border-b-0 hover:bg-[#141920] light:border-[#edeef1] light:hover:bg-[#f7f8f9] [@media(max-width:720px)]:relative [@media(max-width:720px)]:grid-cols-1 [@media(max-width:720px)]:gap-1.5 [@media(max-width:720px)]:px-4 [@media(max-width:720px)]:py-3.5 cursor-pointer"
                key={m.id}
                onClick={() => navigate(`/dashboard/monitors/${m.slug}`)}
              >
                <div className="min-w-0 text-[#c9cdd3] [&>b]:block [&>b]:text-[13px] [&>b]:font-semibold">
                  <StatusPill status={m.status} />
                </div>
                <div className="min-w-0 text-[#c9cdd3] [&>b]:block [&>b]:text-[13px] [&>b]:font-semibold flex flex-col gap-0.5">
                  <b>{m.name}</b>
                  <span className="text-[11px] text-muted">
                    {m.type === "API" ? `${m.method} · API` : "Website"}
                  </span>
                </div>
                <div className="min-w-0 overflow-hidden font-code text-[12px] leading-[normal] text-ellipsis whitespace-nowrap text-[#9aa2ac]">{m.url}</div>
                <div className="min-w-0 text-[#c9cdd3] [&>b]:block [&>b]:text-[13px] [&>b]:font-semibold">
                  {m.latency ? `${m.latency}ms` : "—"}
                </div>
                <div className="min-w-0 text-[12.5px] text-muted">
                  {formatLastChecked(m.lastChecked, now)}
                </div>
                <div className="min-w-0 text-[#c9cdd3] [&>b]:block [&>b]:text-[13px] [&>b]:font-semibold">{m.uptimePct}%</div>
                <div className="min-w-0 flex justify-end gap-1.5 [@media(max-width:720px)]:absolute [@media(max-width:720px)]:top-3 [@media(max-width:720px)]:right-3.5">
                  <button
                    className="relative inline-flex size-[34px] cursor-pointer items-center justify-center rounded-[7px] border border-line bg-panel-2 text-[#b8bec7] [transition:0.15s] hover:border-[#3a4048] hover:text-white light:text-[#5b6470] light:hover:border-[#c7cbd2] light:hover:text-[#14161a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand focus-visible:rounded-md"
                    aria-label="Edit monitor"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(m);
                    }}
                  >
                    <Pencil size={13} strokeWidth={2} />
                  </button>
                  <button
                    className="relative inline-flex size-[34px] cursor-pointer items-center justify-center rounded-[7px] border border-line bg-panel-2 text-[#b8bec7] [transition:0.15s] hover:border-[#3a4048] hover:text-white light:text-[#5b6470] light:hover:border-[#c7cbd2] light:hover:text-[#14161a] hover:border-[rgba(240,100,100,0.4)] hover:text-[#ff9d9d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand focus-visible:rounded-md"
                    aria-label="Delete monitor"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMonitor(m.id);
                      showToast(`${m.name} deleted`, "error");
                    }}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-line px-4 py-3.5 text-[12px] text-muted [@media(max-width:560px)]:flex-col [@media(max-width:560px)]:items-start [@media(max-width:560px)]:gap-3">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2.5 [&>button]:cursor-pointer [&>button]:rounded-md [&>button]:border [&>button]:border-line [&>button]:bg-panel-2 [&>button]:px-[11px] [&>button]:py-1.5 [&>button]:text-[12px] [&>button]:text-[#c9cdd3] [&>button:hover:not(:disabled)]:border-[#3a4048] [&>button:hover:not(:disabled)]:text-white [&>button:disabled]:cursor-not-allowed [&>button:disabled]:opacity-40 [&>button:focus-visible]:outline-2 [&>button:focus-visible]:outline-offset-2 [&>button:focus-visible]:outline-brand [&>button:focus-visible]:rounded-md light:[&>button]:bg-[#f1f2f5] light:[&>button]:text-[#3a4048]">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// //src/pages/dashboard/MonitorsPage.tsx
// import { useMemo, useState, useEffect, } from "react";
// import { useNavigate, useOutletContext } from "react-router-dom";

// import type { AppData } from "../../hooks/useAppData";

// import PageHeader from "../../components/ui/PageHeader";
// import Button from "../../components/ui/Button";
// import Badge from "../../components/ui/Badge";
// import Dropdown from "../../components/ui/Dropdown";
// import EmptyState from "../../components/ui/EmptyState";
// import { TableRowSkeleton } from "../../components/ui/Skeleton";

// import { useToast } from "../../context/ToastContext";
// import { Pencil } from "lucide-react";

// import { formatLastChecked } from "../../lib/date";

// import {
//   PlusIcon,
//   SearchIcon,
//   // PauseIcon,
//   // PlayIcon,
//   TrashIcon,
//   MonitorsIcon,
// } from "../../components/app/icons";

// import type { MonitorStatus } from "../../types/app";

// const STATUS_OPTIONS = [
//   { value: "all", label: "All statuses" },
//   { value: "up", label: "Up" },
//   { value: "down", label: "Down" },

//   // V2
//   // { value: "paused", label: "Paused" },
// ];

// const PAGE_SIZE = 6;

// function StatusPill({ status }: { status: MonitorStatus }) {
//   if (status === "up") {
//     return <Badge tone="green">Up</Badge>;
//   }

//   return <Badge tone="red">Down</Badge>;

//   // V2
//   // if (status === "paused") {
//   //   return <Badge tone="neutral">Paused</Badge>;
//   // }
// }

// export default function MonitorsPage() {
//   const {
//     monitors,
//     isLoading,
//     // toggleMonitorPause, // V2
//     deleteMonitor,
//     openCreateModal,
//     openEditModal,
//   } = useOutletContext<AppData>();

//   const { showToast } = useToast();
//   const navigate = useNavigate();

//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("all");
//   const [page, setPage] = useState(1);
//   const [now, setNow] = useState(Date.now());

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setNow(Date.now());
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   const filtered = useMemo(() => {
//     return monitors.filter((m) => {
//       const matchesSearch =
//         !search.trim() ||
//         m.name.toLowerCase().includes(search.toLowerCase()) ||
//         m.url.toLowerCase().includes(search.toLowerCase());

//       const matchesStatus =
//         status === "all" || m.status === status;

//       return matchesSearch && matchesStatus;
//     });
//   }, [monitors, search, status]);

//   const totalPages = Math.max(
//     1,
//     Math.ceil(filtered.length / PAGE_SIZE)
//   );

//   const pageItems = filtered.slice(
//     (page - 1) * PAGE_SIZE,
//     page * PAGE_SIZE
//   );

//   const resetPage = () => setPage(1);

//   return (
//     <>
//       <PageHeader
//         eyebrow="Monitors"
//         title="Monitors"
//         // description={`Watching ${monitors.length} endpoint${
//         //   monitors.length === 1 ? "" : "s"
//         // } across your workspace.`}
//         description={`${monitors.length} endpoint${
//           monitors.length === 1 ? "" : "s"
//         } being monitored.`}
//         actions={
//           <Button
//             icon={<PlusIcon />}
//             onClick={openCreateModal}
//           >
//             New monitor
//           </Button>
//         }
//       />

//       <div className="overflow-hidden rounded-[10px] border border-line bg-panel">
//         <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3.5">
//           <div className="flex min-w-[200px] flex-1 items-center gap-[9px] rounded-[7px] border border-line bg-[#0d1014] px-[11px] py-2 text-[#7c828c] light:bg-white light:text-[#14161a] [&>input]:flex-1 [&>input]:border-0 [&>input]:bg-transparent [&>input]:text-[13px] [&>input]:text-ink [&>input]:outline-none [&>input::placeholder]:text-[#5b6169]">
//             <SearchIcon size={15} />

//             <input
//               placeholder="Search by name or URL..."
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//                 resetPage();
//               }}
//             />
//           </div>

//           <Dropdown
//             size="sm"
//             options={STATUS_OPTIONS}
//             value={status}
//             onChange={(v) => {
//               setStatus(v);
//               resetPage();
//             }}
//           />
//         </div>

//         {isLoading ? (
//           <div className="w-full">
//             <div className="grid grid-cols-[90px_1.4fr_1.6fr_0.8fr_0.9fr_0.7fr_90px] gap-2.5 border-b border-line px-4 py-2.5 font-code text-[10px] leading-[normal] tracking-[0.06em] text-[#6f7782] uppercase [@media(max-width:720px)]:hidden">
//               <span>Status</span>
//               <span>Name</span>
//               <span>URL</span>
//               <span>Response</span>
//               <span>Last checked</span>
//               <span>Uptime</span>
//               <span></span>
//             </div>

//             {Array.from({ length: 5 }).map((_, i) => (
//               <TableRowSkeleton
//                 key={i}
//                 columns={7}
//               />
//             ))}
//           </div>
//         ) : filtered.length === 0 ? (
//           <EmptyState
//             icon={<MonitorsIcon size={26} />}
//             title={
//               monitors.length === 0
//                 ? "No monitors yet"
//                 : "No monitors match your filters"
//             }
//             description={
//               monitors.length === 0
//                 ? "You haven't created any monitors yet. Add your first URL to start tracking uptime and response time."
//                 : "Try a different search term or status filter."
//             }
//             action={
//               monitors.length === 0 ? (
//                 <Button
//                   icon={<PlusIcon />}
//                   onClick={openCreateModal}
//                 >
//                   Create your first monitor
//                 </Button>
//               ) : (
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     setSearch("");
//                     setStatus("all");
//                     resetPage();
//                   }}
//                 >
//                   Clear filters
//                 </Button>
//               )
//             }
//           />
//         ) : (
//           <div className="w-full">
//             <div className="grid grid-cols-[90px_1.4fr_1.6fr_0.8fr_0.9fr_0.7fr_90px] gap-2.5 border-b border-line px-4 py-2.5 font-code text-[10px] leading-[normal] tracking-[0.06em] text-[#6f7782] uppercase [@media(max-width:720px)]:hidden">
//               <span>Status</span>
//               <span>Name</span>
//               <span>URL</span>
//               <span>Response</span>
//               <span>Last checked</span>
//               <span>Uptime</span>
//               <span></span>
//             </div>

//             {pageItems.map((m) => (
//               <div
//                 className="grid grid-cols-[90px_1.4fr_1.6fr_0.8fr_0.9fr_0.7fr_90px] items-center gap-2.5 border-b border-[#1b2027] px-4 py-[13px] text-[13px] [transition:0.12s] last:border-b-0 hover:bg-[#141920] light:border-[#edeef1] light:hover:bg-[#f7f8f9] [@media(max-width:720px)]:relative [@media(max-width:720px)]:grid-cols-1 [@media(max-width:720px)]:gap-1.5 [@media(max-width:720px)]:px-4 [@media(max-width:720px)]:py-3.5 cursor-pointer"
//                 key={m.id}
//                 // onClick={() => navigate(`/dashboard/monitors/${m.id}`)}
//                 onClick={() => navigate(`/dashboard/monitors/${m.slug}`)}

//               >
//                 <div className="min-w-0 text-[#c9cdd3] [&>b]:block [&>b]:text-[13px] [&>b]:font-semibold">
//                   <StatusPill status={m.status} />
//                 </div>

//                 <div className="min-w-0 text-[#c9cdd3] [&>b]:block [&>b]:text-[13px] [&>b]:font-semibold flex flex-col gap-0.5">
//                   <b>{m.name}</b>

//                   <span className="text-[11px] text-muted">
//                     {m.type === "API"
//                       ? `${m.method} · API`
//                       : "Website"}
//                   </span>
//                 </div>

//                 <div className="min-w-0 overflow-hidden font-code text-[12px] leading-[normal] text-ellipsis whitespace-nowrap text-[#9aa2ac]">
//                   {m.url}
//                 </div>

//                 <div className="min-w-0 text-[#c9cdd3] [&>b]:block [&>b]:text-[13px] [&>b]:font-semibold">
//                   {m.latency
//                     ? `${m.latency}ms`
//                     : "—"}
//                 </div>

//                 <div className="min-w-0 text-[12.5px] text-muted">
//                   {formatLastChecked(m.lastChecked, now)}
//                 </div>

//                 <div className="min-w-0 text-[#c9cdd3] [&>b]:block [&>b]:text-[13px] [&>b]:font-semibold">
//                   {m.uptimePct}%
//                 </div>

//                 <div className="min-w-0 flex justify-end gap-1.5 [@media(max-width:720px)]:absolute [@media(max-width:720px)]:top-3 [@media(max-width:720px)]:right-3.5">

//                   {/* ---------------- V2 ---------------- */}

//                   {/*
//                   <button
//                     className="relative inline-flex size-[34px] cursor-pointer items-center justify-center rounded-[7px] border border-line bg-panel-2 text-[#b8bec7] [transition:0.15s] hover:border-[#3a4048] hover:text-white light:text-[#5b6470] light:hover:border-[#c7cbd2] light:hover:text-[#14161a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand focus-visible:rounded-md"
//                     aria-label={
//                       m.status === "paused"
//                         ? "Resume monitor"
//                         : "Pause monitor"
//                     }
//                     onClick={() => {
//                       toggleMonitorPause(m.id);

//                       showToast(
//                         m.status === "paused"
//                           ? `${m.name} resumed`
//                           : `${m.name} paused`,
//                         "info"
//                       );
//                     }}
//                   >
//                     {m.status === "paused"
//                       ? <PlayIcon />
//                       : <PauseIcon />}
//                   </button>
//                   */}

//                   {/* <button
//                     className="relative inline-flex size-[34px] cursor-pointer items-center justify-center rounded-[7px] border border-line bg-panel-2 text-[#b8bec7] [transition:0.15s] hover:border-[#3a4048] hover:text-white light:text-[#5b6470] light:hover:border-[#c7cbd2] light:hover:text-[#14161a] hover:border-[rgba(240,100,100,0.4)] hover:text-[#ff9d9d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand focus-visible:rounded-md"
//                     aria-label="Delete monitor"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       deleteMonitor(m.id);
//                       showToast(`${m.name} deleted`, "error");
//                     }}
//                   >
//                     <TrashIcon />
//                   </button> */}
//                   <>
//                     <button
//                       className="relative inline-flex size-[34px] cursor-pointer items-center justify-center rounded-[7px] border border-line bg-panel-2 text-[#b8bec7] [transition:0.15s] hover:border-[#3a4048] hover:text-white light:text-[#5b6470] light:hover:border-[#c7cbd2] light:hover:text-[#14161a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand focus-visible:rounded-md"
//                       aria-label="Edit monitor"
//                       onClick={(e) => {
//                         e.stopPropagation();

//                         openEditModal(m);
//                       }}
//                     >
//                       <Pencil size={13} strokeWidth={2} />
//                     </button>

//                     <button
//                       className="relative inline-flex size-[34px] cursor-pointer items-center justify-center rounded-[7px] border border-line bg-panel-2 text-[#b8bec7] [transition:0.15s] hover:border-[#3a4048] hover:text-white light:text-[#5b6470] light:hover:border-[#c7cbd2] light:hover:text-[#14161a] hover:border-[rgba(240,100,100,0.4)] hover:text-[#ff9d9d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand focus-visible:rounded-md"
//                       aria-label="Delete monitor"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         deleteMonitor(m.id);
//                         showToast(`${m.name} deleted`, "error");
//                       }}
//                     >
//                       <TrashIcon />
//                     </button>
//                   </>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {!isLoading &&
//           filtered.length > 0 && (
//             <div className="flex items-center justify-between border-t border-line px-4 py-3.5 text-[12px] text-muted [@media(max-width:560px)]:flex-col [@media(max-width:560px)]:items-start [@media(max-width:560px)]:gap-3">
//               <span>
//                 Showing{" "}
//                 {(page - 1) * PAGE_SIZE + 1}
//                 –
//                 {Math.min(
//                   page * PAGE_SIZE,
//                   filtered.length
//                 )}{" "}
//                 of {filtered.length}
//               </span>

//               <div className="flex items-center gap-2.5 [&>button]:cursor-pointer [&>button]:rounded-md [&>button]:border [&>button]:border-line [&>button]:bg-panel-2 [&>button]:px-[11px] [&>button]:py-1.5 [&>button]:text-[12px] [&>button]:text-[#c9cdd3] [&>button:hover:not(:disabled)]:border-[#3a4048] [&>button:hover:not(:disabled)]:text-white [&>button:disabled]:cursor-not-allowed [&>button:disabled]:opacity-40 light:[&>button]:bg-[#f1f2f5] light:[&>button]:text-[#3a4048]">
//                 <button
//                   disabled={page === 1}
//                   onClick={() =>
//                     setPage((p) => p - 1)
//                   }
//                 >
//                   Previous
//                 </button>

//                 <span>
//                   {page} / {totalPages}
//                 </span>

//                 <button
//                   disabled={
//                     page === totalPages
//                   }
//                   onClick={() =>
//                     setPage((p) => p + 1)
//                   }
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}
//       </div>
//     </>
//   );
// }

// import { useMemo, useState } from "react";
// import { useOutletContext } from "react-router-dom";
// import type { AppData } from "../../hooks/useAppData";
// import PageHeader from "../../components/ui/PageHeader";
// import Button from "../../components/ui/Button";
// import Badge from "../../components/ui/Badge";
// import Dropdown from "../../components/ui/Dropdown";
// import EmptyState from "../../components/ui/EmptyState";
// import { TableRowSkeleton } from "../../components/ui/Skeleton";
// import { useToast } from "../../context/ToastContext";
// import { PlusIcon, SearchIcon, PauseIcon, PlayIcon, TrashIcon, MonitorsIcon } from "../../components/app/icons";
// import type { MonitorStatus } from "../../types/app";

// const STATUS_OPTIONS = [
//   { value: "all", label: "All statuses" },
//   { value: "up", label: "Up" },
//   { value: "down", label: "Down" },
//   { value: "paused", label: "Paused" },
// ];

// const PAGE_SIZE = 6;

// function StatusPill({ status }: { status: MonitorStatus }) {
//   if (status === "up") return <Badge tone="green">Up</Badge>;
//   if (status === "down") return <Badge tone="red">Down</Badge>;
//   return <Badge tone="neutral">Paused</Badge>;
// }

// export default function MonitorsPage() {
//   const { monitors, isLoading, toggleMonitorPause, deleteMonitor, openCreateModal } = useOutletContext<AppData>();
//   const { showToast } = useToast();

//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("all");
//   const [page, setPage] = useState(1);

//   const filtered = useMemo(() => {
//     return monitors.filter((m) => {
//       const matchesSearch =
//         !search.trim() ||
//         m.name.toLowerCase().includes(search.toLowerCase()) ||
//         m.url.toLowerCase().includes(search.toLowerCase());
//       const matchesStatus = status === "all" || m.status === status;
//       return matchesSearch && matchesStatus;
//     });
//   }, [monitors, search, status]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
//   const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   const resetPage = () => setPage(1);

//   return (
//     <>
//       <PageHeader
//         eyebrow="Monitors"
//         title="Monitors"
//         description={`Watching ${monitors.length} endpoint${monitors.length === 1 ? "" : "s"} across your workspace.`}
//         actions={
//           <Button icon={<PlusIcon />} onClick={openCreateModal}>
//             New monitor
//           </Button>
//         }
//       />

//       <div className="overflow-hidden rounded-[10px] border border-line bg-panel">
//         <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3.5">
//           <div className="flex min-w-[200px] flex-1 items-center gap-[9px] rounded-[7px] border border-line bg-[#0d1014] px-[11px] py-2 text-[#7c828c] light:bg-white light:text-[#14161a] [&>input]:flex-1 [&>input]:border-0 [&>input]:bg-transparent [&>input]:text-[13px] [&>input]:text-ink [&>input]:outline-none [&>input::placeholder]:text-[#5b6169]">
//             <SearchIcon size={15} />
//             <input
//               placeholder="Search by name or URL…"
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//                 resetPage();
//               }}
//             />
//           </div>
//           <Dropdown
//             size="sm"
//             options={STATUS_OPTIONS}
//             value={status}
//             onChange={(v) => {
//               setStatus(v);
//               resetPage();
//             }}
//           />
//         </div>

//         {isLoading ? (
//           <div className="w-full">
//             <div className="grid grid-cols-[90px_1.4fr_1.6fr_0.8fr_0.9fr_0.7fr_90px] gap-2.5 border-b border-line px-4 py-2.5 font-code text-[10px] leading-[normal] tracking-[0.06em] text-[#6f7782] uppercase [@media(max-width:720px)]:hidden">
//               <span>Status</span><span>Name</span><span>URL</span><span>Response</span><span>Last checked</span><span>Uptime</span><span></span>
//             </div>
//             {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)}
//           </div>
//         ) : filtered.length === 0 ? (
//           <EmptyState
//             icon={<MonitorsIcon size={26} />}
//             title={monitors.length === 0 ? "No monitors yet" : "No monitors match your filters"}
//             description={
//               monitors.length === 0
//                 ? "You haven't created any monitors yet. Add your first URL to start tracking uptime and response time."
//                 : "Try a different search term or status filter."
//             }
//             action={
//               monitors.length === 0 ? (
//                 <Button icon={<PlusIcon />} onClick={openCreateModal}>
//                   Create your first monitor
//                 </Button>
//               ) : (
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     setSearch("");
//                     setStatus("all");
//                     resetPage();
//                   }}
//                 >
//                   Clear filters
//                 </Button>
//               )
//             }
//           />
//         ) : (
//           <div className="w-full">
//             <div className="grid grid-cols-[90px_1.4fr_1.6fr_0.8fr_0.9fr_0.7fr_90px] gap-2.5 border-b border-line px-4 py-2.5 font-code text-[10px] leading-[normal] tracking-[0.06em] text-[#6f7782] uppercase [@media(max-width:720px)]:hidden">
//               <span>Status</span><span>Name</span><span>URL</span><span>Response</span><span>Last checked</span><span>Uptime</span><span></span>
//             </div>
//             {pageItems.map((m) => (
//               <div className="grid grid-cols-[90px_1.4fr_1.6fr_0.8fr_0.9fr_0.7fr_90px] items-center gap-2.5 border-b border-[#1b2027] px-4 py-[13px] text-[13px] [transition:0.12s] last:border-b-0 hover:bg-[#141920] light:border-[#edeef1] light:hover:bg-[#f7f8f9] [@media(max-width:720px)]:relative [@media(max-width:720px)]:grid-cols-1 [@media(max-width:720px)]:gap-1.5 [@media(max-width:720px)]:px-4 [@media(max-width:720px)]:py-3.5" key={m.id}>
//                 <div className="min-w-0 text-[#c9cdd3] [&>b]:block [&>b]:text-[13px] [&>b]:font-semibold"><StatusPill status={m.status} /></div>
//                 <div className="min-w-0 text-[#c9cdd3] [&>b]:block [&>b]:text-[13px] [&>b]:font-semibold flex flex-col gap-0.5">
//                   <b>{m.name}</b>
//                   <span className="text-[11px] text-muted">{m.kind === "API" ? `${m.method} · API` : "Website"}</span>
//                 </div>
//                 <div className="min-w-0 overflow-hidden font-code text-[12px] leading-[normal] text-ellipsis whitespace-nowrap text-[#9aa2ac]">{m.url}</div>
//                 <div className="min-w-0 text-[#c9cdd3] [&>b]:block [&>b]:text-[13px] [&>b]:font-semibold">{m.latency ? `${m.latency}ms` : "—"}</div>
//                 <div className="min-w-0 text-[12.5px] text-muted">{m.lastChecked}</div>
//                 <div className="min-w-0 text-[#c9cdd3] [&>b]:block [&>b]:text-[13px] [&>b]:font-semibold">{m.uptimePct}%</div>
//                 <div className="min-w-0 flex justify-end gap-1.5 [@media(max-width:720px)]:absolute [@media(max-width:720px)]:top-3 [@media(max-width:720px)]:right-3.5">
//                   <button
//                     className="relative inline-flex size-[34px] cursor-pointer items-center justify-center rounded-[7px] border border-line bg-panel-2 text-[#b8bec7] [transition:0.15s] hover:border-[#3a4048] hover:text-white light:text-[#5b6470] light:hover:border-[#c7cbd2] light:hover:text-[#14161a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand focus-visible:rounded-md"
//                     aria-label={m.status === "paused" ? "Resume monitor" : "Pause monitor"}
//                     onClick={() => {
//                       toggleMonitorPause(m.id);
//                       showToast(m.status === "paused" ? `${m.name} resumed` : `${m.name} paused`, "info");
//                     }}
//                   >
//                     {m.status === "paused" ? <PlayIcon /> : <PauseIcon />}
//                   </button>
//                   <button
//                     className="relative inline-flex size-[34px] cursor-pointer items-center justify-center rounded-[7px] border border-line bg-panel-2 text-[#b8bec7] [transition:0.15s] hover:border-[#3a4048] hover:text-white light:text-[#5b6470] light:hover:border-[#c7cbd2] light:hover:text-[#14161a] hover:border-[rgba(240,100,100,0.4)] hover:text-[#ff9d9d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand focus-visible:rounded-md"
//                     aria-label="Delete monitor"
//                     onClick={() => {
//                       deleteMonitor(m.id);
//                       showToast(`${m.name} deleted`, "error");
//                     }}
//                   >
//                     <TrashIcon />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {!isLoading && filtered.length > 0 && (
//           <div className="flex items-center justify-between border-t border-line px-4 py-3.5 text-[12px] text-muted [@media(max-width:560px)]:flex-col [@media(max-width:560px)]:items-start [@media(max-width:560px)]:gap-3">
//             <span>
//               Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
//             </span>
//             <div className="flex items-center gap-2.5 [&>button]:cursor-pointer [&>button]:rounded-md [&>button]:border [&>button]:border-line [&>button]:bg-panel-2 [&>button]:px-[11px] [&>button]:py-1.5 [&>button]:text-[12px] [&>button]:text-[#c9cdd3] [&>button:hover:not(:disabled)]:border-[#3a4048] [&>button:hover:not(:disabled)]:text-white [&>button:disabled]:cursor-not-allowed [&>button:disabled]:opacity-40 light:[&>button]:bg-[#f1f2f5] light:[&>button]:text-[#3a4048]">
//               <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
//               <span>{page} / {totalPages}</span>
//               <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }
