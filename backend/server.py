"""
Game Screenshot Gallery - Python Backend
Uses CLIP for accurate game screenshot classification
"""

import os
import json
import time
import hashlib
from pathlib import Path
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from classifier import GameScreenshotClassifier

# Configuration
CONFIG = {
    "SCREENSHOTS_FOLDER": r"C:\Users\Jeet\Pictures\Screenshots",
    "PORT": 3001,
    "SUPPORTED_EXTENSIONS": {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif"},
    "CACHE_FILE": "classification_cache.json"
}

# Initialize Flask
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])
socketio = SocketIO(app, cors_allowed_origins="*")

# Global state
classifier = None
classification_cache = {}
game_screenshots = []


def load_cache():
    """Load classification cache from file"""
    global classification_cache
    try:
        if os.path.exists(CONFIG["CACHE_FILE"]):
            with open(CONFIG["CACHE_FILE"], "r") as f:
                classification_cache = json.load(f)
            print(f"📁 Loaded {len(classification_cache)} cached classifications")
    except Exception as e:
        print(f"⚠️ Could not load cache: {e}")
        classification_cache = {}


def save_cache():
    """Save classification cache to file"""
    try:
        with open(CONFIG["CACHE_FILE"], "w") as f:
            json.dump(classification_cache, f, indent=2)
    except Exception as e:
        print(f"⚠️ Could not save cache: {e}")


def get_cache_key(filepath: str) -> str:
    """Generate cache key from file path and modification time"""
    stat = os.stat(filepath)
    return f"{os.path.basename(filepath)}_{stat.st_mtime_ns}"


def generate_title(filename: str) -> str:
    """Generate a clean title from filename"""
    import re
    
    # Remove extension
    title = os.path.splitext(filename)[0]
    
    # Replace underscores and hyphens
    title = re.sub(r"[_-]", " ", title)
    
    # Remove common prefixes
    title = re.sub(r"^(screenshot|screen|capture|ss)\s*", "", title, flags=re.IGNORECASE)
    
    # Remove timestamps
    title = re.sub(r"\d{4}[-_]\d{2}[-_]\d{2}[-_\s]\d{2}[-_]\d{2}[-_]\d{2}", "", title)
    title = re.sub(r"\(\d+\)", "", title)  # Remove (123) patterns
    title = re.sub(r"\d{10,}", "", title)  # Remove unix timestamps
    
    # Clean up
    title = re.sub(r"\s+", " ", title).strip()
    
    if len(title) < 3:
        title = "Game Screenshot"
    
    # Title case
    return title.title()


def classify_file(filepath: str) -> dict | None:
    """Classify a single file and return result"""
    global classification_cache
    
    filename = os.path.basename(filepath)
    cache_key = get_cache_key(filepath)
    
    # Check cache
    if cache_key in classification_cache:
        return classification_cache[cache_key]
    
    try:
        # Classify with ML
        classification = classifier.classify_image(filepath)
        
        stat = os.stat(filepath)
        
        result = {
            "id": f"img_{int(time.time() * 1000)}_{hashlib.md5(filename.encode()).hexdigest()[:8]}",
            "fileName": filename,
            "filePath": filepath,
            "url": f"/screenshots/{filename}",
            "title": generate_title(filename),
            "game": classification["detectedGame"],
            "category": classification["category"],
            "confidence": classification["confidence"],
            "isGameScreenshot": classification["isGameScreenshot"],
            "gameScore": classification["gameScore"],
            "nonGameScore": classification["nonGameScore"],
            "animeScore": classification.get("animeScore", 0),
            "codeScore": classification.get("codeScore", 0),
            "topPredictions": classification["topPredictions"],
            "dateAdded": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "fileSize": stat.st_size,
            "resolution": classification.get("resolution", "unknown")
        }
        
        # Cache the result
        classification_cache[cache_key] = result
        save_cache()
        
        return result
        
    except Exception as e:
        print(f"❌ Error classifying {filename}: {e}")
        return None


def scan_existing_files():
    """Scan folder for existing screenshots"""
    global game_screenshots
    
    print("📂 Scanning existing files...")
    
    folder = Path(CONFIG["SCREENSHOTS_FOLDER"])
    if not folder.exists():
        print(f"❌ Folder not found: {folder}")
        return
    
    image_files = [
        f for f in folder.iterdir()
        if f.suffix.lower() in CONFIG["SUPPORTED_EXTENSIONS"]
    ]
    
    print(f"Found {len(image_files)} images to process\n")
    
    game_screenshots = []
    processed = 0
    game_count = 0
    rejected = {"anime": 0, "code": 0, "other": 0}
    
    for filepath in image_files:
        result = classify_file(str(filepath))
        
        if result:
            if result["isGameScreenshot"]:
                game_screenshots.append(result)
                game_count += 1
            else:
                # Track rejection reasons
                if result.get("animeScore", 0) > 0.2:
                    rejected["anime"] += 1
                elif result.get("codeScore", 0) > 0.2:
                    rejected["code"] += 1
                else:
                    rejected["other"] += 1
        
        processed += 1
        if processed % 25 == 0 or processed == len(image_files):
            print(f"Progress: {processed}/{len(image_files)} | Games: {game_count} | Rejected - Anime: {rejected['anime']}, Code: {rejected['code']}, Other: {rejected['other']}")
    
    # Sort by date (newest first)
    game_screenshots.sort(key=lambda x: x["dateAdded"], reverse=True)
    
    print(f"\n✅ Scan complete!")
    print(f"   Game screenshots: {game_count}")
    print(f"   Rejected (Anime/Manga): {rejected['anime']}")
    print(f"   Rejected (Code/IDE): {rejected['code']}")
    print(f"   Rejected (Other): {rejected['other']}")
    print()


# Watchdog event handler
class ScreenshotHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return
        
        ext = os.path.splitext(event.src_path)[1].lower()
        if ext not in CONFIG["SUPPORTED_EXTENSIONS"]:
            return
        
        print(f"\n📷 New file detected: {os.path.basename(event.src_path)}")
        
        # Wait for file to finish writing
        time.sleep(2)
        
        result = classify_file(event.src_path)
        
        if result:
            if result["isGameScreenshot"]:
                print(f"✅ GAME screenshot: {result['game']} ({result['confidence']:.1%} confidence)")
                game_screenshots.insert(0, result)
                socketio.emit("newScreenshot", result)
            else:
                reasons = []
                if result.get("animeScore", 0) > 0.2:
                    reasons.append(f"anime={result['animeScore']:.1%}")
                if result.get("codeScore", 0) > 0.2:
                    reasons.append(f"code={result['codeScore']:.1%}")
                print(f"❌ Not a game ({', '.join(reasons) or 'low game score'}) - Skipping")
    
    def on_deleted(self, event):
        if event.is_directory:
            return
        
        filename = os.path.basename(event.src_path)
        print(f"🗑️ File removed: {filename}")
        
        # Find and remove from list
        global game_screenshots
        for i, s in enumerate(game_screenshots):
            if s["fileName"] == filename:
                removed = game_screenshots.pop(i)
                socketio.emit("removeScreenshot", {"id": removed["id"]})
                break


# API Routes
@app.route("/screenshots/<path:filename>")
def serve_screenshot(filename):
    """Serve screenshot files"""
    return send_from_directory(CONFIG["SCREENSHOTS_FOLDER"], filename)


@app.route("/api/screenshots")
def get_screenshots():
    """Get all game screenshots"""
    category = request.args.get("category", "all")
    
    results = game_screenshots
    if category != "all":
        results = [s for s in game_screenshots if s["category"] == category]
    
    return jsonify({
        "total": len(results),
        "screenshots": results
    })


@app.route("/api/categories")
def get_categories():
    """Get available categories"""
    categories = list(set(s["category"] for s in game_screenshots))
    return jsonify(categories)


@app.route("/api/stats")
def get_stats():
    """Get server stats"""
    return jsonify({
        "totalScreenshots": len(game_screenshots),
        "watchedFolder": CONFIG["SCREENSHOTS_FOLDER"],
        "cacheSize": len(classification_cache)
    })


@app.route("/api/rescan", methods=["POST"])
def rescan():
    """Force rescan of screenshots folder"""
    global game_screenshots
    print("\n🔄 Manual rescan triggered...")
    game_screenshots = []
    scan_existing_files()
    socketio.emit("refresh")
    return jsonify({"message": "Rescan complete", "total": len(game_screenshots)})


@app.route("/api/clear-cache", methods=["POST"])
def clear_cache():
    """Clear cache and rescan"""
    global classification_cache, game_screenshots
    print("\n🗑️ Clearing classification cache...")
    classification_cache = {}
    save_cache()
    game_screenshots = []
    scan_existing_files()
    socketio.emit("refresh")
    return jsonify({"message": "Cache cleared and rescanned", "total": len(game_screenshots)})


# Socket.IO events
@socketio.on("connect")
def handle_connect():
    print(f"🔌 Client connected")


@socketio.on("disconnect")
def handle_disconnect():
    print(f"🔌 Client disconnected")


def main():
    global classifier
    
    print("""
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🎮  GAME SCREENSHOT GALLERY SERVER (Python)  🎮          ║
║                                                            ║
║   Using CLIP for accurate ML classification                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    """)
    
    # Load cache
    load_cache()
    
    # Initialize classifier
    classifier = GameScreenshotClassifier()
    classifier.initialize()
    
    # Scan existing files
    scan_existing_files()
    
    # Start file watcher
    observer = Observer()
    observer.schedule(
        ScreenshotHandler(),
        CONFIG["SCREENSHOTS_FOLDER"],
        recursive=False
    )
    observer.start()
    print(f"👀 Watching folder: {CONFIG['SCREENSHOTS_FOLDER']}\n")
    
    # Start server
    print(f"🚀 Server running at http://localhost:{CONFIG['PORT']}\n")
    socketio.run(app, host="0.0.0.0", port=CONFIG["PORT"], debug=False)


if __name__ == "__main__":
    main()
