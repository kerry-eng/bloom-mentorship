const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSessions() {
    const { data, error } = await supabase.from('sessions').select('*').order('created_at', { ascending: false }).limit(20);
    if (error) {
        console.error(error);
        return;
    }
    console.table(data.map(s => ({ id: s.id, status: s.status, price: s.price, ref: s.stripe_payment_id, mentor: s.mentor_id })));
}

checkSessions();
