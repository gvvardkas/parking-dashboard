# The Palms - Parking Dashboard

A modern React + TypeScript application for managing parking spot rentals at The Palms apartment complex.

## Features

- **Session-based Authentication**: 7-day session with password protection
- **Spot Management**: Add, edit, and delete parking spot listings
- **Rental System**: Multi-step rental wizard with Venmo payment integration
- **Advanced Filtering**: Filter by date, Venmo handle, spot size, and floor
- **Sorting Options**: Random, soonest available, or longest duration
- **PIN Protection**: Secure spot management with 4-digit PIN
- **Google Apps Script Integration**: Backend API integration (optional - works with mock data)

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS Custom Properties** - Design system
- **Google Apps Script** - Backend API (optional)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

**Default Access Code**: `test` (when running without backend)

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Type Checking

```bash
# Run TypeScript type checker
npm run type-check
```

## Project Structure

```
src/
├── components/           # React components
│   ├── AccessScreen.tsx  # Login/authentication
│   ├── Dashboard.tsx     # Main dashboard with spot listings
│   ├── SpotCard.tsx      # Individual spot display
│   ├── Modal.tsx         # Reusable modal wrapper
│   ├── DateTimeInput.tsx # Date/time picker with timezone
│   ├── AddSpotModal.tsx  # Add new spot form
│   ├── RentModal.tsx     # Multi-step rental wizard
│   └── ManageModal.tsx   # Edit/delete spot form
├── services/             # API layer
│   └── api.ts            # All backend API calls
├── utils/                # Utility functions
│   ├── dateTime.ts       # Date/time parsing and formatting
│   ├── validation.ts     # Email and phone validation
│   ├── formatting.ts     # Phone number formatting
│   ├── session.ts        # Session management
│   └── helpers.ts        # Misc helpers (file upload, shuffle)
├── types/                # TypeScript interfaces
│   └── index.ts          # All type definitions
├── config/               # Configuration
│   └── constants.ts      # App constants and mock data
├── styles/               # CSS
│   └── index.css         # Global styles
├── App.tsx               # Root component with auth
├── main.tsx              # Entry point
└── vite-env.d.ts         # Vite type definitions
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```env
# Optional - app will use mock data if not set
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Constants

Edit `src/config/constants.ts` to customize:

- `PRICE_PER_DAY` - Default price per day
- `TIMEZONE` - Display timezone (default: PST)
- `SESSION_DURATION_DAYS` - Session expiration (default: 7 days)
- `MOCK_DATA` - Mock parking spots for testing

## Features Overview

### Authentication

- Password-protected access with session persistence
- 7-day session expiration
- Server-side password version checking

### Add Parking Spot

- Venmo handle, email, and phone number
- Spot number, size (Full/Compact/Motorcycle), and floor
- Availability date/time range with PST timezone
- Custom price per day
- 4-digit PIN for future management

### Rent Parking Spot

**Step 1**: Select rental period and see cost calculation
**Step 2**: Enter renter information and upload Venmo payment screenshot
**Step 3**: Receive spot number and owner contact info

### Manage Listings

- PIN verification required
- Edit all spot details
- Delete spot listings

### Filtering & Sorting

- **Filter by date**: Find spots available on specific dates
- **Filter by Venmo**: Search by owner's Venmo handle
- **Filter by size**: Full Size, Compact, or Motorcycle
- **Filter by floor**: P1, P2, or P3
- **Sort by**: Random, Soonest Available, or Longest Duration

## Development Notes

### Date/Time Handling

All dates and times are handled in PST timezone using `Intl.DateTimeFormat`. The app correctly:
- Displays times in PST
- Validates rental periods within availability windows
- Calculates costs based on duration

### Form Validation

- Email validation with regex
- Phone number formatting: (XXX) XXX-XXXX
- PIN validation: 4-digit numeric
- Date/time range validation

### Mock Data

When `GOOGLE_SCRIPT_URL` is not configured, the app uses mock data defined in `src/config/constants.ts`. This allows full testing without a backend.

## Migration from Original

This version was converted from a single HTML file to a full React + TypeScript application with:

- ✅ Proper build tooling (Vite)
- ✅ Component modularity
- ✅ Type safety (TypeScript)
- ✅ Production optimizations
- ✅ Hot module replacement
- ✅ Better code organization
- ✅ Preserved all original functionality

The original `index.html` is backed up as `index.html.backup`.

## License

Private project for The Palms apartment complex.
