export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative overflow-hidden rounded-2xl bg-gray-200 aspect-square mb-3" />
      <div className="space-y-2">
        <div className="hidden sm:block h-2 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="flex items-center gap-1 pt-0.5">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-3 h-3 bg-gray-200 rounded-sm" />
            ))}
          </div>
        </div>
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="flex gap-1.5 mt-2.5">
          <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 rounded-xl flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}