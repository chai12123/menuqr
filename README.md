# MenuQR

MenuQR is a complete digital menu web application built with Next.js 14, Tailwind CSS, shadcn/ui, and Supabase.

## Features
- **Admin Dashboard**: Manage shop settings, categories, and menu items.
- **Drag & Drop**: Reorder categories using `@dnd-kit/sortable`.
- **QR Code Generator**: Generate and customize print-ready QR codes for your tables.
- **Public Menu**: Mobile-first, fast customer menu with Supabase real-time updates.
- **Image Upload & Compression**: Automatic client-side compression to WebP before uploading to Supabase Storage.

## Setup Instructions

### 1. Supabase Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** and run the script located at `supabase/migrations/0000_schema.sql`.
   - This script creates all necessary tables (`shops`, `categories`, `menu_items`), sets up RLS policies, Triggers, and Storage buckets.
3. Obtain your Project URL and anon/service keys from Project Settings > API.

### 2. Environment Variables
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in the variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 3. Run Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000/admin/register` to create your first shop owner account!
