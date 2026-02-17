'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, signInWithGoogle, signOut, getBookmarks, addBookmark, deleteBookmark, subscribeToBookmarks } from '@/lib/supabase';
import { Bookmark } from '@/types';
import AuthButton from '@/components/AuthButton';
import BookmarkForm from '@/components/BookmarkForm';
import BookmarkList from '@/components/BookmarkList';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) {
        setConfigError('Supabase is not configured. Please set up your environment variables.');
        setLoading(false);
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    let authSubscription: { unsubscribe: () => void } | null = null;
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
      authSubscription = subscription;
    }

    return () => {
      authSubscription?.unsubscribe();
    };
  }, []);

  // Load bookmarks when user changes
  useEffect(() => {
    if (user) {
      loadBookmarks();
    } else {
      setBookmarks([]);
    }
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user || !supabase) return;

    const subscription = subscribeToBookmarks(user.id, (payload) => {
      console.log('Real-time update received:', payload);
      
      if (payload.eventType === 'INSERT') {
        setBookmarks((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === 'DELETE') {
        setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id));
      } else if (payload.eventType === 'UPDATE') {
        setBookmarks((prev) =>
          prev.map((b) => (b.id === payload.new.id ? payload.new : b))
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadBookmarks = async () => {
    if (!user) return;
    const data = await getBookmarks(user.id);
    setBookmarks(data);
  };

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setBookmarks([]);
  };

  const handleAddBookmark = async (title: string, url: string) => {
    if (!user) return;
    
    const newBookmark = await addBookmark(user.id, title, url);
    if (newBookmark) {
      // Optimistically add to UI (will be confirmed by real-time update)
      setBookmarks((prev) => [newBookmark, ...prev]);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    const success = await deleteBookmark(id);
    if (success) {
      // Optimistically remove from UI (will be confirmed by real-time update)
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show configuration error
  if (configError) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Configuration Required</h2>
            <p className="text-red-700 mb-4">{configError}</p>
            <div className="bg-white rounded p-4 font-mono text-sm">
              <p className="mb-2">Create a <code className="bg-gray-100 px-1">.env.local</code> file with:</p>
              <pre className="bg-gray-800 text-green-400 p-3 rounded">
{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`}
              </pre>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Smart Bookmark App
              </h1>
              <p className="text-gray-600">
                Save and manage your favorite links with real-time sync
              </p>
            </div>
            <AuthButton 
              user={user} 
              onSignIn={handleSignIn} 
              onSignOut={handleSignOut} 
            />
          </div>
        </header>

        {/* Main Content */}
        {user ? (
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4">
              {user.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  Welcome, {user.user_metadata?.name || user.email}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            {/* Add Bookmark Form */}
            <BookmarkForm onAdd={handleAddBookmark} />

            {/* Bookmark List */}
            <BookmarkList 
              bookmarks={bookmarks} 
              onDelete={handleDeleteBookmark} 
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Get Started
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Sign in with your Google account to start saving and managing your bookmarks. 
              Your bookmarks are private and synced in real-time across all your devices.
            </p>
            <button
              onClick={handleSignIn}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Built with Next.js, Supabase, and Tailwind CSS</p>
        </footer>
      </div>
    </main>
  );
}
