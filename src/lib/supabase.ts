import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://eishicgfvsiodhucvxze.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_qN4Tl4fdmsO5W9UDONObOQ_34_ggeSe";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Show = {
  id: number;
  date: string;
  venue: string;
  city: string;
  ticket_url: string | null;
};

export type Song = {
  id: number;
  title: string;
  year: string;
  apple_music_url: string | null;
  emoji: string | null;
};

export type Video = {
  id: number;
  title: string;
  youtube_url: string;
};

export type Member = {
  id: number;
  name: string;
  role: string;
  photo_url: string | null;
  sort_order: number;
};

export type Contact = {
  id: number;
  location: string | null;
  email: string | null;
  phone: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  youtube_videos_url: string | null;
  tiktok_url: string | null;
};
