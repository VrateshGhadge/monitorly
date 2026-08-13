import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  size?: "md" | "sm";
}

export default function Dropdown({
  options,
  value,
  onChange,
  label,
  size = "md",
}: DropdownProps) {
  return (
    <div className="mb-4 flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-semibold text-[#c9cdd3]">{label}</span>
      )}

      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger
          className={`flex w-full items-center justify-between rounded-md border border-border bg-[#0d1014] px-3 text-left text-sm text-foreground outline-none focus:ring-2 focus:ring-brand/15 ${
            size === "sm" ? "h-8 min-w-35 text-xs" : "h-10 min-w-40"
          }`}
        >
          <Select.Value />

          <Select.Icon>
            <ChevronDown className="size-4 text-muted-foreground" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            className="z-60 max-h-60 min-w-[var(--radix-select-trigger-width)] overflow-auto rounded-md border border-border bg-surface p-1 shadow-xl"
          >
            <Select.Viewport>
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex cursor-pointer items-center rounded px-8 py-2 text-sm text-[#c9cdd3] outline-none data-[highlighted]:bg-surface-raised data-[state=checked]:text-brand"
                >
                  <Select.ItemText>{option.label}</Select.ItemText>

                  <Select.ItemIndicator className="absolute left-2">
                    <Check className="size-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

// import * as Select from "@radix-ui/react-select";
// import { Check, ChevronDown } from "lucide-react";
// export interface DropdownOption { value: string; label: string; }
// interface DropdownProps { options: DropdownOption[]; value: string; onChange: (value: string) => void; label?: string; size?: "md" | "sm"; }
// export default function Dropdown({ options, value, onChange, label, size = "md" }: DropdownProps) {
//   return <div className="mb-4 flex flex-col gap-1.5">{label && <span className="text-xs font-semibold text-[#c9cdd3]">{label}</span>}<Select.Root value={value} onValueChange={onChange}><Select.Trigger className={`flex w-full items-center justify-between rounded-md border border-border bg-[#0d1014] px-3 text-left text-sm text-foreground outline-none focus:ring-2 focus:ring-brand/15 ${size === "sm" ? "h-8 min-w-35 text-xs" : "h-10 min-w-40"}`}><Select.Value /><Select.Icon><ChevronDown className="size-4 text-muted-foreground" /></Select.Icon></Select.Trigger><Select.Portal><Select.Content position="popper" className="z-60 max-h-60 min-w-[var(--radix-select-trigger-width)] overflow-auto rounded-md border border-border bg-surface p-1 shadow-xl"><Select.Viewport>{options.map((option) => <Select.Item key={option.value} value={option.value} className="relative flex cursor-pointer items-center rounded px-8 py-2 text-sm text-[#c9cdd3] outline-none data-[highlighted]:bg-surface-raised data-[state=checked]:text-brand"><Select.ItemText>{option.label}</Select.ItemText><Select.ItemIndicator className="absolute left-2"><Check className="size-4" /></Select.ItemIndicator></Select.Item>)}</Select.Viewport></Select.Content></Select.Portal></Select.Root></div>;
// }
