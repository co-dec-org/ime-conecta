import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan variables públicas de Supabase en .env.local')
}

export const projectKey = process.env.NEXT_PUBLIC_PROJECT_KEY || 'ime_conecta'

export const supabase = createClient(supabaseUrl, supabaseKey)
