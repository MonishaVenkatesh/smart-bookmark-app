# Smart Bookmark App - Complete Setup Guide

This guide will walk you through setting up the Smart Bookmark App from scratch, including Supabase configuration, Google OAuth setup, and Vercel deployment.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Supabase Setup](#supabase-setup)
3. [Google OAuth Configuration](#google-oauth-configuration)
4. [Local Development](#local-development)
5. [Vercel Deployment](#vercel-deployment)
6. [Testing Real-time Features](#testing-real-time-features)

---

## Project Overview

The Smart Bookmark App is a full-stack application with:
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, PostgreSQL, Realtime)
- **Authentication**: Google OAuth
- **Features**: Real-time bookmark sync, private bookmarks per user

---

## Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Enter project details:
   - **Name**: `smart-bookmark-app`
   - **Database Password**: Generate a secure password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create New Project"
5. Wait for the project to be created (takes 1-2 minutes)

### Step 2: Get Your API Credentials

1. In your Supabase dashboard, go to **Project Settings** (gear icon)
2. Click **API** in the left sidebar
3. Copy these values (you'll need them later):
   - **Project URL**: `https://xxxxxx.supabase.co`
   - **anon/public**: `eyJhbG...` (long string)

### Step 3: Create the Bookmarks Table

1. In the left sidebar, click **SQL Editor**
2. Click **New Query**
3. Paste the following SQL:

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

-- Create RLS policies for SELECT (users can only see their own bookmarks)
CREATE POLICY "Users can view own bookmarks" 
  ON bookmarks FOR SELECT 
  USING (auth.uid() = user_id);

-- Create RLS policies for INSERT (users can only add their own bookmarks)
CREATE POLICY "Users can insert own bookmarks" 
  ON bookmarks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for DELETE (users can only delete their own bookmarks)
CREATE POLICY "Users can delete own bookmarks" 
  ON bookmarks FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable realtime for bookmarks table
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

4. Click **Run** (or Ctrl+Enter)
5. You should see "Success" message

### Step 4: Enable Realtime

1. Go to **Database** → **Replication** in the left sidebar
2. Under **Source**, make sure `bookmarks` table is checked
3. If not, click **0 tables** and check the `bookmarks` table

---

## Google OAuth Configuration

### Step 1: Create a Google Cloud Project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top
3. Click **New Project**
4. Enter:
   - **Project name**: `Smart Bookmark App`
   - **Location**: No organization
5. Click **Create**

### Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (available to any user with a Google account)
3. Click **Create**
4. Fill in app information:
   - **App name**: `Smart Bookmark App`
   - **User support email**: Your email
   - **App logo**: (optional)
   - **App domain**: (leave blank for now)
   - **Authorized domains**: (leave blank for now)
   - **Developer contact information**: Your email
5. Click **Save and Continue**
6. On **Scopes** page, click **Save and Continue**
7. On **Test users** page, click **Save and Continue**
8. Review and click **Back to Dashboard**

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Application type**: Web application
4. Enter **Name**: `Smart Bookmark App Web Client`
5. Under **Authorized redirect URIs**, add:
   - For local development: `http://localhost:3000/auth/callback`
   - For Supabase: `https://your-project.supabase.co/auth/v1/callback`
     (Replace `your-project` with your actual Supabase project ID)
6. Click **Create**
7. **Copy the Client ID and Client Secret** (you'll need them!)

### Step 4: Configure Google Auth in Supabase

1. Go back to your Supabase dashboard
2. Go to **Authentication** → **Providers**
3. Find **Google** and click **Enable**
4. Paste:
   - **Client ID**: (from Google Cloud)
   - **Client Secret**: (from Google Cloud)
5. Click **Save**

---

## Local Development

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-bookmark-app.git
cd smart-bookmark-app

# Install dependencies
npm install
```

### Step 2: Configure Environment Variables

1. Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual values from Supabase.

### Step 3: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Test the App

1. Click "Sign in with Google"
2. Complete the OAuth flow
3. You should see your profile and be able to add bookmarks
4. Open another tab at the same URL
5. Add a bookmark in one tab - it should appear in the other tab instantly!

---

## Vercel Deployment

### Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/smart-bookmark-app.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign up/login
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Click **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
6. Click **Deploy**

Wait for deployment to complete (2-3 minutes).

### Step 3: Update Google OAuth Redirect URI

1. Go back to Google Cloud Console
2. Go to **APIs & Services** → **Credentials**
3. Click your OAuth client ID
4. Under **Authorized redirect URIs**, add:
   - `https://your-vercel-app.vercel.app/auth/callback`
   (Replace with your actual Vercel URL)
5. Click **Save**

### Step 4: Update Supabase Site URL

1. Go to Supabase dashboard
2. Go to **Authentication** → **URL Configuration**
3. Update:
   - **Site URL**: `https://your-vercel-app.vercel.app`
   - **Redirect URLs**: Add your Vercel URL
4. Click **Save**

---

## Testing Real-time Features

### Test 1: Cross-Tab Sync

1. Open your deployed app in two browser tabs
2. Sign in with the same Google account in both tabs
3. In Tab 1, add a new bookmark
4. **Verify**: The bookmark appears instantly in Tab 2 without refreshing!

### Test 2: Delete Sync

1. With both tabs open, delete a bookmark in Tab 1
2. **Verify**: The bookmark disappears instantly in Tab 2!

### Test 3: Privacy Check

1. Sign in with User A's Google account
2. Add some bookmarks
3. Sign out
4. Sign in with User B's Google account
5. **Verify**: User B cannot see User A's bookmarks

---

## Troubleshooting

### Issue: "Supabase credentials not configured"

**Solution**: Make sure your `.env.local` file has the correct values and restart the dev server.

### Issue: Google Sign-in not working

**Solution**: 
- Check that redirect URIs are correctly configured in Google Cloud
- Verify the Client ID and Secret in Supabase match Google Cloud
- Make sure the OAuth consent screen is published (not in testing mode)

### Issue: Real-time updates not working

**Solution**:
- Check that the `bookmarks` table is added to the realtime publication
- Verify RLS policies are correctly set
- Check browser console for WebSocket connection errors

### Issue: Bookmarks visible to other users

**Solution**: 
- Verify RLS policies are enabled on the `bookmarks` table
- Check that policies use `auth.uid() = user_id` condition

---

## Submission Checklist

- [ ] Live Vercel URL working
- [ ] GitHub repo is public
- [ ] README.md includes problems and solutions
- [ ] Google OAuth sign-in works
- [ ] Can add bookmarks (URL + title)
- [ ] Bookmarks are private per user
- [ ] Real-time updates work across tabs
- [ ] Can delete bookmarks

---

## Need Help?

- Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)
- Next.js Docs: [https://nextjs.org/docs](https://nextjs.org/docs)
- Google OAuth Docs: [https://developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)
