interface ToggleProps {
  on: boolean;
  onClick: () => void;
}

export default function Toggle({ on, onClick }: ToggleProps) {
  return (
    <div className={`toggle${on ? " on" : ""}`} onClick={onClick}>
      <i></i>
    </div>
  );
}
