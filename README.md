# CaseHistory - Psychology Case Intake System

A secure, web-based psychology case intake application that replaces paper-based forms with a modern digital system. Built with React, TypeScript, Node.js, Express, and SQLite.

## Features

- **Role-Based Access Control**: Separate interfaces for clients and providers
- **Secure Authentication**: JWT-based auth with httpOnly cookies
- **Digital Intake Forms**: Multi-section forms for client information collection
- **Case History Management**: Providers can view and add notes to client cases
- **Client Dashboard**: Clients can submit and view their own intake forms
- **Provider Dashboard**: Providers can view all assigned cases

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM with SQLite
- JWT authentication
- bcrypt for password hashing
- express-validator for input validation

## Project Structure

```
CaseHistory/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.ts            # Authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.ts            # Auth routes (signup, login, logout)
│   │   │   └── caseHistory.ts     # Case history and intake form routes
│   │   ├── utils/
│   │   │   └── validation.ts      # Input validation middleware
│   │   ├── types.ts               # TypeScript type definitions
│   │   └── server.ts              # Express server setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts          # API client functions
│   │   ├── components/
│   │   │   └── Layout.tsx         # Shared layout component
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # Authentication context
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   ├── ClientDashboard.tsx
│   │   │   ├── ProviderDashboard.tsx
│   │   │   ├── IntakeFormPage.tsx
│   │   │   └── CaseHistoryDetail.tsx
│   │   ├── types.ts               # TypeScript type definitions
│   │   ├── App.tsx                # Main app component with routing
│   │   ├── main.tsx               # React entry point
│   │   └── index.css              # Global styles
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory:
```bash
cp .env.example .env
```

4. Edit `.env` and set your configuration:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3001
NODE_ENV=development
```

**Important**: Change `JWT_SECRET` to a strong, random string in production.

5. Generate Prisma client:
```bash
npm run prisma:generate
```

6. Run database migrations:
```bash
npm run prisma:migrate
```

This will create the SQLite database and all necessary tables.

7. Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory (in a new terminal):
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

### Creating Accounts

1. **Client Account**: 
   - Go to `/signup`
   - Select "Client" role
   - Fill in email, password, and optional name fields
   - Submit to create account

2. **Provider Account**:
   - Go to `/signup`
   - Select "Provider" role
   - Fill in email, password, name, clinic name, and license number
   - Submit to create account

### Client Workflow

1. Log in as a client
2. Navigate to "New Intake" from the dashboard
3. Fill out the intake form with:
   - Presenting problem
   - Medical history
   - Mental health history
   - Current medications
   - Additional notes
4. Acknowledge consent checkbox
5. Submit the form
6. View submitted forms in the dashboard

### Provider Workflow

1. Log in as a provider
2. View all assigned client cases in the dashboard
3. Click on a case to view full intake form details
4. Add provider notes (only visible to providers)
5. Save notes to update the case

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Case Histories
- `GET /api/case-histories` - Get all case histories (role-based)
- `GET /api/case-histories/:id` - Get specific case history
- `POST /api/case-histories` - Create new case history with intake form (CLIENT only)
- `PATCH /api/case-histories/:id/intake-form` - Update provider notes (PROVIDER only)

## Security Features

### Implemented
- Password hashing with bcrypt (10 rounds)
- JWT tokens stored in httpOnly cookies
- Role-based access control on backend routes
- Input validation and sanitization
- CORS configuration
- SQL injection protection via Prisma ORM

### Production Hardening Needed
The following should be implemented before production use:

1. **HIPAA Compliance**:
   - Encrypt database at rest
   - Implement audit logging for all data access
   - Add data retention policies
   - Implement secure data deletion
   - Add Business Associate Agreements (BAA) for third-party services
   - Regular security audits and penetration testing

2. **GDPR Compliance**:
   - Add data export functionality
   - Implement right to deletion
   - Add consent management system
   - Privacy policy integration
   - Data processing agreements

3. **Additional Security**:
   - Rate limiting on API endpoints
   - HTTPS enforcement
   - Content Security Policy headers
   - Regular dependency updates
   - Security headers (HSTS, X-Frame-Options, etc.)
   - Two-factor authentication
   - Session management and timeout
   - IP whitelisting for admin access

4. **Data Protection**:
   - Regular automated backups
   - Encryption in transit (TLS 1.3)
   - Secure key management
   - No sensitive data in logs (already implemented)
   - Secure error messages (don't leak system info)

## Database Schema

### User
- id (UUID)
- email (unique)
- passwordHash
- role (CLIENT | PROVIDER)
- createdAt

### ClientProfile
- id (UUID)
- userId (foreign key)
- firstName, lastName
- dateOfBirth, phone, address
- timestamps

### ProviderProfile
- id (UUID)
- userId (foreign key)
- firstName, lastName
- clinicName, licenseNumber
- phone, address
- timestamps

### CaseHistory
- id (UUID)
- clientId (foreign key)
- providerId (foreign key)
- timestamps

### IntakeForm
- id (UUID)
- caseHistoryId (foreign key, unique)
- presentingProblem
- medicalHistory
- mentalHealthHistory
- medications
- consentAcknowledged (boolean)
- freeTextNotes
- providerNotes (editable by providers only)
- timestamps

## Development

### Backend Development
```bash
cd backend
npm run dev          # Start with hot reload
npm run build        # Build for production
npm run prisma:studio # Open Prisma Studio (database GUI)
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database Management
```bash
cd backend
npm run prisma:migrate    # Create new migration
npm run prisma:studio     # Open database GUI
npm run prisma:generate   # Regenerate Prisma client
```

## Testing the Application

1. Start both backend and frontend servers
2. Create a provider account first
3. Create a client account
4. Log in as client and submit an intake form
5. Log in as provider and view the submitted case
6. Add provider notes to the case

## Troubleshooting

### Database Issues
- If migrations fail, delete `backend/dev.db` and run migrations again
- Ensure `DATABASE_URL` in `.env` is correct

### Authentication Issues
- Clear browser cookies if experiencing auth problems
- Check that `JWT_SECRET` is set in backend `.env`
- Verify CORS settings match your frontend URL

### Port Conflicts
- Backend default: 3001 (change in `.env`)
- Frontend default: 5173 (change in `vite.config.ts`)

## License

This is an MVP for rapid iteration. Not intended for production use without additional security hardening.

## Notes

- SQLite is used for simplicity in MVP. For production, consider PostgreSQL or MySQL.
- Provider assignment is currently automatic (first available provider). Implement provider selection in production.
- No email verification in MVP. Add email verification for production.
- No password reset functionality in MVP. Add password reset flow for production.
# CaseHistory
