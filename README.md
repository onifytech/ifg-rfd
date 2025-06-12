# 📋 RFD Index System

> **Request for Discussion (RFD) Index System with Google Docs Integration**

A centralized system for discovering, tracking, and managing Request for Discussion (RFD) documents stored in Google Docs, enabling teams to efficiently collaborate on technical decisions and proposals.

## ✨ Features

- 🔍 **RFD Discovery & Indexing** - Automatically scan and index RFD documents from Google Drive
- 📝 **Template-Based Creation** - Create new RFDs using predefined templates with smart placeholder replacement
- 🔄 **Workflow Management** - Track RFD lifecycle from Draft → Review → Decision → Archived
- 👥 **Collaborative Reviews** - Comment threads and endorsement voting system
- 🏷️ **Smart Organization** - Tag-based categorization and powerful search capabilities
- 🔐 **Secure Access** - Google OAuth integration with proper permission management
- 📊 **Real-time Tracking** - Status history and activity monitoring

## 🛠️ Tech Stack

- **Frontend**: SvelteKit 2.x + TypeScript + TailwindCSS 4.x
- **Backend**: SvelteKit API routes with Drizzle ORM
- **Database**: PostgreSQL with comprehensive RFD schema
- **Authentication**: Lucia Auth with Google OAuth
- **External APIs**: Google Drive API & Google Docs API

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Google Cloud Platform project with Drive & Docs APIs enabled

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ifg-rfd

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Google credentials and database settings

# Start the database
pnpm run db:start

# Push database schema
pnpm run db:push

# Start development server
pnpm run dev
```

## 📁 Project Structure

```
src/
├── routes/
│   ├── api/          # API endpoints
│   └── (app)/        # Application pages
├── lib/
│   ├── components/   # Svelte components
│   ├── server/       # Server-side utilities
│   └── types/        # TypeScript definitions
└── app.html          # HTML template
```

## 🔧 Development Commands

### Database Operations

```bash
pnpm run db:start     # Start PostgreSQL via Docker
pnpm run db:push      # Push schema changes
pnpm run db:migrate   # Run migrations
pnpm run db:studio    # Open Drizzle Studio
```

### Development

```bash
pnpm run dev          # Development server
pnpm run build        # Production build
pnpm run preview      # Preview build
pnpm run check        # Type checking
```

### Code Quality

```bash
pnpm run lint         # ESLint + Prettier
pnpm run format       # Format code
```

## 🏗️ Architecture

### Authentication Flow

- **Dual Authentication**: User OAuth tokens + Service account for centralized RFD storage
- **Permission Management**: Automatic document sharing with creators, team members, and domain access
- **Secure Integration**: Lucia Auth session management with Google OAuth

### Database Design

- **Core Tables**: Users, sessions, RFDs with Google Docs integration
- **Workflow Tracking**: Status history and lifecycle management
- **Collaboration**: Comment threads and endorsement voting
- **Organization**: Tag system for categorization

### Design System

- **Vertical Rhythm**: Consistent baseline grid for typography and spacing
- **Component Library**: Reusable Svelte components following design guidelines
- **Responsive Design**: Mobile-first approach with TailwindCSS

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on how to:

- Report bugs and request features
- Submit pull requests
- Follow our coding standards
- Set up your development environment

## ❤ Thanks to all contributors

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<a href="https://github.com/onifytech/ifg-rfd/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=onifytech/ifg-rfd" />
</a>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Project Documentation](./CLAUDE.md)
- [API Documentation](#) <!-- Add when available -->
- [Deployment Guide](#) <!-- Add when available -->

---

<div align="center">
  <strong>Built with ❤️ by the Onify Team</strong>
</div>
