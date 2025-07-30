# 🍳 CookFlow - Interactive Recipe Web App

CookFlow is a full-stack interactive recipe web application that allows users to follow recipes step-by-step with built-in timers, submit their own recipes, leave reviews, and save favorites. Built with Next.js, React, Tailwind CSS, and Supabase.

## ✨ Features

### 🧭 Interactive Step-by-Step Recipe Player
- Follow recipes one step at a time with large, readable instructions
- Built-in timers for time-sensitive steps
- **Auto-advance**: Automatically moves to the next step when timers finish
- Visual progress tracking with step counter
- Navigation between steps with Back/Next buttons

### 🔍 Recipe Discovery & Browsing
- Homepage with searchable recipe cards
- Advanced filtering by category, difficulty, and cooking time
- Recipe detail pages with ingredients, instructions, and ratings
- Beautiful, responsive design with recipe images

### ⭐ Reviews & Ratings System
- Authenticated users can rate recipes (1-5 stars)
- Leave detailed reviews and comments
- View average ratings and all user reviews
- One review per user per recipe

### 👨‍🍳 User-Generated Content
- Submit your own recipes with detailed forms
- Upload recipe images to Supabase Storage
- Add ingredients and step-by-step instructions
- Set optional timers for cooking steps
- Categorize recipes by type and difficulty

### ❤️ Personal Recipe Management
- Save any recipe to your favorites
- User profile showing submitted recipes and favorites
- Track your cooking contributions to the community

### 🔐 Authentication & User Profiles
- Email/password authentication via Supabase Auth
- Secure user profiles with Row Level Security (RLS)
- Guest browsing with full authentication for interactions

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for recipe images
- **Icons**: Lucide React
- **Deployment**: Ready for Vercel/Netlify

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd cookflow
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Set up Database

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the SQL to create all tables, policies, and storage buckets

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see CookFlow in action!

## 📁 Project Structure

```
cookflow/
├── app/                    # Next.js 13+ app directory
│   ├── cook/[id]/         # Interactive cooking player
│   ├── login/             # Authentication page
│   ├── profile/           # User profile and favorites
│   ├── recipe/[id]/       # Recipe detail pages
│   ├── submit/            # Recipe submission form
│   ├── globals.css        # Global styles and Tailwind
│   ├── layout.tsx         # Root layout with auth provider
│   └── page.tsx           # Homepage with recipe browsing
├── components/            # Reusable React components
│   ├── AuthProvider.tsx   # Authentication context
│   ├── CookingPlayer.tsx  # Step-by-step cooking interface
│   ├── FavoriteButton.tsx # Recipe favoriting functionality
│   ├── Navbar.tsx         # Navigation component
│   ├── RecipeGrid.tsx     # Recipe card grid display
│   ├── ReviewSection.tsx  # Reviews and ratings
│   └── SearchAndFilters.tsx # Homepage search/filter
├── lib/
│   └── supabase.ts        # Supabase client configuration
├── supabase-schema.sql    # Database schema and RLS policies
└── README.md              # This file
```

## 🗄️ Database Schema

The app uses 6 main tables:

- **users**: Extended user profiles (linked to Supabase Auth)
- **recipes**: Recipe metadata (title, category, difficulty, times)
- **ingredients**: Recipe ingredients with ordering
- **steps**: Step-by-step instructions with optional timers
- **favorites**: User's saved favorite recipes
- **reviews**: User ratings and comments

All tables include Row Level Security (RLS) policies for secure data access.

## 🎯 Key Features Explained

### Interactive Cooking Player

The cooking player (`/cook/[id]`) is the heart of CookFlow:

- **Step-by-step guidance**: Shows one instruction at a time
- **Built-in timers**: Visual countdown with audio notification
- **Auto-advance**: Automatically moves to next step when timer completes
- **Progress tracking**: Visual progress bar and step overview
- **Ingredient sidebar**: Always-visible ingredient list

### Smart Recipe Discovery

The homepage provides powerful recipe discovery:

- **Real-time search**: Filter recipes by title
- **Multi-faceted filtering**: Category, difficulty, and time filters
- **Rating display**: Shows average ratings and review counts
- **Responsive grid**: Beautiful card layout on all devices

### User-Generated Content

Users can contribute recipes through a comprehensive submission form:

- **Rich recipe editor**: Add ingredients and steps dynamically
- **Timer integration**: Set cooking timers for specific steps
- **Image upload**: Upload recipe photos to Supabase Storage
- **Categorization**: Organize recipes by type and difficulty

## 🔧 Configuration

### Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Supabase Storage

The app uses a `recipe-images` storage bucket for user-uploaded recipe photos. The bucket is configured for:

- Public read access for all images
- Authenticated write access for uploads
- User-specific folders for organization

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

CookFlow works on any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

We welcome contributions! Here are some ways to help:

- 🐛 Report bugs and issues
- 💡 Suggest new features
- 🔧 Submit pull requests
- 📖 Improve documentation
- 🎨 Enhance UI/UX design

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database and auth by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)

---
Have fun y'all :P
