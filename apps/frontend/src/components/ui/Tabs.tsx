interface TabOption {
  value: string;
  label: string;
  count?: number;
}

interface TabsProps {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function Tabs({ options, value, onChange }: TabsProps) {
  return (
    <div className="tabs" role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={opt.value === value}
          className={`tab${opt.value === value ? " active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
          {typeof opt.count === "number" && (
            <span className="tab-count">{opt.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
