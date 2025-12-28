import { Gamepad2, Github, Twitter, RefreshCw, Folder } from 'lucide-react'

function Navbar({ stats, onRefresh }) {
    return (
        <nav className="sticky top-0 z-40 bg-gaming-dark/90 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <Gamepad2 className="text-accent-primary w-7 h-7" />
                        <span className="text-xl font-extrabold tracking-tight">
                            <span className="gradient-text">PIXEL</span>
                            <span className="text-white">PERFECT</span>
                        </span>
                    </div>
                    
                    {/* Center - Folder info */}
                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                        <Folder className="w-4 h-4" />
                        <span className="truncate max-w-xs" title={stats?.watchedFolder}>
                            {stats?.watchedFolder ? 
                                `...${stats.watchedFolder.slice(-30)}` : 
                                'Connecting...'
                            }
                        </span>
                    </div>
                    
                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        {/* Refresh button */}
                        <button 
                            onClick={onRefresh}
                            className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-lg"
                            title="Refresh gallery"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        
                        {/* Social links */}
                        <div className="hidden sm:flex gap-2">
                            <a href="#" className="p-2 text-gray-400 hover:text-white transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 text-gray-400 hover:text-white transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
