const JP_UNITS: [number, string][] = [
  [1e68, '無量大数'],
  [1e64, '不可思議'],
  [1e60, '那由他'],
  [1e56, '阿僧祇'],
  [1e52, '恒河沙'],
  [1e48, '極'],
  [1e44, '載'],
  [1e40, '正'],
  [1e36, '澗'],
  [1e32, '溝'],
  [1e28, '穣'],
  [1e24, '秭'],
  [1e20, '垓'],
  [1e16, '京'],
  [1e12, '兆'],
  [1e8, '億'],
  [1e4, '万'],
];

export function fmt(n: number): string {
  if (!isFinite(n)) return '∞✝';
  if (n < 0) return '-' + fmt(-n);
  if (n < 10 && n % 1 !== 0) return n.toFixed(1);
  if (n < 1e4) return Math.floor(n).toLocaleString('ja-JP');
  if (n >= 1e72) return (n / 1e68).toExponential(2) + '無量大数';
  for (const [v, name] of JP_UNITS) {
    if (n >= v) {
      const x = n / v;
      const s = x >= 1000 ? Math.floor(x).toString() : x >= 100 ? x.toFixed(1) : x.toFixed(2);
      return s + name;
    }
  }
  return String(Math.floor(n));
}

export function fmtInt(n: number): string {
  return Math.floor(n).toLocaleString('ja-JP');
}

export function fmtTime(sec: number): string {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}時間${m}分`;
  if (m > 0) return `${m}分${s}秒`;
  return `${s}秒`;
}

export function pct(v: number, digits = 0): string {
  return (v * 100).toFixed(digits) + '%';
}
