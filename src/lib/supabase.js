import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://thhosunkpwtinxbclwfm.supabase.co'
const supabaseAnonKey = 'sb_publishable_rMyJMB9w3FYfyc2hzCK8Dg_YV1eLtg_'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
