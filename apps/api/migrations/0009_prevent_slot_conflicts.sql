-- Preserve existing requests while preventing new conflicts and conflicting reschedules.
CREATE TRIGGER quote_requests_guard_insert_slot
BEFORE INSERT ON quote_requests
WHEN NEW.status NOT IN ('completed', 'cancelled')
  AND EXISTS (
    SELECT 1 FROM quote_requests
    WHERE preferred_date = NEW.preferred_date
      AND preferred_time_window = NEW.preferred_time_window
      AND status NOT IN ('completed', 'cancelled')
  )
BEGIN
  SELECT RAISE(ABORT, 'consultation_slot_conflict');
END;

CREATE TRIGGER quote_requests_guard_update_slot
BEFORE UPDATE OF preferred_date, preferred_time_window, status ON quote_requests
WHEN NEW.status NOT IN ('completed', 'cancelled')
  AND (OLD.status IN ('completed', 'cancelled')
    OR NEW.preferred_date IS NOT OLD.preferred_date
    OR NEW.preferred_time_window IS NOT OLD.preferred_time_window)
  AND EXISTS (
    SELECT 1 FROM quote_requests
    WHERE id <> OLD.id
      AND preferred_date = NEW.preferred_date
      AND preferred_time_window = NEW.preferred_time_window
      AND status NOT IN ('completed', 'cancelled')
  )
BEGIN
  SELECT RAISE(ABORT, 'consultation_slot_conflict');
END;
