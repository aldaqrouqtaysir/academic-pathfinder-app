type Props = {
  value: number; // 0..100
};

export function Progress({ value }: Props) {
  return (
    <div className="h-2.5 w-full rounded-full bg-slate-100">
      <div className="h-2.5 rounded-full bg-gradient-to-r from-teal-600 to-sky-500" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

