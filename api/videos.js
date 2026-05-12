const supabase = require('./supabase');

module.exports = async (req, res) => {
  try {
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
