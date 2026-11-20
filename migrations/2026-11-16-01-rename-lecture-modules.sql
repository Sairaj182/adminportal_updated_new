-- Run once before deploying the renamed lecture API routes.
-- RENAME TABLE moves the existing rows and indexes without copying or dropping them.
RENAME TABLE `guest_lectures` TO `phd_seminars`,
             `institute_lectures` TO `guest_lectures`;

-- The former institute lecture records now belong to the Guest Lectures module.
UPDATE `guest_lectures`
SET `category` = 'Guest Lecture'
WHERE `category` = 'Institute Lecture';

ALTER TABLE guest_lectures
ALTER COLUMN category SET DEFAULT 'Guest Lecture';
