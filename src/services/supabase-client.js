import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Client Supabase cho bảng xếp hạng trực tuyến.
 * Chưa khai báo biến môi trường thì giá trị là null và app dùng bảng xếp hạng lưu trên máy như cũ.
 */
export const supabase =
  url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
