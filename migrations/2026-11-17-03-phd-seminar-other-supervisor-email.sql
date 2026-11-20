ALTER TABLE `phd_seminars`
  ADD COLUMN `supervisor_other_email` varchar(255) DEFAULT NULL AFTER `supervisor_other`,
  ADD COLUMN `co_supervisor_other_email` varchar(255) DEFAULT NULL AFTER `co_supervisor_other`;
