import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SettingsIcon, LogoutIcon } from "./icons";

export default function AccountMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex cursor-pointer rounded-full border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand focus-visible:rounded-md"
        aria-label="Account menu"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[#254d3a] bg-[#1a2320] text-[12px] font-extrabold text-brand light:border-[#bfe6cf] light:bg-[#e5f6ec] light:text-[#1f8a54]">
          {(user?.name || "M")[0]}
        </span>
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+10px)] right-0 z-40 w-[260px] animate-popover overflow-hidden rounded-[10px] border border-line bg-[#141820] text-ink [box-shadow:0_20px_46px_rgba(0,0,0,0.45)] light:bg-white light:[box-shadow:0_16px_34px_rgba(20,22,26,0.1)]"
          role="menu"
          aria-label="Account"
        >
          <div className="flex items-center gap-2.5 border-b border-line px-4 py-3.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[#254d3a] bg-[#1a2320] text-[12px] font-extrabold text-brand light:border-[#bfe6cf] light:bg-[#e5f6ec] light:text-[#1f8a54]">
              {(user?.name || "M")[0]}
            </span>
            <div>
              <b className="block text-[12.5px]">
                {user?.name || "Monitorly user"}
              </b>
              <small className="block max-w-[170px] truncate text-[11px] text-muted">
                {user?.email}
              </small>
            </div>
          </div>
          <div className="h-px bg-line" />
          <button
            className="flex w-full cursor-pointer items-center gap-[9px] border-0 bg-transparent px-4 py-2.5 text-left text-[12.5px] font-semibold text-[#c9cdd3] hover:bg-[#1a1f26] hover:text-white light:hover:bg-[#f1f2f5] light:hover:text-[#14161a]"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              navigate("/dashboard/settings");
            }}
          >
            <SettingsIcon size={15} /> Settings
          </button>
          <button
            className="flex w-full cursor-pointer items-center gap-[9px] border-0 bg-transparent px-4 py-2.5 text-left text-[12.5px] font-semibold text-[#ff9d9d] hover:bg-[rgba(240,100,100,0.08)] hover:text-[#ff9d9d]"
            role="menuitem"
            onClick={signOut}
          >
            <LogoutIcon size={15} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
