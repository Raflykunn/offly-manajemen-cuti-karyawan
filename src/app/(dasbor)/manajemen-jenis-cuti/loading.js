import { Skeleton } from "@/components/ui/skeleton";

export default function MemuatJenisCuti() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Memuat manajemen jenis cuti"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-8 w-40 rounded-lg" />
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-3">
        <Skeleton className="h-6 w-56" />
        {Array.from({ length: 5 }).map((_, indeks) => (
          <Skeleton key={indeks} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
