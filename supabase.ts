
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || "https://ikvsahtemgarvhkvaftl.supabase.co",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrdnNhaHRlbWdhcnZoa3ZhZnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNTM4MzksImV4cCI6MjA0NDgyOTgzOX0.8Il_7DeIq7FISKwf432O8cQH1xhhn9PVh-TWRbTkF5s",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
        