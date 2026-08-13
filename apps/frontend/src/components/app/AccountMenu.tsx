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
    <div className="popover-anchor" ref={ref}>
      <button
        className="account-trigger"
        aria-label="Account menu"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="avatar">{(user?.name || "M")[0]}</span>
      </button>

      {open && (
        <div
          className="popover account-popover"
          role="menu"
          aria-label="Account"
        >
          <div className="popover-head account-popover-head">
            <span className="avatar">{(user?.name || "M")[0]}</span>
            <div>
              <b>{user?.name || "Monitorly user"}</b>
              <small>{user?.email}</small>
            </div>
          </div>
          <div className="popover-divider" />
          <button
            className="popover-action"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              navigate("/dashboard/settings");
            }}
          >
            <SettingsIcon size={15} /> Settings
          </button>
          <button
            className="popover-action popover-action-danger"
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
