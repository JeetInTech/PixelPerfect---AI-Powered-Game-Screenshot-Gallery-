import { motion } from 'framer-motion'

function Hero({ categories, selectedCategory, onCategoryChange, totalCount }) {
    const categoryLabels = {
        'all': 'All Games',
        'gaming': 'Gaming',
        'rpg': 'RPG',
        'action': 'Action',
        'scifi': 'Sci-Fi',
        'landscape': 'Landscape',
        'racing': 'Racing',
        'fantasy': 'Fantasy',
        'horror': 'Horror',
        'sports': 'Sports'
    }
    
    return (
        <header className="relative py-16 md:py-20 px-4 text-center overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent-primary/20 rounded-full blur-[100px] -z-10" />
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    Curated Virtual <br className="hidden md:block" /> Photography
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-2">
                    Automatically curated game screenshots from your local folder.
                </p>
                <p className="text-accent-primary font-semibold mb-8">
                    {totalCount} screenshots detected
                </p>
            </motion.div>
            
            {/* Filter Buttons */}
            <motion.div 
                className="flex flex-wrap justify-center gap-2 md:gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        className={`
                            px-5 py-2 rounded-full border text-sm font-semibold
                            transition-all duration-200 backdrop-blur-sm
                            ${selectedCategory === category
                                ? 'bg-white/10 border-accent-primary/50 text-white shadow-lg shadow-accent-primary/20'
                                : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                            }
                        `}
                    >
                        {categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                ))}
            </motion.div>
        </header>
    )
}

export default Hero
