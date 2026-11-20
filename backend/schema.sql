
CREATE DATABASE IF NOT EXISTS student_events;

USE student_events;

CREATE TABLE IF NOT EXISTS records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(80) NOT NULL,
    category VARCHAR(40) NOT NULL,
    description VARCHAR(300) NOT NULL,
    status ENUM('Pending', 'In progress', 'Completed') NOT NULL
);
