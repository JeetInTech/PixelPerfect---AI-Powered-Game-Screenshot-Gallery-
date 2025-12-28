import { useState } from 'react'
import { motion } from 'framer-motion'
import { Expand, Sparkles } from 'lucide-react'

function ScreenshotCard({ screenshot, onClick, index }) {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)
    
    const confidenceColor = screenshot.confidence > 0.8 
        ? 'text-green-400' 
        : screenshot.confidence > 0.6 
            ? 'text-yellow-400' 
            : 'text-orange-400'
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                layout: { duration: 0.3 }
            }}
            className="group relative bg-gaming-card rounded-xl overflow-hidden shadow-lg border border-white/5 cursor-pointer hover:border-accent-primary/30 transition-all duration-300"
            onClick={onClick}
        >
            {/* Image container */}
            <div className="aspect-video w-full overflow-hidden bg-gray-800">
                {!imageLoaded && !imageError && (
                    <div className="shimmer w-full h-full" />
                )}
                
                {imageError ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <span className="text-gray-500">Failed to load</span>
                    </div>
                ) : (
                    <img
                        src={screenshot.url}
                        alt={screenshot.title}
                        className={`w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                    />
                )}
            </div>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <span className="text-accent-primary text-xs font-bold tracking-wider uppercase mb-1">
                    {screenshot.game}
                </span>
                <h3 className="text-white text-lg font-bold leading-tight">
                    {screenshot.title}
                </h3>
                
                {/* Confidence indicator */}
                <div className="flex items-center gap-1 mt-2">
                    <Sparkles className={`w-3 h-3 ${confidenceColor}`} />
                    <span className={`text-xs ${confidenceColor}`}>
                        {(screenshot.confidence * 100).toFixed(0)}% match
                    </span>
                </div>
            </div>
            
            {/* Expand icon */}
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Expand className="w-4 h-4" />
            </div>
            
            {/* Category badge */}
            <div className="absolute top-3 left-3 bg-accent-primary/80 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full font-semibold uppercase tracking-wide">
                {screenshot.category}
            </div>
            
            {/* New indicator for recent screenshots */}
            {isRecent(screenshot.dateAdded) && (
                <div className="absolute bottom-3 right-3 bg-green-500/80 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full live-indicator" />
                    NEW
                </div>
            )}
        </motion.div>
    )
}

// Check if screenshot was added in the last 5 minutes
function isRecent(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = diffMs / (1000 * 60)
    return diffMins < 5
}

export default ScreenshotCard
