# Space Shooter Game

A modern, browser-based arcade-style space shooter game built with vanilla HTML5, CSS3, and JavaScript. Features multiple themes, customizable spaceships, power-ups, and smooth 60fps gameplay with stunning visual effects.

## 🎮 Game Features

### Core Gameplay
- **Player-controlled spaceship** with smooth arrow key movement
- **Bullet shooting mechanics** with spacebar control
- **Dynamic enemy spawning** with progressive difficulty
- **Collision detection** with explosive particle effects
- **Lives system** (3 lives) with score tracking
- **Game over and restart** functionality
- **Animated starfield background** with glow effects

### Advanced Features
- **Theme Selection System** - Choose from Masked Rider, Ultraman, or Godzilla themes
- **Spaceship Customization** - Multiple spaceship designs per theme
- **Power-up System** with multiple categories:
  - **Offensive**: Rapid Fire, Multi-Shot, Laser Beam, Explosive Rounds
  - **Defensive**: Shield Generator
  - **Utility**: Time Slow
- **Character Selection Screen** with preview system
- **Interactive Introduction** with controls guide and power-up explanations
- **State Management System** for smooth screen transitions

## 🚀 Quick Start

### Prerequisites
- Modern web browser with HTML5 Canvas support
- JavaScript enabled
- Python (for local development server)

### Installation & Setup

1. **Clone or download** the project files
2. **Navigate** to the project directory
3. **Start the development server**:
   ```bash
   npm start
   # or
   npm run serve
   # or directly with Python
   python -m http.server 8000
   ```
4. **Open your browser** and go to `http://localhost:8000`

## 🎯 How to Play

### Controls
- **Arrow Keys** (↑ ↓ ← →) - Move your spaceship
- **Spacebar** - Fire bullets
- **ESC** - Pause game (when implemented)
- **Enter** - Alternative start game key

### Game Mechanics
- **Lives**: Start with 3 lives
- **Scoring**: Earn 10 points per enemy destroyed
- **Difficulty**: Enemy spawn rate increases over time
- **Power-ups**: Collect power-ups for temporary abilities
- **Themes**: Each theme offers unique visual styles and spaceship designs

### Power-ups Guide

#### Offensive Power-ups
- **🔥 Rapid Fire** - 300% increased firing rate for 10 seconds
- **⚡ Multi-Shot** - Fires 3 bullets in spread pattern for 15 seconds
- **🔴 Laser Beam** - Continuous laser beam for 8 seconds
- **💥 Explosive Rounds** - Area-of-effect explosions for 20 seconds

#### Defensive Power-ups
- **🛡️ Shield Generator** - Temporary invincibility for 5 seconds

#### Utility Power-ups
- **⏰ Time Slow** - Reduces enemy speed by 50% for 12 seconds

## 🏗️ Technical Architecture

### Technology Stack
- **HTML5** - Canvas API for game rendering
- **CSS3** - Advanced styling with gradients, shadows, and animations
- **Vanilla JavaScript** - ES6+ features, object-oriented design
- **Canvas 2D Context** - All game graphics and animations

### Project Structure
```
/
├── index.html          # Main HTML entry point
├── game.js            # Core game logic and classes
├── style.css          # All styling and visual effects
├── package.json       # Project metadata and scripts
├── .kiro/             # AI assistant configuration
└── .vscode/           # VS Code workspace settings
```

### Code Organization
- **State Management System** - Modular game states (Intro, Character Select, Game)
- **Object-Oriented Design** - ES6 classes for game entities
- **Event-Driven Architecture** - Input handling and game events
- **Performance Optimized** - `requestAnimationFrame` for smooth 60fps
- **Efficient Rendering** - Object pooling for bullets, enemies, and particles

### Key Classes & Components
- **GameStateManager** - Handles state transitions and game flow
- **IntroState** - Welcome screen with instructions and power-up guide
- **CharacterSelectState** - Theme and spaceship selection system
- **Game Entities** - Player, bullets, enemies, particles, power-ups
- **Theme System** - Configurable visual themes with unique assets

## 🎨 Customization

### Adding New Themes
1. Define theme configuration in `THEME_CONFIGS`
2. Add theme-specific background drawing functions
3. Create spaceship sprite drawing functions
4. Update CSS for theme preview styles

### Adding New Power-ups
1. Define power-up configuration in game constants
2. Implement power-up effect logic
3. Add visual representation and UI elements
4. Update power-up guide in intro screen

### Modifying Game Balance
Key configuration constants in `game.js`:
- `INITIAL_ENEMY_SPAWN_RATE` - Starting enemy spawn interval
- `MIN_ENEMY_SPAWN_RATE` - Fastest enemy spawn rate
- `PLAYER_SPEED` - Player movement speed
- `BULLET_SPEED` - Bullet travel speed
- `SHOOT_COOLDOWN` - Minimum time between shots

## 🔧 Development

### Performance Considerations
- Uses `requestAnimationFrame` for optimal frame rate
- Efficient object pooling prevents memory leaks
- Canvas clearing with fade effects for visual trails
- Shadow/glow effects may impact performance on older devices

### Browser Compatibility
- Modern browsers with HTML5 Canvas support
- ES6+ JavaScript features required
- Responsive design for various screen sizes
- Keyboard input support required

### Development Commands
```bash
# Start local development server
npm start

# Alternative server command
npm run serve

# Direct Python server
python -m http.server 8000
```

## 📱 Responsive Design

The game includes responsive design elements:
- **Desktop Optimized** - Primary target platform
- **Mobile Considerations** - UI adapts to smaller screens
- **Flexible Layouts** - Character selection and intro screens scale
- **Touch-Friendly** - Button sizes appropriate for touch devices

## 🚧 Future Enhancements

### Planned Features
- **Mobile Touch Controls** - Touch-based movement and shooting
- **Sound Effects & Music** - Audio feedback and background music
- **High Score System** - Local storage for best scores
- **Achievement System** - Unlock rewards for milestones
- **Multiplayer Mode** - Local or online multiplayer support
- **Level System** - Structured progression with boss battles

### Technical Improvements
- **WebGL Rendering** - Enhanced graphics performance
- **Service Worker** - Offline gameplay capability
- **Progressive Web App** - Installable game experience
- **Gamepad Support** - Controller input handling

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

**Enjoy the game!** 🚀✨