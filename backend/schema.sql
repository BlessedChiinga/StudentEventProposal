
-- ==========================================
-- STUDENT EVENT PROPOSALS MANAGEMENT SYSTEM
-- DATABASE STRUCTURE
-- ICT251 ACTIVITY 7
-- ==========================================

-- Create the database
CREATE DATABASE IF NOT EXISTS student_event_proposals
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Select the database
USE student_event_proposals;

-- Create the records table
CREATE TABLE IF NOT EXISTS records (

    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(80) NOT NULL,

    category VARCHAR(40) NOT NULL,

    description VARCHAR(300) NOT NULL,

    status ENUM(
        'Pending',
        'In progress',
        'Completed'
    ) NOT NULL DEFAULT 'Pending',

    CONSTRAINT check_title
        CHECK (CHAR_LENGTH(TRIM(title)) BETWEEN 3 AND 80),

    CONSTRAINT check_category
        CHECK (CHAR_LENGTH(TRIM(category)) BETWEEN 2 AND 40),

    CONSTRAINT check_description
        CHECK (CHAR_LENGTH(TRIM(description)) BETWEEN 5 AND 300)

);

-- Display the table structure
DESCRIBE records;
