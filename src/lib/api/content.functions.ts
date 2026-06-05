import { createServerFn } from "@tanstack/react-start";
import { supabase } from "../supabase";

export const getShows = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabase
    .from("shows")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getSongs = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getVideos = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getMembers = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getContact = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabase
    .from("contact")
    .select("*")
    .limit(1)
    .single();
  if (error) return null;
  return data;
});
