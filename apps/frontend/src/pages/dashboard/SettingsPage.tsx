import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../lib/api";
import { sendTestEmail } from "../../api/monitor";
import { deleteAccount } from "../../api/auth";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Sessions persisted before Google support lack hasPassword - treat them as password accounts.
  const needsGoogleConfirm = user?.hasPassword === false;

  const [notificationEmail, setNotificationEmail] = useState(user?.email || "");

  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleNotificationSave = async (e: FormEvent) => {
    e.preventDefault();

    if (isSendingEmail) return;

    try {
      setIsSendingEmail(true);

      await sendTestEmail();

      showToast("Test notification email sent");
    } catch (error) {
      console.error(error);
      showToast("Failed to send notification email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const closeDeleteModal = () => {
    setDeleteOpen(false);
    setConfirmText("");
    setDeletePassword("");
  };

  const finishDelete = () => {
    showToast("Your account has been deleted.");

    closeDeleteModal();
    signOut();
    navigate("/signin", { replace: true });
  };

  const handlePasswordDelete = async () => {
    if (deleting) return;

    try {
      setDeleting(true);

      await deleteAccount({ password: deletePassword });

      finishDelete();
    } catch (error) {
      showToast(
        getErrorMessage(
          error,
          "Failed to delete your account. Please try again.",
        ),
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleGoogleDelete = async (credential: string) => {
    if (deleting) return;

    try {
      setDeleting(true);

      await deleteAccount({ credential });

      finishDelete();
    } catch (error) {
      showToast(
        getErrorMessage(
          error,
          "Failed to delete your account. Please try again.",
        ),
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Settings"
        description="Manage your profile, notifications and workspace preferences."
      />

      <div className="settings-stack">
        <section className="settings-section">
          <div className="settings-section-head">
            <h3>Profile</h3>
            <p>Your account details. Contact support to make changes.</p>
          </div>

          <div className="settings-form">
            <div className="settings-form-row">
              <Input
                label="Full name"
                value={user?.name || ""}
                disabled
                readOnly
              />

              <Input
                label="Email"
                value={user?.email || ""}
                disabled
                readOnly
              />
            </div>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-head">
            <h3>Notification email</h3>
            <p>Where alert emails get sent when a monitor changes status.</p>
          </div>

          <form className="settings-form" onSubmit={handleNotificationSave}>
            <div className="settings-form-row">
              <Input
                label="Notification email"
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                disabled
                readOnly
              />
            </div>

            <div className="settings-form-actions">
              <Button type="submit" size="sm" disabled={isSendingEmail}>
                {isSendingEmail ? "Sending..." : "Send notification email"}
              </Button>
            </div>
          </form>
        </section>

        <section className="settings-section settings-danger">
          <div className="settings-section-head">
            <h3>Danger zone</h3>
            <p>This action is permanent and can't be undone.</p>
          </div>

          <div className="row-line">
            <div>
              <b>Delete account</b>
              <div className="row-sub">
                Permanently remove your account, monitors and alert history
              </div>
            </div>

            <Button
              size="sm"
              variant="danger"
              onClick={() => setDeleteOpen(true)}
            >
              Delete account
            </Button>
          </div>
        </section>
      </div>

      <Modal
        open={deleteOpen}
        onClose={closeDeleteModal}
        title="Delete account"
        description="This will permanently delete your account, monitors and alert history."
        footer={
          <>
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>

            {!needsGoogleConfirm && (
              <Button
                variant="danger"
                loading={deleting}
                disabled={confirmText !== "DELETE" || !deletePassword}
                onClick={handlePasswordDelete}
              >
                Delete permanently
              </Button>
            )}
          </>
        }
      >
        <Input
          label='Type "DELETE" to confirm'
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
        />

        {needsGoogleConfirm && confirmText === "DELETE" && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-muted-foreground">
              Confirm with Google to delete your account.
            </p>

            <GoogleSignInButton
              onCredential={handleGoogleDelete}
              text="continue_with"
            />

            {deleting && (
              <p className="text-xs text-muted-foreground">
                Deleting your account…
              </p>
            )}
          </div>
        )}

        {!needsGoogleConfirm && (
          <PasswordInput
            label="Confirm your password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
        )}
      </Modal>
    </>
  );
}
