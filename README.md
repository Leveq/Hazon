# 🎬 Hazon

**A modern, open-source screenwriting application built with Electron and React.**

Hazon is a desktop application designed for screenwriters who want a clean, distraction-free environment to write screenplays in proper industry-standard format. It runs on Windows, macOS, and Linux.

![Hazon Screenshot](docs/screenshot.png)

---

## ✨ Features

### 📝 Professional Screenplay Editor
- **Industry-standard formatting** - Proper margins and spacing for scene headings, action, character names, dialogue, parentheticals, and transitions
- **Smart line type detection** - Automatically detects scene headings (INT./EXT.) and transitions (CUT TO:)
- **Intelligent flow** - Press Enter after a character name to automatically start dialogue
- **Tab cycling** - Cycle through line types with Tab key
- **Real-time page count** - Estimated pages and runtime based on industry standards (~1 page = 1 minute)

### 👥 Character Management
- Create and organize characters with roles (protagonist, antagonist, supporting, etc.)
- Track character descriptions, bios, and story arcs
- Color-code characters for easy identification
- Gender and age tracking

### 📍 Location Management
- Organize INT/EXT locations
- Add descriptions and notes for each location
- Automatically generates scene heading format preview

### 💾 Local-First Storage
- All data stored locally on your machine
- No account required, no cloud dependency
- JSON-based database for easy backup and portability
- Auto-save with debouncing (saves 500ms after you stop typing)

### 🌙 Dark Mode
- Full dark mode support
- Respects system preferences
- Easy toggle in the header

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Electron](https://www.electronjs.org/) | Cross-platform desktop app framework |
| [React 19](https://react.dev/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite](https://vitejs.dev/) | Build tool & dev server |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling |
| [LowDB](https://github.com/typicode/lowdb) | Local JSON database |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [React Router](https://reactrouter.com/) | Navigation |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/hazon.git
cd hazon

# Install dependencies
npm install

# Start development server
npm run dev
```

This will start both the Vite dev server and Electron in development mode with hot reloading.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build the React app for production |
| `npm run build-electron` | Compile Electron main/preload scripts |
| `npm run seed` | Populate database with sample screenplays |
| `npm run start` | Run the built Electron app |

---

## 📦 Building for Distribution

### Quick Build

```bash
# Install electron-builder
npm install -D electron-builder

# Build for your current platform
npm run build && npm run build-electron
npx electron-builder
```

### Platform-Specific Builds

```bash
# Windows
npx electron-builder --win

# macOS
npx electron-builder --mac

# Linux
npx electron-builder --linux
```

### electron-builder Configuration

Add this to your `package.json`:

```json
{
  "build": {
    "appId": "com.yourname.hazon",
    "productName": "Hazon",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "package.json"
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "public/icon.ico"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "public/icon.icns",
      "category": "public.app-category.productivity"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "public/icon.png",
      "category": "Office"
    }
  }
}
```

---

## 🔄 Auto-Updates (For Future Releases)

Electron apps can auto-update using **electron-updater**. Here's how to set it up:

### 1. Install electron-updater

```bash
npm install electron-updater
```

### 2. Configure Updates in main.ts

```typescript
import { autoUpdater } from 'electron-updater'

app.whenReady().then(() => {
  // Check for updates (don't do this in dev mode)
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify()
  }
})

// Handle update events
autoUpdater.on('update-available', () => {
  // Notify user that an update is available
})

autoUpdater.on('update-downloaded', () => {
  // Prompt user to restart and install
  autoUpdater.quitAndInstall()
})
```

### 3. Publish Updates via GitHub Releases

1. Create a GitHub repository for your project
2. Generate a [GitHub Personal Access Token](https://github.com/settings/tokens) with `repo` scope
3. Set the token as an environment variable: `GH_TOKEN=your_token`
4. Configure your package.json:

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "yourusername",
      "repo": "hazon"
    }
  }
}
```

5. Release a new version:

```bash
# Bump version
npm version patch  # or minor, major

# Build and publish
npx electron-builder --publish always
```

This creates a GitHub Release with installers. Users with the app installed will automatically receive updates!

### Update Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  User opens app │────▶│ Check GitHub    │────▶│ Download update │
│                 │     │ for new release │     │ in background   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ App restarts    │◀────│ User clicks     │◀────│ Prompt: "Update │
│ with new version│     │ "Restart"       │     │ ready!"         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 🔐 Code Signing (Recommended for Production)

To distribute your app without security warnings, you'll need to sign it:

### Windows
- Purchase a code signing certificate from a provider like DigiCert, Sectigo, or Comodo (~$70-$200/year)
- Or use [Azure SignTool](https://github.com/vcsjones/AzureSignTool) with Azure Key Vault

### macOS
- Requires Apple Developer Program membership ($99/year)
- Generate signing certificates in Xcode
- Notarize your app for Gatekeeper approval

### Linux
- No code signing required for most distributions

---

## 📁 Project Structure

```
hazon/
├── main.ts              # Electron main process
├── preload.ts           # Bridge between main & renderer
├── db.ts                # LowDB database operations
├── seedData.ts          # Sample data for development
├── src/
│   ├── main.tsx         # React entry point
│   ├── components/
│   │   ├── Header.tsx           # App header with theme toggle
│   │   ├── Layout.tsx           # Page layout wrapper
│   │   ├── ScriptEditor.tsx     # Core screenplay editor
│   │   ├── CharactersPanel.tsx  # Character CRUD panel
│   │   ├── LocationsPanel.tsx   # Location CRUD panel
│   │   ├── NewScriptModal.tsx   # Create script modal
│   │   └── Recents.tsx          # Recent scripts list
│   ├── pages/
│   │   ├── LandingPage.tsx      # Home page
│   │   └── ScriptPage.tsx       # Script editing page
│   ├── lib/
│   │   ├── pageCount.ts         # Page/runtime calculations
│   │   ├── useTheme.ts          # Dark mode hook
│   │   └── ...
│   └── types/
│       ├── models.ts            # TypeScript interfaces
│       └── global.d.ts          # Window API declarations
├── public/                      # Static assets
├── scripts/
│   └── build-electron.js        # Electron build script
└── package.json
```

---

## 🎯 Roadmap

- [ ] **Export to PDF** - Industry-standard screenplay PDF export
- [ ] **Export to Final Draft (.fdx)** - Compatibility with industry tools
- [ ] **Import from .fdx/.fountain** - Open existing screenplay files
- [ ] **Revision tracking** - Color-coded revision pages
- [ ] **Outline mode** - Bird's eye view of scene structure
- [ ] **Index cards** - Visual scene organization
- [ ] **Collaboration** - Optional cloud sync for teams
- [ ] **AI Assistant** - Character suggestions, dialogue help
- [ ] **Statistics** - Dialogue balance, scene length analysis
- [ ] **Print preview** - See exactly how pages will print

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run the app** to test: `npm run dev`
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Follow existing code style (TypeScript, React functional components)
- Use meaningful commit messages
- Add types for new features
- Test on multiple platforms if possible

### Reporting Issues

Found a bug? Please [open an issue](https://github.com/yourusername/hazon/issues) with:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- OS and app version

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- [Electron](https://www.electronjs.org/) for making cross-platform desktop apps possible
- [React](https://react.dev/) team for an amazing UI framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- The screenwriting community for feedback and inspiration

---

## 📬 Contact

Project Link: [https://github.com/leveq/hazon](https://github.com/leveq/hazon)

---

<p align="center">
  Made with ❤️ for screenwriters everywhere
</p>
