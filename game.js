// ===== GAME INITIALIZATION =====
let canvas, ctx, scoreElement, livesElement, gameOverElement, finalScoreElement;

// Initialize DOM elements with error handling
function initializeDOM() {
    try {
        canvas = document.getElementById('gameCanvas');
        if (!canvas) throw new Error('Canvas element not found');
        
        ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D context not supported');
        
        scoreElement = document.getElementById('score');
        livesElement = document.getElementById('lives');
        gameOverElement = document.getElementById('gameOver');
        finalScoreElement = document.getElementById('finalScore');
        
        if (!scoreElement || !livesElement || !gameOverElement || !finalScoreElement) {
            throw new Error('Required UI elements not found');
        }
        
        return true;
    } catch (error) {
        console.error('DOM initialization failed:', error);
        return false;
    }
}

// ===== GAME STATE =====
let gameRunning = true;
let score = 0;
let lives = 3;
let keys = {};

// ===== GAME CONSTANTS =====
const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    PLAYER_SPEED: 5,
    BULLET_SPEED: 7,
    INITIAL_ENEMY_SPAWN_RATE: 2000,
    MIN_ENEMY_SPAWN_RATE: 800,
    SPAWN_RATE_DECREASE: 10,
    SHOOT_COOLDOWN: 200,
    EXPLOSION_PARTICLES: 15,
    STAR_COUNT: 100
};

// ===== PLAYER OBJECT =====
const player = {
    x: GAME_CONFIG.CANVAS_WIDTH / 2 - 15,
    y: GAME_CONFIG.CANVAS_HEIGHT - 50,
    width: 30,
    height: 30,
    speed: GAME_CONFIG.PLAYER_SPEED,
    color: '#00ffff',
    
    reset() {
        this.x = GAME_CONFIG.CANVAS_WIDTH / 2 - 15;
        this.y = GAME_CONFIG.CANVAS_HEIGHT - 50;
    }
};

// ===== GAME OBJECT ARRAYS =====
let bullets = [];
let enemies = [];
let particles = [];

// ===== GAME TIMING =====
let lastEnemySpawn = 0;
let enemySpawnRate = GAME_CONFIG.INITIAL_ENEMY_SPAWN_RATE;

// ===== INPUT HANDLING =====
function initializeInputHandlers() {
    try {
        document.addEventListener('keydown', (e) => {
            if (e && e.code) {
                keys[e.code] = true;
                // Prevent default behavior for game keys
                if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(e.code)) {
                    e.preventDefault();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e && e.code) {
                keys[e.code] = false;
            }
        });
        
        return true;
    } catch (error) {
        console.error('Input handler initialization failed:', error);
        return false;
    }
}

// ===== STATE MANAGEMENT =====

// Base State class
class State {
    constructor() {
        this.name = 'BaseState';
    }
    
    update() {
        // Override in subclasses
    }
    
    render() {
        // Override in subclasses
    }
    
    enter() {
        // Called when entering this state
    }
    
    exit() {
        // Called when leaving this state
    }
    
    handleInput() {
        // Override in subclasses
    }
}

// GameStateManager class
class GameStateManager {
    constructor() {
        this.currentState = null;
        this.states = new Map();
        this.initialized = false;
    }
    
    // Register a state with the manager
    addState(name, state) {
        try {
            if (!name || !state) {
                throw new Error('State name and state object are required');
            }
            
            if (!(state instanceof State)) {
                throw new Error('State must extend the State class');
            }
            
            this.states.set(name, state);
            return true;
        } catch (error) {
            console.error('Failed to add state:', error);
            return false;
        }
    }
    
    // Get current state
    getCurrentState() {
        return this.currentState;
    }
    
    // Get current state name
    getCurrentStateName() {
        if (!this.currentState) return null;
        return this.currentState.name;
    }
    
    // Set/transition to a new state
    setState(stateName) {
        try {
            if (!stateName) {
                throw new Error('State name is required');
            }
            
            const newState = this.states.get(stateName);
            if (!newState) {
                throw new Error(`State '${stateName}' not found`);
            }
            
            // Exit current state if exists
            if (this.currentState && this.currentState.exit) {
                this.currentState.exit();
            }
            
            // Set new state
            const previousState = this.currentState;
            this.currentState = newState;
            
            // Enter new state
            if (this.currentState.enter) {
                this.currentState.enter();
            }
            
            console.log(`State transition: ${previousState ? previousState.name : 'null'} -> ${this.currentState.name}`);
            return true;
        } catch (error) {
            console.error('State transition failed:', error);
            return false;
        }
    }
    
    // Update current state
    update() {
        try {
            if (this.currentState && this.currentState.update) {
                this.currentState.update();
            }
        } catch (error) {
            console.error('State update error:', error);
        }
    }
    
    // Render current state
    render() {
        try {
            if (this.currentState && this.currentState.render) {
                this.currentState.render();
            }
        } catch (error) {
            console.error('State render error:', error);
        }
    }
    
    // Handle input for current state
    handleInput() {
        try {
            if (this.currentState && this.currentState.handleInput) {
                this.currentState.handleInput();
            }
        } catch (error) {
            console.error('State input handling error:', error);
        }
    }
    
    // Initialize the state manager
    initialize() {
        try {
            this.initialized = true;
            console.log('GameStateManager initialized');
            return true;
        } catch (error) {
            console.error('GameStateManager initialization failed:', error);
            return false;
        }
    }
    
    // Check if state manager is ready
    isReady() {
        return this.initialized && this.states.size > 0;
    }
}

// Global state manager instance
let gameStateManager = null;

// ===== GAME STATE IMPLEMENTATIONS =====

// IntroState - Welcome screen with instructions
class IntroState extends State {
    constructor() {
        super();
        this.name = 'IntroState';
        this.introScreen = null;
        this.startButton = null;
    }
    
    enter() {
        console.log('Entering IntroState');
        
        // Get intro screen elements
        this.introScreen = document.getElementById('introScreen');
        this.startButton = document.getElementById('startButton');
        
        // Hide game UI elements
        if (gameOverElement) gameOverElement.style.display = 'none';
        if (scoreElement && livesElement) {
            scoreElement.parentElement.style.display = 'none';
            livesElement.parentElement.style.display = 'none';
        }
        
        // Show intro screen with fade-in animation
        if (this.introScreen) {
            this.introScreen.style.display = 'flex';
            // Reset transition properties
            this.introScreen.style.opacity = '1';
            this.introScreen.style.transform = 'scale(1)';
        }
        
        // Add click event listener to start button
        if (this.startButton) {
            this.startButton.addEventListener('click', this.handleStartClick.bind(this));
        }
        
        // Initialize power-up tabs
        this.initializePowerupTabs();
    }
    
    exit() {
        console.log('Exiting IntroState');
        
        // Hide intro screen
        if (this.introScreen) {
            this.introScreen.style.display = 'none';
        }
        
        // Show game UI elements
        if (scoreElement && livesElement) {
            scoreElement.parentElement.style.display = 'flex';
            livesElement.parentElement.style.display = 'flex';
        }
        
        // Remove click event listener
        if (this.startButton) {
            this.startButton.removeEventListener('click', this.handleStartClick.bind(this));
        }
        
        // Clean up power-up tab listeners
        this.cleanupPowerupTabs();
    }
    
    update() {
        // Handle intro screen logic
        this.handleInput();
    }
    
    render() {
        try {
            if (!ctx || !canvas) return;
            
            // Clear canvas and draw animated background
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw animated stars background
            drawStars();
            
            // Add some subtle animated particles for visual appeal
            this.drawBackgroundEffects();
        } catch (error) {
            console.error('IntroState render error:', error);
        }
    }
    
    drawBackgroundEffects() {
        try {
            if (!ctx) return;
            
            // Draw some floating particles for visual appeal
            const time = Date.now() * 0.001;
            for (let i = 0; i < 20; i++) {
                const x = (Math.sin(time + i) * 100) + canvas.width / 2;
                const y = (Math.cos(time * 0.7 + i) * 50) + canvas.height / 2;
                const alpha = (Math.sin(time * 2 + i) + 1) * 0.3;
                
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#00ffff';
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        } catch (error) {
            console.error('Background effects error:', error);
        }
    }
    
    handleInput() {
        // Handle keyboard input for starting the game
        if (keys['Enter'] || keys['Space']) {
            if (keys['Enter']) keys['Enter'] = false;
            if (keys['Space']) keys['Space'] = false;
            this.startGame();
        }
        
        // Tab navigation for power-up sections
        if (keys['Tab']) {
            keys['Tab'] = false;
            this.cyclePowerupTabs();
        }
        
        // Allow ESC to close if needed (future functionality)
        if (keys['Escape']) {
            keys['Escape'] = false;
            // Could add exit confirmation or settings menu
        }
    }
    
    handleStartClick() {
        this.startGame();
    }
    
    startGame() {
        // Add transition animation before changing state
        this.animateTransition(() => {
            if (gameStateManager) {
                gameStateManager.setState('CharacterSelectState');
            }
        });
    }
    
    animateTransition(callback) {
        try {
            if (this.introScreen) {
                // Add fade-out animation
                this.introScreen.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                this.introScreen.style.opacity = '0';
                this.introScreen.style.transform = 'scale(0.95)';
                
                // Execute callback after animation
                setTimeout(() => {
                    if (callback) callback();
                }, 500);
            } else {
                // Fallback if no intro screen
                if (callback) callback();
            }
        } catch (error) {
            console.error('Transition animation error:', error);
            // Fallback to immediate transition
            if (callback) callback();
        }
    }
    
    initializePowerupTabs() {
        try {
            const tabButtons = document.querySelectorAll('.tab-button');
            const tabContents = document.querySelectorAll('.tab-content');
            
            // Store references for cleanup
            this.tabButtons = tabButtons;
            this.tabClickHandler = (e) => {
                const targetTab = e.target.getAttribute('data-tab');
                
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                e.target.classList.add('active');
                const targetContent = document.getElementById(targetTab);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            };
            
            tabButtons.forEach(button => {
                button.addEventListener('click', this.tabClickHandler);
            });
        } catch (error) {
            console.error('Power-up tabs initialization error:', error);
        }
    }
    
    cleanupPowerupTabs() {
        try {
            if (this.tabButtons && this.tabClickHandler) {
                this.tabButtons.forEach(button => {
                    button.removeEventListener('click', this.tabClickHandler);
                });
            }
        } catch (error) {
            console.error('Power-up tabs cleanup error:', error);
        }
    }
    
    cyclePowerupTabs() {
        try {
            const activeTab = document.querySelector('.tab-button.active');
            const allTabs = document.querySelectorAll('.tab-button');
            
            if (activeTab && allTabs.length > 0) {
                let currentIndex = Array.from(allTabs).indexOf(activeTab);
                let nextIndex = (currentIndex + 1) % allTabs.length;
                
                // Simulate click on next tab
                allTabs[nextIndex].click();
            }
        } catch (error) {
            console.error('Tab cycling error:', error);
        }
    }
}

// CharacterSelectState - Theme and spaceship selection
class CharacterSelectState extends State {
    constructor() {
        super();
        this.name = 'CharacterSelectState';
        this.characterSelectScreen = null;
        this.currentThemeIndex = 0;
        this.selectedTheme = 'masked-rider';
        this.selectedSpaceship = null;
        this.previewCanvas = null;
        this.previewCtx = null;
        
        // UI element references
        this.themeCards = null;
        this.spaceshipGrid = null;
        this.backButton = null;
        this.confirmButton = null;
        this.themePrevButton = null;
        this.themeNextButton = null;
        this.speedStat = null;
        this.fireRateStat = null;
    }
    
    enter() {
        console.log('Entering CharacterSelectState');
        
        // Get character select screen elements
        this.characterSelectScreen = document.getElementById('characterSelectScreen');
        this.previewCanvas = document.getElementById('previewCanvas');
        
        // Hide other UI elements
        if (gameOverElement) gameOverElement.style.display = 'none';
        if (scoreElement && livesElement) {
            scoreElement.parentElement.style.display = 'none';
            livesElement.parentElement.style.display = 'none';
        }
        
        // Show character select screen
        if (this.characterSelectScreen) {
            this.characterSelectScreen.style.display = 'flex';
        }
        
        // Initialize preview canvas
        if (this.previewCanvas) {
            this.previewCtx = this.previewCanvas.getContext('2d');
        }
        
        // Load saved selections from session storage
        this.loadSavedSelections();
        
        // Initialize UI elements
        this.initializeUI();
        
        // Set default selections
        this.updateThemeSelection();
        this.updateSpaceshipOptions();
        this.updatePreview();
    }
    
    exit() {
        console.log('Exiting CharacterSelectState');
        
        // Hide character select screen
        if (this.characterSelectScreen) {
            this.characterSelectScreen.style.display = 'none';
        }
        
        // Show game UI elements
        if (scoreElement && livesElement) {
            scoreElement.parentElement.style.display = 'flex';
            livesElement.parentElement.style.display = 'flex';
        }
        
        // Clean up event listeners
        this.cleanupUI();
    }
    
    initializeUI() {
        try {
            // Get UI element references
            this.themeCards = document.querySelectorAll('.theme-card');
            this.spaceshipGrid = document.getElementById('spaceshipGrid');
            this.backButton = document.getElementById('backToIntro');
            this.confirmButton = document.getElementById('confirmSelection');
            this.themePrevButton = document.getElementById('themePrev');
            this.themeNextButton = document.getElementById('themeNext');
            this.speedStat = document.getElementById('speedStat');
            this.fireRateStat = document.getElementById('fireRateStat');
            
            // Add event listeners
            if (this.backButton) {
                this.backButton.addEventListener('click', () => this.goBack());
            }
            
            if (this.confirmButton) {
                this.confirmButton.addEventListener('click', () => this.confirmSelection());
            }
            
            if (this.themePrevButton) {
                this.themePrevButton.addEventListener('click', () => this.previousTheme());
            }
            
            if (this.themeNextButton) {
                this.themeNextButton.addEventListener('click', () => this.nextTheme());
            }
            
            // Add theme card click listeners
            this.themeCards.forEach(card => {
                card.addEventListener('click', (e) => {
                    const theme = e.currentTarget.getAttribute('data-theme');
                    this.selectTheme(theme);
                });
            });
            
        } catch (error) {
            console.error('UI initialization error:', error);
        }
    }
    
    cleanupUI() {
        try {
            // Remove event listeners to prevent memory leaks
            if (this.backButton) {
                this.backButton.removeEventListener('click', () => this.goBack());
            }
            
            if (this.confirmButton) {
                this.confirmButton.removeEventListener('click', () => this.confirmSelection());
            }
            
            if (this.themePrevButton) {
                this.themePrevButton.removeEventListener('click', () => this.previousTheme());
            }
            
            if (this.themeNextButton) {
                this.themeNextButton.removeEventListener('click', () => this.nextTheme());
            }
            
        } catch (error) {
            console.error('UI cleanup error:', error);
        }
    }
    
    selectTheme(themeName) {
        try {
            this.selectedTheme = themeName;
            
            // Only reset spaceship selection if changing themes
            // This preserves spaceship selection when loading saved state
            const currentThemeConfig = THEME_CONFIGS[themeName];
            if (currentThemeConfig && this.selectedSpaceship) {
                // Check if current spaceship exists in new theme
                const spaceshipExists = currentThemeConfig.spaceships.some(ship => ship.id === this.selectedSpaceship);
                if (!spaceshipExists) {
                    this.selectedSpaceship = null; // Reset only if spaceship doesn't exist in new theme
                }
            }
            
            // Update theme index for carousel navigation
            const themes = Object.keys(THEME_CONFIGS);
            this.currentThemeIndex = themes.indexOf(themeName);
            
            this.updateThemeSelection();
            this.updateSpaceshipOptions();
            this.updatePreview();
            this.updateConfirmButton();
            
        } catch (error) {
            console.error('Theme selection error:', error);
        }
    }
    
    selectSpaceship(spaceshipId) {
        try {
            this.selectedSpaceship = spaceshipId;
            
            // Update spaceship selection UI
            const spaceshipOptions = document.querySelectorAll('.spaceship-option');
            spaceshipOptions.forEach(option => {
                option.classList.remove('active');
                if (option.getAttribute('data-spaceship') === spaceshipId) {
                    option.classList.add('active');
                }
            });
            
            this.updatePreview();
            this.updateStats();
            this.updateConfirmButton();
            
        } catch (error) {
            console.error('Spaceship selection error:', error);
        }
    }
    
    updateThemeSelection() {
        try {
            // Update theme card active states
            this.themeCards.forEach(card => {
                card.classList.remove('active');
                if (card.getAttribute('data-theme') === this.selectedTheme) {
                    card.classList.add('active');
                }
            });
            
            // Update carousel navigation buttons
            const themes = Object.keys(THEME_CONFIGS);
            if (this.themePrevButton) {
                this.themePrevButton.disabled = this.currentThemeIndex <= 0;
            }
            if (this.themeNextButton) {
                this.themeNextButton.disabled = this.currentThemeIndex >= themes.length - 1;
            }
            
        } catch (error) {
            console.error('Theme selection update error:', error);
        }
    }
    
    updateSpaceshipOptions() {
        try {
            if (!this.spaceshipGrid) return;
            
            // Clear existing options
            this.spaceshipGrid.innerHTML = '';
            
            // Get spaceship options for selected theme
            const themeConfig = THEME_CONFIGS[this.selectedTheme];
            if (!themeConfig || !themeConfig.spaceships) return;
            
            // Create spaceship option elements
            themeConfig.spaceships.forEach(spaceship => {
                const option = document.createElement('div');
                option.className = 'spaceship-option';
                option.setAttribute('data-spaceship', spaceship.id);
                
                // Create a mini canvas for spaceship preview
                const previewCanvas = document.createElement('canvas');
                previewCanvas.width = 60;
                previewCanvas.height = 60;
                previewCanvas.className = 'spaceship-preview';
                
                const previewCtx = previewCanvas.getContext('2d');
                this.drawSpaceshipOptionPreview(previewCtx, spaceship, themeConfig);
                
                const nameDiv = document.createElement('div');
                nameDiv.className = 'spaceship-name';
                nameDiv.textContent = spaceship.name;
                
                option.appendChild(previewCanvas);
                option.appendChild(nameDiv);
                
                option.addEventListener('click', () => {
                    this.selectSpaceship(spaceship.id);
                });
                
                this.spaceshipGrid.appendChild(option);
            });
            
            // Auto-select first spaceship if none selected
            if (!this.selectedSpaceship && themeConfig.spaceships.length > 0) {
                this.selectSpaceship(themeConfig.spaceships[0].id);
            }
            
        } catch (error) {
            console.error('Spaceship options update error:', error);
        }
    }
    
    drawSpaceshipOptionPreview(ctx, spaceship, themeConfig) {
        try {
            const width = 60;
            const height = 60;
            
            // Clear canvas
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, width, height);
            
            // Draw mini theme background
            const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
            gradient.addColorStop(0, themeConfig.colors.background + '80');
            gradient.addColorStop(1, themeConfig.colors.background + '20');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            
            // Try to draw the actual spaceship
            const drawFunctionName = spaceship.sprite;
            if (typeof window[drawFunctionName] === 'function') {
                const shipSize = 30;
                const x = (width - shipSize) / 2;
                const y = (height - shipSize) / 2;
                
                window[drawFunctionName](ctx, x, y, shipSize, shipSize);
            } else {
                // Fallback: simple spaceship representation
                const centerX = width / 2;
                const centerY = height / 2;
                
                ctx.fillStyle = themeConfig.colors.primary;
                ctx.fillRect(centerX - 8, centerY - 6, 16, 12);
                
                ctx.fillStyle = themeConfig.colors.accent;
                ctx.fillRect(centerX - 3, centerY - 3, 6, 6);
                
                // Add small glow
                ctx.shadowColor = themeConfig.colors.primary;
                ctx.shadowBlur = 4;
                ctx.fillRect(centerX - 8, centerY - 6, 16, 12);
                ctx.shadowBlur = 0;
            }
            
        } catch (error) {
            console.error('Spaceship option preview error:', error);
            // Ultra-simple fallback
            ctx.fillStyle = themeConfig.colors.primary;
            ctx.fillRect(20, 20, 20, 20);
        }
    }
    
    updatePreview() {
        try {
            if (!this.previewCtx || !this.previewCanvas) return;
            
            const canvas = this.previewCanvas;
            const ctx = this.previewCtx;
            
            // Clear preview canvas
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw theme-specific background
            this.drawThemeBackground(ctx, canvas.width, canvas.height);
            
            // Draw spaceship if selected
            if (this.selectedSpaceship) {
                this.drawSpaceshipPreview(ctx, canvas.width, canvas.height);
            }
            
        } catch (error) {
            console.error('Preview update error:', error);
        }
    }
    
    drawThemeBackground(ctx, width, height) {
        try {
            const themeConfig = THEME_CONFIGS[this.selectedTheme];
            if (!themeConfig) return;
            
            // Draw theme-specific background pattern
            switch (this.selectedTheme) {
                case 'masked-rider':
                    this.drawMaskedRiderBackground(ctx, width, height);
                    break;
                case 'ultraman':
                    this.drawUltramanBackground(ctx, width, height);
                    break;
                case 'godzilla':
                    this.drawGodzillaBackground(ctx, width, height);
                    break;
                default:
                    this.drawDefaultBackground(ctx, width, height);
            }
            
        } catch (error) {
            console.error('Theme background drawing error:', error);
        }
    }
    
    drawMaskedRiderBackground(ctx, width, height) {
        // Masked Rider theme: Red and black with yellow accents
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add some geometric patterns
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height/2);
        ctx.lineTo(width, height/2);
        ctx.moveTo(width/2, 0);
        ctx.lineTo(width/2, height);
        ctx.stroke();
    }
    
    drawUltramanBackground(ctx, width, height) {
        // Ultraman theme: Blue and red with white accents
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
        gradient.addColorStop(0, 'rgba(0, 102, 255, 0.4)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 51, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add energy beam effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const x1 = width/2 + Math.cos(angle) * 20;
            const y1 = height/2 + Math.sin(angle) * 20;
            const x2 = width/2 + Math.cos(angle) * 60;
            const y2 = height/2 + Math.sin(angle) * 60;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.stroke();
    }
    
    drawGodzillaBackground(ctx, width, height) {
        // Godzilla theme: Green and dark with yellow accents
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.3)');
        gradient.addColorStop(0.5, 'rgba(0, 17, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add monster-like spikes pattern
        ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const x = width/2 + Math.cos(angle) * 40;
            const y = height/2 + Math.sin(angle) * 40;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * 15, y + Math.sin(angle) * 15);
            ctx.lineTo(x + Math.cos(angle + 0.5) * 10, y + Math.sin(angle + 0.5) * 10);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    drawDefaultBackground(ctx, width, height) {
        // Default space background
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
        gradient.addColorStop(0, 'rgba(15, 15, 35, 1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add some stars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawSpaceshipPreview(ctx, width, height) {
        try {
            const themeConfig = THEME_CONFIGS[this.selectedTheme];
            const spaceship = themeConfig.spaceships.find(ship => ship.id === this.selectedSpaceship);
            
            if (!spaceship) return;
            
            // Get the drawing function name
            const drawFunctionName = spaceship.sprite;
            
            // Check if the function exists in global scope
            if (typeof window[drawFunctionName] === 'function') {
                // Draw the spaceship in the center of the preview
                const shipWidth = 40;
                const shipHeight = 40;
                const x = (width - shipWidth) / 2;
                const y = (height - shipHeight) / 2;
                
                // Call the spaceship drawing function
                window[drawFunctionName](ctx, x, y, shipWidth, shipHeight);
            } else {
                // Fallback: draw a simple representation
                this.drawFallbackSpaceship(ctx, width, height, themeConfig);
            }
            
        } catch (error) {
            console.error('Spaceship preview drawing error:', error);
            // Fallback drawing
            this.drawFallbackSpaceship(ctx, width, height, THEME_CONFIGS[this.selectedTheme]);
        }
    }
    
    drawFallbackSpaceship(ctx, width, height, themeConfig) {
        // Simple fallback spaceship representation
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Main body
        ctx.fillStyle = themeConfig.colors.primary;
        ctx.fillRect(centerX - 15, centerY - 10, 30, 20);
        
        // Wings
        ctx.fillStyle = themeConfig.colors.secondary;
        ctx.fillRect(centerX - 20, centerY - 5, 10, 10);
        ctx.fillRect(centerX + 10, centerY - 5, 10, 10);
        
        // Cockpit
        ctx.fillStyle = themeConfig.colors.accent;
        ctx.fillRect(centerX - 5, centerY - 5, 10, 10);
        
        // Add glow effect
        ctx.shadowColor = themeConfig.colors.primary;
        ctx.shadowBlur = 8;
        ctx.fillRect(centerX - 15, centerY - 10, 30, 20);
        ctx.shadowBlur = 0;
    }
    
    updateStats() {
        try {
            if (!this.selectedSpaceship || !this.speedStat || !this.fireRateStat) return;
            
            const themeConfig = THEME_CONFIGS[this.selectedTheme];
            const spaceship = themeConfig.spaceships.find(ship => ship.id === this.selectedSpaceship);
            
            if (spaceship && spaceship.stats) {
                // Update speed stat (normalize to 0-100%)
                const speedPercent = Math.min(100, (spaceship.stats.speed / 10) * 100);
                this.speedStat.style.width = speedPercent + '%';
                
                // Update fire rate stat (normalize to 0-100%)
                const fireRatePercent = Math.min(100, (spaceship.stats.fireRate / 2) * 100);
                this.fireRateStat.style.width = fireRatePercent + '%';
            }
            
        } catch (error) {
            console.error('Stats update error:', error);
        }
    }
    
    updateConfirmButton() {
        try {
            if (!this.confirmButton) return;
            
            // Enable confirm button only if both theme and spaceship are selected
            const canConfirm = this.selectedTheme && this.selectedSpaceship;
            this.confirmButton.disabled = !canConfirm;
            
        } catch (error) {
            console.error('Confirm button update error:', error);
        }
    }
    
    previousTheme() {
        const themes = Object.keys(THEME_CONFIGS);
        if (this.currentThemeIndex > 0) {
            this.currentThemeIndex--;
            this.selectTheme(themes[this.currentThemeIndex]);
        }
    }
    
    nextTheme() {
        const themes = Object.keys(THEME_CONFIGS);
        if (this.currentThemeIndex < themes.length - 1) {
            this.currentThemeIndex++;
            this.selectTheme(themes[this.currentThemeIndex]);
        }
    }
    
    goBack() {
        if (gameStateManager) {
            gameStateManager.setState('IntroState');
        }
    }
    
    confirmSelection() {
        try {
            if (!this.selectedTheme || !this.selectedSpaceship) {
                console.warn('Cannot confirm: missing theme or spaceship selection');
                return;
            }
            
            // Save selections to session storage
            this.saveSelections();
            
            // Apply selections to theme manager
            if (themeManager) {
                themeManager.loadTheme(this.selectedTheme);
                themeManager.setSelectedSpaceship(this.selectedSpaceship);
            }
            
            // Transition to game state
            if (gameStateManager) {
                gameStateManager.setState('GameState');
            }
            
        } catch (error) {
            console.error('Selection confirmation error:', error);
        }
    }
    
    loadSavedSelections() {
        try {
            // Load theme selection from session storage
            const savedTheme = sessionStorage.getItem('selectedTheme');
            if (savedTheme && THEME_CONFIGS[savedTheme]) {
                this.selectedTheme = savedTheme;
                const themes = Object.keys(THEME_CONFIGS);
                this.currentThemeIndex = themes.indexOf(savedTheme);
            }
            
            // Load spaceship selection from session storage
            const savedSpaceship = sessionStorage.getItem('selectedSpaceship');
            if (savedSpaceship) {
                // Verify the spaceship exists in the selected theme
                const themeConfig = THEME_CONFIGS[this.selectedTheme];
                if (themeConfig && themeConfig.spaceships.some(ship => ship.id === savedSpaceship)) {
                    this.selectedSpaceship = savedSpaceship;
                }
            }
            
            console.log('Loaded saved selections:', {
                theme: this.selectedTheme,
                spaceship: this.selectedSpaceship
            });
            
        } catch (error) {
            console.error('Error loading saved selections:', error);
            // Use defaults if loading fails
            this.selectedTheme = 'masked-rider';
            this.selectedSpaceship = null;
            this.currentThemeIndex = 0;
        }
    }
    
    saveSelections() {
        try {
            // Save current selections to session storage
            if (this.selectedTheme) {
                sessionStorage.setItem('selectedTheme', this.selectedTheme);
            }
            
            if (this.selectedSpaceship) {
                sessionStorage.setItem('selectedSpaceship', this.selectedSpaceship);
            }
            
            console.log('Saved selections to session storage:', {
                theme: this.selectedTheme,
                spaceship: this.selectedSpaceship
            });
            
        } catch (error) {
            console.error('Error saving selections:', error);
        }
    }
    
    clearSavedSelections() {
        try {
            sessionStorage.removeItem('selectedTheme');
            sessionStorage.removeItem('selectedSpaceship');
            console.log('Cleared saved selections');
        } catch (error) {
            console.error('Error clearing saved selections:', error);
        }
    }
    
    update() {
        this.handleInput();
    }
    
    render() {
        try {
            if (!ctx || !canvas) return;
            
            // Clear canvas and draw animated background
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw animated stars background
            drawStars();
            
            // Add some subtle animated particles for visual appeal
            this.drawBackgroundEffects();
        } catch (error) {
            console.error('CharacterSelectState render error:', error);
        }
    }
    
    drawBackgroundEffects() {
        try {
            if (!ctx) return;
            
            // Draw some floating particles for visual appeal
            const time = Date.now() * 0.001;
            for (let i = 0; i < 15; i++) {
                const x = (Math.sin(time + i * 0.5) * 150) + canvas.width / 2;
                const y = (Math.cos(time * 0.8 + i * 0.3) * 80) + canvas.height / 2;
                const alpha = (Math.sin(time * 1.5 + i) + 1) * 0.2;
                
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#00ffff';
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        } catch (error) {
            console.error('Background effects error:', error);
        }
    }
    
    handleInput() {
        // Handle keyboard navigation
        if (keys['Escape']) {
            keys['Escape'] = false;
            this.goBack();
        }
        
        if (keys['Enter']) {
            keys['Enter'] = false;
            this.confirmSelection();
        }
        
        // Theme navigation with arrow keys
        if (keys['ArrowLeft']) {
            keys['ArrowLeft'] = false;
            this.previousTheme();
        }
        
        if (keys['ArrowRight']) {
            keys['ArrowRight'] = false;
            this.nextTheme();
        }
    }
}

// GameState - Active gameplay
class GameState extends State {
    constructor() {
        super();
        this.name = 'GameState';
    }
    
    enter() {
        console.log('Entering GameState');
        // Initialize/reset game state
        gameRunning = true;
        score = 0;
        lives = 3;
        bullets = [];
        enemies = [];
        particles = [];
        lastEnemySpawn = 0;
        enemySpawnRate = GAME_CONFIG.INITIAL_ENEMY_SPAWN_RATE;
        
        // Reset player position
        if (player && player.reset) {
            player.reset();
        }
        
        // Update UI elements
        updateScore(0);
        updateLives(0);
        
        if (gameOverElement) {
            gameOverElement.style.display = 'none';
        }
    }
    
    exit() {
        console.log('Exiting GameState');
        gameRunning = false;
    }
    
    update() {
        if (!gameRunning) return;
        
        this.handleInput();
        spawnEnemy();
        
        // Update bullets
        updateBullets();
        
        // Update enemies
        updateEnemies();
        
        // Update particles
        updateParticles();
        
        checkCollisions();
        
        // Check for game over
        if (lives <= 0) {
            if (gameStateManager) {
                gameStateManager.setState('GameOverState');
            }
        }
    }
    
    render() {
        try {
            if (!ctx || !canvas) return;
            
            // Clear canvas with fade effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw stars background
            drawStars();
            
            // Draw player
            drawPlayer();
            
            // Draw game objects
            drawGameObjects();
        } catch (error) {
            console.error('GameState render error:', error);
        }
    }
    
    handleInput() {
        try {
            if (!canvas || !player) return;
            
            const canvasWidth = canvas.width || GAME_CONFIG.CANVAS_WIDTH;
            const canvasHeight = canvas.height || GAME_CONFIG.CANVAS_HEIGHT;
            
            if (keys['ArrowLeft'] && player.x > 0) {
                player.x -= player.speed;
            }
            if (keys['ArrowRight'] && player.x < canvasWidth - player.width) {
                player.x += player.speed;
            }
            if (keys['ArrowUp'] && player.y > 0) {
                player.y -= player.speed;
            }
            if (keys['ArrowDown'] && player.y < canvasHeight - player.height) {
                player.y += player.speed;
            }
            if (keys['Space']) {
                shootBullet();
                keys['Space'] = false; // Prevent rapid fire
            }
            if (keys['Escape']) {
                keys['Escape'] = false;
                if (gameStateManager) {
                    gameStateManager.setState('PauseState');
                }
            }
        } catch (error) {
            console.error('GameState input handling error:', error);
        }
    }
}

// PauseState - Game paused
class PauseState extends State {
    constructor() {
        super();
        this.name = 'PauseState';
        this.previousState = null;
    }
    
    enter() {
        console.log('Entering PauseState');
        // Store the previous state (should be GameState)
        this.previousState = 'GameState';
    }
    
    exit() {
        console.log('Exiting PauseState');
    }
    
    update() {
        this.handleInput();
        // Don't update game logic while paused
    }
    
    render() {
        try {
            if (!ctx || !canvas) return;
            
            // Draw the game state in the background (frozen)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            drawStars();
            drawPlayer();
            drawGameObjects();
            
            // Draw pause overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw pause text
            ctx.fillStyle = '#ffffff';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 50);
            
            ctx.font = '24px Arial';
            ctx.fillText('Press ESC to Resume', canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText('Press M for Main Menu', canvas.width / 2, canvas.height / 2 + 60);
        } catch (error) {
            console.error('PauseState render error:', error);
        }
    }
    
    handleInput() {
        if (keys['Escape']) {
            keys['Escape'] = false;
            if (gameStateManager && this.previousState) {
                gameStateManager.setState(this.previousState);
            }
        }
        if (keys['KeyM']) {
            keys['KeyM'] = false;
            if (gameStateManager) {
                gameStateManager.setState('IntroState');
            }
        }
    }
}

// GameOverState - End game screen
class GameOverState extends State {
    constructor() {
        super();
        this.name = 'GameOverState';
    }
    
    enter() {
        console.log('Entering GameOverState');
        gameRunning = false;
        if (finalScoreElement) {
            finalScoreElement.textContent = score;
        }
        if (gameOverElement) {
            gameOverElement.style.display = 'block';
        }
    }
    
    exit() {
        console.log('Exiting GameOverState');
        if (gameOverElement) {
            gameOverElement.style.display = 'none';
        }
    }
    
    update() {
        this.handleInput();
    }
    
    render() {
        try {
            if (!ctx || !canvas) return;
            
            // Clear canvas
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw stars background
            drawStars();
            
            // Draw game over text
            ctx.fillStyle = '#ff0000';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 100);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '32px Arial';
            ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 - 20);
            
            ctx.font = '20px Arial';
            ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 30);
            ctx.fillText('Press C for Character Selection', canvas.width / 2, canvas.height / 2 + 60);
            ctx.fillText('Press M for Main Menu', canvas.width / 2, canvas.height / 2 + 90);
        } catch (error) {
            console.error('GameOverState render error:', error);
        }
    }
    
    handleInput() {
        if (keys['KeyR']) {
            keys['KeyR'] = false;
            if (gameStateManager) {
                gameStateManager.setState('GameState');
            }
        }
        if (keys['KeyC']) {
            keys['KeyC'] = false;
            if (gameStateManager) {
                gameStateManager.setState('CharacterSelectState');
            }
        }
        if (keys['KeyM']) {
            keys['KeyM'] = false;
            if (gameStateManager) {
                gameStateManager.setState('IntroState');
            }
        }
    }
}

// ===== GAME CLASSES =====

// Bullet class
class Bullet {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
        this.width = 4;
        this.height = 10;
        this.speed = GAME_CONFIG.BULLET_SPEED;
        this.color = '#ffff00';
    }

    update() {
        this.y -= this.speed;
    }

    draw() {
        try {
            if (!ctx) return;
            
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Add glow effect
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.shadowBlur = 0;
        } catch (error) {
            console.error('Bullet draw error:', error);
        }
    }
}

// Enemy class
class Enemy {
    constructor() {
        const canvasWidth = canvas ? canvas.width : GAME_CONFIG.CANVAS_WIDTH;
        this.x = Math.random() * (canvasWidth - 30);
        this.y = -30;
        this.width = 30;
        this.height = 30;
        this.speed = Math.random() * 2 + 1;
        this.color = '#ff0000';
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        try {
            if (!ctx) return;
            
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Add glow effect
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.shadowBlur = 0;
        } catch (error) {
            console.error('Enemy draw error:', error);
        }
    }
}

// Particle class for explosions
class Particle {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.life = 30;
        this.maxLife = 30;
        this.color = `hsl(${Math.random() * 60 + 15}, 100%, 50%)`;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.vx *= 0.98;
        this.vy *= 0.98;
    }

    draw() {
        try {
            if (!ctx) return;
            
            const alpha = this.life / this.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, 3, 3);
            ctx.globalAlpha = 1;
        } catch (error) {
            console.error('Particle draw error:', error);
        }
    }
}

// ===== THEME SYSTEM =====

// Theme configuration objects
const THEME_CONFIGS = {
    'masked-rider': {
        name: 'masked-rider',
        displayName: 'Masked Rider',
        colors: {
            primary: '#ff0000',
            secondary: '#000000',
            accent: '#ffff00',
            background: '#1a0000',
            ui: '#ff3333'
        },
        spaceships: [
            {
                id: 'rider-1',
                name: 'Rider Alpha',
                sprite: 'drawMaskedRiderShip1',
                stats: { speed: 5, fireRate: 1.0 }
            },
            {
                id: 'rider-2', 
                name: 'Rider Beta',
                sprite: 'drawMaskedRiderShip2',
                stats: { speed: 4, fireRate: 1.2 }
            },
            {
                id: 'rider-3',
                name: 'Rider Gamma',
                sprite: 'drawMaskedRiderShip3',
                stats: { speed: 6, fireRate: 0.8 }
            }
        ],
        enemies: {
            basic: { 
                sprite: 'drawMaskedRiderBasicEnemy', 
                health: 1,
                color: '#800000'
            },
            advanced: { 
                sprite: 'drawMaskedRiderAdvancedEnemy', 
                health: 3,
                color: '#cc0000'
            }
        },
        backgroundElements: 'drawMaskedRiderBackground'
    },
    
    'ultraman': {
        name: 'ultraman',
        displayName: 'Ultraman',
        colors: {
            primary: '#0066ff',
            secondary: '#ff0000',
            accent: '#ffffff',
            background: '#000033',
            ui: '#3399ff'
        },
        spaceships: [
            {
                id: 'ultra-1',
                name: 'Ultra Fighter',
                sprite: 'drawUltramanShip1',
                stats: { speed: 5, fireRate: 1.0 }
            },
            {
                id: 'ultra-2',
                name: 'Ultra Defender',
                sprite: 'drawUltramanShip2', 
                stats: { speed: 3, fireRate: 1.5 }
            },
            {
                id: 'ultra-3',
                name: 'Ultra Striker',
                sprite: 'drawUltramanShip3',
                stats: { speed: 7, fireRate: 0.7 }
            }
        ],
        enemies: {
            basic: { 
                sprite: 'drawUltramanBasicEnemy', 
                health: 1,
                color: '#004080'
            },
            advanced: { 
                sprite: 'drawUltramanAdvancedEnemy', 
                health: 3,
                color: '#0066cc'
            }
        },
        backgroundElements: 'drawUltramanBackground'
    },
    
    'godzilla': {
        name: 'godzilla',
        displayName: 'Godzilla',
        colors: {
            primary: '#00ff00',
            secondary: '#333333',
            accent: '#ffff00',
            background: '#001100',
            ui: '#66ff66'
        },
        spaceships: [
            {
                id: 'kaiju-1',
                name: 'Kaiju Hunter',
                sprite: 'drawGodzillaShip1',
                stats: { speed: 4, fireRate: 1.1 }
            },
            {
                id: 'kaiju-2',
                name: 'Monster Slayer',
                sprite: 'drawGodzillaShip2',
                stats: { speed: 5, fireRate: 0.9 }
            },
            {
                id: 'kaiju-3',
                name: 'Titan Destroyer',
                sprite: 'drawGodzillaShip3',
                stats: { speed: 6, fireRate: 0.8 }
            }
        ],
        enemies: {
            basic: { 
                sprite: 'drawGodzillaBasicEnemy', 
                health: 2,
                color: '#006600'
            },
            advanced: { 
                sprite: 'drawGodzillaAdvancedEnemy', 
                health: 4,
                color: '#00cc00'
            }
        },
        backgroundElements: 'drawGodzillaBackground'
    }
};

// ThemeManager class for handling theme loading and management
class ThemeManager {
    constructor() {
        this.currentTheme = null;
        this.selectedSpaceship = null;
        this.themeCache = new Map();
        this.initialized = false;
    }
    
    // Initialize the theme manager
    initialize() {
        try {
            // Load default theme
            this.loadTheme('masked-rider');
            this.initialized = true;
            console.log('ThemeManager initialized with default theme');
            return true;
        } catch (error) {
            console.error('ThemeManager initialization failed:', error);
            return false;
        }
    }
    
    // Load a theme by name
    loadTheme(themeName) {
        try {
            if (!themeName) {
                throw new Error('Theme name is required');
            }
            
            const themeConfig = THEME_CONFIGS[themeName];
            if (!themeConfig) {
                throw new Error(`Theme '${themeName}' not found`);
            }
            
            // Cache the theme if not already cached
            if (!this.themeCache.has(themeName)) {
                this.themeCache.set(themeName, { ...themeConfig });
                console.log(`Theme '${themeName}' loaded and cached`);
            }
            
            // Set as current theme
            this.currentTheme = this.themeCache.get(themeName);
            
            // Apply theme styles to the game
            this.applyThemeStyles();
            
            console.log(`Active theme changed to: ${this.currentTheme.displayName}`);
            return true;
        } catch (error) {
            console.error('Theme loading failed:', error);
            return false;
        }
    }
    
    // Get the current theme
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    // Get current theme name
    getCurrentThemeName() {
        return this.currentTheme ? this.currentTheme.name : null;
    }
    
    // Get spaceship options for current theme
    getSpaceshipOptions(themeName = null) {
        try {
            const theme = themeName ? THEME_CONFIGS[themeName] : this.currentTheme;
            if (!theme) {
                console.warn('No theme specified and no current theme set');
                return [];
            }
            
            return theme.spaceships || [];
        } catch (error) {
            console.error('Error getting spaceship options:', error);
            return [];
        }
    }
    
    // Get all available themes
    getAvailableThemes() {
        return Object.keys(THEME_CONFIGS).map(key => ({
            name: key,
            displayName: THEME_CONFIGS[key].displayName
        }));
    }
    
    // Set selected spaceship
    setSelectedSpaceship(spaceshipId) {
        try {
            if (!this.currentTheme) {
                throw new Error('No theme loaded');
            }
            
            const spaceship = this.currentTheme.spaceships.find(ship => ship.id === spaceshipId);
            if (!spaceship) {
                throw new Error(`Spaceship '${spaceshipId}' not found in current theme`);
            }
            
            this.selectedSpaceship = spaceship;
            console.log(`Selected spaceship: ${spaceship.name}`);
            return true;
        } catch (error) {
            console.error('Spaceship selection failed:', error);
            return false;
        }
    }
    
    // Get selected spaceship
    getSelectedSpaceship() {
        return this.selectedSpaceship;
    }
    
    // Apply theme styles to game elements
    applyThemeStyles() {
        try {
            if (!this.currentTheme) {
                console.warn('No theme to apply');
                return false;
            }
            
            const theme = this.currentTheme;
            
            // Apply theme colors to player if no spaceship selected
            if (!this.selectedSpaceship && player) {
                player.color = theme.colors.primary;
            }
            
            // Apply theme colors to UI elements (if they exist)
            this.applyUITheme(theme);
            
            console.log(`Applied theme styles for: ${theme.displayName}`);
            return true;
        } catch (error) {
            console.error('Theme style application failed:', error);
            return false;
        }
    }
    
    // Apply theme to UI elements
    applyUITheme(theme) {
        try {
            // Apply CSS custom properties for theme colors
            const root = document.documentElement;
            if (root && root.style) {
                root.style.setProperty('--theme-primary', theme.colors.primary);
                root.style.setProperty('--theme-secondary', theme.colors.secondary);
                root.style.setProperty('--theme-accent', theme.colors.accent);
                root.style.setProperty('--theme-background', theme.colors.background);
                root.style.setProperty('--theme-ui', theme.colors.ui);
            }
        } catch (error) {
            console.error('UI theme application failed:', error);
        }
    }
    
    // Get theme colors
    getThemeColors() {
        return this.currentTheme ? this.currentTheme.colors : null;
    }
    
    // Get enemy configuration for current theme
    getEnemyConfig(enemyType = 'basic') {
        try {
            if (!this.currentTheme) {
                return null;
            }
            
            return this.currentTheme.enemies[enemyType] || this.currentTheme.enemies.basic;
        } catch (error) {
            console.error('Error getting enemy config:', error);
            return null;
        }
    }
    
    // Clear theme cache
    clearCache() {
        try {
            this.themeCache.clear();
            console.log('Theme cache cleared');
            return true;
        } catch (error) {
            console.error('Cache clearing failed:', error);
            return false;
        }
    }
    
    // Check if theme manager is ready
    isReady() {
        return this.initialized && this.currentTheme !== null;
    }
    
    // Get cache statistics
    getCacheStats() {
        return {
            cachedThemes: this.themeCache.size,
            currentTheme: this.getCurrentThemeName(),
            selectedSpaceship: this.selectedSpaceship ? this.selectedSpaceship.id : null
        };
    }
}

// Global theme manager instance
let themeManager = null;

// ===== SPACESHIP SPRITE DRAWING FUNCTIONS =====

// Masked Rider Theme Spaceships
function drawMaskedRiderShip1(ctx, x, y, width, height) {
    try {
        if (!ctx) return;
        
        // Rider Alpha - Classic red and black design
        ctx.save();
        
        // Main body (red)
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x + width * 0.3, y + height * 0.2, width * 0.4, height * 0.6);
        
        // Wings (black with red trim)
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y + height * 0.4, width * 0.25, height * 0.3);
        ctx.fillRect(x + width * 0.75, y + height * 0.4, width * 0.25, height * 0.3);
        
        // Wing trim (red)
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x + width * 0.02, y + height * 0.42, width * 0.21, height * 0.04);
        ctx.fillRect(x + width * 0.77, y + height * 0.42, width * 0.21, height * 0.04);
        
        // Cockpit (yellow)
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(x + width * 0.4, y + height * 0.1, width * 0.2, height * 0.2);
        
        // Engine exhausts (bright red)
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(x + width * 0.35, y + height * 0.85, width * 0.1, height * 0.15);
        ctx.fillRect(x + width * 0.55, y + height * 0.85, width * 0.1, height * 0.15);
        
        // Add glow effect
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x + width * 0.3, y + height * 0.2, width * 0.4, height * 0.6);
        
        ctx.restore();
    } catch (error) {
        console.error('Error drawing Masked Rider Ship 1:', error);
    }
}

function drawMaskedRiderShip2(ctx, x, y, width, height) {
    try {
        if (!ctx) return;
        
        // Rider Beta - Sleeker design with more black
        ctx.save();
        
        // Main body (black with red accents)
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + width * 0.25, y + height * 0.15, width * 0.5, height * 0.7);
        
        // Red accent stripes
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x + width * 0.3, y + height * 0.25, width * 0.4, height * 0.05);
        ctx.fillRect(x + width * 0.3, y + height * 0.35, width * 0.4, height * 0.05);
        ctx.fillRect(x + width * 0.3, y + height * 0.45, width * 0.4, height * 0.05);
        
        // Extended wings (red)
        ctx.fillStyle = '#cc0000';
        ctx.fillRect(x, y + height * 0.35, width * 0.2, width * 0.4);
        ctx.fillRect(x + width * 0.8, y + height * 0.35, width * 0.2, height * 0.4);
        
        // Nose cone (yellow)
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(x + width * 0.5, y);
        ctx.lineTo(x + width * 0.35, y + height * 0.15);
        ctx.lineTo(x + width * 0.65, y + height * 0.15);
        ctx.closePath();
        ctx.fill();
        
        // Twin engines (red glow)
        ctx.fillStyle = '#ff6666';
        ctx.fillRect(x + width * 0.3, y + height * 0.9, width * 0.15, height * 0.1);
        ctx.fillRect(x + width * 0.55, y + height * 0.9, width * 0.15, height * 0.1);
        
        ctx.restore();
    } catch (error) {
        console.error('Error drawing Masked Rider Ship 2:', error);
    }
}

function drawMaskedRiderShip3(ctx, x, y, width, height) {
    try {
        if (!ctx) return;
        
        // Rider Gamma - Bulky, armored design
        ctx.save();
        
        // Heavy armor body (dark red)
        ctx.fillStyle = '#800000';
        ctx.fillRect(x + width * 0.2, y + height * 0.1, width * 0.6, height * 0.8);
        
        // Armor plating (red)
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x + width * 0.25, y + height * 0.15, width * 0.5, height * 0.1);
        ctx.fillRect(x + width * 0.25, y + height * 0.3, width * 0.5, height * 0.1);
        ctx.fillRect(x + width * 0.25, y + height * 0.45, width * 0.5, height * 0.1);
        ctx.fillRect(x + width * 0.25, y + height * 0.6, width * 0.5, height * 0.1);
        
        // Heavy wings (black with yellow trim)
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y + height * 0.3, width * 0.15, height * 0.5);
        ctx.fillRect(x + width * 0.85, y + height * 0.3, width * 0.15, height * 0.5);
        
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(x + width * 0.02, y + height * 0.32, width * 0.11, height * 0.03);
        ctx.fillRect(x + width * 0.87, y + height * 0.32, width * 0.11, height * 0.03);
        
        // Reinforced cockpit (bright yellow)
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(x + width * 0.35, y + height * 0.05, width * 0.3, height * 0.15);
        
        // Quad engines (bright red)
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(x + width * 0.25, y + height * 0.92, width * 0.1, height * 0.08);
        ctx.fillRect(x + width * 0.4, y + height * 0.92, width * 0.1, height * 0.08);
        ctx.fillRect(x + width * 0.5, y + height * 0.92, width * 0.1, height * 0.08);
        ctx.fillRect(x + width * 0.65, y + height * 0.92, width * 0.1, height * 0.08);
        
        ctx.restore();
    } catch (error) {
        console.error('Error drawing Masked Rider Ship 3:', error);
    }
}

// Ultraman Theme Spaceships
function drawUltramanShip1(ctx, x, y, width, height) {
    try {
        if (!ctx) return;
        
        // Ultra Fighter - Sleek blue and silver design
        ctx.save();
        
        // Main body (blue)
        ctx.fillStyle = '#0066ff';
        ctx.fillRect(x + width * 0.3, y + height * 0.2, width * 0.4, height * 0.6);
        
        // Silver accents
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(x + width * 0.32, y + height * 0.25, width * 0.36, height * 0.05);
        ctx.fillRect(x + width * 0.32, y + height * 0.4, width * 0.36, height * 0.05);
        ctx.fillRect(x + width * 0.32, y + height * 0.55, width * 0.36, height * 0.05);
        
        // Swept wings (light blue)
        ctx.fillStyle = '#3399ff';
        ctx.beginPath();
        ctx.moveTo(x, y + height * 0.6);
        ctx.lineTo(x + width * 0.25, y + height * 0.3);
        ctx.lineTo(x + width * 0.25, y + height * 0.7);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + width, y + height * 0.6);
        ctx.lineTo(x + width * 0.75, y + height * 0.3);
        ctx.lineTo(x + width * 0.75, y + height * 0.7);
        ctx.closePath();
        ctx.fill();
        
        // Cockpit (white)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + width * 0.4, y + height * 0.1, width * 0.2, height * 0.15);
        
        // Energy core (red)
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(x + width * 0.5, y + height * 0.5, width * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        // Engines (blue glow)
        ctx.fillStyle = '#66ccff';
        ctx.fillRect(x + width * 0.35, y + height * 0.85, width * 0.1, height * 0.15);
        ctx.fillRect(x + width * 0.55, y + height * 0.85, width * 0.1, height * 0.15);
        
        ctx.restore();
    } catch (error) {
        console.error('Error drawing Ultraman Ship 1:', error);
    }
}

function drawUltramanShip2(ctx, x, y, width, height) {
    try {
        if (!ctx) return;
        
        // Ultra Defender - Defensive design with shield generators
        ctx.save();
        
        // Main body (dark blue)
        ctx.fillStyle = '#003399';
        ctx.fillRect(x + width * 0.25, y + height * 0.15, width * 0.5, height * 0.7);
        
        // Shield generators (silver)
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(x + width * 0.1, y + height * 0.25, width * 0.1, height * 0.5);
        ctx.fillRect(x + width * 0.8, y + height * 0.25, width * 0.1, height * 0.5);
        
        // Shield energy (light blue)
        ctx.fillStyle = '#66ccff';
        ctx.fillRect(x + width * 0.12, y + height * 0.3, width * 0.06, height * 0.4);
        ctx.fillRect(x + width * 0.82, y + height * 0.3, width * 0.06, height * 0.4);
        
        // Central core (bright blue)
        ctx.fillStyle = '#0099ff';
        ctx.fillRect(x + width * 0.35, y + height * 0.25, width * 0.3, height * 0.5);
        
        // Energy lines (white)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + width * 0.37, y + height * 0.3, width * 0.26, height * 0.02);
        ctx.fillRect(x + width * 0.37, y + height * 0.4, width * 0.26, height * 0.02);
        ctx.fillRect(x + width * 0.37, y + height * 0.5, width * 0.26, height * 0.02);
        ctx.fillRect(x + width * 0.37, y + height * 0.6, width * 0.26, height * 0.02);
        
        // Cockpit (white)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + width * 0.4, y + height * 0.05, width * 0.2, height * 0.12);
        
        // Triple engines (blue)
        ctx.fillStyle = '#3399ff';
        ctx.fillRect(x + width * 0.3, y + height * 0.9, width * 0.1, height * 0.1);
        ctx.fillRect(x + width * 0.45, y + height * 0.9, width * 0.1, height * 0.1);
        ctx.fillRect(x + width * 0.6, y + height * 0.9, width * 0.1, height * 0.1);
        
        ctx.restore();
    } catch (error) {
        console.error('Error drawing Ultraman Ship 2:', error);
    }
}

function drawUltramanShip3(ctx, x, y, width, height) {
    try {
        if (!ctx) return;
        
        // Ultra Striker - Fast, angular design
        ctx.save();
        
        // Angular main body (bright blue)
        ctx.fillStyle = '#0099ff';
        ctx.beginPath();
        ctx.moveTo(x + width * 0.5, y);
        ctx.lineTo(x + width * 0.2, y + height * 0.3);
        ctx.lineTo(x + width * 0.3, y + height * 0.8);
        ctx.lineTo(x + width * 0.7, y + height * 0.8);
        ctx.lineTo(x + width * 0.8, y + height * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Wing blades (silver)
        ctx.fillStyle = '#cccccc';
        ctx.beginPath();
        ctx.moveTo(x, y + height * 0.4);
        ctx.lineTo(x + width * 0.15, y + height * 0.2);
        ctx.lineTo(x + width * 0.15, y + height * 0.6);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + width, y + height * 0.4);
        ctx.lineTo(x + width * 0.85, y + height * 0.2);
        ctx.lineTo(x + width * 0.85, y + height * 0.6);
        ctx.closePath();
        ctx.fill();
        
        // Energy channels (white)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + width * 0.35, y + height * 0.2, width * 0.3, height * 0.03);
        ctx.fillRect(x + width * 0.35, y + height * 0.35, width * 0.3, height * 0.03);
        ctx.fillRect(x + width * 0.35, y + height * 0.5, width * 0.3, height * 0.03);
        
        // Red energy core
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(x + width * 0.5, y + height * 0.4, width * 0.04, 0, Math.PI * 2);
        ctx.fill();
        
        // High-speed engines (bright blue glow)
        ctx.fillStyle = '#66ccff';
        ctx.fillRect(x + width * 0.32, y + height * 0.85, width * 0.12, height * 0.15);
        ctx.fillRect(x + width * 0.56, y + height * 0.85, width * 0.12, height * 0.15);
        
        ctx.restore();
    } catch (error) {
        console.error('Error drawing Ultraman Ship 3:', error);
    }
}

// Godzilla Theme Spaceships
function drawGodzillaShip1(ctx, x, y, width, height) {
    try {
        if (!ctx) return;
        
        // Kaiju Hunter - Organic, monster-inspired design
        ctx.save();
        
        // Main body (dark green)
        ctx.fillStyle = '#006600';
        ctx.fillRect(x + width * 0.25, y + height * 0.2, width * 0.5, height * 0.6);
        
        // Organic plating (green)
        ctx.fillStyle = '#00aa00';
        ctx.fillRect(x + width * 0.3, y + height * 0.25, width * 0.4, height * 0.1);
        ctx.fillRect(x + width * 0.28, y + height * 0.4, width * 0.44, height * 0.1);
        ctx.fillRect(x + width * 0.3, y + height * 0.55, width * 0.4, height * 0.1);
        
        // Claw-like wings (dark green with yellow claws)
        ctx.fillStyle = '#004400';
        ctx.fillRect(x, y + height * 0.35, width * 0.2, height * 0.4);
        ctx.fillRect(x + width * 0.8, y + height * 0.35, width * 0.2, height * 0.4);
        
        // Claws (yellow)
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(x + width * 0.02, y + height * 0.32, width * 0.16, height * 0.04);
        ctx.fillRect(x + width * 0.82, y + height * 0.32, width * 0.16, height * 0.04);
        
        // Monster eye cockpit (yellow glow)
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(x + width * 0.5, y + height * 0.15, width * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Spinal ridges (bright green)
        ctx.fillStyle = '#00ff00';
        for (let i = 0; i < 5; i++) {
            const ridgeY = y + height * (0.3 + i * 0.1);
            ctx.fillRect(x + width * 0.47, ridgeY, width * 0.06, height * 0.03);
        }
        
        // Bio-engines (green glow)
        ctx.fillStyle = '#66ff66';
        ctx.fillRect(x + width * 0.3, y + height * 0.85, width * 0.15, height * 0.15);
        ctx.fillRect(x + width * 0.55, y + height * 0.85, width * 0.15, height * 0.15);
        
        ctx.restore();
    } catch (error) {
        console.error('Error drawing Godzilla Ship 1:', error);
    }
}

function drawGodzillaShip2(ctx, x, y, width, height) {
    try {
        if (!ctx) return;
        
        // Monster Slayer - Armored with spikes
        ctx.save();
        
        // Heavy armor body (dark green)
        ctx.fillStyle = '#003300';
        ctx.fillRect(x + width * 0.2, y + height * 0.15, width * 0.6, height * 0.7);
        
        // Armor spikes (bright green)
        ctx.fillStyle = '#00cc00';
        for (let i = 0; i < 6; i++) {
            const spikeX = x + width * (0.25 + i * 0.08);
            const spikeY = y + height * 0.1;
            ctx.beginPath();
            ctx.moveTo(spikeX, spikeY);
            ctx.lineTo(spikeX + width * 0.02, spikeY + height * 0.08);
            ctx.lineTo(spikeX - width * 0.02, spikeY + height * 0.08);
            ctx.closePath();
            ctx.fill();
        }
        
        // Side armor plates (green)
        ctx.fillStyle = '#006600';
        ctx.fillRect(x + width * 0.05, y + height * 0.3, width * 0.1, height * 0.4);
        ctx.fillRect(x + width * 0.85, y + height * 0.3, width * 0.1, height * 0.4);
        
        // Armor details (yellow)
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(x + width * 0.25, y + height * 0.2, width * 0.5, height * 0.03);
        ctx.fillRect(x + width * 0.25, y + height * 0.35, width * 0.5, height * 0.03);
        ctx.fillRect(x + width * 0.25, y + height * 0.5, width * 0.5, height * 0.03);
        ctx.fillRect(x + width * 0.25, y + height * 0.65, width * 0.5, height * 0.03);
        
        // Monster head cockpit (yellow with green details)
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(x + width * 0.35, y + height * 0.05, width * 0.3, height * 0.12);
        ctx.fillStyle = '#00aa00';
        ctx.fillRect(x + width * 0.4, y + height * 0.07, width * 0.2, height * 0.08);
        
        // Quad bio-engines (bright green)
        ctx.fillStyle = '#66ff66';
        ctx.fillRect(x + width * 0.22, y + height * 0.9, width * 0.12, height * 0.1);
        ctx.fillRect(x + width * 0.38, y + height * 0.9, width * 0.12, height * 0.1);
        ctx.fillRect(x + width * 0.5, y + height * 0.9, width * 0.12, height * 0.1);
        ctx.fillRect(x + width * 0.66, y + height * 0.9, width * 0.12, height * 0.1);
        
        ctx.restore();
    } catch (error) {
        console.error('Error drawing Godzilla Ship 2:', error);
    }
}

function drawGodzillaShip3(ctx, x, y, width, height) {
    try {
        if (!ctx) return;
        
        // Titan Destroyer - Massive, intimidating design
        ctx.save();
        
        // Massive main body (very dark green)
        ctx.fillStyle = '#002200';
        ctx.fillRect(x + width * 0.15, y + height * 0.1, width * 0.7, height * 0.8);
        
        // Titan scales (layered green)
        ctx.fillStyle = '#004400';
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 4; col++) {
                const scaleX = x + width * (0.2 + col * 0.15);
                const scaleY = y + height * (0.15 + row * 0.1);
                ctx.fillRect(scaleX, scaleY, width * 0.12, height * 0.08);
            }
        }
        
        // Scale highlights (bright green)
        ctx.fillStyle = '#00aa00';
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 4; col++) {
                const scaleX = x + width * (0.2 + col * 0.15);
                const scaleY = y + height * (0.15 + row * 0.1);
                ctx.fillRect(scaleX, scaleY, width * 0.12, height * 0.02);
            }
        }
        
        // Massive claws (yellow)
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(x, y + height * 0.4);
        ctx.lineTo(x + width * 0.1, y + height * 0.2);
        ctx.lineTo(x + width * 0.1, y + height * 0.6);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + width, y + height * 0.4);
        ctx.lineTo(x + width * 0.9, y + height * 0.2);
        ctx.lineTo(x + width * 0.9, y + height * 0.6);
        ctx.closePath();
        ctx.fill();
        
        // Titan eyes (glowing yellow)
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(x + width * 0.4, y + height * 0.08, width * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + width * 0.6, y + height * 0.08, width * 0.03, 0, Math.PI * 2);
        ctx.fill();
        
        // Massive bio-engines (very bright green)
        ctx.fillStyle = '#66ff66';
        ctx.fillRect(x + width * 0.2, y + height * 0.92, width * 0.15, height * 0.08);
        ctx.fillRect(x + width * 0.4, y + height * 0.92, width * 0.2, height * 0.08);
        ctx.fillRect(x + width * 0.65, y + height * 0.92, width * 0.15, height * 0.08);
        
        // Add glow effect for intimidation
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#002200';
        ctx.fillRect(x + width * 0.15, y + height * 0.1, width * 0.7, height * 0.8);
        
        ctx.restore();
    } catch (error) {
        console.error('Error drawing Godzilla Ship 3:', error);
    }
}

// ===== UTILITY FUNCTIONS =====

// Create explosion particles
function createExplosion(x, y) {
    try {
        const particleCount = GAME_CONFIG.EXPLOSION_PARTICLES;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(x, y));
        }
    } catch (error) {
        console.error('Explosion creation error:', error);
    }
}

// ===== INPUT AND MOVEMENT =====

// Handle player input
function handleInput() {
    try {
        if (!canvas || !player) return;
        
        const canvasWidth = canvas.width || GAME_CONFIG.CANVAS_WIDTH;
        const canvasHeight = canvas.height || GAME_CONFIG.CANVAS_HEIGHT;
        
        if (keys['ArrowLeft'] && player.x > 0) {
            player.x -= player.speed;
        }
        if (keys['ArrowRight'] && player.x < canvasWidth - player.width) {
            player.x += player.speed;
        }
        if (keys['ArrowUp'] && player.y > 0) {
            player.y -= player.speed;
        }
        if (keys['ArrowDown'] && player.y < canvasHeight - player.height) {
            player.y += player.speed;
        }
        if (keys['Space']) {
            shootBullet();
            keys['Space'] = false; // Prevent rapid fire
        }
    } catch (error) {
        console.error('Input handling error:', error);
    }
}

// Shoot bullet
let lastShot = 0;
function shootBullet() {
    try {
        const now = Date.now();
        if (now - lastShot > GAME_CONFIG.SHOOT_COOLDOWN) {
            const bulletX = player.x + player.width / 2 - 2;
            const bulletY = player.y;
            bullets.push(new Bullet(bulletX, bulletY));
            lastShot = now;
        }
    } catch (error) {
        console.error('Bullet shooting error:', error);
    }
}

// ===== ENEMY MANAGEMENT =====

// Spawn enemies
function spawnEnemy() {
    try {
        const now = Date.now();
        if (now - lastEnemySpawn > enemySpawnRate) {
            enemies.push(new Enemy());
            lastEnemySpawn = now;
            
            // Increase difficulty over time
            if (enemySpawnRate > GAME_CONFIG.MIN_ENEMY_SPAWN_RATE) {
                enemySpawnRate -= GAME_CONFIG.SPAWN_RATE_DECREASE;
            }
        }
    } catch (error) {
        console.error('Enemy spawning error:', error);
    }
}

// ===== COLLISION DETECTION =====

// Check collisions
function checkCollisions() {
    try {
        // Bullet-enemy collisions
        for (let i = bullets.length - 1; i >= 0; i--) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (bullets[i] && enemies[j] &&
                    bullets[i].x < enemies[j].x + enemies[j].width &&
                    bullets[i].x + bullets[i].width > enemies[j].x &&
                    bullets[i].y < enemies[j].y + enemies[j].height &&
                    bullets[i].y + bullets[i].height > enemies[j].y) {
                    
                    // Create explosion
                    createExplosion(enemies[j].x + enemies[j].width / 2, enemies[j].y + enemies[j].height / 2);
                    
                    // Remove bullet and enemy
                    bullets.splice(i, 1);
                    enemies.splice(j, 1);
                    
                    // Increase score
                    updateScore(10);
                    break;
                }
            }
        }

        // Player-enemy collisions
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (enemies[i] &&
                enemies[i].x < player.x + player.width &&
                enemies[i].x + enemies[i].width > player.x &&
                enemies[i].y < player.y + player.height &&
                enemies[i].y + enemies[i].height > player.y) {
                
                // Create explosion
                createExplosion(player.x + player.width / 2, player.y + player.height / 2);
                
                // Remove enemy and reduce lives
                enemies.splice(i, 1);
                updateLives(-1);
                
                if (lives <= 0) {
                    gameOver();
                }
            }
        }
    } catch (error) {
        console.error('Collision detection error:', error);
    }
}

// Update score with error handling
function updateScore(points) {
    try {
        score += points;
        if (scoreElement) {
            scoreElement.textContent = score;
        }
    } catch (error) {
        console.error('Score update error:', error);
    }
}

// Update lives with error handling
function updateLives(change) {
    try {
        lives += change;
        if (livesElement) {
            livesElement.textContent = lives;
        }
    } catch (error) {
        console.error('Lives update error:', error);
    }
}

// ===== GAME UPDATE LOGIC =====

// Update game objects
function update() {
    try {
        if (!gameRunning) return;

        handleInput();
        spawnEnemy();

        // Update bullets
        updateBullets();
        
        // Update enemies
        updateEnemies();
        
        // Update particles
        updateParticles();

        checkCollisions();
    } catch (error) {
        console.error('Game update error:', error);
    }
}

// Update bullets with bounds checking
function updateBullets() {
    try {
        for (let i = bullets.length - 1; i >= 0; i--) {
            if (bullets[i]) {
                bullets[i].update();
                if (bullets[i].y < 0) {
                    bullets.splice(i, 1);
                }
            }
        }
    } catch (error) {
        console.error('Bullet update error:', error);
    }
}

// Update enemies with bounds checking
function updateEnemies() {
    try {
        const canvasHeight = canvas ? canvas.height : GAME_CONFIG.CANVAS_HEIGHT;
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (enemies[i]) {
                enemies[i].update();
                if (enemies[i].y > canvasHeight) {
                    enemies.splice(i, 1);
                }
            }
        }
    } catch (error) {
        console.error('Enemy update error:', error);
    }
}

// Update particles with lifecycle management
function updateParticles() {
    try {
        for (let i = particles.length - 1; i >= 0; i--) {
            if (particles[i]) {
                particles[i].update();
                if (particles[i].life <= 0) {
                    particles.splice(i, 1);
                }
            }
        }
    } catch (error) {
        console.error('Particle update error:', error);
    }
}

// ===== RENDERING =====

// Draw everything
function draw() {
    try {
        if (!ctx || !canvas) return;
        
        // Clear canvas with fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw stars background
        drawStars();

        // Draw player
        drawPlayer();

        // Draw game objects
        drawGameObjects();
    } catch (error) {
        console.error('Draw error:', error);
    }
}

// Draw player with error handling
function drawPlayer() {
    try {
        if (!ctx || !player) return;
        
        // Use theme-based spaceship sprite if available
        if (themeManager && themeManager.isReady()) {
            const selectedSpaceship = themeManager.getSelectedSpaceship();
            if (selectedSpaceship && selectedSpaceship.sprite) {
                // Get the sprite drawing function
                const spriteFunction = window[selectedSpaceship.sprite];
                if (typeof spriteFunction === 'function') {
                    spriteFunction(ctx, player.x, player.y, player.width, player.height);
                    return;
                }
            }
        }
        
        // Fallback to basic rectangle if no theme sprite available
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // Add glow to player
        ctx.shadowColor = player.color;
        ctx.shadowBlur = 15;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.shadowBlur = 0;
    } catch (error) {
        console.error('Player draw error:', error);
    }
}

// Draw all game objects
function drawGameObjects() {
    try {
        // Draw bullets
        bullets.forEach(bullet => {
            if (bullet && bullet.draw) {
                bullet.draw();
            }
        });

        // Draw enemies
        enemies.forEach(enemy => {
            if (enemy && enemy.draw) {
                enemy.draw();
            }
        });

        // Draw particles
        particles.forEach(particle => {
            if (particle && particle.draw) {
                particle.draw();
            }
        });
    } catch (error) {
        console.error('Game objects draw error:', error);
    }
}

// ===== BACKGROUND EFFECTS =====

// Draw animated stars
let stars = [];

function initStars() {
    try {
        stars = [];
        const canvasWidth = canvas ? canvas.width : GAME_CONFIG.CANVAS_WIDTH;
        const canvasHeight = canvas ? canvas.height : GAME_CONFIG.CANVAS_HEIGHT;
        
        for (let i = 0; i < GAME_CONFIG.STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * canvasWidth,
                y: Math.random() * canvasHeight,
                speed: Math.random() * 2 + 0.5,
                size: Math.random() * 2
            });
        }
    } catch (error) {
        console.error('Star initialization error:', error);
    }
}

function drawStars() {
    try {
        if (!ctx || !canvas) return;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        stars.forEach(star => {
            if (star) {
                ctx.fillRect(star.x, star.y, star.size, star.size);
                star.y += star.speed;
                if (star.y > canvasHeight) {
                    star.y = 0;
                    star.x = Math.random() * canvasWidth;
                }
            }
        });
    } catch (error) {
        console.error('Star drawing error:', error);
    }
}

// ===== LEGACY GAME STATE MANAGEMENT =====
// These functions are kept for backward compatibility but are now handled by the state system

// Game over (legacy - now handled by GameOverState)
function gameOver() {
    try {
        if (gameStateManager && gameStateManager.isReady()) {
            gameStateManager.setState('GameOverState');
        } else {
            // Fallback to original behavior
            gameRunning = false;
            if (finalScoreElement) {
                finalScoreElement.textContent = score;
            }
            if (gameOverElement) {
                gameOverElement.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Game over error:', error);
    }
}

// Restart game (legacy - now handled by GameState.enter())
function restartGame() {
    try {
        if (gameStateManager && gameStateManager.isReady()) {
            gameStateManager.setState('GameState');
        } else {
            // Fallback to original behavior
            gameRunning = true;
            score = 0;
            lives = 3;
            bullets = [];
            enemies = [];
            particles = [];
            lastEnemySpawn = 0;
            enemySpawnRate = GAME_CONFIG.INITIAL_ENEMY_SPAWN_RATE;
            
            // Reset player position
            if (player && player.reset) {
                player.reset();
            }
            
            // Update UI elements
            updateScore(0);
            updateLives(0);
            
            if (gameOverElement) {
                gameOverElement.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Game restart error:', error);
    }
}

// ===== GAME LOOP =====

// Game loop
function gameLoop() {
    try {
        // Use state manager if available, otherwise fall back to original logic
        if (gameStateManager && gameStateManager.isReady()) {
            gameStateManager.update();
            gameStateManager.render();
        } else {
            // Fallback to original game logic
            update();
            draw();
        }
        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('Game loop error:', error);
        // Continue the loop even if there's an error
        requestAnimationFrame(gameLoop);
    }
}

// ===== GAME INITIALIZATION =====

// Initialize state manager
function initializeStateManager() {
    try {
        // Create state manager instance
        gameStateManager = new GameStateManager();
        
        // Create and register all states
        const introState = new IntroState();
        const characterSelectState = new CharacterSelectState();
        const gameState = new GameState();
        const pauseState = new PauseState();
        const gameOverState = new GameOverState();
        
        gameStateManager.addState('IntroState', introState);
        gameStateManager.addState('CharacterSelectState', characterSelectState);
        gameStateManager.addState('GameState', gameState);
        gameStateManager.addState('PauseState', pauseState);
        gameStateManager.addState('GameOverState', gameOverState);
        
        // Initialize the state manager
        if (!gameStateManager.initialize()) {
            throw new Error('Failed to initialize GameStateManager');
        }
        
        // Set initial state
        if (!gameStateManager.setState('IntroState')) {
            throw new Error('Failed to set initial state');
        }
        
        console.log('State manager initialized successfully');
        return true;
    } catch (error) {
        console.error('State manager initialization failed:', error);
        return false;
    }
}

// Initialize theme manager
function initializeThemeManager() {
    try {
        // Create theme manager instance
        themeManager = new ThemeManager();
        
        // Initialize the theme manager with default theme
        if (!themeManager.initialize()) {
            throw new Error('Failed to initialize ThemeManager');
        }
        
        // Set default spaceship for the default theme
        const spaceshipOptions = themeManager.getSpaceshipOptions();
        if (spaceshipOptions.length > 0) {
            themeManager.setSelectedSpaceship(spaceshipOptions[0].id);
        }
        
        console.log('Theme manager initialized successfully');
        return true;
    } catch (error) {
        console.error('Theme manager initialization failed:', error);
        return false;
    }
}

// Initialize and start game
function initializeGame() {
    try {
        // Initialize DOM elements
        if (!initializeDOM()) {
            console.error('Failed to initialize DOM elements');
            return false;
        }
        
        // Initialize input handlers
        if (!initializeInputHandlers()) {
            console.error('Failed to initialize input handlers');
            return false;
        }
        
        // Initialize game elements
        initStars();
        
        // Initialize state manager
        if (!initializeStateManager()) {
            console.error('Failed to initialize state manager');
            return false;
        }
        
        // Initialize theme manager
        if (!initializeThemeManager()) {
            console.error('Failed to initialize theme manager');
            return false;
        }
        
        // Start game loop
        gameLoop();
        
        console.log('Game initialized successfully');
        return true;
    } catch (error) {
        console.error('Game initialization failed:', error);
        return false;
    }
}

// Start the game when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}