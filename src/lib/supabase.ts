import { createClient } from '@supabase/supabase-js'
import { env, useMocks } from './env.ts'

/** Client Supabase, ou `null` en mode démo (variables d'environnement absentes). */
export const supabase = useMocks ? null : createClient(env.supabaseUrl, env.supabaseAnonKey)
