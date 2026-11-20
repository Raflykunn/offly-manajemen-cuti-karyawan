import { Skeleton } from "@/components/ui/skeleton";

export default function MemuatProfil() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat profil">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="size-20 rounded-full" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
            <div className="space-y-2.5 pt-2 border-t">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-44" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>

        <div className="lg:col-span-8 rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="flex justify-end">
            <Skeleton className="h-9 w-44 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
