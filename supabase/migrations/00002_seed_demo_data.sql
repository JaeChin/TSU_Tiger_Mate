-- Tiger M.A.T.E Demo Seed Data
-- 10 TSU campus events + 10 TSU campus resources

-- ============================================================
-- Events
-- ============================================================
insert into public.events (title, description, location, category, start_time, end_time, is_featured) values

(
  'New Tiger Orientation',
  'Welcome to the TSU family! Join us for a full day of campus tours, academic advising sessions, and meeting your fellow Tigers. Learn about student organizations, campus resources, and everything you need to start your journey at Texas Southern University.',
  'Sterling Student Life Center',
  'academic',
  '2026-08-18 09:00:00+00',
  '2026-08-18 16:00:00+00',
  true
),
(
  'Tiger Fest 2026',
  'TSU''s biggest back-to-school celebration! Live music, free food, games, giveaways, and performances by student organizations. Meet new friends and kick off the semester right.',
  'Tiger Walk & University Courtyard',
  'social',
  '2026-08-22 17:00:00+00',
  '2026-08-22 22:00:00+00',
  true
),
(
  'FAFSA & Financial Aid Workshop',
  'Don''t leave money on the table. Financial aid counselors will walk you through the FAFSA application, scholarship opportunities, and work-study programs. Bring your FSA ID and tax documents.',
  'Library Learning Center, Room 210',
  'academic',
  '2026-09-05 14:00:00+00',
  '2026-09-05 16:00:00+00',
  false
),
(
  'Fall Career Fair',
  'Over 75 employers recruiting TSU students for internships, co-ops, and full-time positions. Industries include engineering, business, healthcare, technology, and education. Business professional attire required.',
  'Health & Physical Education Arena',
  'career',
  '2026-09-17 10:00:00+00',
  '2026-09-17 15:00:00+00',
  true
),
(
  'TSU Tigers vs. Prairie View A&M — Football',
  'It''s the Labor Day Classic! Come cheer on your Tigers as they take on rival Prairie View A&M. Student section is free with TSU ID. Gates open 2 hours before kickoff.',
  'BBVA Stadium',
  'sports',
  '2026-09-06 18:00:00+00',
  '2026-09-06 22:00:00+00',
  true
),
(
  'Homecoming Week: Step Show & Concert',
  'The highlight of TSU Homecoming! Watch the Divine Nine fraternities and sororities compete in the annual step show, followed by a headlining concert. Tickets available at the student life office.',
  'Health & Physical Education Arena',
  'cultural',
  '2026-10-24 19:00:00+00',
  '2026-10-24 23:00:00+00',
  true
),
(
  'Midterm Study Jam',
  'Free tutoring, study groups, snacks, and quiet study spaces. Hosted by the Tutoring Center and Student Government Association. All subjects covered — bring your notes and your questions.',
  'Library Learning Center, 1st Floor',
  'academic',
  '2026-10-06 18:00:00+00',
  '2026-10-06 23:00:00+00',
  false
),
(
  'Mental Health Awareness Week: Wellness Fair',
  'Take a break and take care of yourself. Free mental health screenings, stress management workshops, therapy dog visits, meditation sessions, and self-care kits while supplies last.',
  'Sterling Student Life Center Ballroom',
  'health',
  '2026-10-13 11:00:00+00',
  '2026-10-13 15:00:00+00',
  false
),
(
  'Resume & LinkedIn Workshop',
  'Career Services coaches will help you build a professional resume and optimize your LinkedIn profile. Bring a laptop and a draft resume if you have one. Walk-ins welcome.',
  'MLK Building, Room 108',
  'career',
  '2026-09-24 13:00:00+00',
  '2026-09-24 15:00:00+00',
  false
),
(
  'Spring 2027 Early Registration Info Session',
  'Get ahead of the rush. Academic advisors will explain the spring registration timeline, how to check degree audits, resolve holds, and select the right courses. Priority registration dates announced.',
  'Sawyer Auditorium',
  'academic',
  '2026-11-03 12:00:00+00',
  '2026-11-03 13:30:00+00',
  false
);

-- ============================================================
-- Resources
-- ============================================================
insert into public.resources (name, description, category, location, phone, email, website, hours, icon) values

(
  'Academic Advising Center',
  'Get guidance on course selection, degree planning, major declarations, and academic progress. Walk-in and appointment-based advising available for all classifications.',
  'academic',
  'MLK Building, Suite 105',
  '(713) 313-7981',
  'advising@tsu.edu',
  'https://www.tsu.edu/academics/advising',
  'Mon-Fri 8:00 AM - 5:00 PM',
  'GraduationCap'
),
(
  'Office of Financial Aid',
  'Apply for scholarships, grants, loans, and work-study. Get help with FAFSA, verify financial aid status, and resolve any holds on your account.',
  'financial',
  'Bell Building, 2nd Floor',
  '(713) 313-7071',
  'financialaid@tsu.edu',
  'https://www.tsu.edu/financialaid',
  'Mon-Fri 8:00 AM - 5:00 PM',
  'DollarSign'
),
(
  'Counseling Center',
  'Free, confidential mental health services for enrolled students. Individual counseling, group therapy, crisis intervention, and referrals. No insurance needed.',
  'health',
  'Sterling Student Life Center, Suite 230',
  '(713) 313-7804',
  'counseling@tsu.edu',
  'https://www.tsu.edu/counseling',
  'Mon-Fri 8:00 AM - 5:00 PM',
  'Heart'
),
(
  'TSU Police Department',
  'Campus safety and emergency services. Available 24/7 for emergencies, escorts, lost property, and incident reports. Save this number in your phone.',
  'safety',
  'Public Safety Building, 3200 Cleburne St',
  '(713) 313-7000',
  'police@tsu.edu',
  'https://www.tsu.edu/police',
  '24/7',
  'Shield'
),
(
  'Tiger Food Pantry',
  'No Tiger goes hungry. Free groceries and meal assistance for students experiencing food insecurity. Confidential — just bring your TSU ID.',
  'dining',
  'Sterling Student Life Center, Room 139',
  '(713) 313-4968',
  'foodpantry@tsu.edu',
  'https://www.tsu.edu/foodpantry',
  'Mon, Wed, Fri 10:00 AM - 2:00 PM',
  'Apple'
),
(
  'IT Help Desk',
  'Tech support for TSU email, Wi-Fi, myTSU portal, Blackboard, password resets, and campus computer labs. Walk-in or call for assistance.',
  'technology',
  'Library Learning Center, 1st Floor',
  '(713) 313-4357',
  'helpdesk@tsu.edu',
  'https://www.tsu.edu/technology',
  'Mon-Fri 8:00 AM - 6:00 PM, Sat 10:00 AM - 2:00 PM',
  'Monitor'
),
(
  'Career Services Center',
  'Resume reviews, mock interviews, internship postings, job fairs, and employer connections. Start building your career from day one.',
  'career',
  'MLK Building, Room 108',
  '(713) 313-7225',
  'careers@tsu.edu',
  'https://www.tsu.edu/careerservices',
  'Mon-Fri 8:00 AM - 5:00 PM',
  'Briefcase'
),
(
  'Tutoring & Academic Support Center',
  'Free peer tutoring in math, science, English, and more. Drop-in tutoring, scheduled appointments, and study groups. Available to all enrolled students.',
  'academic',
  'Library Learning Center, 3rd Floor',
  '(713) 313-1843',
  'tutoring@tsu.edu',
  'https://www.tsu.edu/tutoring',
  'Mon-Thu 9:00 AM - 7:00 PM, Fri 9:00 AM - 3:00 PM',
  'BookOpen'
),
(
  'Student Health Center',
  'Primary care, immunizations, health screenings, and pharmacy services for enrolled students. Most services are free or low-cost with student health fee.',
  'health',
  'Health & Wellness Building, 3100 Cleburne St',
  '(713) 313-7173',
  'health@tsu.edu',
  'https://www.tsu.edu/healthcenter',
  'Mon-Fri 8:00 AM - 5:00 PM',
  'Stethoscope'
),
(
  'Office of Residential Life & Housing',
  'On-campus housing applications, room assignments, roommate requests, maintenance requests, and residence life programming.',
  'housing',
  'University Courtyard Apartments, Leasing Office',
  '(713) 313-4968',
  'housing@tsu.edu',
  'https://www.tsu.edu/housing',
  'Mon-Fri 8:00 AM - 5:00 PM',
  'Home'
);
