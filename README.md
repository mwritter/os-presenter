<p align="center">
  <img src="public/osp_logo.svg" alt="OS Presenter Logo" width="240"/>
</p>

<h1 align="center">OS Presenter</h1>

<p align="center">
A powerful, cross-platform presentation software designed for live events, churches, conferences, and stage productions.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0--alpha-blue" alt="Version" />
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey" alt="Platform" />
  <img src="https://img.shields.io/github/license/mwritter/os-presenter" alt="License" />
  <img src="https://img.shields.io/badge/status-pre--alpha-orange" alt="Status" />
</p>

---

> **⚠️ Early Development**: This project is currently in early-stage development working towards an Alpha release. Features are actively being built and refined. Expect breaking changes and incomplete functionality.

## Overview

Presenter is a desktop application that enables you to create, manage, and display professional presentations with rich multimedia content. With an intuitive interface and robust feature set, it's designed to handle the demands of live production environments.

### Key Features

- **🎨 Rich Slide Editor**: Create and edit slides with text, images, videos, and shapes
- **📚 Media Library**: Organize and manage your media assets in one place
- **🎭 Live Show Mode**: Present with confidence using a dedicated show view
- **🎯 Flexible Object Editing**: Position, resize, and style objects with precision
- **🎨 Advanced Typography**: Access system fonts with support for font variants and styling
- **🖼️ Multiple Object Types**: Support for text, images, videos, and custom shapes
- **💾 Persistent Storage**: Automatically save your work with local storage
- **⚡ Native Performance**: Built with Rust backend for speed and reliability
- **🖥️ Cross-Platform**: Works on macOS, Windows, and Linux

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **React Router** for navigation
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Shadcn UI** for accessible components
- **Motion** for animations
- **React Moveable** for object manipulation

### Backend
- **Tauri 2.0** - Native desktop framework with Rust
- **Custom Plugins** for system integration (fonts, etc.)

## Installation

**Releases are not yet available.** Once we reach our Alpha milestone, pre-built installers will be available for download for macOS, Windows, and Linux.

For now, you can build from source if you'd like to try the software or contribute to development. See the [Building from Source](#building-from-source) section below.

## Building from Source

### Prerequisites

Before building, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **pnpm**
- **Rust** (latest stable version)
- **Tauri CLI** dependencies for your platform ([see Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites))

### Setup

1. Clone the repository:
```bash
git clone git@github.com:mwritter/os-presenter.git
cd os-presenter
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run tauri dev
```

### Creating a Production Build

To create a production build:

```bash
npm run tauri build
```

This will create platform-specific installers in `src-tauri/target/release/bundle/`.

## Development

### Project Structure

```
presenter-final/
├── src/                      # React frontend source
│   ├── components/          # React components
│   │   ├── feature/        # Feature-specific components (slides, color picker)
│   │   ├── presenter/      # Main presenter UI components
│   │   └── ui/            # Reusable UI components
│   ├── stores/            # Zustand state stores
│   ├── services/          # Business logic and services
│   └── hooks/             # Custom React hooks
├── src-tauri/              # Rust backend
│   ├── src/               # Rust source code
│   └── plugins/           # Custom Tauri plugins
└── public/                # Static assets
```

### Available Scripts for Development

- `npm run dev` - Start React development server only
- `npm run tauri dev` - Start full application in development mode (recommended)
- `npm run build` - Build the React app for production
- `npm run tauri build` - Build the complete application with installers
- `npm run storybook` - Run Storybook for component development and testing

### Storybook

Component documentation and testing is available through Storybook:

```bash
npm run storybook
```

Visit `http://localhost:6006` to browse components.

## Features in Detail

### Slide Editor
Create and edit presentation slides with a powerful WYSIWYG editor. Add text, images, videos, and shapes with precise control over positioning, sizing, and styling.

### Media Library
Manage all your presentation assets in a centralized library. Import media files and quickly add them to your slides.

### Show View
Present your slides with a dedicated show interface designed for live production. Navigate through slides smoothly and manage your presentation flow.

### Object Editing
Each slide object (text, image, video, shape) can be individually edited with:
- Position and size controls
- Rotation and transformation
- Layer ordering (bring forward/send backward)
- Color and style customization
- Font and typography settings (for text)

### Custom Shapes
Built-in shape library including:
- Rectangles
- Circles/Ellipses
- Triangles
- And more...

## Plugin System

Presenter uses custom Tauri plugins to extend functionality:

- **font-variants**: System font integration with support for font families and variants

## Development Status

**Current Stage**: Pre-Alpha → Alpha

We are actively working towards our first Alpha release. Current focus areas:

- ✅ Core slide editing functionality
- ✅ Media library management
- ✅ Basic object manipulation (text, images, shapes, videos)
- 🚧 Show/presentation mode improvements
- 🚧 Performance optimizations
- 🚧 Additional output options
- 📋 Multi-screen support
- 📋 Advanced transitions and effects
- 📋 Template / Theme system

Legend: ✅ Implemented | 🚧 In Progress | 📋 Planned

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Guidelines

1. Follow TypeScript best practices
2. Use existing UI components from `src/components/ui/`
3. Maintain consistent code style
4. Test your changes thoroughly

## Acknowledgments

Built with [Tauri](https://tauri.app/), [React](https://react.dev/), and other amazing open-source technologies.

---

**Note**: This project is in early-stage development working towards an Alpha release. Features, APIs, and file formats may change significantly. Not recommended for production use yet.
