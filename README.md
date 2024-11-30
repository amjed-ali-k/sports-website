# 🏆 College Sports Event Manager

A comprehensive platform for managing college-level sports, games, and arts events. Built with modern web technologies and optimized for mobile-first experience.

## 📱 Key Features

- 📊 Real-time sports scores and results tracking
- 🎯 Individual and group event management
- 🏃 Support for multiple event categories:
  - Athletics (Track & Field)
  - Team Sports
  - Arts & Cultural Events
- 📜 Automated certificate generation
- 👥 Participant management with unique chest numbers
- 📊 Department-wise scoring and tracking
- 📱 Mobile-optimized interface

## 🏗️ Project Structure

The project is organized as a monorepo using Turborepo:

### 📱 Apps

- `apps/api`: Hono-based Backend API server (Cloudflare compatible)
- `apps/admin`: Admin dashboard for event management
- `apps/mobile`: Mobile-first frontend for participants and viewers

### 📦 Packages

- `packages/database`: Shared database schema and utilities (Cloudflare D1 + Drizzle)

## 🛠️ Tech Stack

- **Frontend**: ⚛️ Vite + React + shadcn/ui
- **Backend**: ☁️ Hono (Cloudflare-optimized)
- **Database**: 💾 Cloudflare D1 + Drizzle ORM
- **Infrastructure**: ☁️ Cloudflare Platform
- **Build System**: 🏎️ Turborepo

## 🎯 Supported Events

### 🏃 Athletics
- Individual Track Events (100m to 10000m)
- Field Events (Long Jump, High Jump, etc.)
- Relay Events (4x100m, 4x400m)

### ⚽ Games
- Team Sports (Football, Cricket, etc.)
- Individual Sports (Badminton, Table Tennis)

### 🎨 Arts
- Cultural Events
- Competitions

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone [repository-url]
cd sports-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create `.env` files in the respective app directories following the example templates.

4. Start development servers:
```bash
# Start API server
npm run dev --workspace=api

# Start admin dashboard
npm run dev --workspace=admin

# Start mobile frontend
npm run dev --workspace=mobile
```

## 💻 Development

- Mobile frontend: `http://localhost:3000` (mobile-optimized)
- Admin dashboard: `http://localhost:3001`
- API server: `http://localhost:8000`

## 🗄️ Database

Uses Cloudflare D1 with Drizzle ORM for:
- Participant management
- Event results tracking
- Certificate generation
- Score calculations

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## 📄 License

[Your License Here]

## 👥 Admin Roles

- 👑 Controller: Full access to results and management
- 👨‍💼 Manager: Can manage participants and enrollments
- 👤 Rep: Basic participant management
