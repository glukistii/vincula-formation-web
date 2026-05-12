// Hand-written types for our Supabase schema.
// You can regenerate these from the DB with `supabase gen types typescript --local`.

export type Product = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  short_description: string | null;
  price: number;
  price_original: number | null;
  category: string | null;
  badge: string | null;
  image_url: string | null;
  wc_url: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type CourseVideo = {
  id: string;
  product_id: number;
  title: string;
  description: string | null;
  youtube_id: string;
  duration_seconds: number | null;
  display_order: number;
  created_at: string;
};

export type Purchase = {
  id: string;
  user_id: string;
  product_id: number;
  wc_order_id: number | null;
  status: 'completed' | 'refunded' | 'pending';
  amount: number | null;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  wp_user_id: number | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

// Minimal Database type so the supabase-js client gets type-safe queries.
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, 'id' | 'email'>;
        Update: Partial<Profile>;
      };
      products: {
        Row: Product;
        Insert: Partial<Product> & Pick<Product, 'id' | 'slug' | 'title' | 'price'>;
        Update: Partial<Product>;
      };
      course_videos: {
        Row: CourseVideo;
        Insert: Partial<CourseVideo> & Pick<CourseVideo, 'product_id' | 'title' | 'youtube_id'>;
        Update: Partial<CourseVideo>;
      };
      purchases: {
        Row: Purchase;
        Insert: Partial<Purchase> & Pick<Purchase, 'user_id' | 'product_id'>;
        Update: Partial<Purchase>;
      };
    };
  };
};
