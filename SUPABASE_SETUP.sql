-- ============================================================================
-- Campus Chatbot - Supabase Database Setup
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vzimszxjonqgdleoixvi/sql
-- ============================================================================

-- Create enum for user roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own conversations" ON public.conversations;
CREATE POLICY "Users can create their own conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;
CREATE POLICY "Users can delete their own conversations"
  ON public.conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.chat_messages;
CREATE POLICY "Users can view messages from their conversations"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = chat_messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.chat_messages;
CREATE POLICY "Users can create messages in their conversations"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = chat_messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Create FAQs table
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view FAQs" ON public.faqs;
CREATE POLICY "Anyone can view FAQs"
  ON public.faqs FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Only admins can manage FAQs" ON public.faqs;
CREATE POLICY "Only admins can manage FAQs"
  ON public.faqs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view announcements" ON public.announcements;
CREATE POLICY "Anyone can view announcements"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Only admins can manage announcements" ON public.announcements;
CREATE POLICY "Only admins can manage announcements"
  ON public.announcements FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_faqs_updated_at ON public.faqs;
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON public.announcements;
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Insert sample data (optional)
-- ============================================================================

-- Comprehensive FAQs - KLE BCA Specific
INSERT INTO public.faqs (question, answer, category) VALUES

-- ADMISSIONS
('What are the BCA course fees at KLE?', 'The BCA program costs ₹1,00,000 per year. Total for 3 years is ₹3,00,000.', 'Admissions'),
('What is the admission process for BCA?', 'Admissions are based on merit and availability. Visit https://www.klebcahubli.in/ for the latest admission details and application forms. Contact the office for specific requirements.', 'Admissions'),
('What are the eligibility criteria for BCA?', 'Candidates must have completed 10+2 with Mathematics as one of the subjects. Specific percentage requirements are available on the official website.', 'Admissions'),
('When does admission start for BCA?', 'Admission dates are announced on the official website. Typically, admissions open after 12th board results. Check https://www.klebcahubli.in/ for current dates.', 'Admissions'),
('Is there an entrance exam for BCA admission?', 'Admission is primarily merit-based. Contact the admissions office for current requirements and any entrance exam details.', 'Admissions'),

-- ACADEMICS  
('What is the duration of the BCA program?', 'The BCA program is 3 years long, divided into 6 semesters.', 'Academics'),
('Is KLE BCA affiliated to any university?', 'Yes, KLE BCA is affiliated to Karnataka University, Hubli. The institute has academic independence and conducts its own exams. Degrees are awarded by Karnataka University.', 'Academics'),
('Does KLE conduct its own exams?', 'Yes, the institute conducts its own exams aligned with the curriculum. This academic independence allows for regularly updated syllabus and flexible scheduling.', 'Academics'),
('What programming languages are taught in BCA?', 'The curriculum includes C, C++, Java, Python, web technologies (HTML, CSS, JavaScript), database management, and more. The syllabus is regularly updated to include modern technologies.', 'Academics'),
('Is there an internship requirement?', 'Yes, practical training and internships are part of the curriculum. Students gain real-world experience through industry partnerships and projects.', 'Academics'),
('What is the syllabus structure?', 'The syllabus covers programming, database management, web development, software engineering, and computer applications. Contact the office for detailed syllabus information.', 'Academics'),

-- FACULTY
('Who is the BCA coordinator?', 'Mr. Siddalingappa Kadakol is the Coordinator for the BCA department at KLE.', 'Faculty'),
('How many faculty members are there?', 'The BCA department has 30 Assistant Professors, 5 Lab Instructors, and 4 Office Staff members.', 'Faculty'),
('Who handles IT Help Desk queries?', 'Mr. Mahesh Rao Koppal (Assistant Professor) manages the IT Help Desk. Contact him for technical support and computer lab issues.', 'Faculty'),
('How can I contact a specific professor?', 'Faculty can be contacted through the BCA office during office hours or by visiting their respective departments on campus.', 'Faculty'),
('What are faculty office hours?', 'Faculty office hours vary. Contact the BCA office or check with individual professors for their availability and consultation hours.', 'Faculty'),

-- FACILITIES
('What computer labs are available?', 'The department has excellent computer labs with modern hardware and software resources. Specific lab details can be obtained from the office or lab instructors.', 'Facilities'),
('Is WiFi available on campus?', 'Yes, WiFi is available for students. Contact the IT Help Desk (Mr. Mahesh Rao Koppal) for access credentials and network information.', 'Facilities'),
('What software is available in labs?', 'Labs are equipped with programming environments, development tools, and software relevant to the BCA curriculum. Contact lab instructors for specific software lists.', 'Facilities'),
('Where is the library located?', 'The library is part of P.C. Jabin Science College campus. For specific location, timings, and resources, contact the college office.', 'Facilities'),
('What are the library hours?', 'Library hours vary by semester and exam schedules. Contact the library or college office for current operating hours.', 'Facilities'),
('Is there a cafeteria on campus?', 'Yes, cafeteria facilities are available on campus. Contact the college office for details about timings and services.', 'Facilities'),

-- ABOUT
('When was the BCA department established?', 'The BCA department was started in 1999 as a Department of Computer Science at P.C. Jabin Science College. It now operates with its own dedicated facilities.', 'About'),
('What is the 4 C''s philosophy?', 'KLE BCA focuses on forming students who are Competent, Committed, Creative, and Compassionate. Education is about quality of knowledge that builds character, not just qualifications.', 'About'),
('Where is P.C. Jabin Science College located?', 'P.C. Jabin Science College is located in Hubli, Karnataka, India.', 'About'),
('What makes KLE BCA unique?', 'KLE BCA offers academic independence with regularly updated curriculum, institute-conducted exams, excellent faculty, and modern infrastructure. The 4 C''s philosophy shapes well-rounded graduates.', 'About'),
('How many students are currently enrolled?', 'Enrollment numbers vary by year. Contact the admissions office or BCA department for current enrollment statistics and capacity information.', 'About'),

-- CONTACT
('How can I contact the BCA office?', 'Contact the office staff during office hours: Mr. Basavaraj Hulkoti, Mr. Mahantesh G, Mrs. Shashikala Kallur, or Miss. Meghana Pattan. For general inquiries, visit https://www.klebcahubli.in/', 'Contact'),
('Who should I contact for technical issues?', 'Contact Mr. Mahesh Rao Koppal (Assistant Professor) for IT support and technical issues.', 'Contact'),
('What is the college website?', 'Visit the official website: https://www.klebcahubli.in/ for announcements, forms, and detailed information.', 'Contact'),
('What is the college address?', 'P.C. Jabin Science College, Hubli, Karnataka, India. Contact the office for detailed address and directions.', 'Contact'),
('How can I reach the coordinator?', 'Mr. Siddalingappa Kadakol (Coordinator) can be contacted through the BCA office or during office hours on campus.', 'Contact'),
('Who should I contact for lab-related queries?', 'Contact the Lab Instructors: Mr. Manjunath Badiger, Miss. Huligemma Daivatti, Miss. S Usha, Mr. Vinayak Kulkarni, or Mr. Aditya Kulkarni.', 'Contact')
ON CONFLICT DO NOTHING;

-- Sample announcements - KLE BCA Specific
INSERT INTO public.announcements (title, content) VALUES
('Welcome to KLE BCA!', 'Welcome to K.L.E.S''s Bachelor of Computer Application program at P.C. Jabin Science College, Hubli. We''re excited to have you join our community of future IT professionals.'),
('Academic Independence Notice', 'KLE BCA operates with academic independence. We conduct our own examinations while degrees are awarded by Karnataka University, Hubli.'),
('IT Support Available', 'For any technical assistance, please contact Mr. Mahesh Rao Koppal at the IT Help Desk. Our faculty is here to support your learning journey.'),
('4 C''s Philosophy', 'At KLE BCA, we focus on developing Competent, Committed, Creative, and Compassionate graduates. Education is about the quality of knowledge that builds character.')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- To make a user an admin, run this (replace with actual email):
-- ============================================================================
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'::app_role
-- FROM auth.users
-- WHERE email = 'your-email@example.com'
-- ON CONFLICT DO NOTHING;

-- ============================================================================
-- Setup Complete!
-- ============================================================================
