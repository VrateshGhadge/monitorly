import { zodResolver } from "@hookform/resolvers/zod";
import * as Switch from "@radix-ui/react-switch";
import { useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { Controller, useForm } from "react-hook-form";

import Button from "../ui/Button";
import Dropdown from "../ui/Dropdown";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import axios from "axios";

import { createMonitorInput, type CreateMonitorInput } from "@repo/validation";

const KIND_OPTIONS = [
  { value: "WEBSITE", label: "Website" },
  { value: "API", label: "API Endpoint" },
];

const METHOD_OPTIONS = [
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
];

type Values = CreateMonitorInput;

interface CreateMonitorModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (values: CreateMonitorInput) => Promise<void>;
  onUpdate?: (values: CreateMonitorInput) => Promise<void>;
  initialValues?: CreateMonitorInput;
}

export default function CreateMonitorModal({
  open,
  onClose,
  onCreate,
  onUpdate,
  initialValues,
}: CreateMonitorModalProps) {
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(createMonitorInput),
    defaultValues: {
      name: "",
      url: "",
      type: "WEBSITE",
      method: "GET",
      emailAlerts: true,
    },
  });

  // useEffect(() => {
  //   if (!open) {
  //     reset();
  //   }
  // }, [open, reset]);
  useEffect(() => {
    if (!open) {
      reset();
      return;
    }

    if (initialValues) {
      reset(initialValues);
    } else {
      reset();
    }
  }, [open, initialValues, reset]);

  const close = () => {
    reset();
    onClose();
  };

  // const submit = async (values: Values) => {
  //   await new Promise((resolve) => setTimeout(resolve, 500));

  //   onCreate({
  //     id: `m-${Date.now()}`,
  //     name: values.name,
  //     url: values.url,
  //     type: values.type,
  //     method: values.method,
  //     emailAlerts: values.emailAlerts,

  //     status: "up",
  //     uptimePct: 100,
  //     latency: Math.round(30 + Math.random() * 150),
  //     lastChecked: "Just now",
  //   });

  //   close();
  // };

  // const submit = async (values: Values) => {
  //   await onCreate(values);
  //   close();
  // };
  // const submit = async (values: Values) => {
  //   if (initialValues && onUpdate) {
  //     await onUpdate(values);
  //   } else {
  //     await onCreate(values);
  //   }

  //   close();
  // };
  const submit = async (values: Values) => {
    try {
      if (initialValues && onUpdate) {
        await onUpdate(values);
      } else {
        await onCreate(values);
      }

      close();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to update monitor.";

        showToast(message, "error");
        return;
      }

      showToast("Something went wrong. Please try again.", "error");
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={initialValues ? "Edit monitor" : "Create monitor"}
      description={
        initialValues
          ? "Update your monitor settings."
          : "Start tracking uptime and response time for a URL."
      }
    >
      <form onSubmit={handleSubmit(submit)} noValidate>
        <Input
          label="Monitor name"
          placeholder="e.g. Marketing Site"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="URL"
          placeholder="https://example.com"
          error={errors.url?.message}
          {...register("url")}
        />

        <div className="grid grid-cols-2 gap-3">
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Dropdown
                label="Monitor type"
                options={KIND_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="method"
            render={({ field }) => (
              <Dropdown
                label="HTTP method"
                options={METHOD_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name="emailAlerts"
          render={({ field }) => (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-[#0e1115] p-3">
              <div>
                <b className="text-sm">Email notifications</b>

                <p className="mt-1 text-xs text-muted-foreground">
                  Get an email the moment this monitor goes down.
                </p>
              </div>

              <Switch.Root
                checked={field.value}
                onCheckedChange={field.onChange}
                className="relative h-5 w-9 rounded-full bg-[#1b2028] outline-none data-[state=checked]:bg-[#173526]"
              >
                <Switch.Thumb className="block size-4 translate-x-0.5 rounded-full bg-muted-foreground transition-transform data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-brand" />
              </Switch.Root>
            </div>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>

          <Button type="submit" loading={isSubmitting}>
            {initialValues ? "Update monitor" : "Save monitor"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// import { zodResolver } from "@hookform/resolvers/zod";
// import * as Switch from "@radix-ui/react-switch";
// import { useEffect } from "react";
// import { Controller, useForm } from "react-hook-form";

// import Button from "../ui/Button";
// import Dropdown from "../ui/Dropdown";
// import Input from "../ui/Input";
// import Modal from "../ui/Modal";

// import {
//   createMonitorInput,
//   type CreateMonitorInput,
// } from "@repo/validation";

// import type {
//   AppMonitor,
// } from "../../types/app";

// const KIND_OPTIONS = [
//   { value: "website", label: "Website" },
//   { value: "api", label: "API Endpoint" },
// ];

// const METHOD_OPTIONS = [
//   { value: "GET", label: "GET" },
//   { value: "POST", label: "POST" },
//   { value: "HEAD", label: "HEAD" },
// ];

// // const INTERVAL_OPTIONS = [
// //   { value: "30 sec", label: "Every 30 seconds" },
// //   { value: "1 min", label: "Every 1 minute" },
// //   { value: "5 min", label: "Every 5 minutes" },
// //   { value: "15 min", label: "Every 15 minutes" },
// // ];

// type Values = CreateMonitorInput;

// interface CreateMonitorModalProps {
//   open: boolean;
//   onClose: () => void;
//   onCreate: (monitor: AppMonitor) => void;
// }

// export default function CreateMonitorModal({
//   open,
//   onClose,
//   onCreate,
// }: CreateMonitorModalProps) {
//   const {
//     register,
//     handleSubmit,
//     control,
//     reset,
//     formState: {
//       errors,
//       isSubmitting,
//     },
//   } = useForm<Values>({
//     resolver: zodResolver(createMonitorInput),
//     defaultValues: {
//       name: "",
//       url: "",
//       kind: "website",
//       method: "GET",
//       interval: "1 min",
//       emailAlerts: true,
//     },
//   });

//   useEffect(() => {
//     if (!open) {
//       reset();
//     }
//   }, [open, reset]);

//   const close = () => {
//     reset();
//     onClose();
//   };

//   const submit = async (values: Values) => {
//     await new Promise((resolve) => setTimeout(resolve, 500));

//     onCreate({
//       id: `m-${Date.now()}`,
//       ...values,
//       status: "up",
//       uptimePct: 100,
//       latency: Math.round(30 + Math.random() * 150),
//       lastChecked: "just now",
//     });

//     close();
//   };

//   return (
//     <Modal
//       open={open}
//       onClose={close}
//       title="Create monitor"
//       description="Start tracking uptime and response time for a URL."
//     >
//       <form
//         onSubmit={handleSubmit(submit)}
//         noValidate
//       >
//         <Input
//           label="Monitor name"
//           placeholder="e.g. Marketing Site"
//           error={errors.name?.message}
//           {...register("name")}
//         />

//         <Input
//           label="URL"
//           placeholder="https://example.com"
//           error={errors.url?.message}
//           {...register("url")}
//         />

//         <div className="grid grid-cols-2 gap-3">
//           <Controller
//             control={control}
//             name="kind"
//             render={({ field }) => (
//               <Dropdown
//                 label="Monitor type"
//                 options={KIND_OPTIONS}
//                 value={field.value}
//                 onChange={field.onChange}
//               />
//             )}
//           />

//           <Controller
//             control={control}
//             name="method"
//             render={({ field }) => (
//               <Dropdown
//                 label="HTTP method"
//                 options={METHOD_OPTIONS}
//                 value={field.value}
//                 onChange={field.onChange}
//               />
//             )}
//           />
//         </div>

//         {/* <Controller
//           control={control}
//           name="interval"
//           render={({ field }) => (
//             <Dropdown
//               label="Check interval"
//               options={INTERVAL_OPTIONS}
//               value={field.value}
//               onChange={field.onChange}
//             />
//           )}
//         /> */}

//         <Controller
//           control={control}
//           name="emailAlerts"
//           render={({ field }) => (
//             <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-[#0e1115] p-3">
//               <div>
//                 <b className="text-sm">
//                   Email notifications
//                 </b>

//                 <p className="mt-1 text-xs text-muted-foreground">
//                   Get an email the moment this monitor goes down
//                 </p>
//               </div>

//               <Switch.Root
//                 checked={field.value}
//                 onCheckedChange={field.onChange}
//                 className="relative h-5 w-9 rounded-full bg-[#1b2028] outline-none data-[state=checked]:bg-[#173526]"
//               >
//                 <Switch.Thumb className="block size-4 translate-x-0.5 rounded-full bg-muted-foreground transition-transform data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-brand" />
//               </Switch.Root>
//             </div>
//           )}
//         />

//         <div className="flex justify-end gap-2">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={close}
//           >
//             Cancel
//           </Button>

//           <Button
//             type="submit"
//             loading={isSubmitting}
//           >
//             Save monitor
//           </Button>
//         </div>
//       </form>
//     </Modal>
//   );
// }

// import { zodResolver } from "@hookform/resolvers/zod";
// import * as Switch from "@radix-ui/react-switch";
// import { useEffect } from "react";
// import { Controller, useForm } from "react-hook-form";
// import { z } from "zod";
// import Modal from "../ui/Modal";
// import Input from "../ui/Input";
// import Button from "../ui/Button";
// import Dropdown from "../ui/Dropdown";
// import type { AppMonitor, HttpMethod, MonitorKind } from "../../types/app";
// const KIND_OPTIONS = [{ value: "website", label: "Website" }, { value: "api", label: "API Endpoint" }];
// const METHOD_OPTIONS = [{ value: "GET", label: "GET" }, { value: "POST", label: "POST" }, { value: "HEAD", label: "HEAD" }];
// const INTERVAL_OPTIONS = [{ value: "30 sec", label: "Every 30 seconds" }, { value: "1 min", label: "Every 1 minute" }, { value: "5 min", label: "Every 5 minutes" }, { value: "15 min", label: "Every 15 minutes" }];
// const schema = z.object({ name: z.string().trim().min(1, "Give your monitor a name."), url: z.string().url("Include http:// or https://"), kind: z.enum(["website", "api"]), method: z.enum(["GET", "POST", "HEAD"]), interval: z.string(), emailAlerts: z.boolean() });
// type Values = z.infer<typeof schema>;
// interface CreateMonitorModalProps { open: boolean; onClose: () => void; onCreate: (monitor: AppMonitor) => void; }
// export default function CreateMonitorModal({ open, onClose, onCreate }: CreateMonitorModalProps) {
//   const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "", url: "", kind: "website", method: "GET", interval: "1 min", emailAlerts: true } });
//   useEffect(() => { if (!open) reset(); }, [open, reset]);
//   const close = () => { reset(); onClose(); };
//   const submit = async (values: Values) => { await new Promise((resolve) => setTimeout(resolve, 500)); onCreate({ id: `m-${Date.now()}`, ...values, kind: values.kind as MonitorKind, method: values.method as HttpMethod, status: "up", uptimePct: 100, latency: Math.round(30 + Math.random() * 150), lastChecked: "just now" }); close(); };
//   return <Modal open={open} onClose={close} title="Create monitor" description="Start tracking uptime and response time for a URL."><form onSubmit={handleSubmit(submit)} noValidate><Input label="Monitor name" placeholder="e.g. Marketing Site" error={errors.name?.message} {...register("name")} /><Input label="URL" placeholder="https://example.com" error={errors.url?.message} {...register("url")} /><div className="grid grid-cols-2 gap-3"><Controller control={control} name="kind" render={({ field }) => <Dropdown label="Monitor type" options={KIND_OPTIONS} value={field.value} onChange={field.onChange} />} /><Controller control={control} name="method" render={({ field }) => <Dropdown label="HTTP method" options={METHOD_OPTIONS} value={field.value} onChange={field.onChange} />} /></div><Controller control={control} name="interval" render={({ field }) => <Dropdown label="Check interval" options={INTERVAL_OPTIONS} value={field.value} onChange={field.onChange} />} /><Controller control={control} name="emailAlerts" render={({ field }) => <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-[#0e1115] p-3"><div><b className="text-sm">Email notifications</b><p className="mt-1 text-xs text-muted-foreground">Get an email the moment this monitor goes down</p></div><Switch.Root checked={field.value} onCheckedChange={field.onChange} className="relative h-5 w-9 rounded-full bg-[#1b2028] outline-none data-[state=checked]:bg-[#173526]"><Switch.Thumb className="block size-4 translate-x-0.5 rounded-full bg-muted-foreground transition-transform data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-brand" /></Switch.Root></div>} /><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit" loading={isSubmitting}>Save monitor</Button></div></form></Modal>;
// }
