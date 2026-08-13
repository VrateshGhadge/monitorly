import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.98,
                }}
                className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl border border-border bg-surface p-5 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="text-lg font-bold">
                      {title}
                    </Dialog.Title>

                    {description && (
                      <Dialog.Description className="mt-1.5 text-sm text-muted-foreground">
                        {description}
                      </Dialog.Description>
                    )}
                  </div>

                  <Dialog.Close
                    className="rounded p-1 text-muted-foreground hover:text-foreground"
                    aria-label="Close dialog"
                  >
                    <X className="size-4" />
                  </Dialog.Close>
                </div>

                <div className="pt-5">{children}</div>

                {footer && (
                  <div className="flex justify-end gap-2 pt-5">{footer}</div>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

// import * as Dialog from "@radix-ui/react-dialog";
// import { AnimatePresence, motion } from "framer-motion";
// import { X } from "lucide-react";
// import type { ReactNode } from "react";

// interface ModalProps { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; footer?: ReactNode; }
// export default function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
//   return <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}><AnimatePresence>{open && <Dialog.Portal forceMount>
//     <Dialog.Overlay asChild><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" /></Dialog.Overlay>
//     <Dialog.Content asChild><motion.div initial={{ opacity: 0, y: 10, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: .98 }} className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl border border-border bg-surface p-5 shadow-2xl">
//       <div className="flex items-start justify-between gap-4"><div><Dialog.Title className="text-lg font-bold">{title}</Dialog.Title>{description && <Dialog.Description className="mt-1.5 text-sm text-muted-foreground">{description}</Dialog.Description>}</div><Dialog.Close className="rounded p-1 text-muted-foreground hover:text-foreground" aria-label="Close dialog"><X className="size-4" /></Dialog.Close></div>
//       <div className="pt-5">{children}</div>{footer && <div className="flex justify-end gap-2 pt-5">{footer}</div>}
//     </motion.div></Dialog.Content>
//   </Dialog.Portal>}</AnimatePresence></Dialog.Root>;
// }
