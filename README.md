# DigiDuo

A fast-paced number-matching puzzle game built with React Native and Expo. Match numbers that are equal or sum to 10 to clear the grid and progress through challenging levels.

## 🎮 Game Rules

DigiDuo is a strategic puzzle game where you match pairs of numbers on a grid:

### Matching Rules

- **Equal Numbers**: Match two identical numbers (e.g., 5 + 5)
- **Complement to 10**: Match two numbers that sum to 10 (e.g., 3 + 7, 4 + 6)
- **Adjacent Cells**: Only adjacent cells (horizontal, vertical, or diagonal) can be matched

### Objective

- Clear all filled rows by matching number pairs
- Complete levels within the time limit
- Use strategic thinking to avoid getting stuck

### Special Features

- **Add Row Power-up**: Limited uses per level to add new numbers when stuck
- **Streak System**: Build combos for higher scores
- **Dynamic Difficulty**: Later levels have fewer add-row chances

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** (v18 or higher)
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

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Run on specific platforms**

   ```bash
   # Web browser
   npm run web

   # iOS Simulator (macOS only)
   npm run ios

   # Android Emulator
   npm run android
   ```

### Development Environment

- **Expo SDK**: ~54.0.10
- **React**: 19.1.0
- **React Native**: 0.81.4
- **TypeScript**: ~5.9.2

## 🏗️ Architecture

DigiDuo follows a modular, game-engine architecture designed for reusability and extensibility.

### Core Architecture

```
src/
├── engine/           # Generic game engine
│   └── types.ts     # Core interfaces and types
├── games/
│   └── digiduo/     # DigiDuo-specific implementation
│       ├── DigiDuoEngine.ts     # Game logic
│       └── DigiDuoConfig.ts     # Level configuration
├── components/      # UI components
│   ├── GenericGrid.tsx          # Reusable grid component
│   ├── GenericGridCell.tsx      # Reusable cell component
│   ├── Grid.tsx                 # Legacy wrapper
│   └── GridCell.tsx             # Legacy wrapper
├── screens/         # Game screens
├── hooks/           # Custom React hooks
└── utils/           # Utility functions
```

### Design Patterns

**Game Engine Pattern**

- `GameEngine<T>`: Generic interface for all game types
- `DigiDuoEngine`: Concrete implementation for DigiDuo rules
- Type-safe with TypeScript generics

**Component Architecture**

- Generic components (`GenericGrid`, `GenericGridCell`) for reusability
- Legacy wrappers maintain backward compatibility
- Dependency injection for customization

**State Management**

- React hooks for game state
- Centralized game logic in engine classes
- Immutable state updates

## 🎯 Level Structure

### Level Configuration

Each level is defined by:

```typescript
interface DigiDuoLevelConfig {
  id: number; // Unique level identifier
  name: string; // Display name
  gridRows: number; // Total grid rows (9)
  gridCols: number; // Total grid columns (9)
  startFilledRows: number; // Initially filled rows (6)
  numberRange: [number, number]; // Range of numbers [1, 9]
  addRowLimit: number; // Max add-row power-ups
  timeLimit: number; // Time limit in seconds
}
```

### Current Levels

| Level | Name    | Add Rows | Time Limit | Difficulty |
| ----- | ------- | -------- | ---------- | ---------- |
| 1     | Level 1 | 3        | 120s       | Easy       |
| 2     | Level 2 | 3        | 120s       | Medium     |
| 3     | Level 3 | 2        | 120s       | Hard       |

### Grid Layout

- **9×9 Grid**: Total playing field
- **6 Initial Rows**: Pre-filled with random numbers (1-9)
- **3 Empty Rows**: Available for expansion via add-row power-up

## 🎵 Audio System

### Sound Effects

- **Cell Selection**: Audio feedback for cell taps
- **Successful Match**: Satisfying match confirmation
- **Invalid Match**: Clear error indication
- **Level Complete**: Victory celebration
- **Game Over**: Failure notification
- **Streak Bonus**: Combo achievement sounds

### Audio Features

- **Web Audio API**: Advanced browser audio processing
- **Platform Fallback**: React Native Audio for mobile
- **Dynamic Music**: Background music with intensity changes
- **Volume Control**: User-adjustable audio levels

## 🎨 Visual Design

### Color Scheme

- **Primary**: `#00FFB3` (Neon Green)
- **Secondary**: `#8C1BFF` (Purple)
- **Accent**: `#FF007A` (Pink)
- **Background**: Dark theme with glass effects

### Visual Effects

- **Linear Gradients**: Dynamic cell coloring based on values
- **Animations**: Smooth transitions and feedback
- **Glass Morphism**: Modern UI with transparency effects
- **Responsive Design**: Adapts to different screen sizes

## 🔧 Customization

### Adding New Games

1. **Create Game Engine**

   ```typescript
   class MyGameEngine implements GameEngine<MyValueType> {
     generateGrid(config: MyLevelConfig): GenericGrid<MyValueType> {
       // Implementation
     }
     // ... other methods
   }
   ```

2. **Define Level Configuration**

   ```typescript
   interface MyLevelConfig extends LevelConfig {
     // Custom properties
   }
   ```

3. **Register Game**
   ```typescript
   export const MY_GAME_CONFIG: GameConfig<MyValueType> = {
     name: "My Game",
     engine: new MyGameEngine(),
     levels: MY_LEVELS,
     // ... configuration
   };
   ```

### Modifying Levels

Edit `src/games/digiduo/DigiDuoConfig.ts` to:

- Add new levels
- Modify difficulty parameters
- Adjust time limits
- Change grid sizes

### Custom Themes

Modify the theme configuration in `DigiDuoConfig.ts`:

```typescript
theme: {
  colors: {
    primary: '#your-color',
    // ... other colors
  }
}
```

## 📱 Platform Support

- **Web**: Modern browsers with Web Audio API support
- **iOS**: iOS 13+ via Expo
- **Android**: Android 7+ via Expo

## 🧪 Testing

```bash
# Type checking
npx tsc --noEmit

# Run development server
npm start
```

## 📄 License

This project is opensource.

---

**DigiDuo** - Fast-paced number matching with strategic depth!
