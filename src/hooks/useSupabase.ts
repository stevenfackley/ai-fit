import { useState, useEffect, useCallback } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const { supabaseUrl = '', supabaseAnonKey = '' } = Constants.expoConfig?.extra ?? {};

let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in your .env');
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

export function useSupabase() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let supabase: SupabaseClient;
    try {
      supabase = getSupabase();
    } catch (err: any) {
      setAuthError(err.message);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
      })
      .catch((err: any) => setAuthError(err.message));

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    try {
      const { error } = await getSupabase().auth.signInWithOtp({ email });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await getSupabase().auth.signOut();
    } catch {}
  }, []);

  return { session, user, authError, signInWithMagicLink, signOut };
}

export default getSupabase;
