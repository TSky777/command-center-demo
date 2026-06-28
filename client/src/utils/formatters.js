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

export function fmtTime(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const timeStr = d.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true, 
    timeZoneName: 'short' 
  });
  
  const parts = timeStr.split(' ');
  const timePart = `${parts[0]}${parts[1].toLowerCase()}`;
  const tzPart = parts.slice(2).join(' ');
  
  return `${timePart} ${tzPart}`;
}



