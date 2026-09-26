export function currency(value: number, opts: {compact?: boolean;} = {}): string {
  if (opts.compact && Math.abs(value) >= 1000) {
    const k = value / 1000;
    return `$${k >= 100 ? Math.round(k) : k.toFixed(1)}k`;
  }
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function qty(value: number): string {
  return value.toLocaleString('en-US');
}

export function initialsOf(name: string): string {
  return name.
  split(' ').
  filter(Boolean).
  slice(0, 2).
  map((part) => part[0]?.toUpperCase() ?? '').
  join('');
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}