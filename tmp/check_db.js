import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
    console.log('--- Checking tables ---')
    const { data: tables, error } = await supabase
        .from('pg_catalog.pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')
    
    if (error) {
        console.error('Error fetching tables:', error)
        return
    }
    console.log('Tables:', tables.map(t => t.tablename).join(', '))

    const checkedTables = ['messages', 'notifications', 'direct_messages']
    for (const t of checkedTables) {
        const { data: columns, error: colErr } = await supabase
            .rpc('get_table_columns', { table_name: t }) // Assuming a helper Rpc
        
        // Alternative: Just select 1 to see if it exists
        const { error: existErr } = await supabase.from(t).select('id').limit(1)
        console.log(`Table ${t}: ${existErr ? 'Doesn\'t exist' : 'Exists'}`)
    }
}

// checkSchema() // This would need environment variables. Instead, I'll search the code.
