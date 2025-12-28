function LoadingCard() {
    return (
        <div className="bg-gaming-card rounded-xl overflow-hidden border border-white/5">
            <div className="aspect-video shimmer" />
            <div className="p-4 space-y-2">
                <div className="h-3 w-16 shimmer rounded" />
                <div className="h-5 w-3/4 shimmer rounded" />
            </div>
        </div>
    )
}

export default LoadingCard
