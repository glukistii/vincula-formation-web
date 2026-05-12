const supabase = require('./supabase');

module.exports = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const { data, error } = await supabase
      .from('purchases')
      .select('*, courses(*)')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (error) throw error;

    res.status(200).json({ purchases: data || [] });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
};
