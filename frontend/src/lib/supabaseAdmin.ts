import { supabase } from '@/integrations/supabase/client';

// FAQ Management
export async function getFAQs() {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function addFAQ(question: string, answer: string, category: string) {
  const { data, error } = await supabase
    .from('faqs')
    .insert({ question, answer, category })
    .select()
    .single();
  return { data, error };
}

export async function updateFAQ(id: string, updates: { question?: string; answer?: string; category?: string }) {
  const { data, error } = await supabase
    .from('faqs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteFAQ(id: string) {
  const { data, error } = await supabase
    .from('faqs')
    .delete()
    .eq('id', id);
  return { data, error };
}

// Announcement Management
export async function getAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function addAnnouncement(title: string, content: string) {
  const { data, error } = await supabase
    .from('announcements')
    .insert({ title, content })
    .select()
    .single();
  return { data, error };
}

export async function updateAnnouncement(id: string, updates: { title?: string; content?: string }) {
  const { data, error } = await supabase
    .from('announcements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteAnnouncement(id: string) {
  const { data, error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);
  return { data, error };
}