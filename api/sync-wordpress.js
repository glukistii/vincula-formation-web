const supabase = require('./supabase');

module.exports = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'email required' });
  }

  try {
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      throw userError;
    }

    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ email, name: email.split('@')[0] }])
        .select('id')
        .single();

      if (createError) throw createError;
      user = newUser;
    }

    return res.status(200).json({
      message: 'User synced',
      userId: user.id
    });
  } catch (err) {
    console.error('Sync error:', err);
    return res.status(500).json({ error: err.message });
  }
};
