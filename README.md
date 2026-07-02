# QR Menu Platform

Professional QR Menu platform for restaurants and cafes. Scan a QR code to view a beautiful, responsive digital menu — no app required.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4** + shadcn/ui components
- **Framer Motion** for animations
- **PostgreSQL** + **Prisma ORM**
- **next-intl** (Arabic / English with RTL)
- **JWT Auth** with role-based access
- **QRCode** library for QR generation
- **PWA** ready with service worker

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or update `DATABASE_URL` in `.env`)

### Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Seed demo data (restaurant, 100+ products, categories)
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@basata.com | admin123 | Owner |
| manager@basata.com | admin123 | Manager |

## Demo URLs

- **Landing Page:** `/`
- **Public Menu:** `/menu/basata-cafe-main`
- **Dashboard:** `/dashboard`
- **Login:** `/auth/login`

## Features

### Public QR Menu
- Restaurant header with logo, cover, hours, contact buttons
- Category navigation with smooth scrolling
- Product cards with badges (Best Seller, New, Offer, etc.)
- Product detail page with gallery, sizes, add-ons
- Real-time search and filters
- Favorites (localStorage)
- Share & copy link
- Dark mode + RTL support

### Dashboard
- Overview with stats
- Branches, Categories, Products management
- Add-ons & Sizes
- QR Code generator (PNG/SVG download)
- Users & Settings
- Role-based access (Owner, Manager, Cashier, Viewer)

## Database

```bash
npx prisma studio    # Open database GUI
npx prisma migrate dev  # Apply migrations
npm run db:seed      # Re-seed data
```

## Project Structure

```
src/
├── app/[locale]/          # Localized routes
│   ├── page.tsx           # Landing page
│   ├── menu/[slug]/       # Public menu
│   ├── dashboard/         # Admin dashboard
│   └── auth/login/        # Authentication
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── menu/              # Menu components
│   └── dashboard/         # Dashboard components
├── lib/                   # Utilities, auth, db
├── i18n/                  # Internationalization
└── messages/              # ar.json, en.json
prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Demo data seeder
```

## License

MIT
