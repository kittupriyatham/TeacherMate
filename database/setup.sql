CREATE DATABASE IF NOT EXISTS school_db;
USE school_db;

-- Table for Class-Section Combinations (Pane 1 Menu)
CREATE TABLE IF NOT EXISTS class_section_combinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Table for Students
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    roll_no INT NOT NULL,
    combination_id INT NOT NULL,
    FOREIGN KEY (combination_id) REFERENCES class_section_combinations(id) ON DELETE CASCADE
);

-- Insert Dummy Data for sidebar menu
INSERT INTO class_section_combinations (id, name) VALUES 
(1, 'Class 5 - A'),
(2, 'Class 5 - B'),
(3, 'Class 6 - A'),
(4, 'Class 6 - B'),
(5, 'Class 7 - A')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Dummy Students
INSERT INTO students (id, name, roll_no, combination_id) VALUES
(1, 'Aarav Sharma', 101, 1),
(2, 'Aditi Rao', 102, 1),
(3, 'Bhavya Patel', 101, 2),
(4, 'Chaitanya Reddy', 102, 2),
(5, 'Devansh Gupta', 101, 3),
(6, 'Esha Iyer', 102, 3),
(7, 'Faisal Khan', 101, 4),
(8, 'Gauri Sen', 102, 4),
(9, 'Ishaan Nair', 101, 5),
(10, 'Jaya Lakshmi', 102, 5)
ON DUPLICATE KEY UPDATE name=VALUES(name), roll_no=VALUES(roll_no), combination_id=VALUES(combination_id);
