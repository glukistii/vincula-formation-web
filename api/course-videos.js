const supabase = require('./supabase');

module.exports = async (req, res) => {
  try {
    const courseId = req.query.courseId;
    if (!courseId) {
      return res.status(400).json({ error: 'courseId required' });
    }

    const { data, error } = await supabase
      .from('course_videos')
      .select('*')
      .eq('course_id', courseId)
      .order('order', { ascending: true });

    if (error) throw error;

    res.status(200).json({ videos: data || [] });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
};
