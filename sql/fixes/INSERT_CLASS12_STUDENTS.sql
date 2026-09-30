-- ====================================================================
-- INSERT 15 STUDENTS IN CLASS 12
-- ====================================================================

-- Insert 15 students into the students_registry table for Grade 12
INSERT INTO public.students_registry (roll, name, class, attendance, overall_gpa, status, billing_state, created_at)
VALUES
  (1201, 'Aarav Sharma', 'Grade 12 Technical - T', '98.5%', '3.8', 'Active', 'paid', NOW()),
  (1202, 'Aditya Poudel', 'Grade 12 Technical - T', '96.2%', '3.75', 'Active', 'paid', NOW()),
  (1203, 'Ananya Singh', 'Grade 12 Technical - T', '99.0%', '3.9', 'Active', 'paid', NOW()),
  (1204, 'Arnav Verma', 'Grade 12 Technical - T', '95.8%', '3.7', 'Active', 'paid', NOW()),
  (1205, 'Bhavna Mishra', 'Grade 12 Technical - T', '97.5%', '3.82', 'Active', 'paid', NOW()),
  (1206, 'Chirag Desai', 'Grade 12 Technical - T', '94.3%', '3.65', 'Active', 'unpaid', NOW()),
  (1207, 'Deepak Kulkarni', 'Grade 12 Technical - T', '96.8%', '3.78', 'Active', 'paid', NOW()),
  (1208, 'Diya Nair', 'Grade 12 Technical - T', '98.1%', '3.85', 'Active', 'paid', NOW()),
  (1209, 'Esha Gupta', 'Grade 12 Technical - T', '93.5%', '3.6', 'Active', 'paid', NOW()),
  (1210, 'Fahad Khan', 'Grade 12 Technical - T', '95.2%', '3.72', 'Active', 'unpaid', NOW()),
  (1211, 'Gauri Pandey', 'Grade 12 Technical - T', '99.2%', '3.95', 'Active', 'paid', NOW()),
  (1212, 'Harsh Joshi', 'Grade 12 Technical - T', '94.8%', '3.68', 'Active', 'paid', NOW()),
  (1213, 'Isha Reddy', 'Grade 12 Technical - T', '97.3%', '3.81', 'Active', 'paid', NOW()),
  (1214, 'Jatin Mehta', 'Grade 12 Technical - T', '96.0%', '3.74', 'Active', 'paid', NOW()),
  (1215, 'Kavya Sharma', 'Grade 12 Technical - T', '98.7%', '3.88', 'Active', 'paid', NOW())
ON CONFLICT (roll) DO NOTHING;

-- ====================================================================
-- OPTIONAL: Insert corresponding student credentials for login access
-- ====================================================================

INSERT INTO public.student_credentials (student_roll, student_name, student_username, student_password, student_email, student_phone, student_class, is_active, created_at)
VALUES
  (1201, 'Aarav Sharma', 'aarav.sharma', '$2a$10$dXJ3d2R5clpzSnM5RkJKLg==', 'aarav.sharma@school.com', '9841234567', 'Grade 12 Technical - T', true, NOW()),
  (1202, 'Aditya Poudel', 'aditya.poudel', '$2a$10$dXJ3d2R5clpzSnM5RkJKLg==', 'aditya.poudel@school.com', '9841234568', 'Grade 12 Technical - T', true, NOW()),
  (1203, 'Ananya Singh', 'ananya.singh', '$2a$10$dXJ3d2R5clpzSnM5RkJKLg==', 'ananya.singh@school.com', '9841234569', 'Grade 12 Technical - T', true, NOW()),
  (1204, 'Arnav Verma', 'arnav.verma', '$2a$10$dXJ3d2R5clpzSnM5RkJKLg==', 'arnav.verma@school.com', '9841234570', 'Grade 12 Technical - T', true, NOW()),
  (1205, 'Bhavna Mishra', 'bhavna.mishra', '$2a$10$dXJ3d2R5clpzSnM5RkJKLg==', 'bhavna.mishra@school.com', '9841234571', 'Grade 12 Technical - T', true, NOW()),
  (1206, 'Chirag Desai', 'chirag.desai', '$2a$10$dXJ3d2R5clpzSnM5RkJKLg==', 'chirag.desai@school.com', '9841234572', 'Grade 12 Technical - T', true, NOW()),
  (1207, 'Deepak Kulkarni', 'deepak.kulkarni', '$2a$10$dXJ3d2R5clpzSnM5RkJKLg==', 'deepak.kulkarni@school.com', '9841234573', 'Grade 12 Technical - T', true, NOW()),
  (1208, 'Diya Nair', 'diya.nair', '$2a$10$dXJ3d2R5clpzSnM5RkJKLg==', 'diya.nair@school.com', '9841234574', 'Grade 12 Technical - T', true, NOW()),
  (1209, 'Esha Gupta', 'esha.gupta', '$2a$10$dXJ3d2R5clpzSnM5RkJKLg==', 'esha.gupta@school.com', '9841234575', 'Grade 12 Technical - T', true, NOW()),
  (1210, 'Fahad Khan', 'fahad.khan', '$2a$10$dXJ3d2R5clpzSnM5RkJKLg==', 'fahad.khan@school.com', '9841234576', 'Grade 12 Technical - T', true, NOW()),
  (1211, 'Gauri Pandey', 'gauri.pandey', '$2a$10$dXJ3d2R5clpzSnM5RkJKLg==', 'gauri.pandey@school.com', '9841234577', 'Grade 12 Technical - T', true, NOW()),
  (1212, 'Harsh Joshi', 'harsh.joshi', '$2a$10$dXJ3d2R5clpzSnM5RkJKLg==', 'harsh.joshi@school.com', '9841234578', 'Grade 12 Technical - T', true, NOW()),
  (1213, 'Isha Reddy', 'isha.reddy', '$2a$10$dXJ3d2R5clpzSnM5RkJKLg==', 'isha.reddy@school.com', '9841234579', 'Grade 12 Technical - T', true, NOW()),
  (1214, 'Jatin Mehta', 'jatin.mehta', '$2a$10$dXJ3d2R5clpzSnM5RkJKLg==', 'jatin.mehta@school.com', '9841234580', 'Grade 12 Technical - T', true, NOW()),
  (1215, 'Kavya Sharma', 'kavya.sharma', '$2a$10$dXJ3d2R5clpzSnM5RkJKLg==', 'kavya.sharma@school.com', '9841234581', 'Grade 12 Technical - T', true, NOW())
ON CONFLICT (student_roll) DO NOTHING;

-- ====================================================================
-- VERIFY INSERTION
-- ====================================================================

-- Check how many students were inserted in Grade 12
SELECT COUNT(*) as total_students, class 
FROM public.students_registry 
WHERE class = 'Grade 12 Technical - T'
GROUP BY class;

-- Display all inserted students
SELECT roll, name, class, attendance, overall_gpa, status, billing_state 
FROM public.students_registry 
WHERE roll BETWEEN 1201 AND 1215
ORDER BY roll;

-- ====================================================================
-- NOTES:
-- ====================================================================
-- 1. Roll numbers: 1201 to 1215 (15 students)
-- 2. Class: 'Grade 12 Technical - T' (matches the format used in the system)
-- 3. Attendance: Realistic percentage values (93.5% - 99.2%)
-- 4. GPA: Realistic values (3.6 - 3.95)
-- 5. Status: All set to 'Active'
-- 6. Billing: Mix of paid and unpaid for realistic distribution
-- 7. Student Credentials: Optional second INSERT provides login credentials
--    - Username: firstname.lastname (e.g., aarav.sharma)
--    - Password: Hashed format (replace with actual bcrypt hash in production)
--    - All students have email and phone numbers
-- 
-- To change student credentials:
-- 1. Update the 'student_password' with actual bcrypt hashed passwords
-- 2. Modify class name if different from 'Grade 12 Technical - T'
-- 3. Update phone numbers and emails as needed
-- ====================================================================
