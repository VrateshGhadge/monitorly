import { cn } from "../../lib/utils";

interface ToggleProps {
  on: boolean;
  onClick: () => void;
}

export default function Toggle({ on, onClick }: ToggleProps) {
  return (
    <div
      className={cn(
        "relative inline-block h-[18px] w-8 shrink-0 cursor-pointer appearance-none rounded-full border p-0 transition-all duration-150 ease-[ease] focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        on ? "border-[#254d3a] bg-[#173526]" : "border-line bg-[#1b2028]",
      )}
      onClick={onClick}
    >
      <i
        className={cn(
          "absolute top-px left-px block size-3.5 rounded-full transition-all duration-150 ease-[ease]",
          on ? "translate-x-3.5 bg-brand" : "bg-muted-foreground",
        )}
      />
    </div>
  );
}
