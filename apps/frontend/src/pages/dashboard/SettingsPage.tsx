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

      <div className="flex max-w-[760px] flex-col gap-3.5">
        <section className="rounded-[10px] border border-line bg-panel p-5 light:bg-white">
          <div className="mb-4 [&>h3]:m-0 [&>h3]:mb-1 [&>h3]:text-[15px] [&>h3]:tracking-[-0.3px] [&>p]:m-0 [&>p]:text-[12.5px] [&>p]:text-muted">
            <h3>Profile</h3>
            <p>Your account details. Contact support to make changes.</p>
          </div>

          <div className="settings-form">
            <div className="grid grid-cols-2 gap-3.5 [@media(max-width:860px)]:grid-cols-1">
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

        <section className="rounded-[10px] border border-line bg-panel p-5 light:bg-white">
          <div className="mb-4 [&>h3]:m-0 [&>h3]:mb-1 [&>h3]:text-[15px] [&>h3]:tracking-[-0.3px] [&>p]:m-0 [&>p]:text-[12.5px] [&>p]:text-muted">
            <h3>Notification email</h3>
            <p>Where alert emails get sent when a monitor changes status.</p>
          </div>

          <form className="settings-form" onSubmit={handleNotificationSave}>
            <div className="grid grid-cols-2 gap-3.5 [@media(max-width:860px)]:grid-cols-1">
              <Input
                label="Notification email"
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                disabled
                readOnly
              />
            </div>

            <div className="mt-0.5 flex justify-end">
              <Button type="submit" size="sm" disabled={isSendingEmail}>
                {isSendingEmail ? "Sending..." : "Send notification email"}
              </Button>
            </div>
          </form>
        </section>

        <section className="rounded-[10px] border border-[#3a2424] bg-[#151011] p-5 light:border-[#f3d6d6] light:bg-[#fdf4f4]">
          <div className="mb-4 [&>h3]:m-0 [&>h3]:mb-1 [&>h3]:text-[15px] [&>h3]:tracking-[-0.3px] [&>p]:m-0 [&>p]:text-[12.5px] [&>p]:text-muted">
            <h3>Danger zone</h3>
            <p>This action is permanent and can't be undone.</p>
          </div>

          <div className="flex items-center justify-between border-t border-[#2a1c1c] px-1 py-[11px] text-[12px] first:border-t-0 light:border-t-[#f3d6d6]">
            <div>
              <b className="font-semibold">Delete account</b>
              <div className="mt-0.5 text-[10px] text-[#818994]">
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
