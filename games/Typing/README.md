# Typing Master 🎮

A modern, component-based typing training game built with **Vue 3 (Composition API)**, **TypeScript**, and **Tailwind CSS**. Designed for performance and maintainability, this project features a smooth `requestAnimationFrame` game loop, dynamic difficulty levels, and interactive visual feedback.

![Typing Master](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)

## ✨ Features

- **High-Performance Rendering**: Utilizes `requestAnimationFrame` instead of `setInterval` to prevent stuttering and ensure smooth letter dropping animations.
- **Dynamic Level System**:
  - **Level 1 (Novice)**: The game randomly selects 5 to 7 letters from the alphabet per session. Falls at a comfortable, relaxed pace.
  - **Level 2 (Advanced)**: Full alphabet (A-Z) with increased falling speed and a special "wobble" effect that makes tracking harder.
  - **Level 3 (Chaos)**: Maximum speed, wobble effect, and letters become partially blurred/transparent, heavily testing your peripheral vision and reflexes.
- **Combo & HP Mechanics**: Hitting correct keys builds your Combo and score multiplier. Missing letters or **pressing the wrong key** reduces your HP and breaks the Combo.
- **Responsive UI/UX**: Features glassmorphism effects, dynamic color transitions based on game state, and clear visual indicators for HP and score.

## 🛠️ Tech Stack

- **Framework**: Vue 3 (Script Setup)
- **Styling**: Tailwind CSS (Utility-first)
- **Logic**: TypeScript (Strict Mode)
- **State Management**: Composition API (Ref / Computed)
- **Build Tool**: Vite

## 📁 Project Structure

The project strictly follows a separation of concerns pattern, dividing the architecture into a **Logic Layer** and a **Presentation Layer**.

```text
src/
├── components/           # Presentation Layer
│   ├── GameBoard.vue     # Main game container
│   ├── FallingLetter.vue # Single dropping letter component
│   ├── GameHUD.vue       # Heads-up display (Score, HP, Combo)
│   └── GameOverlay.vue   # State overlays (Start, Level Up, Game Over)
├── composables/          # Logic Layer
│   └── useGameLogic.ts   # Core game engine and state management
├── config/               
│   └── levelConfig.ts    # Level definitions and parameters
├── types/                
│   └── game.ts           # TypeScript interfaces and types
├── App.vue               # Root component
└── main.ts               # Application entry point
```

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository or open the project folder:
   ```bash
   cd jamie-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173/` to play the game!

## 🎯 How to Play

1. Click **Start Game** on the initial screen.
2. Letters will start falling from the top of the board.
3. Press the corresponding key on your keyboard to destroy the letter before it hits the ground.
4. If multiple identical letters are on the screen, the system will automatically target the one closest to the bottom.
5. Missing a letter will deduct **10 HP** and break your combo.
6. Reach the target score to automatically advance to the next level. If your HP reaches 0, it's **Game Over**.
