CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_title VARCHAR(150), company VARCHAR(150), location VARCHAR(100),
  experience VARCHAR(30), skills TEXT,
  salary_min INT NULL, salary_max INT NULL,   -- NULL = not disclosed (never 0)
  salary_currency CHAR(3) DEFAULT 'INR',
  employment_type VARCHAR(30), job_description TEXT,
  posted_date DATE, source VARCHAR(100), collected_on DATE
);
