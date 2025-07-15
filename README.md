# YH Pecklech Platform

A comprehensive e-commerce platform for YH Pecklech, offering customizable gift packages for various occasions.

## Features

- Multiple ordering methods:
  - Ready-to-Go Pecklech
  - Budget Choice Pecklech
  - Build-a-Peckel custom options
- Admin dashboard for inventory and order management
- Customer accounts and order tracking
- Hebrew date integration for Jewish occasions
- Responsive design for all devices

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials

4. Start the development server:
   ```
   npm run dev
   ```

## Database Setup

This project uses Supabase for data persistence. To set up the database:

1. Click the "Connect to Supabase" button in the top right corner of the StackBlitz editor
2. Create a new Supabase project or connect to an existing one
3. The database schema will be automatically created

## Demo Accounts

For testing purposes, the following demo accounts are available:

### Customer Account
- **Email:** `customer@example.com`
- **Password:** `customer123`

### Admin Account
- **Email:** `admin@yhpecklech.com`
- **Password:** `admin123`

### Staff Account
- **Email:** `staff@yhpecklech.com`
- **Password:** `staff123`

These accounts work with both the mock authentication system (for demo purposes) and can be created in your Supabase project for production use.

## Admin Access

Access the admin panel at `/admin-login` with the admin credentials above.

## Deployment

The site can be deployed to Netlify:

1. Build the project:
   ```
   npm run build
   ```
2. Deploy the `dist` folder to Netlify
3. Set up environment variables in Netlify for Supabase connection

## License

This project is proprietary and owned by YH Pecklech.