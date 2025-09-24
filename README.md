# DigiDuo

A fast-paced number matching puzzle game built with React Native and Expo. Match pairs of numbers that are either identical or sum to 10 to clear the grid before time runs out!

## 🎮 Game Rules

- **Match Condition**: Numbers match if they are equal OR sum to 10
  - Examples: `5+5=10`, `3+7=10`, `9+1=10`, `4+4=8` (matches), `2+6=8` (no match)
- **Objective**: Clear all numbered cells from the grid by making valid matches
- **Time Limit**: Complete each level within 120 seconds
- **Power-ups**: Use "Add Row" charges (limited per level) to get more numbers when stuck
- **Scoring**:
  - Base score: (number1 + number2) × 10
  - Streak multiplier: Up to 5x for consecutive quick matches
  - Quick match bonus: Make matches within 3 seconds for streak multiplier

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd DigiDuo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Run on different platforms**

   ```bash
   # iOS (requires Xcode on macOS)
   npm run ios

   # Android (requires Android Studio)
   npm run android

   # Web
   npm run web
   ```

### Development Setup

- **TypeScript**: Fully typed codebase with strict mode enabled
- **Expo SDK**: Version ~54.0.10
- **React Native**: Version 0.81.4
- **Audio**: expo-av for cross-platform sound effects and music
- **Graphics**: expo-linear-gradient and react-native-svg for enhanced UI

## 📋 Level Structure

### Level Progression

| Level | Grid Size | Start Rows | Number Range | Add Row Charges | Time Limit |
| ----- | --------- | ---------- | ------------ | --------------- | ---------- |
| 1     | 6×8       | 3          | 1-9          | 3               | 120s       |
| 2     | 7×9       | 4          | 1-9          | 3               | 120s       |
| 3     | 8×10      | 4          | 1-9          | 2               | 120s       |

### Level Configuration

- **Grid Size**: Increases with each level for added complexity
- **Start Rows**: Number of rows filled with numbers at level start
- **Number Range**: All levels use numbers 1-9
- **Add Row Charges**: Decreases in later levels to increase difficulty
- **Guaranteed Pairs**: Each level ensures at least 3 solvable pairs at start

## 🏗️ Architecture

### Project Structure

```
DigiDuo/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AnimatedBackground.tsx    # Particle animation system
│   │   ├── CircularTimer.tsx         # SVG-based countdown timer
│   │   ├── GameOverlay.tsx           # Victory/defeat modal
│   │   ├── Grid.tsx                  # Game grid container
│   │   ├── GridCell.tsx              # Individual cell component
│   │   └── SparklesBackground.tsx    # Background sparkle effects
│   ├── hooks/              # Custom React hooks
│   │   └── useSound.ts              # Audio management system
│   ├── levels/             # Level configuration
│   │   └── config.ts                # Level definitions and settings
│   ├── logic/              # Game logic
│   │   └── game.ts                  # Core game mechanics
│   ├── screens/            # Main screens
│   │   └── GameScreen.tsx           # Primary game interface
│   └── types/              # TypeScript definitions
│       └── index.ts                 # Shared type definitions
├── assets/                 # Static assets
│   ├── wavs/               # Audio files
│   └── images/             # App icons and splash screens
├── App.tsx                 # Root component
└── index.ts               # App entry point
```

### Core Components

#### Game Logic (`src/logic/game.ts`)

- **Grid Generation**: Creates randomized grids with guaranteed solvable pairs
- **Match Validation**: Implements the core matching rules (equal or sum to 10)
- **Pair Detection**: Finds all valid pairs in current grid state
- **Row Addition**: Adds new rows with guaranteed matches when power-up used
- **Win Conditions**: Detects level completion and game over states

#### Audio System (`src/hooks/useSound.ts`)

- **Cross-Platform**: Web Audio API for web, Expo AV for mobile
- **Rich Sound Effects**: Procedurally generated audio for web platform
- **Music Management**: Background music with seamless transitions
- **Volume Controls**: Master volume and mute functionality
- **Fallback System**: Graceful degradation when audio fails

#### State Management

- **React Hooks**: useState and useEffect for component state
- **Game State**: Centralized in GameScreen component
- **Animation State**: Managed with React Native Animated API
- **Audio State**: Isolated in useSound hook

### Performance Optimizations

#### Mobile Performance

- **Reduced Particle Counts**: 35 particles on mobile vs 90 on web
- **Simplified Animations**: Native driver usage where possible
- **Memory Management**: Proper cleanup of timers and audio resources
- **Platform Detection**: Different rendering strategies per platform

#### Web Performance

- **Web Audio API**: Rich, procedurally generated sound effects
- **Advanced Animations**: Complex particle systems and effects
- **Responsive Design**: Adapts to different screen sizes
- **Caching**: Audio context reuse and optimization

### Animation System

#### Background Effects

- **Particle Animation**: Moving sparkles with physics simulation
- **Energy Flows**: Dynamic particle streams (web only)
- **Constellation Layer**: Breathing star field effect
- **Gradient Transitions**: Smooth color transitions

#### Game Feedback

- **Cell Animations**: Scale, glow, and color transitions
- **Score Popups**: Animated score increases with scaling
- **Streak Effects**: Visual feedback for consecutive matches
- **Timer Animation**: Circular progress with color changes

## 🎨 Visual Design

### Color Scheme

- **Background**: Deep space gradient (`#000000` to `#2A1B3D`)
- **UI Elements**: Glassmorphism with subtle transparency
- **Cell Colors**: Value-based color coding:
  - Low values (1-2): Gray tones
  - Medium values (3-4): Green tones
  - Higher values (5-6): Blue tones
  - High values (7-8): Purple tones
  - Maximum values (9): Gold tones

### Typography

- **Headers**: Bold, high-contrast white text
- **UI Text**: Medium weight with good readability
- **Numbers**: Extra bold for clear visibility in cells

## 🔧 Development Notes

### Platform Differences

- **Web**: Enhanced with Web Audio API and advanced particle effects
- **Mobile**: Optimized for performance with simplified animations
- **iOS**: Native driver animations, proper audio session handling
- **Android**: Edge-to-edge design, predictive back gesture disabled

### Build Configuration

- **TypeScript**: Strict mode enabled for type safety
- **Expo**: New architecture enabled for React Native 0.81+
- **EAS Build**: Configured for development, preview, and production builds

### Audio Implementation

- **File Formats**: WAV files for compatibility
- **Web Fallback**: Procedural audio generation when files fail
- **Mobile Fallback**: Silent operation with error logging
- **Volume Mixing**: Proper audio session management

## 📱 Supported Platforms

- **iOS**: iPhone and iPad (iOS 13+)
- **Android**: Android 7+ (API level 24+)
- **Web**: Modern browsers with Web Audio API support

## 🎵 Audio Credits

Custom sound effects and music included for:

- Cell selection and matching
- Level completion and game over
- UI interactions and power-ups
- Background music with seamless looping

---
