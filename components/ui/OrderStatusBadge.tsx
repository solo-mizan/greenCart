const statusMap: Record<string, { label: string; cls: string }> = {
  pending:    { label: "অপেক্ষমাণ",   cls: "badge-yellow" },
  confirmed:  { label: "নিশ্চিত",      cls: "badge-blue" },
  processing: { label: "প্রক্রিয়াধীন", cls: "badge-blue" },
  shipped:    { label: "পাঠানো হয়েছে", cls: "badge-blue" },
  delivered:  { label: "পৌঁছে গেছে",  cls: "badge-green" },
  cancelled:  { label: "বাতিল",        cls: "badge-red" },
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const s = statusMap[status] ?? { label: status, cls: "badge-gray" };
  return <span className={s.cls}>{s.label}</span>;
}
