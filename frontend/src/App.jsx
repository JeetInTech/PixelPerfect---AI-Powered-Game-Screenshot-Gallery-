import { useState, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Gallery from './components/Gallery'
import Lightbox from './components/Lightbox'
import Footer from './components/Footer'
import ConnectionStatus from './components/ConnectionStatus'
import { useScreenshots } from './hooks/useScreenshots'

const SOCKET_URL = 'http://localhost:3001'

function App() {
    const [socket, setSocket] = useState(null)
    const [connected, setConnected] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [lightboxImage, setLightboxImage] = useState(null)
    const [lightboxIndex, setLightboxIndex] = useState(0)
    
    const { 
        screenshots, 
        loading, 
        error, 
        stats,
        addScreenshot, 
        removeScreenshot, 
        refreshScreenshots 
    } = useScreenshots()
    
    // Filter screenshots by category
    const filteredScreenshots = selectedCategory === 'all' 
        ? screenshots 
        : screenshots.filter(s => s.category === selectedCategory)
    
    // Get unique categories
    const categories = ['all', ...new Set(screenshots.map(s => s.category))]
    
    // Socket connection
    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        })
        
        newSocket.on('connect', () => {
            console.log('🔌 Connected to server')
            setConnected(true)
        })
        
        newSocket.on('disconnect', () => {
            console.log('🔌 Disconnected from server')
            setConnected(false)
        })
        
        newSocket.on('newScreenshot', (screenshot) => {
            console.log('📷 New screenshot received:', screenshot.title)
            addScreenshot(screenshot)
        })
        
        newSocket.on('removeScreenshot', ({ id }) => {
            console.log('🗑️ Screenshot removed:', id)
            removeScreenshot(id)
        })
        
        newSocket.on('refresh', () => {
            console.log('🔄 Refresh signal received')
            refreshScreenshots()
        })
        
        setSocket(newSocket)
        
        return () => {
            newSocket.close()
        }
    }, [])
    
    // Open lightbox
    const openLightbox = useCallback((screenshot) => {
        const index = filteredScreenshots.findIndex(s => s.id === screenshot.id)
        setLightboxIndex(index)
        setLightboxImage(screenshot)
    }, [filteredScreenshots])
    
    // Close lightbox
    const closeLightbox = useCallback(() => {
        setLightboxImage(null)
    }, [])
    
    // Navigate lightbox
    const navigateLightbox = useCallback((direction) => {
        let newIndex = lightboxIndex + direction
        
        if (newIndex >= filteredScreenshots.length) newIndex = 0
        if (newIndex < 0) newIndex = filteredScreenshots.length - 1
        
        setLightboxIndex(newIndex)
        setLightboxImage(filteredScreenshots[newIndex])
    }, [lightboxIndex, filteredScreenshots])
    
    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!lightboxImage) return
            
            if (e.key === 'Escape') closeLightbox()
            if (e.key === 'ArrowRight') navigateLightbox(1)
            if (e.key === 'ArrowLeft') navigateLightbox(-1)
        }
        
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [lightboxImage, closeLightbox, navigateLightbox])
    
    return (
        <div className="min-h-screen bg-gaming-dark text-gray-100 flex flex-col">
            <Navbar 
                stats={stats} 
                onRefresh={refreshScreenshots}
            />
            
            <Hero 
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                totalCount={screenshots.length}
            />
            
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
                <Gallery 
                    screenshots={filteredScreenshots}
                    loading={loading}
                    error={error}
                    onImageClick={openLightbox}
                />
            </main>
            
            <Footer />
            
            <ConnectionStatus connected={connected} />
            
            {lightboxImage && (
                <Lightbox 
                    screenshot={lightboxImage}
                    onClose={closeLightbox}
                    onNext={() => navigateLightbox(1)}
                    onPrev={() => navigateLightbox(-1)}
                    currentIndex={lightboxIndex}
                    totalCount={filteredScreenshots.length}
                />
            )}
        </div>
    )
}

export default App
