import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oilguhbhtexetxyjlqfa.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pbGd1aGJodGV4ZXR4eWpscWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzM2MzEsImV4cCI6MjA4NjMwOTYzMX0.kCxtjYiOw4uDaS91paawTqpaeQ3IEtzacYtTIjSQLM4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
