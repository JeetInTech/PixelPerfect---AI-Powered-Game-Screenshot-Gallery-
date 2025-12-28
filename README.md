# 🎮 PixelPerfect - AI-Powered Game Screenshot Gallery

A dynamic React-based gallery that automatically detects and displays **only video game screenshots** from your local folder using **OpenAI's CLIP model** for ML classification.

It intelligently filters out:
- ❌ Anime / Manga / 10+ images
- ❌ Code / IDE screenshots
- ❌ Browser / Desktop screenshots
- ❌ Photos of real people
- ❌ Documents and memes

![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![CLIP](https://img.shields.io/badge/AI-CLIP-green?logo=openai)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **CLIP-Powered Classification** | Uses OpenAI's CLIP model for accurate image understanding |
| 🎯 **Smart Filtering** | Rejects anime, code, browser screenshots automatically |
| ⚡ **Real-time Updates** | WebSocket connection for instant gallery updates |
| 👀 **Folder Watching** | Monitors your Screenshots folder continuously |
| 🏷️ **Auto-Categorization** | RPG, Action, Sci-Fi, Landscape, Racing, Horror, etc. |
| 🎨 **Beautiful UI** | Modern React frontend with Tailwind CSS & Framer Motion |
| 💾 **Caching** | Saves classification results to avoid re-processing |
| 🖼️ **Lightbox Viewer** | Full-screen image viewer with keyboard navigation |

---

## 🏗️ Architecture

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│                 │◄──────────────────►│                 │
│  React Frontend │                    │  Python Backend │
│   (Vite + TW)   │◄───── REST API ───►│  (Flask + CLIP) │
│   Port: 5173    │                    │   Port: 3001    │
└─────────────────┘                    └────────┬────────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │  Screenshots Folder   │
                                    │  (File System Watch)  │
                                    └───────────────────────┘
```

---

## 📁 Project Structure

```
PixelPerfect/
├── backend/
│   ├── venv/                 # Python virtual environment
│   ├── server.py             # Flask + Socket.IO server
│   ├── classifier.py         # CLIP-based image classifier
│   ├── requirements.txt      # Python dependencies
│   └── classification_cache.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── components/       # UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Gallery.jsx
│   │   │   ├── ScreenshotCard.jsx
│   │   │   ├── Lightbox.jsx
│   │   │   ├── LoadingCard.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ConnectionStatus.jsx
│   │   └── hooks/
│   │       └── useScreenshots.js
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **~1GB disk space** (for CLIP model download)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/JeetInTech/PixelPerfect---AI-Powered-Game-Screenshot-Gallery-.git
cd PixelPerfect---AI-Powered-Game-Screenshot-Gallery-
```

### 2️⃣ Setup Backend (Python)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate venv (Windows)
.\venv\Scripts\activate

# Activate venv (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3️⃣ Configure Screenshots Folder

Edit `backend/server.py` and update the path:

```python
CONFIG = {
    "SCREENSHOTS_FOLDER": r"C:\Users\YourName\Pictures\Screenshots",
    # ...
}
```

### 4️⃣ Setup Frontend (React)

```bash
cd frontend
npm install
```

### 5️⃣ Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
.\venv\Scripts\activate  # Windows
python server.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6️⃣ Open in Browser

Navigate to **http://localhost:5173** 🎉

---

## 🤖 How CLIP Classification Works

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Screenshot  │────►│   CLIP Model    │────►│  Classification  │
│    Image     │     │  (ViT-B/32)     │     │     Results      │
└──────────────┘     └─────────────────┘     └──────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   Compare with text prompts:  │
              │                               │
              │ ✅ "a video game screenshot"  │
              │ ❌ "anime or manga image"     │
              │ ❌ "screenshot of code/IDE"   │
              │ ❌ "a photo of a real person" │
              │ ❌ "a web browser screenshot" │
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   Decision Logic:             │
              │                               │
              │ • gameScore > nonGameScore    │
              │ • animeScore < 25%            │
              │ • codeScore < 25%             │
              │ • Confidence threshold met    │
              └───────────────────────────────┘
```

### Classification Categories

| Category | Description |
|----------|-------------|
| `rpg` | Fantasy RPG, role-playing games |
| `action` | Shooters, combat games |
| `scifi` | Futuristic, space games |
| `landscape` | Open world scenic shots |
| `racing` | Driving and racing games |
| `horror` | Horror and survival games |
| `sports` | Sports simulation games |
| `strategy` | Strategy and simulation games |

---

## 📡 API Reference

### REST Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/screenshots` | GET | Get all classified game screenshots |
| `/api/screenshots?category=rpg` | GET | Filter by category |
| `/api/categories` | GET | List available categories |
| `/api/stats` | GET | Server statistics |
| `/api/rescan` | POST | Force rescan of folder |
| `/api/clear-cache` | POST | Clear cache and rescan |

### WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `newScreenshot` | Server → Client | Screenshot object |
| `removeScreenshot` | Server → Client | `{ id: string }` |
| `refresh` | Server → Client | - |

---

## ⚙️ Configuration

### Supported Image Formats

- PNG, JPG, JPEG, WebP, BMP, GIF

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HF_HUB_DISABLE_SYMLINKS_WARNING` | Disable HuggingFace warnings | - |

### Classification Thresholds

Edit `backend/classifier.py` to adjust sensitivity:

```python
# In analyzeResults method
is_game_screenshot = game_score > non_game_score * 1.5 and game_score > 0.3

# Rejection thresholds
if anime_score > 0.25:  # Increase to be more lenient
    is_game_screenshot = False
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection Error" in frontend | Ensure backend is running on port 3001 |
| No screenshots showing | Check the folder path in `server.py` |
| CLIP model download fails | Check internet connection, retry |
| Slow classification | First run downloads 605MB model, subsequent runs use cache |
| Too many false positives | Increase threshold in `classifier.py` |
| Too many false negatives | Decrease threshold in `classifier.py` |

---

## 🛠️ Tech Stack

### Backend
- **Python 3.11** - Runtime
- **Flask** - Web framework
- **Flask-SocketIO** - WebSocket support
- **PyTorch** - ML framework
- **Transformers** - CLIP model
- **Watchdog** - File system monitoring
- **Pillow** - Image processing

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Socket.IO Client** - Real-time updates
- **Lucide React** - Icons

---

## 📝 License

MIT License - Feel free to use and modify!

---

## 🙏 Acknowledgments

- [OpenAI CLIP](https://github.com/openai/CLIP) - Image classification model
- [Hugging Face](https://huggingface.co/) - Model hosting
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

Made with 💜 by [JeetInTech](https://github.com/JeetInTech)
