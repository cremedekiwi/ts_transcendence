# KingPong 🏓

A full-stack multiplayer Pong game application with real-time gameplay, tournaments, and social features.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [WebSocket Events](#websocket-events)

## 🎮 Overview

KingPong is a modern web-based Pong game that allows players to compete in real-time matches, organize tournaments, and interact with other players through chat and friend systems. The application supports multiple languages and offers both local and online multiplayer modes.

## ✨ Features

### Game Modes
- **Local Multiplayer**: Play against another player on the same device
- **Online Multiplayer**: Real-time matches against other players
- **Bot Players**: Practice against AI opponents (Easy, Medium, Hard, Extreme)
- **Tournament Mode**: 4-player bracket tournaments

### Customization
- Adjustable game physics (ball, paddle, speed, acceleration)
- Multiple language support (English, French, Chinese, Tamil, Arabic)
- Custom avatars and usernames

### Social Features
- Real-time chat system
- Friend management
- User blocking functionality
- Player statistics and match history
- User profiles with performance metrics

### Authentication
- Standard username/password authentication
- Google OAuth integration
- JWT-based session management

## 🛠 Tech Stack

### Frontend
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Chart.js**: Data visualization for statistics
- **WebSocket**: Real-time communication

### Backend
- **Node.js**: JavaScript runtime
- **Fastify**: Fast and low overhead web framework
- **SQLite**: Lightweight database with better-sqlite3
- **WebSocket**: Real-time game state synchronization
- **JWT**: Secure authentication

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **HTTPS**: Self-signed SSL certificates for development

## 📦 Prerequisites

- Docker and Docker Compose
- Node.js 22+ (if running without Docker)
- Git

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ts_transcendence
   ```

2. **Set up environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URI=https://localhost:3000/auth/google/callback
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Build and run with Docker**
   ```bash
   make dev
   ```

   Or manually:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: https://localhost:3000
   - Backend API: https://localhost:8080

## 💻 Development

### Available Make Commands

```bash
make dev        # Start development environment
make build      # Build Docker images
make up         # Start containers in detached mode
make down       # Stop containers
make clean      # Clean database and stop containers
make fclean     # Full clean including node_modules and volumes
make re         # Clean and rebuild everything
```

### Manual Development Setup

If you prefer to run without Docker:

**Frontend:**
```bash
cd client
npm install
npm run dev
```

**Backend:**
```bash
cd server
npm install
npm run dev
```

## 🏗 Architecture

### Project Structure
```
ts_transcendence/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── classes/       # Core application classes
│   │   ├── components/    # Reusable UI components
│   │   ├── content/       # Page content and views
│   │   ├── types/         # TypeScript type definitions
│   │   ├── translations/  # i18n translations
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── server/                 # Backend application
│   ├── src/
│   │   ├── modules/       # Feature modules
│   │   │   ├── auth/      # Authentication logic
│   │   │   ├── users/     # User management
│   │   │   ├── Game/      # Game logic
│   │   │   ├── matches/   # Match history
│   │   │   └── websockets/# WebSocket handlers
│   │   ├── config/        # Server configuration
│   │   └── utils/         # Utility functions
│   └── public/            # User avatars
└── docker-compose.yml     # Docker configuration
```

### Key Components

#### Frontend Architecture
- **App Class**: Central application controller
- **Router**: Client-side routing system
- **WebSocketClient**: Real-time server communication
- **Game Engine**: Canvas-based game renderer
- **Cache**: Client-side data management

#### Backend Architecture
- **Fastify Server**: HTTP and WebSocket server
- **Game Manager**: Centralized game state management
- **WebSocket Manager**: Client connection handling
- **SQLite Database**: User data, matches, relationships

## 📡 API Documentation

### Authentication Endpoints

```http
POST   /auth/register      # Create new account
POST   /auth/login         # Login with credentials
POST   /auth/google/token  # Google OAuth login
GET    /auth/me           # Get current user
POST   /auth/logout       # Logout user
```

### User Management

```http
GET    /users/all         # Get all users
GET    /users/list        # Get users with relationships
GET    /users/:id         # Get specific user
POST   /users/update/username     # Update username
POST   /users/update/avatar       # Update avatar
POST   /users/update/password     # Update password
POST   /users/update/relationship # Manage friends/blocks
DELETE /users/delete/:id          # Delete account
```

### Game Management

```http
GET    /game/state        # Get current game state
POST   /game/invite       # Send game invitation
POST   /game/join         # Accept invitation
POST   /game/decline      # Decline invitation
POST   /game/ready        # Toggle ready state
POST   /game/keyEvent     # Send keyboard input
```

### Match History

```http
GET    /matches/all       # Get all matches
GET    /matches/:username # Get user's matches
POST   /matches/create    # Record new match
```

## 🔌 WebSocket Events

### Client to Server
```javascript
connect       # Authenticate WebSocket connection
ping          # Keep-alive ping
logout        # Disconnect user
chat          # Send chat message
invite        # Send game invitation
invite-response # Accept/decline invitation
ready         # Toggle ready state
key-event     # Send keyboard input
cancel-invite # Cancel pending invitation
cancel-game   # Leave active game
```

### Server to Client
```javascript
connect       # User connected notification
logout        # User disconnected notification
chat          # Incoming chat message
invite        # Game invitation received
invite-response # Invitation response
gameState     # Game state update
cancel-invite # Invitation cancelled
cancel-game   # Game cancelled
```

## 🎮 Game Controls

### Player 1 (Left Paddle)
- **W**: Move up
- **S**: Move down

### Player 2 (Right Paddle)
- **↑**: Move up
- **↓**: Move down

## 🌐 Language Support

The application supports multiple languages:
- 🇬🇧 English
- 🇫🇷 French
- 🇨🇳 Chinese
- 🇱🇰 Tamil
- 🇲🇦 Arabic

Language can be changed by clicking the flag icon in the navigation bar.

## 🧪 Testing

### Dummy Data
To populate the database with test data:
```http
GET /dummy
```

This creates several test users (Kiwi, Nabil, David, Coco, Zoro, Chopper, Roger) with random match history.
