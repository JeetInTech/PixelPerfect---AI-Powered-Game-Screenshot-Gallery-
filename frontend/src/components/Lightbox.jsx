import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Sparkles, Calendar, HardDrive } from 'lucide-react'

function Lightbox({ screenshot, onClose, onNext, onPrev, currentIndex, totalCount }) {
    const confidenceColor = screenshot.confidence > 0.8 
        ? 'text-green-400' 
        : screenshot.confidence > 0.6 
            ? 'text-yellow-400' 
            : 'text-orange-400'
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }
    
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }
    
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white z-50 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="w-8 h-8" />
                </button>
                
                {/* Navigation - Previous */}
                <button
                    onClick={onPrev}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-3 hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
                
                {/* Navigation - Next */}
                <button
                    onClick={onNext}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-3 hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
                
                {/* Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-6xl max-h-screen p-4 flex flex-col items-center"
                >
                    {/* Image */}
                    <img
                        src={screenshot.url}
                        alt={screenshot.title}
                        className="max-h-[70vh] w-auto object-contain rounded-lg shadow-2xl border border-white/10"
                    />
                    
                    {/* Info panel */}
                    <div className="mt-6 text-center max-w-xl">
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            {screenshot.title}
                        </h3>
                        
                        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-accent-primary/20 text-accent-primary border border-accent-primary/30">
                                {screenshot.game}
                            </span>
                            <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-gray-300 uppercase">
                                {screenshot.category}
                            </span>
                        </div>
                        
                        {/* Metadata */}
                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1.5">
                                <Sparkles className={`w-4 h-4 ${confidenceColor}`} />
                                <span className={confidenceColor}>
                                    {(screenshot.confidence * 100).toFixed(0)}% confidence
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(screenshot.dateAdded)}</span>
                            </div>
                            {screenshot.fileSize && (
                                <div className="flex items-center gap-1.5">
                                    <HardDrive className="w-4 h-4" />
                                    <span>{formatFileSize(screenshot.fileSize)}</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Counter */}
                        <div className="mt-4 text-gray-500 text-sm">
                            {currentIndex + 1} / {totalCount}
                        </div>
                    </div>
                    
                    {/* Mobile navigation */}
                    <div className="flex sm:hidden gap-6 mt-6">
                        <button
                            onClick={onPrev}
                            className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={onNext}
                            className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default Lightbox
