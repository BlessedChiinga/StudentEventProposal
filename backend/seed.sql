
-- ==========================================
-- STUDENT EVENT PROPOSALS
-- INITIAL DEMONSTRATION RECORDS
-- Run this file only once
-- ==========================================

USE student_event_proposals;

INSERT INTO records
    (title, category, description, status)
VALUES
(
    'Annual Campus Innovation Fair',
    'Academic',
    'A fair where students demonstrate creative projects, prototypes and new ideas.',
    'Pending'
),
(
    'Inter-Faculty Football Tournament',
    'Sport',
    'A football competition that brings together teams from different faculties.',
    'In progress'
),
(
    'Cultural Heritage Day',
    'Culture',
    'A celebration of traditional food, music, clothing and dance.',
    'Pending'
),
(
    'Student Debate Championship',
    'Academic',
    'A debate event that develops public speaking and critical thinking.',
    'Completed'
),
(
    'Campus Fitness Challenge',
    'Sport',
    'A friendly fitness challenge encouraging students to stay active and healthy.',
    'Pending'
),
(
    'Poetry and Open Mic Night',
    'Culture',
    'An evening where students share poetry, music and performances.',
    'In progress'
),
(
    'Research and Technology Symposium',
    'Academic',
    'Students present research findings and discuss emerging technologies.',
    'Completed'
),
(
    'Traditional Dance Showcase',
    'Culture',
    'Student groups perform traditional dances and explain their cultural significance.',
    'Pending'
);

-- Display all records
SELECT * FROM records ORDER BY id;
