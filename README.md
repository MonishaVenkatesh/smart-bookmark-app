# Smart Bookmark App

A modern bookmark manager built with Next.js, Supabase, and Tailwind CSS. Features Google OAuth authentication, real-time bookmark synchronization, and a clean, responsive UI.

## Features

- **Google OAuth Authentication** - Sign in securely with your Google account (no email/password required)
- **Add Bookmarks** - Save URLs with custom titles
- **Private Bookmarks** - Each user's bookmarks are completely isolated and private
- **Real-time Sync** - Bookmarks update instantly across all open tabs without page refresh
- **Delete Bookmarks** - Remove bookmarks you no longer need
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

- **Next.js 14** - App Router, React Server Components
- **Supabase** - Authentication, PostgreSQL Database, Realtime subscriptions
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe development

## Live Demo

[View Live App](https://your-vercel-url.vercel.app)

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account (free tier works perfectly)
- A Google Cloud project for OAuth credentials

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/smart-bookmark-app.git
cd smart-bookmark-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Project Settings > API

#### Create the Bookmarks Table

In the Supabase SQL Editor, run:

```sql
-- Create bookmarks table
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own bookmarks" 
  ON bookmarks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" 
  ON bookmarks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" 
  ON bookmarks FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable realtime for bookmarks table
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

#### Configure Google OAuth

1. In Supabase, go to Authentication > Providers > Google
2. Enable Google provider
3. Set up OAuth credentials in Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Navigate to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth client ID"
   - Configure the consent screen if needed
   - For Application type, select "Web application"
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Copy the Client ID and Client Secret
4. Paste the Client ID and Client Secret in Supabase Google provider settings
5. Save changes

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with your actual Supabase credentials.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

```bash
npm run build
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

5. **Important**: Update your Google OAuth redirect URI to include your Vercel domain:
   - Go to Google Cloud Console > APIs & Services > Credentials
   - Edit your OAuth client ID
   - Add authorized redirect URI: `https://your-vercel-app.vercel.app/auth/callback`

## Project Structure

```
src/
├── app/
│   ├── auth/callback/     # OAuth callback handler
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/
│   ├── AuthButton.tsx     # Sign in/out button
│   ├── BookmarkForm.tsx   # Add bookmark form
│   └── BookmarkList.tsx   # Bookmark list display
├── lib/
│   └── supabase.ts        # Supabase client & helpers
└── types/
    └── index.ts           # TypeScript types
```

## Problems Encountered and Solutions

### Problem 1: Environment Setup Challenges

**Issue**: The development environment had restrictions on symlinks and npm package installations, causing `npm install` to fail with "operation not supported on socket" errors.

**Solution**: 
- Used `--no-bin-links` flag with npm install to avoid symlink creation
- Manually created the Next.js project structure instead of using `create-next-app`
- This approach worked around the filesystem limitations while maintaining full functionality

### Problem 2: Real-time Updates Not Working

**Issue**: Initially, real-time updates weren't appearing across multiple tabs even though the code was correct.

**Solution**:
- Discovered that the Supabase table needs to be explicitly added to the realtime publication
- Ran `ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;` in the SQL Editor
- Also ensured the channel subscription uses the correct filter format: `filter: user_id=eq.${userId}`

### Problem 3: Google OAuth Redirect Issues

**Issue**: After Google sign-in, users weren't being redirected back to the app correctly.

**Solution**:
- Created a dedicated `/auth/callback` route to handle the OAuth callback
- Used `redirectTo` option in `signInWithOAuth` pointing to the callback URL
- The callback page waits for the session to be established before redirecting to home

### Problem 4: Row Level Security (RLS) Policies

**Issue**: Users could see other users' bookmarks because RLS policies weren't configured.

**Solution**:
- Enabled RLS on the bookmarks table with `ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY`
- Created specific policies for SELECT, INSERT, and DELETE operations
- Each policy checks `auth.uid() = user_id` to ensure users only access their own data

### Problem 5: URL Formatting

**Issue**: Some URLs didn't work correctly when users omitted the protocol (http/https).

**Solution**:
- Added automatic URL formatting in the BookmarkForm component
- If a URL doesn't start with http:// or https://, we prepend https://
- This ensures all bookmarks are valid, clickable links

## Testing Real-time Functionality

To verify real-time updates work:

1. Open the app in two different browser tabs
2. Sign in with the same Google account in both tabs
3. Add a bookmark in one tab
4. Watch it appear instantly in the other tab without refreshing
5. Delete a bookmark in one tab
6. Watch it disappear instantly in the other tab

## License

MIT License - feel free to use this project for learning or building your own bookmark manager!

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
