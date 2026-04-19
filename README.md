# Dine - Restaurant Management System

A modern restaurant discovery and management platform built with Next.js 16, featuring customer-facing reservation and ordering flows, plus an admin dashboard for restaurant management.

## Features

### Customer Features
- **Restaurant Discovery** - Browse and search restaurants with filters
- **Reservations** - Book tables with date/time selection and floor plan view
- **Online Ordering** - Order for delivery or pickup with cart management
- **QR Dine-in** - Scan QR codes at tables to order directly

### Admin Features
- **Dashboard** - Overview of orders, reservations, and revenue
- **Kitchen Display** - Real-time order management for kitchen staff
- **Order Management** - Track and update order statuses
- **Reservation Management** - View and manage bookings
- **Menu Builder** - Add, edit, and organize menu items
- **Settings** - Configure restaurant hours, attributes, and contact info

### Driver Features
- **Delivery Dashboard** - View and accept delivery jobs
- **Order Tracking** - Mark pickups and deliveries as complete

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KichoX/DicoverDish.git
cd DicoverDish
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── r/[slug]/          # Restaurant microsite pages
│   │   ├── menu/          # Menu and ordering
│   │   ├── reserve/       # Reservation flow
│   │   └── dine-in/       # QR code dine-in ordering
│   ├── restaurant/[id]/   # Restaurant discovery profile
│   ├── favorites/         # User favorites (requires login)
│   ├── reservations/      # User reservations (requires login)
│   ├── profile/           # User profile (requires login)
│   └── driver/            # Driver dashboard
├── components/            # Reusable React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and data
│   ├── data.ts           # Mock data for restaurants, menu items
│   ├── store.ts          # Zustand state management
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

## Demo Login

The app includes a demo login system. Click the "Login" button in the header and select:

- **Client** - Access favorites, reservations, and profile
- **Admin** - Access the restaurant admin dashboard
- **Driver** - Access the delivery driver dashboard

## Key URLs

| URL | Description |
|-----|-------------|
| `/` | Home / Restaurant discovery |
| `/restaurant/[id]` | Restaurant profile page |
| `/r/[slug]` | Restaurant microsite (shareable link) |
| `/r/[slug]/menu` | Order online (delivery/pickup) |
| `/r/[slug]/reserve` | Make a reservation |
| `/r/[slug]/dine-in/[tableId]` | QR code dine-in ordering |
| `/admin` | Admin dashboard |
| `/driver` | Driver dashboard |

### Test QR Code Link
`/r/le-loup-imperial/dine-in/table-5`

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Charts**: Recharts

## Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## License

This project is private and proprietary.
