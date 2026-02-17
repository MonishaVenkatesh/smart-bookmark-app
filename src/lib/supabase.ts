import { createClient } from '@supabase/supabase-js';
import { Bookmark } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a mock client for build time when env vars are not available
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured. Using mock client.');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
};

export const supabase = createSupabaseClient();

// Auth helpers
export const signInWithGoogle = async () => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
    },
  });
  return { data, error };
};

export const signOut = async () => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  if (!supabase) {
    return { user: null, error: new Error('Supabase not configured') };
  }
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Bookmark helpers
export const getBookmarks = async (userId: string): Promise<Bookmark[]> => {
  if (!supabase) {
    return [];
  }
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
  
  return data || [];
};

export const addBookmark = async (userId: string, title: string, url: string): Promise<Bookmark | null> => {
  if (!supabase) {
    return null;
  }
  const { data, error } = await supabase
    .from('bookmarks')
    .insert([{ user_id: userId, title, url }])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding bookmark:', error);
    return null;
  }
  
  return data;
};

export const deleteBookmark = async (bookmarkId: string): Promise<boolean> => {
  if (!supabase) {
    return false;
  }
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkId);
  
  if (error) {
    console.error('Error deleting bookmark:', error);
    return false;
  }
  
  return true;
};

// Real-time subscription helper
export const subscribeToBookmarks = (
  userId: string,
  callback: (payload: any) => void
) => {
  if (!supabase) {
    throw new Error('Supabase not initialized');
  }

  const channel = supabase
    .channel('bookmarks-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // 🔥 listen to ALL events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'bookmarks',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return channel;
};

