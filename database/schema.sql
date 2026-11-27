CREATE DATABASE IF NOT EXISTS jobscope;
USE jobscope;
CREATE TABLE jobs (
  job_id INT PRIMARY KEY AUTO_INCREMENT,
  job_title VARCHAR(100) NOT NULL,
  company VARCHAR(120),
  location VARCHAR(80),
  experience DECIMAL(4,1),
  skills TEXT,
  salary_min INT NULL,          -- NULL = unknown, never 0
  salary_max INT NULL,
  salary_currency CHAR(3) DEFAULT 'INR',
  employment_type VARCHAR(30),
  education VARCHAR(40),
  job_description TEXT,
  posted_date DATE,
  source VARCHAR(120),
  INDEX (job_title), INDEX (location), INDEX (posted_date)
);
