import { Progress } from './ui/progress';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span>
            {current}/{total}
          </span>
        </div>
      )}
      <Progress value={percentage} />
    </div>
  );
}
