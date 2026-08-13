import { useState, type FormEvent } from "react";
import PageHeader from "../../components/ui/PageHeader";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { sendTestEmail } from "../../api/monitor";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();

  const [notificationEmail, setNotificationEmail] = useState(user?.email || "");

  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

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
        onClose={() => setDeleteOpen(false)}
        title="Delete account"
        description="This will permanently delete your account, monitors and alert history."
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>

            <Button
              variant="danger"
              disabled={confirmText !== "DELETE"}
              onClick={() => {
                setDeleteOpen(false);
                signOut();
              }}
            >
              Delete permanently
            </Button>
          </>
        }
      >
        <Input
          label='Type "DELETE" to confirm'
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
        />
      </Modal>
    </>
  );
}
