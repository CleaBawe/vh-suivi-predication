-- Deduplicate courses: keep MIN(id) per titre, migrate progress/submissions, delete duplicates
-- Then add unique constraint to prevent future re-seeding issues

-- 1. Migrate any progress rows pointing to duplicate course IDs to the canonical ID
-- (only if the canonical ID doesn't already have a row for that user)
UPDATE progress p
SET course_id = (SELECT MIN(id) FROM courses WHERE titre = (SELECT titre FROM courses WHERE id = p.course_id))
WHERE p.course_id NOT IN (SELECT MIN(id) FROM courses GROUP BY titre)
  AND NOT EXISTS (
    SELECT 1 FROM progress p2
    WHERE p2.user_id = p.user_id
      AND p2.course_id = (SELECT MIN(id) FROM courses WHERE titre = (SELECT titre FROM courses WHERE id = p.course_id))
  );

-- 2. Delete remaining progress rows on duplicate course IDs (redundant — canonical already has a row for that user)
DELETE FROM progress
WHERE course_id NOT IN (SELECT MIN(id) FROM courses GROUP BY titre);

-- 3. Migrate submissions pointing to duplicate course IDs
UPDATE submissions
SET course_id = (SELECT MIN(id) FROM courses WHERE titre = (SELECT titre FROM courses WHERE id = submissions.course_id))
WHERE course_id IS NOT NULL
  AND course_id NOT IN (SELECT MIN(id) FROM courses GROUP BY titre);

-- 4. Delete duplicate courses (cascade handles course_audio_parts)
DELETE FROM courses
WHERE id NOT IN (SELECT MIN(id) FROM courses GROUP BY titre);

-- 5. Add unique constraint on courses.titre to prevent future duplicates
ALTER TABLE courses ADD CONSTRAINT courses_titre_unique UNIQUE (titre);
