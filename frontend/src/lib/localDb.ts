// Local storage database replacement for Supabase

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// Initialize with default data
const DEFAULT_FAQS: FAQ[] = [
  {
    id: '1',
    question: 'What is the duration of the BCA program?',
    answer: 'The BCA program is 3 years long.',
    category: 'Academics',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    question: 'What are the annual fees?',
    answer: 'The annual fees are ₹1,00,000. Total for 3 years is ₹3,00,000.',
    category: 'Fees',
    created_at: new Date().toISOString()
  }
];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'Welcome to ClarifyAI',
    content: 'Your intelligent campus assistant is now live!',
    priority: 'high',
    created_at: new Date().toISOString()
  }
];

// Initialize storage
if (!localStorage.getItem('faqs')) {
  localStorage.setItem('faqs', JSON.stringify(DEFAULT_FAQS));
}
if (!localStorage.getItem('announcements')) {
  localStorage.setItem('announcements', JSON.stringify(DEFAULT_ANNOUNCEMENTS));
}
if (!localStorage.getItem('conversations')) {
  localStorage.setItem('conversations', JSON.stringify([]));
}

// FAQ operations
export const getFAQs = (): FAQ[] => {
  return JSON.parse(localStorage.getItem('faqs') || '[]');
};

export const addFAQ = (faq: Omit<FAQ, 'id' | 'created_at'>): FAQ => {
  const faqs = getFAQs();
  const newFAQ: FAQ = {
    ...faq,
    id: Date.now().toString(),
    created_at: new Date().toISOString()
  };
  faqs.push(newFAQ);
  localStorage.setItem('faqs', JSON.stringify(faqs));
  return newFAQ;
};

export const updateFAQ = (id: string, updates: Partial<FAQ>): FAQ | null => {
  const faqs = getFAQs();
  const index = faqs.findIndex(f => f.id === id);
  if (index === -1) return null;
  faqs[index] = { ...faqs[index], ...updates };
  localStorage.setItem('faqs', JSON.stringify(faqs));
  return faqs[index];
};

export const deleteFAQ = (id: string): boolean => {
  const faqs = getFAQs();
  const filtered = faqs.filter(f => f.id !== id);
  localStorage.setItem('faqs', JSON.stringify(filtered));
  return filtered.length < faqs.length;
};

// Announcement operations
export const getAnnouncements = (): Announcement[] => {
  return JSON.parse(localStorage.getItem('announcements') || '[]');
};

export const addAnnouncement = (announcement: Omit<Announcement, 'id' | 'created_at'>): Announcement => {
  const announcements = getAnnouncements();
  const newAnnouncement: Announcement = {
    ...announcement,
    id: Date.now().toString(),
    created_at: new Date().toISOString()
  };
  announcements.push(newAnnouncement);
  localStorage.setItem('announcements', JSON.stringify(announcements));
  return newAnnouncement;
};

export const updateAnnouncement = (id: string, updates: Partial<Announcement>): Announcement | null => {
  const announcements = getAnnouncements();
  const index = announcements.findIndex(a => a.id === id);
  if (index === -1) return null;
  announcements[index] = { ...announcements[index], ...updates };
  localStorage.setItem('announcements', JSON.stringify(announcements));
  return announcements[index];
};

export const deleteAnnouncement = (id: string): boolean => {
  const announcements = getAnnouncements();
  const filtered = announcements.filter(a => a.id !== id);
  localStorage.setItem('announcements', JSON.stringify(filtered));
  return filtered.length < announcements.length;
};

// Conversation operations
export const getConversations = (): Conversation[] => {
  return JSON.parse(localStorage.getItem('conversations') || '[]');
};

export const addConversation = (title: string): Conversation => {
  const conversations = getConversations();
  const newConv: Conversation = {
    id: Date.now().toString(),
    title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  conversations.unshift(newConv);
  localStorage.setItem('conversations', JSON.stringify(conversations));
  return newConv;
};

export const updateConversation = (id: string, title: string): void => {
  const conversations = getConversations();
  const index = conversations.findIndex(c => c.id === id);
  if (index !== -1) {
    conversations[index].title = title;
    conversations[index].updated_at = new Date().toISOString();
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }
};

export const deleteConversation = (id: string): void => {
  const conversations = getConversations();
  const filtered = conversations.filter(c => c.id !== id);
  localStorage.setItem('conversations', JSON.stringify(filtered));
};
