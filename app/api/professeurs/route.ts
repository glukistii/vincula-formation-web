import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const specialiteFilter = searchParams.get('specialite');
    const localisationFilter = searchParams.get('localisation');

    let query = supabase.from('professeurs').select('*');

    if (specialiteFilter) {
      query = query.contains('specialites', [specialiteFilter]);
    }

    if (localisationFilter) {
      query = query.ilike('localisation', `%${localisationFilter}%`);
    }

    const { data, error } = await query.order('nom', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
