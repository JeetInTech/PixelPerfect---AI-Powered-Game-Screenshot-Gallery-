"""
Game Screenshot Classifier using CLIP
Uses OpenAI's CLIP model to classify images based on natural language descriptions
"""

import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import os

class GameScreenshotClassifier:
    def __init__(self):
        self.model = None
        self.processor = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.initialized = False
        
        # Categories to classify against
        self.categories = [
            # Game categories (positive)
            "a screenshot from a video game",
            "a video game screenshot with gameplay",
            "a screenshot from a PC or console game",
            "an in-game screenshot showing game graphics",
            
            # Non-game categories (negative)  
            "a screenshot of code or programming IDE",
            "a screenshot of a text editor or terminal",
            "an anime or manga image",
            "a hentai or adult anime image",
            "a screenshot of a web browser",
            "a screenshot of a desktop or file explorer",
            "a photo of a real person or selfie",
            "a photograph of real life scenery",
            "a screenshot of social media",
            "a screenshot of a chat or messaging app",
            "a document or spreadsheet screenshot",
            "a meme or image with text overlay",
        ]
        
        # Game subcategories for classification
        self.game_subcategories = {
            "rpg": "a screenshot from an RPG or role-playing game with fantasy elements",
            "action": "a screenshot from an action or shooter game with combat",
            "scifi": "a screenshot from a sci-fi game with futuristic technology",
            "landscape": "a scenic landscape screenshot from an open world game",
            "racing": "a screenshot from a racing or driving game",
            "horror": "a screenshot from a horror or survival game",
            "sports": "a screenshot from a sports game",
            "strategy": "a screenshot from a strategy or simulation game",
        }
        
    def initialize(self):
        """Load the CLIP model"""
        print("🤖 Loading CLIP model (this may take a moment on first run)...")
        
        try:
            self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
            self.processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
            self.model.to(self.device)
            self.model.eval()
            self.initialized = True
            print(f"✅ CLIP model loaded successfully on {self.device.upper()}")
            
        except Exception as e:
            print(f"❌ Failed to load CLIP model: {e}")
            raise e
    
    def classify_image(self, image_path: str) -> dict:
        """
        Classify an image to determine if it's a game screenshot
        Returns classification results with confidence scores
        """
        if not self.initialized:
            raise RuntimeError("Classifier not initialized. Call initialize() first.")
        
        try:
            # Load and preprocess image
            image = Image.open(image_path).convert("RGB")
            
            # Get image dimensions for aspect ratio check
            width, height = image.size
            aspect_ratio = width / height
            
            # Process image with all categories
            inputs = self.processor(
                text=self.categories,
                images=image,
                return_tensors="pt",
                padding=True
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Get predictions
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits_per_image
                probs = logits.softmax(dim=1).cpu().numpy()[0]
            
            # Calculate game vs non-game scores
            # First 4 categories are game-related, rest are non-game
            game_score = float(sum(probs[:4]))
            non_game_score = float(sum(probs[4:]))
            
            # Get top predictions
            top_indices = probs.argsort()[::-1][:5]
            top_predictions = [
                {"label": self.categories[i], "confidence": float(probs[i])}
                for i in top_indices
            ]
            
            # Determine if it's a game screenshot
            # Be strict: game score must be significantly higher
            is_game_screenshot = game_score > non_game_score * 1.5 and game_score > 0.3
            
            # Additional checks for common false positives
            anime_score = float(probs[6]) + float(probs[7])  # anime + hentai
            code_score = float(probs[4]) + float(probs[5])   # code + terminal
            browser_score = float(probs[8])                   # browser
            
            # Reject if any non-game category is too high
            if anime_score > 0.25 or code_score > 0.25 or browser_score > 0.2:
                is_game_screenshot = False
            
            # Get game category if it's a game
            category = "gaming"
            detected_game = "Video Game"
            
            if is_game_screenshot:
                category, detected_game = self._get_game_category(image)
            
            confidence = game_score if is_game_screenshot else non_game_score
            
            return {
                "isGameScreenshot": is_game_screenshot,
                "confidence": min(0.99, max(0.1, confidence)),
                "gameScore": game_score,
                "nonGameScore": non_game_score,
                "animeScore": anime_score,
                "codeScore": code_score,
                "detectedGame": detected_game,
                "category": category,
                "topPredictions": top_predictions,
                "aspectRatio": aspect_ratio,
                "resolution": f"{width}x{height}"
            }
            
        except Exception as e:
            print(f"❌ Error classifying {image_path}: {e}")
            return self._fallback_classification(image_path)
    
    def _get_game_category(self, image: Image.Image) -> tuple:
        """Determine the game subcategory"""
        subcategory_texts = list(self.game_subcategories.values())
        subcategory_keys = list(self.game_subcategories.keys())
        
        inputs = self.processor(
            text=subcategory_texts,
            images=image,
            return_tensors="pt",
            padding=True
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            probs = outputs.logits_per_image.softmax(dim=1).cpu().numpy()[0]
        
        top_idx = probs.argmax()
        category = subcategory_keys[top_idx]
        
        # Map category to game type description
        game_types = {
            "rpg": "RPG Adventure",
            "action": "Action Game", 
            "scifi": "Sci-Fi Game",
            "landscape": "Open World",
            "racing": "Racing Game",
            "horror": "Horror Game",
            "sports": "Sports Game",
            "strategy": "Strategy Game"
        }
        
        return category, game_types.get(category, "Video Game")
    
    def _fallback_classification(self, image_path: str) -> dict:
        """Fallback when classification fails"""
        filename = os.path.basename(image_path).lower()
        
        # Check for known game patterns in filename
        game_patterns = [
            "valorant", "csgo", "cs2", "fortnite", "apex", "minecraft",
            "gta", "skyrim", "elden", "cyberpunk", "witcher", "halo",
            "destiny", "overwatch", "league", "dota", "steam", "nvidia"
        ]
        
        is_game = any(pattern in filename for pattern in game_patterns)
        
        return {
            "isGameScreenshot": is_game,
            "confidence": 0.5,
            "gameScore": 0.5 if is_game else 0.2,
            "nonGameScore": 0.2 if is_game else 0.5,
            "animeScore": 0.0,
            "codeScore": 0.0,
            "detectedGame": "Unknown Game",
            "category": "gaming",
            "topPredictions": [{"label": "Fallback classification", "confidence": 0.5}],
            "aspectRatio": 1.78,
            "resolution": "unknown"
        }


# Test the classifier
if __name__ == "__main__":
    import sys
    
    classifier = GameScreenshotClassifier()
    classifier.initialize()
    
    if len(sys.argv) > 1:
        test_path = sys.argv[1]
        print(f"\nTesting: {test_path}")
        result = classifier.classify_image(test_path)
        print(f"Is Game: {result['isGameScreenshot']}")
        print(f"Confidence: {result['confidence']:.2%}")
        print(f"Game Score: {result['gameScore']:.2%}")
        print(f"Non-Game Score: {result['nonGameScore']:.2%}")
        print(f"Anime Score: {result['animeScore']:.2%}")
        print(f"Category: {result['category']}")
        print(f"Top predictions:")
        for pred in result['topPredictions'][:3]:
            print(f"  - {pred['label']}: {pred['confidence']:.2%}")
