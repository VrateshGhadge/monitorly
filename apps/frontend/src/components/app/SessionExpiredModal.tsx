import { useNavigate } from "react-router-dom";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";

export default function SessionExpiredModal() {
  const { sessionExpired, clearSessionExpired } = useAuth();
  const navigate = useNavigate();

  const handleClose = () => {
    clearSessionExpired();
    navigate("/signin", { replace: true });
  };

  return (
    <Modal
      open={sessionExpired}
      onClose={handleClose}
      title="You've been logged out"
      description="Your session has expired. Please sign in again to continue."
      footer={<Button onClick={handleClose}>Sign in again</Button>}
    >
      <p className="text-sm text-muted-foreground">
        For your security, you'll need to sign in again to keep watching your
        monitors.
      </p>
    </Modal>
  );
}
