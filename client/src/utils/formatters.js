export function fmtCurrency(value, decimals = 0) {
  if (value === null || value === undefined) return '—';
  const abs = Math.abs(value);
  const prefix = value < 0 ? '-' : '';
  if (abs >= 1000000) return `${prefix}$${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 10000) return `${prefix}$${(abs / 1000).toFixed(1)}K`;
  return `${prefix}$${abs.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function fmtNumber(value) {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString();
}

export function fmtPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(decimals)}%`;
}

export function fmtDecimal(value, decimals = 2) {
  if (value === null || value === undefined) return '—';
  return value.toFixed(decimals);
}
