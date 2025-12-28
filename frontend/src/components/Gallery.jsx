import { motion, AnimatePresence } from 'framer-motion'
import ScreenshotCard from './ScreenshotCard'
import LoadingCard from './LoadingCard'
import { FolderOpen } from 'lucide-react'

function Gallery({ screenshots, loading, error, onImageClick }) {
    if (error) {
        return (
            <div className="text-center py-20">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md mx-auto">
                    <h3 className="text-red-400 text-xl font-bold mb-2">Connection Error</h3>
                    <p className="text-gray-400">
                        {error}
                    </p>
                    <p className="text-gray-500 text-sm mt-4">
                        Make sure the backend server is running on port 3001
                    </p>
                </div>
            </div>
        )
    }
    
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <LoadingCard key={i} />
                ))}
            </div>
        )
    }
    
    if (screenshots.length === 0) {
        return (
            <motion.div 
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-gray-400 text-xl font-semibold mb-2">
                    No Game Screenshots Found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                    The ML classifier hasn't detected any game screenshots yet. 
                    Try adding some game screenshots to your folder.
                </p>
            </motion.div>
        )
    }
    
    return (
        <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            layout
        >
            <AnimatePresence mode="popLayout">
                {screenshots.map((screenshot, index) => (
                    <ScreenshotCard
                        key={screenshot.id}
                        screenshot={screenshot}
                        onClick={() => onImageClick(screenshot)}
                        index={index}
                    />
                ))}
            </AnimatePresence>
        </motion.div>
    )
}

export default Gallery
