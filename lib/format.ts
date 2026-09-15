export function formatPrice(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatRelativeDate(date: string | Date): string {
  const target = typeof date === "string" ? new Date(date) : date;
  const diffDays = Math.floor((Date.now() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "오늘";
  return `${diffDays}일 전`;
}
