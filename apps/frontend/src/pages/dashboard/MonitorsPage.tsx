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

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-field">
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
          <div className="table">
            <div className="table-head">
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
          <div className="table">
            <div className="table-head">
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
                className="table-row cursor-pointer"
                key={m.id}
                onClick={() => navigate(`/dashboard/monitors/${m.slug}`)}
              >
                <div className="table-cell">
                  <StatusPill status={m.status} />
                </div>
                <div className="table-cell table-cell-name">
                  <b>{m.name}</b>
                  <span className="table-cell-sub">
                    {m.type === "API" ? `${m.method} · API` : "Website"}
                  </span>
                </div>
                <div className="table-cell table-cell-url">{m.url}</div>
                <div className="table-cell">
                  {m.latency ? `${m.latency}ms` : "—"}
                </div>
                <div className="table-cell table-cell-muted">
                  {formatLastChecked(m.lastChecked, now)}
                </div>
                <div className="table-cell">{m.uptimePct}%</div>
                <div className="table-cell table-actions">
                  <button
                    className="icon-btn"
                    aria-label="Edit monitor"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(m);
                    }}
                  >
                    <Pencil size={13} strokeWidth={2} />
                  </button>
                  <button
                    className="icon-btn icon-btn-danger"
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
          <div className="table-pagination">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="pagination-controls">
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

//       <div className="table-card">
//         <div className="table-toolbar">
//           <div className="search-field">
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
//           <div className="table">
//             <div className="table-head">
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
//           <div className="table">
//             <div className="table-head">
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
//                 className="table-row cursor-pointer"
//                 key={m.id}
//                 // onClick={() => navigate(`/dashboard/monitors/${m.id}`)}
//                 onClick={() => navigate(`/dashboard/monitors/${m.slug}`)}

//               >
//                 <div className="table-cell">
//                   <StatusPill status={m.status} />
//                 </div>

//                 <div className="table-cell table-cell-name">
//                   <b>{m.name}</b>

//                   <span className="table-cell-sub">
//                     {m.type === "API"
//                       ? `${m.method} · API`
//                       : "Website"}
//                   </span>
//                 </div>

//                 <div className="table-cell table-cell-url">
//                   {m.url}
//                 </div>

//                 <div className="table-cell">
//                   {m.latency
//                     ? `${m.latency}ms`
//                     : "—"}
//                 </div>

//                 <div className="table-cell table-cell-muted">
//                   {formatLastChecked(m.lastChecked, now)}
//                 </div>

//                 <div className="table-cell">
//                   {m.uptimePct}%
//                 </div>

//                 <div className="table-cell table-actions">

//                   {/* ---------------- V2 ---------------- */}

//                   {/*
//                   <button
//                     className="icon-btn"
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
//                     className="icon-btn icon-btn-danger"
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
//                       className="icon-btn"
//                       aria-label="Edit monitor"
//                       onClick={(e) => {
//                         e.stopPropagation();

//                         openEditModal(m);
//                       }}
//                     >
//                       <Pencil size={13} strokeWidth={2} />
//                     </button>

//                     <button
//                       className="icon-btn icon-btn-danger"
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
//             <div className="table-pagination">
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

//               <div className="pagination-controls">
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

//       <div className="table-card">
//         <div className="table-toolbar">
//           <div className="search-field">
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
//           <div className="table">
//             <div className="table-head">
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
//           <div className="table">
//             <div className="table-head">
//               <span>Status</span><span>Name</span><span>URL</span><span>Response</span><span>Last checked</span><span>Uptime</span><span></span>
//             </div>
//             {pageItems.map((m) => (
//               <div className="table-row" key={m.id}>
//                 <div className="table-cell"><StatusPill status={m.status} /></div>
//                 <div className="table-cell table-cell-name">
//                   <b>{m.name}</b>
//                   <span className="table-cell-sub">{m.kind === "API" ? `${m.method} · API` : "Website"}</span>
//                 </div>
//                 <div className="table-cell table-cell-url">{m.url}</div>
//                 <div className="table-cell">{m.latency ? `${m.latency}ms` : "—"}</div>
//                 <div className="table-cell table-cell-muted">{m.lastChecked}</div>
//                 <div className="table-cell">{m.uptimePct}%</div>
//                 <div className="table-cell table-actions">
//                   <button
//                     className="icon-btn"
//                     aria-label={m.status === "paused" ? "Resume monitor" : "Pause monitor"}
//                     onClick={() => {
//                       toggleMonitorPause(m.id);
//                       showToast(m.status === "paused" ? `${m.name} resumed` : `${m.name} paused`, "info");
//                     }}
//                   >
//                     {m.status === "paused" ? <PlayIcon /> : <PauseIcon />}
//                   </button>
//                   <button
//                     className="icon-btn icon-btn-danger"
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
//           <div className="table-pagination">
//             <span>
//               Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
//             </span>
//             <div className="pagination-controls">
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
