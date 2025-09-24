# DigiDuo

<div align="center">
  <img src="./assets/logo.png" alt="DigiDuo Logo" width="120" height="120" />
  <h3>A Modern Number-Matching Puzzle Game</h3>
  <p>Match pairs of numbers that are equal or sum to 10</p>
</div>

---

## 🎮 Game Overview

DigiDuo is an engaging puzzle game where players match pairs of numbers in a grid. Numbers can be matched if they are **equal** or if they **sum to 10**. The goal is to clear all numbered cells from the grid before time runs out.

### 🎯 Game Rules

1. **Matching Logic**: Match two numbers if:

   - They are equal (5 + 5)
   - They sum to 10 (3 + 7, 2 + 8, 1 + 9)

2. **Objective**: Clear all numbered cells from the grid

3. **Time Limit**: Each level has a countdown timer

4. **Add Rows**: Limited ability to add new rows when stuck

5. **Scoring**:
   - Base score: (num1 + num2) × 10
   - Streak multiplier: Up to 5x for quick consecutive matches
   - Bonus for speed and efficiency

---

## 🏗️ Architecture

### Project Structure

```
DigiDuo/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AnimatedBackground.tsx
│   │   ├── CircularTimer.tsx
│   │   ├── GameOverlay.tsx
│   │   ├── Grid.tsx
│   │   ├── GridCell.tsx
│   │   └── SparklesBackground.tsx
│   ├── levels/              # Level configuration
│   │   └── config.ts
│   ├── logic/               # Game logic and utilities
│   │   └── game.ts
│   ├── screens/             # Main screen components
│   │   └── GameScreen.tsx
│   └── types/               # TypeScript type definitions
│       └── index.ts
├── assets/                  # Static assets
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash-icon.png
│   ├── favicon.png
│   └── logo.png
├── android/                 # Android-specific files
├── App.tsx                  # Main app component
├── index.ts                 # App entry point
└── package.json
```

### Component Architecture

#### Core Components

- **GameScreen**: Main game interface with state management
- **Grid**: Renders the game grid and handles cell interactions
- **GridCell**: Individual cell component with animations and styling
- **GameOverlay**: Game over/victory screen with restart options
- **CircularTimer**: Animated countdown timer

#### Background Effects

- **AnimatedBackground**: Particle system with energy flows (web-optimized)
- **SparklesBackground**: Simple sparkle animation system

### State Management

The game uses React's built-in state management with the following key states:

```typescript
interface GameState {
  grid: Grid; // Current grid configuration
  selectedCells: GridCell[]; // Currently selected cells
  level: LevelConfig; // Current level settings
  timeRemaining: number; // Countdown timer
  pairsFound: number; // Number of successful matches
  addRowsUsed: number; // Add-row powerups used
  isGameOver: boolean; // Game completion state
  isWon: boolean; // Victory condition
}
```

---

## 📱 Level Structure

The game features 3 progressively challenging levels:

### Level 1 - Beginner

- **Grid**: 6×8 (48 cells)
- **Starting Rows**: 3 filled rows
- **Number Range**: 1-9
- **Add Rows**: 3 available
- **Time Limit**: 2 minutes

### Level 2 - Intermediate

- **Grid**: 7×9 (63 cells)
- **Starting Rows**: 4 filled rows
- **Number Range**: 1-9
- **Add Rows**: 3 available
- **Time Limit**: 2 minutes

### Level 3 - Advanced

- **Grid**: 8×10 (80 cells)
- **Starting Rows**: 4 filled rows
- **Number Range**: 1-9
- **Add Rows**: 2 available
- **Time Limit**: 2 minutes

### Level Configuration

```typescript
interface LevelConfig {
  id: number;
  name: string;
  gridRows: number; // Total grid height
  gridCols: number; // Total grid width
  startFilledRows: number; // Initial filled rows
  numberRange: [number, number]; // Min/max values
  addRowLimit: number; // Available add-row powerups
  timeLimit: number; // Time limit in seconds
}
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g @expo/cli`

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd DigiDuo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm start
   ```

4. **Run on specific platforms**

   ```bash
   # Web browser
   npm run web

   # iOS simulator (macOS only)
   npm run ios

   # Android emulator
   npm run android
   ```

### Platform-Specific Setup

#### iOS Development

- **Xcode** (macOS required)
- **iOS Simulator** or physical device
- Apple Developer account (for device testing)

#### Android Development

- **Android Studio**
- **Android SDK** and emulator
- Enable developer mode on physical device

#### Web Development

- Modern web browser
- No additional setup required

---

## 🛠️ Development

### Key Technologies

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe JavaScript
- **React Native SVG**: Vector graphics support
- **Expo Linear Gradient**: Gradient effects

### Performance Optimizations

- Platform-specific particle counts (web vs mobile)
- Efficient animation handling with cleanup
- Memoized calculations for grid operations
- Optimized re-renders with proper state management

### Code Quality

- **TypeScript**: Full type coverage
- **ESLint**: Code linting and formatting
- **Consistent styling**: Single quotes, proper imports
- **Clean architecture**: Separation of concerns

---

## 🎨 Visual Design

### Color Palette

- **Primary Colors**: Cyan (#00FFB3), Purple (#8C1BFF), Pink (#FF007A)
- **Secondary Colors**: Gold (#FFD600), Blue (#00BFFF), Orange (#FF6F61)
- **Background**: Dark gradient with animated particles
- **UI Elements**: Glass morphism effects with subtle gradients

### Animations

- **Smooth transitions**: Grid scaling and fading
- **Particle effects**: Dynamic background animation
- **Cell interactions**: Hover, selection, and match animations
- **UI feedback**: Button pulses, score pop-ups, streak effects

---

## 📦 Building for Production

### Development Build

```bash
expo start
```

### Production Build

```bash
# iOS
expo build:ios

# Android
expo build:android

# Web
expo build:web
```

### App Store Deployment

1. **Configure app.json** with proper metadata
2. **Generate app icons** (already included)
3. **Build signed APK/IPA** using EAS Build
4. **Upload to respective stores**

---

## 🧪 Game Logic

### Core Functions

#### Matching Logic

```typescript
export const isValidPair = (a: number, b: number): boolean => {
  return a === b || a + b === 10;
};
```

#### Grid Generation

- Random number placement within range
- Guaranteed solvable pairs creation
- Empty row management for add-row feature

#### Win/Loss Conditions

- **Win**: All numbered cells matched
- **Loss**: Timer reaches zero with remaining cells
- **Continuation**: Valid pairs exist or add-rows available

---

## 🎯 Features

### Gameplay Features

- ✅ Number matching with dual logic (equal/sum to 10)
- ✅ Progressive difficulty across 3 levels
- ✅ Countdown timer with visual indicator
- ✅ Add-row powerup system
- ✅ Score system with streak multipliers
- ✅ Animated feedback for all interactions

### Technical Features

- ✅ Cross-platform compatibility (iOS, Android, Web)
- ✅ Responsive design for all screen sizes
- ✅ Smooth animations and transitions
- ✅ Professional UI with modern design
- ✅ TypeScript for type safety
- ✅ Performance optimized for mobile devices

---

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run TypeScript check (`npx tsc --noEmit`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## 🎮 How to Play

1. **Start**: Select two cells with numbers
2. **Match**: Numbers must be equal OR sum to 10
3. **Clear**: Matched cells become inactive (grayed out)
4. **Strategy**: Use add-rows wisely when no matches available
5. **Win**: Clear all numbered cells before time expires

### Pro Tips

- Look for quick consecutive matches to build streaks
- Plan ahead - some matches may block others
- Save add-rows for critical moments
- Higher numbers (7-9) give more points

---
