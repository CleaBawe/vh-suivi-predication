-- Change construction_predication from text to text[] (array of steps)
-- Table is emptied first because existing single-string values cannot be
-- auto-cast; data is re-seeded from docs/themes_exercice.json after migration.

DELETE FROM themes_exercice;

ALTER TABLE themes_exercice ALTER COLUMN construction_predication DROP DEFAULT;
ALTER TABLE themes_exercice ALTER COLUMN construction_predication TYPE text[] USING NULL;
ALTER TABLE themes_exercice ALTER COLUMN construction_predication SET NOT NULL;