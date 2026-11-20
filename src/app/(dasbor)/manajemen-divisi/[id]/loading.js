import { Skeleton } from "@/components/ui/skeleton";

export default function MemuatDetailDivisi() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Memuat detail divisi"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-6 w-36 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, indeks) => (
          <div key={indeks} className="rounded-xl border bg-card p-5 space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-3">
        <Skeleton className="h-6 w-48" />
        {Array.from({ length: 4 }).map((_, indeks) => (
          <Skeleton key={indeks} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
