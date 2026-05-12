module.exports = async (req, res) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(400).json({ error: 'Missing Supabase environment variables' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('course_videos')
      .select('*')
      .order('order', { ascending: true })
      .limit(10);

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
};
