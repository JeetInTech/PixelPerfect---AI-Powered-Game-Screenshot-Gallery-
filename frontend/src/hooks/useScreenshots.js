import { useState, useEffect, useCallback } from 'react'

const API_URL = 'http://localhost:3001'

export function useScreenshots() {
    const [screenshots, setScreenshots] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [stats, setStats] = useState({
        totalScreenshots: 0,
        watchedFolder: '',
        cacheSize: 0
    })
    
    // Fetch screenshots
    const fetchScreenshots = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            
            const response = await fetch(`${API_URL}/api/screenshots`)
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data = await response.json()
            setScreenshots(data.screenshots)
            
        } catch (err) {
            console.error('Failed to fetch screenshots:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])
    
    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/stats`)
            
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err)
        }
    }, [])
    
    // Initial fetch
    useEffect(() => {
        fetchScreenshots()
        fetchStats()
    }, [fetchScreenshots, fetchStats])
    
    // Add new screenshot (from socket)
    const addScreenshot = useCallback((screenshot) => {
        setScreenshots(prev => {
            // Check if already exists
            if (prev.some(s => s.id === screenshot.id)) {
                return prev
            }
            // Add to beginning (newest first)
            return [screenshot, ...prev]
        })
        
        setStats(prev => ({
            ...prev,
            totalScreenshots: prev.totalScreenshots + 1
        }))
    }, [])
    
    // Remove screenshot (from socket)
    const removeScreenshot = useCallback((id) => {
        setScreenshots(prev => prev.filter(s => s.id !== id))
        
        setStats(prev => ({
            ...prev,
            totalScreenshots: Math.max(0, prev.totalScreenshots - 1)
        }))
    }, [])
    
    // Refresh all screenshots
    const refreshScreenshots = useCallback(async () => {
        await fetchScreenshots()
        await fetchStats()
    }, [fetchScreenshots, fetchStats])
    
    return {
        screenshots,
        loading,
        error,
        stats,
        addScreenshot,
        removeScreenshot,
        refreshScreenshots
    }
}
