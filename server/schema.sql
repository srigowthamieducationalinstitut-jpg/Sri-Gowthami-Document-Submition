-- Relational Database Initialization Script for Sri Gowthami Document Tracker
-- DBMS: MySQL (Compatible with v8.0+)

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS `sri_gowthami_tracker`;
USE `sri_gowthami_tracker`;

-- Table 1: applications
-- Stores student applications and their overall verification status
CREATE TABLE IF NOT EXISTS `applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_name` VARCHAR(255) NOT NULL,
  `student_email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `course_applied` VARCHAR(255) NOT NULL,
  `admission_status` ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_admission_status` (`admission_status`),
  INDEX `idx_course_applied` (`course_applied`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 2: documents
-- Stores individual verification checklist items for each student application
CREATE TABLE IF NOT EXISTS `documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_id` INT NOT NULL,
  `document_type` ENUM('Marks Memo', 'Aadhaar', 'Transfer Certificate', 'Photos', 'Caste Certificate') NOT NULL,
  `status` ENUM('Submitted', 'Pending', 'Rejected') DEFAULT 'Pending',
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE,
  INDEX `idx_application_id` (`application_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 3: comments_history
-- Stores verification notes and feedback appended by administrators
CREATE TABLE IF NOT EXISTS `comments_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_id` INT NOT NULL,
  `staff_role` VARCHAR(100) NOT NULL,
  `comment_text` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE,
  INDEX `idx_comment_application_id` (`application_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
