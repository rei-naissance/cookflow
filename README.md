# CookFlow

**A Modern Interactive Recipe & Cooking Companion Web Application**

![Status](https://img.shields.io/badge/Status-Active_Development-success)
![Framework](https://img.shields.io/badge/Framework-Next.js_14-black)
![Language](https://img.shields.io/badge/Language-TypeScript-blue)
![Styling](https://img.shields.io/badge/Styling-Tailwind_CSS-38bdf8)
![Database](https://img.shields.io/badge/Database-Supabase-3ecf8e)
![AI](https://img.shields.io/badge/AI-Groq_SDK-orange)

CookFlow is a full-stack, feature-rich recipe platform designed to transform the cooking experience. From smart recipe discovery to an interactive step-by-step cooking player with voice guidance, CookFlow empowers home cooks to discover, create, and master delicious meals.

Built with performance, accessibility, and modern design principles in mind using the latest web technologies.

---

## Key Features

### Interactive Cooking Player
Transform your device into a cooking assistant.
- **Step-by-Step Guidance**: Focus on one instruction at a time with large, readable text.
- **Voice Guidance (TTS)**: Listen to cooking steps hands-free, powered by **Groq SDK** and PlayAI text-to-speech.
- **Smart Timers**: Integrated timers for time-sensitive steps that auto-advance the recipe upon completion.
- **Progress Tracking**: Visual indicators show exactly where you are in the cooking process.
- **Ingredients Sidebar**: Keep track of required items without leaving the current instruction.

### Smart Discovery & Browsing
Find your next favorite meal effortlessly.
- **Advanced Search**: Real-time search by recipe title.
- **Curated Collections**: Browse "Championship Recipes", "Fast and Furious" quick meals, and more.
- **Rich Filtering**: Filter by category, difficulty level, dietary tags, and cooking time.
- **Smooth Animations**: Powered by **Framer Motion** for a fluid and premium user experience.
- **Responsive Design**: A fluid grid layout that looks stunning on mobile, tablet, and desktop.

### User-Generated Content
Share your culinary creations with the world.
- **Comprehensive Editor**: Easy-to-use form for contributing your own recipes.
- **Multimedia Support**: Upload high-quality recipe images (stored via Supabase Storage).
- **Structured Data**: Input detailed ingredients, ordered steps, and metadata (prep time, cook time, servings).

### Authentication & Security
- **Secure Auth**: Email/password login and user management via **Supabase Auth**.
- **Password Recovery**: Integrated "Forgot Password" flow with email verification.
- **Profile Management**: Customize your profile and manage your account settings.

### Email Integration
- **Newsletter**: Subscribe to "Fresh Inspiration" for weekly recipe updates.
- **Transactional Emails**: Automated emails for email verification and password resets using **Nodemailer**.

---

## Technology Stack

| Category | Technology | Description |
|----------|------------|-------------|
| **Frontend** | [Next.js 14](https://nextjs.org/) | App Router, Server Components, SSR |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type-safe development |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) | Production-ready animation library |
| **UI Components** | [Lucide React](https://lucide.dev/) | Beautiful, consistent iconography |
| **Backend/DB** | [Supabase](https://supabase.com/) | PostgreSQL, Auth, Storage, Realtime |
| **Email** | [Nodemailer](https://nodemailer.com/) | Robust email sending service |
| **AI/ML** | [Groq SDK](https://groq.com/) | Fast AI inference for Text-to-Speech features |
| **Deployment** | Vercel | Optimized edge deployment |

---

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- **Node.js**: v18.17.0 or higher
- **npm**: v9.0.0 or higher
- **Supabase Account**: For database and auth
- **Groq API Key**: For TTS features

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/cookflow.git
cd cookflow
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add the following variables:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Groq AI Configuration (Required for TTS)
GROQ_API_KEY=your_groq_api_key

# SMTP Configuration (Required for Emails)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
SMTP_FROM="CookFlow <no-reply@cookflow.com>"
```

### 4. Database Setup
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to the **SQL Editor**.
3. Open the `supabase-schema.sql` file from this project.
4. Copy its contents and run it in the SQL Editor to create tables, policies, and storage buckets.

### 5. Run the Local Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
cookflow/
├── app/                    # Next.js 14 App Router
│   ├── api/                # API Routes (TTS, Newsletter, etc.)
│   ├── auth/               # Auth callback handlers
│   ├── cook/[id]/          # Interactive cooking player page
│   ├── favorites/          # User favorites page
│   ├── forgot-password/    # Password recovery flow
│   ├── login/              # Authentication pages
│   ├── profile/            # User dashboard
│   ├── recipe/[id]/        # Recipe details page
│   ├── submit/             # Recipe submission page
│   ├── update-password/    # Password update page
│   ├── verify-email/       # Email verification page
│   └── page.tsx            # Landing page
├── components/             # React Components
│   ├── landing/            # Landing page specific components
│   ├── ui/                 # Reusable UI elements
│   ├── CookingPlayer.tsx   # Core cooking logic
│   └── ...
├── lib/                    # Utilities and clients
│   ├── email.ts            # Email sending utility
│   ├── supabaseClient.ts   # Supabase client
│   └── ...
├── public/                 # Static assets
└── supabase-schema.sql     # Database definition
```

---

## Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  xoxo, rei.
</p>