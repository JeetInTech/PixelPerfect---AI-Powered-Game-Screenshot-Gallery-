import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff } from 'lucide-react'

function ConnectionStatus({ connected }) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-4 left-4 z-50"
            >
                <div className={`
                    flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium
                    backdrop-blur-md border transition-colors duration-300
                    ${connected 
                        ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }
                `}>
                    {connected ? (
                        <>
                            <Wifi className="w-3.5 h-3.5" />
                            <span>Live</span>
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full live-indicator" />
                        </>
                    ) : (
                        <>
                            <WifiOff className="w-3.5 h-3.5" />
                            <span>Disconnected</span>
                        </>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

export default ConnectionStatus
