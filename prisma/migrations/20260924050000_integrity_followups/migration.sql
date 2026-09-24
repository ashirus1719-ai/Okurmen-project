BEGIN;

ALTER TABLE assignment_submissions
  ADD COLUMN assignment_snapshot JSONB NOT NULL DEFAULT '{}';

ALTER TABLE leads
  ADD COLUMN source_id UUID REFERENCES acquisition_sources(id) ON DELETE SET NULL;

ALTER TABLE payment_provider_events
  ADD COLUMN payment_attempt_id UUID REFERENCES payment_attempts(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX discount_targets_course_unique
  ON discount_targets(discount_id,course_id) WHERE course_id IS NOT NULL;
CREATE UNIQUE INDEX discount_targets_tariff_unique
  ON discount_targets(discount_id,tariff_id) WHERE tariff_id IS NOT NULL;
CREATE UNIQUE INDEX event_registrations_user_unique
  ON event_registrations(event_id,user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX event_registrations_lead_unique
  ON event_registrations(event_id,lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX payment_provider_events_attempt_idx
  ON payment_provider_events(payment_attempt_id) WHERE payment_attempt_id IS NOT NULL;
CREATE INDEX leads_source_idx ON leads(source_id,created_at DESC);

COMMIT;
