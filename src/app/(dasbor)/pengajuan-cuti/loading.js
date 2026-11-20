import { Skeleton } from "@/components/ui/skeleton";

export default function MemuatPengajuanCuti() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Memuat pengajuan cuti"
    >
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-56" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <div className="flex justify-end gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-44 rounded-lg" />
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-52" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
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
