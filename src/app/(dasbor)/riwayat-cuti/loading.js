import { Skeleton } from "@/components/ui/skeleton";

export default function MemuatRiwayatCuti() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Memuat riwayat cuti"
    >
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, indeks) => (
            <Skeleton key={indeks} className="h-8 w-full rounded-lg" />
          ))}
        </div>
        <div className="space-y-3 pt-2">
          {Array.from({ length: 6 }).map((_, indeks) => (
            <Skeleton key={indeks} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
