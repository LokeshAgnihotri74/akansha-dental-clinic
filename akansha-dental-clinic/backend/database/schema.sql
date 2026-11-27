-- =========================================================================
-- Akansha Dental Clinic & Implant Center — Database Schema (MySQL 8.x)
-- =========================================================================

CREATE DATABASE IF NOT EXISTS akansha_dental_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE akansha_dental_db;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255)
) ENGINE=InnoDB;

-- 2. Admins & Clinic Staff Table
CREATE TABLE IF NOT EXISTS admins (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  username VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL DEFAULT 'STAFF',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Patients Table (Matched by phone number)
CREATE TABLE IF NOT EXISTS patients (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(150),
  date_of_birth DATE,
  gender ENUM('MALE', 'FEMALE', 'OTHER'),
  blood_group VARCHAR(10),
  medical_history TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Doctors & Specialists Table
CREATE TABLE IF NOT EXISTS doctors (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  qualification VARCHAR(150) NOT NULL,
  specialization VARCHAR(150) NOT NULL,
  experience_years INT NOT NULL DEFAULT 5,
  consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  bio TEXT,
  image_url VARCHAR(500),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Doctor Weekly Working Schedules
CREATE TABLE IF NOT EXISTS doctor_schedules (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  doctor_id BIGINT NOT NULL,
  day_of_week INT NOT NULL COMMENT '1=Monday ... 7=Sunday',
  start_time TIME NOT NULL DEFAULT '09:00:00',
  end_time TIME NOT NULL DEFAULT '18:00:00',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Dental Services & Treatments Catalog
CREATE TABLE IF NOT EXISTS services (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  duration_minutes INT NOT NULL DEFAULT 30,
  description TEXT,
  image_url VARCHAR(500),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 7. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_reference VARCHAR(50) NOT NULL UNIQUE,
  patient_id BIGINT NOT NULL,
  doctor_id BIGINT NOT NULL DEFAULT 0 COMMENT '0 = Any Available Doctor',
  service_id BIGINT NOT NULL,
  appointment_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  cancellation_reason TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_active_doctor_slot (doctor_id, appointment_date, time_slot),
  INDEX idx_appt_date (appointment_date),
  INDEX idx_appt_status (status),
  INDEX idx_appt_doctor (doctor_id)
) ENGINE=InnoDB;

-- 8. Appointment Status Transitions Audit
CREATE TABLE IF NOT EXISTS appointment_status_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  appointment_id BIGINT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
  notes VARCHAR(255),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. General Inquiries & Contact Messages
CREATE TABLE IF NOT EXISTS inquiries (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('NEW', 'IN_REVIEW', 'RESOLVED') NOT NULL DEFAULT 'NEW',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 10. Admin Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  admin_id BIGINT,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id BIGINT,
  details JSON,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 11. Clinic Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
