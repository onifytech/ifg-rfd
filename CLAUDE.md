# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## RFD Index System with Google Docs Integration

Build a centralized index system for Request for Discussion (RFD) documents stored in Google Docs, allowing teams to discover, track, and manage RFDs efficiently.

## Development Commands

### Database Operations

- `pnpm run db:start` - Start PostgreSQL database via Docker Compose
- `pnpm run db:push` - Push schema changes to database using Drizzle
- `pnpm run db:migrate` - Run database migrations
- `pnpm run db:studio` - Open Drizzle Studio for database management

### Development

- `pnpm run dev` - Start development server on localhost:5173
- `pnpm run build` - Build production version
- `pnpm run preview` - Preview production build
- `pnpm run check` - Run Svelte type checking
- `pnpm run check:watch` - Run type checking in watch mode

### Code Quality

- `pnpm run lint` - Run ESLint and Prettier checks
- `pnpm run format` - Format code with Prettier

## Architecture Overview

### Tech Stack

- **Frontend**: SvelteKit 2.x with TypeScript and TailwindCSS 4.x
- **Backend**: SvelteKit API routes with Drizzle ORM
- **Database**: PostgreSQL with comprehensive RFD schema
- **Authentication**: Lucia Auth with Google OAuth integration
- **External APIs**: Google Drive API and Google Docs API via googleapis

### Design System

- **Vertical Rhythm**: All typography, spacing, and layout elements follow a consistent vertical rhythm baseline grid
- **Typography Scale**: Font sizes and line heights are mathematically related to maintain rhythm
- **Spacing System**: Margins, padding, and component spacing align to the baseline grid
- **Layout Grid**: Component layouts respect the vertical rhythm for consistent visual flow

### Database Schema

The application uses a comprehensive PostgreSQL schema designed for RFD lifecycle management:

- **Core Tables**: `user`, `session`, `rfd` with Google Docs integration
- **Workflow**: `rfd_status_history` tracks status changes (draft → review → approved/rejected → archived)
- **Collaboration**: `rfd_comment` with threaded discussions, `rfd_endorsement` for approval voting
- **Organization**: `rfd_tag` and `rfd_tag_relation` for categorization

### Authentication Flow

- Google OAuth for user authentication using Lucia Auth
- Dual authentication system:
  - User OAuth tokens for template access and user operations
  - Service account for RFD document creation and management in centralized Google Drive

### Google Drive Integration

The `GoogleDriveService` class handles two authentication modes:

1. **Service Account Mode** (for RFD storage):

   - Creates RFDs in centralized service account Drive
   - Manages document permissions (creator gets editor, domain gets commenter)
   - Handles template-based document creation with placeholder replacement
   - Supports domain-wide delegation to impersonate users for proper ownership

2. **User OAuth Mode** (for template access):
   - Allows users to access their own templates
   - Fallback for read operations

#### Domain-Wide Delegation Setup

To enable the service account to impersonate users in your Google Workspace:

1. In Google Admin Console, go to Security > API Controls > Domain-wide Delegation
2. Add your service account's client ID with these OAuth scopes:
   - https://www.googleapis.com/auth/drive
   - https://www.googleapis.com/auth/documents
3. The service account will then be able to impersonate users to create documents on their behalf

### Key Features Implementation

- **RFD Creation**: Template-based with placeholder replacement (`{{TITLE}}`, `{{AUTHOR}}`, `{{DATE}}`, etc.)
- **Permission Management**: Automatic sharing with creator, team members, and domain-wide comment access
- **Status Tracking**: Full lifecycle tracking with history table
- **Endorsement System**: Users can endorse RFDs with vote counting

## Environment Configuration

Required environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_CLIENT_ID/SECRET` - OAuth credentials for user authentication
- `GOOGLE_SERVICE_ACCOUNT_KEY` - JSON key for service account (RFD storage)
- `GOOGLE_DRIVE_RFD_FOLDER_ID` - Centralized folder for RFD storage
- `GOOGLE_RFD_TEAM_EMAILS` - Comma-separated emails for editor access
- `ORIGIN` - Application URL for OAuth callbacks

## File Structure Conventions

### API Routes (`src/routes/api/`)

- Follow SvelteKit API conventions with `+server.ts` files
- Authentication required for all RFD operations
- RESTful endpoints: GET (list), POST (create), PUT (endorse/unendorse)

### Database Layer (`src/lib/server/db/`)

- `schema.ts` - Drizzle ORM schema definitions
- `index.ts` - Database connection and query helpers

### Services (`src/lib/server/`)

- `auth.ts` - Lucia Auth configuration with Google OAuth
- `google-drive.ts` - Google Drive/Docs API integration service

### Components (`src/lib/components/`)

- Svelte components following SvelteKit 5.x conventions
- Focus on RFD creation, listing, and management UI
- All components must maintain vertical rhythm through consistent spacing and typography

## Development Workflow

1. **Database Setup**: Run `pnpm run db:start` to start PostgreSQL
2. **Schema Changes**: Modify `schema.ts`, then run `pnpm run db:generate && pnpm db:migrate`
3. **Environment**: Copy `.env.example` to `.env` and configure Google credentials
4. **Development**: Run `pnpm run dev` for hot-reload development server

## Design Guidelines

### Vertical Rhythm Implementation

When creating or modifying UI components, ensure adherence to vertical rhythm principles:

1. **Baseline Grid**: Use a consistent baseline unit (typically 24px or 1.5rem) for all vertical spacing
2. **Typography Hierarchy**:
   - Font sizes should be multiples or fractions of the baseline unit
   - Line heights must align to the baseline grid
   - Maintain consistent spacing between text elements
3. **Component Spacing**:
   - Use baseline multiples for margins and padding
   - Ensure buttons, form elements, and cards align to the grid
   - Component heights should be multiples of the baseline unit
4. **Layout Consistency**:
   - Section spacing follows the baseline grid
   - Navigation and content areas maintain rhythm
   - Consistent spacing between UI elements creates visual harmony

### TailwindCSS Configuration

- Configure custom spacing scale based on baseline units
- Create utility classes for common vertical rhythm patterns
- Use consistent line-height values across typography classes

## Core Features Progress

### 1. RFD Discovery & Indexing

- [ ] Connect to Google Drive API to scan for RFD documents
- [ ] Auto-detect RFD documents by naming convention or folder structure
- [ ] Extract metadata from Google Docs (title, author, creation date, last modified)
- [ ] Parse RFD status from document content (Draft, Review, Approved, Rejected, etc.)

### 2. RFD Database Schema

- [x] Design database schema for RFD metadata
- [x] Store: ID, title, author, status, Google Doc URL, tags, summary
- [x] Track revision history and status changes
- [x] Index for fast searching (implemented with Drizzle ORM)

### 3. Web Interface

- [x] RFD listing page with search and filters (basic implementation)
- [x] RFD creation interface with Google Docs integration
- [x] Authentication-based access control
- [ ] Individual RFD detail pages
- [ ] Status-based views (active, approved, archived)
- [ ] Author and tag-based filtering

### 4. Google Docs Integration

- [x] OAuth integration for Google Drive access
- [x] Service account integration for RFD document management
- [x] Template-based RFD creation with placeholder replacement
- [x] Document permissions and access control
- [x] Automatic sharing with team members and domain access
- [ ] Sync RFD content and metadata from existing Google Docs
- [ ] Real-time updates when documents change (webhooks/polling)

### 5. RFD Workflow Management

- [x] Status tracking (Draft → Review → Decision → Archived) with history
- [x] Comment and discussion threads (database schema)
- [x] Endorsement/approval voting system
- [ ] Email notifications for status changes

### 6. Search & Navigation

- [x] Basic RFD listing and display
- [ ] Full-text search across RFD titles and summaries
- [x] Tag-based categorization (database schema)
- [ ] Recently updated RFDs
- [ ] Popular/frequently accessed RFDs

## Technical Implementation Progress

### Backend

- [x] Google Drive API integration (GoogleDriveService)
- [x] Database design and migrations (Drizzle schema)
- [x] API endpoints for RFD CRUD operations
- [x] Authentication with Lucia Auth and Google OAuth
- [ ] Background jobs for syncing with Google Docs

### Frontend

- [x] Basic RFD creation interface
- [x] Authentication flow (login/logout)
- [x] RFD listing page (basic)
- [ ] Enhanced RFD index page with sorting/filtering
- [ ] Search interface
- [ ] Individual RFD detail pages
- [ ] Admin interface for managing RFDs

### Authentication

- [x] Google OAuth integration with Drive permissions
- [x] Dual authentication system (user OAuth + service account)
- [x] Integration with Google Docs sharing permissions
- [x] Session-based authentication with Lucia Auth
- [ ] Role-based access control beyond basic authentication

## Next Steps

1. Set up Google Drive API credentials
2. Design database schema for RFDs
3. Implement basic Google Docs synchronization
4. Build RFD listing interface
5. Add search and filtering capabilities
