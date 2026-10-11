import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { BellIcon, MonitorsIcon, PlusIcon } from "./icons";

interface HowItWorksModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
}

const STEPS = [
  {
    icon: <PlusIcon size={18} />,
    title: "Create a monitor",
    description: "Give it a name and a URL — a website or an API endpoint.",
  },
  {
    icon: <MonitorsIcon size={18} />,
    title: "We check it for you",
    description:
      "Your first check runs right away, then about every 5 minutes. Every check records response time and uptime.",
  },
  {
    icon: <BellIcon size={18} />,
    title: "Get alerted when it breaks",
    description:
      "If your site goes down we email you — and send a recovery email the moment it's back. You can send yourself a test email from Settings.",
  },
];

export default function HowItWorksModal({
  open,
  onClose,
  onCreate,
}: HowItWorksModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="How Monitorly works"
      description="From zero to alerts in three steps."
      footer={<Button onClick={onCreate}>Create your own monitor</Button>}
    >
      <div className="flex flex-col gap-4">
        {STEPS.map((step) => (
          <div className="flex gap-3" key={step.title}>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-[#0e1115] text-brand">
              {step.icon}
            </div>

            <div>
              <b className="text-sm">{step.title}</b>

              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
