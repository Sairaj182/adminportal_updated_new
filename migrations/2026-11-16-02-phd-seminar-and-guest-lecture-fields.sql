-- Run after 2026-11-16-01-rename-lecture-modules.sql.
-- Keep existing seminar names intact while moving the field to its new meaning.
ALTER TABLE `phd_seminars`
  CHANGE COLUMN `seminar_name` `seminar_type` varchar(1000) NOT NULL,
  DROP COLUMN `subject`,
  ADD COLUMN `supervisor_other` varchar(500) DEFAULT NULL AFTER `supervisor_email`,
  ADD COLUMN `co_supervisor_email` varchar(255) DEFAULT NULL AFTER `supervisor_other`,
  ADD COLUMN `co_supervisor_other` varchar(500) DEFAULT NULL AFTER `co_supervisor_email`;

-- This is now the sole allowed category for every existing Guest Lecture row.
UPDATE `guest_lectures`
SET `category` = 'Institute Seminar';

ALTER TABLE `guest_lectures`
  MODIFY COLUMN `category` varchar(255) NOT NULL DEFAULT 'Institute Seminar';
