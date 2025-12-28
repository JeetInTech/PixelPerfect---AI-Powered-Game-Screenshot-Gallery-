function Footer() {
    return (
        <footer className="bg-gaming-card border-t border-white/5 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <p className="text-gray-500 text-sm">
                    © {new Date().getFullYear()} PixelPerfect Gallery. 
                    Powered by ML-based screenshot classification.
                </p>
                <p className="text-gray-600 text-xs mt-2">
                    Screenshots are automatically detected and classified from your local folder.
                </p>
            </div>
        </footer>
    )
}

export default Footer
