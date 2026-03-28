const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hjfhnkdcgvapvihymwht.supabase.co';
const supabaseKey = 'sb_publishable_mEmi5qjFjLiKIXHdDHBBhA_-adDKbFV';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('--- Checking direct_messages ---');
    const { data: dmData, error: dmError } = await supabase.from('direct_messages').select('*').limit(1);
    if (dmError) {
        console.error('Error selecting direct_messages:', dmError);
    } else {
        console.log('direct_messages columns:', Object.keys(dmData[0] || {}));
    }

    console.log('\n--- Checking notifications ---');
    const { data: notifData, error: notifError } = await supabase.from('notifications').select('*').limit(1);
    if (notifError) {
        console.error('Error selecting notifications:', notifError);
    } else {
        console.log('notifications columns:', Object.keys(notifData[0] || {}));
    }
}

checkSchema();
