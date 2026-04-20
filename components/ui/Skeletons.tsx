export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-3.5 space-y-2">
        <div className="h-3 w-16 skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-3 w-3/4 skeleton rounded" />
        <div className="flex justify-between items-center mt-3">
          <div className="h-5 w-16 skeleton rounded" />
          <div className="w-8 h-8 skeleton rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 w-32 skeleton rounded" />
        <div className="h-5 w-20 skeleton rounded-full" />
      </div>
      <div className="h-4 w-full skeleton rounded" />
      <div className="h-4 w-2/3 skeleton rounded" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 w-24 skeleton rounded" />
        <div className="h-9 w-28 skeleton rounded-xl" />
      </div>
    </div>
  );
}
