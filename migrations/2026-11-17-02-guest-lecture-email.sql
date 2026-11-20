ALTER TABLE `guest_lectures`
  ADD COLUMN `lecturer_email` varchar(255) DEFAULT NULL AFTER `lecturer_name`;
