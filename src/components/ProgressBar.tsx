type ProgressBarProps = {
  progress: number;
};

export default function ProgressBar({ progress }: ProgressBarProps) {
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="progress-shell" aria-hidden="true">
      <div
        className="progress-bar"
        style={{ transform: `scaleX(${safeProgress / 100})` }}
      />
    </div>
  );
}
