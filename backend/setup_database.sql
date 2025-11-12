-- ============================================================================
-- Dynamic Campus Query Chatbot - Database Setup
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor to create all required tables
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- FAQs Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL CHECK (char_length(question) >= 5 AND char_length(question) <= 500),
    answer TEXT NOT NULL CHECK (char_length(answer) >= 10 AND char_length(answer) <= 5000),
    category TEXT NOT NULL CHECK (category IN (
        'academics', 'admissions', 'facilities', 'events', 'general', 
        'sports', 'library', 'hostel', 'placement', 'clubs'
    )),
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    view_count INTEGER DEFAULT 0 CHECK (view_count >= 0)
);

-- Create indexes for FAQs
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_is_active ON faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_created_by ON faqs(created_by);
CREATE INDEX IF NOT EXISTS idx_faqs_created_at ON faqs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_faqs_tags ON faqs USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for FAQs
CREATE POLICY "FAQs are viewable by everyone" ON faqs
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Authenticated users can create FAQs" ON faqs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own FAQs" ON faqs
    FOR UPDATE USING (auth.uid()::text = created_by);

CREATE POLICY "Users can delete their own FAQs" ON faqs
    FOR DELETE USING (auth.uid()::text = created_by);

-- ============================================================================
-- Announcements Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL CHECK (char_length(title) >= 5 AND char_length(title) <= 200),
    description TEXT NOT NULL CHECK (char_length(description) >= 10 AND char_length(description) <= 2000),
    category TEXT NOT NULL CHECK (category IN (
        'academic', 'event', 'exam', 'holiday', 'general', 
        'sports', 'cultural', 'placement', 'emergency'
    )),
    date TIMESTAMPTZ NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    is_active BOOLEAN DEFAULT TRUE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for Announcements
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_date ON announcements(date);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON announcements(created_by);

-- Enable Row Level Security
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Announcements
CREATE POLICY "Announcements are viewable by everyone" ON announcements
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Authenticated users can create announcements" ON announcements
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own announcements" ON announcements
    FOR UPDATE USING (auth.uid()::text = created_by);

CREATE POLICY "Users can delete their own announcements" ON announcements
    FOR DELETE USING (auth.uid()::text = created_by);

-- ============================================================================
-- Chat Logs Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS chat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    question TEXT NOT NULL CHECK (char_length(question) >= 1 AND char_length(question) <= 1000),
    matched_faq_id UUID REFERENCES faqs(id) ON DELETE SET NULL,
    confidence DECIMAL(3, 2) CHECK (confidence >= 0.0 AND confidence <= 1.0),
    was_helpful BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for Chat Logs
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_id ON chat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_logs_matched_faq_id ON chat_logs(matched_faq_id);

-- Enable Row Level Security
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Chat Logs
CREATE POLICY "Users can view their own chat logs" ON chat_logs
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own chat logs" ON chat_logs
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own chat logs" ON chat_logs
    FOR UPDATE USING (auth.uid()::text = user_id);

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_faqs_updated_at
    BEFORE UPDATE ON faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Sample Data (Optional - for testing)
-- ============================================================================

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category, tags, created_by) VALUES
(
    'What are the library timings?',
    'The central library is open from 8:00 AM to 10:00 PM on weekdays and 9:00 AM to 6:00 PM on weekends. During exam periods, the library extends its hours until midnight.',
    'library',
    ARRAY['library', 'timings', 'hours', 'schedule'],
    'system'
),
(
    'How do I apply for hostel accommodation?',
    'To apply for hostel accommodation, log in to the student portal and navigate to the Hostel section. Fill out the application form and submit it before the deadline. You will receive a confirmation email once your application is processed.',
    'hostel',
    ARRAY['hostel', 'accommodation', 'application', 'housing'],
    'system'
),
(
    'What is the process for course registration?',
    'Course registration is done online through the student portal during the registration period at the start of each semester. You can add or drop courses within the first two weeks of the semester. Make sure to consult with your academic advisor before finalizing your courses.',
    'academics',
    ARRAY['courses', 'registration', 'enrollment', 'academics'],
    'system'
),
(
    'Where can I find information about campus events?',
    'Campus events are posted on the official college website, student portal, and various social media channels. You can also check the notice boards around campus or subscribe to the events newsletter for regular updates.',
    'events',
    ARRAY['events', 'activities', 'campus', 'information'],
    'system'
),
(
    'How do I access the sports facilities?',
    'Sports facilities are available to all students with a valid student ID. You can book facilities like the gym, tennis courts, and swimming pool through the sports portal. Some facilities require advance booking, especially during peak hours.',
    'sports',
    ARRAY['sports', 'facilities', 'gym', 'booking'],
    'system'
);

-- Insert sample announcements
INSERT INTO announcements (title, description, category, date, priority, created_by) VALUES
(
    'Annual Sports Day 2024',
    'Join us for the Annual Sports Day on March 15th, 2024. Various competitions including athletics, basketball, cricket, and more. Registration opens next week!',
    'sports',
    '2024-03-15 09:00:00+00',
    'high',
    'system'
),
(
    'Mid-Semester Exams Schedule',
    'Mid-semester examinations will be held from April 1st to April 10th, 2024. The detailed timetable is now available on the student portal. Please check your exam schedule and plan accordingly.',
    'exam',
    '2024-04-01 09:00:00+00',
    'urgent',
    'system'
),
(
    'Guest Lecture on AI and Machine Learning',
    'Dr. Sarah Johnson from MIT will be delivering a guest lecture on "The Future of AI and Machine Learning" on March 20th at 3:00 PM in the main auditorium. All students are welcome to attend.',
    'academic',
    '2024-03-20 15:00:00+00',
    'medium',
    'system'
);

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check if tables were created successfully
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_name IN ('faqs', 'announcements', 'chat_logs')
ORDER BY table_name;

-- Check sample data
SELECT 'FAQs' as table_name, COUNT(*) as record_count FROM faqs
UNION ALL
SELECT 'Announcements', COUNT(*) FROM announcements
UNION ALL
SELECT 'Chat Logs', COUNT(*) FROM chat_logs;

-- ============================================================================
-- Notes
-- ============================================================================
-- 1. Make sure to enable Row Level Security (RLS) in Supabase dashboard
-- 2. The created_by field uses TEXT to store user IDs from Supabase Auth
-- 3. All timestamps are stored in UTC
-- 4. Indexes are created for common query patterns
-- 5. Sample data uses 'system' as the creator for testing purposes
-- ============================================================================
