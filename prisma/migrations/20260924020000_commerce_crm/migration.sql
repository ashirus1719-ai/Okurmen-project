BEGIN;

CREATE TYPE "OrderStatus" AS ENUM ('DRAFT','PENDING_PAYMENT','PARTIALLY_PAID','PAID','FULFILLED','CANCELLED','REFUNDED','PARTIALLY_REFUNDED');
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED','PENDING','AUTHORIZED','SUCCEEDED','FAILED','CANCELLED','EXPIRED','REFUNDED','PARTIALLY_REFUNDED');

ALTER TABLE leads
  ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN email CITEXT, ADD COLUMN phone_e164 VARCHAR(20),
  ADD COLUMN preferred_contact VARCHAR(20), ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  ADD COLUMN preferred_format "CourseFormat", ADD COLUMN source_code VARCHAR(80),
  ADD COLUMN utm_source VARCHAR(160), ADD COLUMN utm_medium VARCHAR(160), ADD COLUMN utm_campaign VARCHAR(160),
  ADD COLUMN utm_content VARCHAR(160), ADD COLUMN utm_term VARCHAR(160), ADD COLUMN landing_path TEXT,
  ADD COLUMN referrer_url TEXT, ADD COLUMN assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN score INTEGER NOT NULL DEFAULT 0, ADD COLUMN updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  ADD COLUMN contacted_at TIMESTAMPTZ(3), ADD COLUMN converted_at TIMESTAMPTZ(3), ADD COLUMN rejected_reason TEXT;
CREATE INDEX leads_pipeline_idx ON leads(status,assigned_to,created_at DESC);
CREATE INDEX leads_course_idx ON leads(course_id,created_at DESC);
CREATE INDEX leads_phone_idx ON leads(phone_e164) WHERE phone_e164 IS NOT NULL;
CREATE INDEX leads_email_idx ON leads(email) WHERE email IS NOT NULL;

CREATE TABLE acquisition_sources (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code VARCHAR(80) NOT NULL UNIQUE, name VARCHAR(160) NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ(3) NOT NULL DEFAULT now());
CREATE TABLE lead_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE, type VARCHAR(40) NOT NULL, actor_id UUID REFERENCES users(id) ON DELETE SET NULL, from_status VARCHAR(30), to_status VARCHAR(30), payload JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ(3) NOT NULL DEFAULT now());
CREATE INDEX lead_events_timeline_idx ON lead_events(lead_id,created_at DESC);
CREATE TABLE lead_tasks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE, assignee_id UUID REFERENCES users(id) ON DELETE SET NULL, type VARCHAR(40) NOT NULL, title VARCHAR(240) NOT NULL, due_at TIMESTAMPTZ(3), completed_at TIMESTAMPTZ(3), outcome TEXT, created_at TIMESTAMPTZ(3) NOT NULL DEFAULT now());
CREATE INDEX lead_tasks_open_idx ON lead_tasks(assignee_id,due_at) WHERE completed_at IS NULL;
CREATE TABLE lead_course_interests (lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE, course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT, priority SMALLINT NOT NULL DEFAULT 1, PRIMARY KEY(lead_id,course_id));
CREATE TABLE consultations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), lead_id UUID REFERENCES leads(id) ON DELETE SET NULL, user_id UUID REFERENCES users(id) ON DELETE SET NULL, consultant_id UUID REFERENCES users(id) ON DELETE SET NULL, starts_at TIMESTAMPTZ(3) NOT NULL, ends_at TIMESTAMPTZ(3), channel VARCHAR(20) NOT NULL CHECK(channel IN ('PHONE','ONLINE','OFFLINE','CHAT')), status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' CHECK(status IN ('SCHEDULED','CONFIRMED','COMPLETED','NO_SHOW','CANCELLED')), meeting_url TEXT, notes TEXT, outcome TEXT, created_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(), CHECK(ends_at IS NULL OR ends_at>starts_at));

CREATE TABLE reservations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), lead_id UUID REFERENCES leads(id) ON DELETE SET NULL, user_id UUID REFERENCES users(id) ON DELETE SET NULL, group_id UUID NOT NULL REFERENCES "groups"(id) ON DELETE RESTRICT, tariff_id UUID REFERENCES tariffs(id) ON DELETE RESTRICT, status VARCHAR(20) NOT NULL DEFAULT 'HELD' CHECK(status IN ('HELD','CONFIRMED','EXPIRED','CANCELLED','CONVERTED')), expires_at TIMESTAMPTZ(3) NOT NULL, created_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT now());
CREATE INDEX reservations_capacity_idx ON reservations(group_id,status,expires_at);

CREATE TABLE orders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_number VARCHAR(40) NOT NULL UNIQUE, user_id UUID REFERENCES users(id) ON DELETE RESTRICT, lead_id UUID REFERENCES leads(id) ON DELETE SET NULL, status "OrderStatus" NOT NULL DEFAULT 'DRAFT', currency CHAR(3) NOT NULL CHECK(currency ~ '^[A-Z]{3}$'), subtotal_minor BIGINT NOT NULL CHECK(subtotal_minor>=0), discount_minor BIGINT NOT NULL DEFAULT 0 CHECK(discount_minor>=0), total_minor BIGINT NOT NULL CHECK(total_minor>=0), paid_minor BIGINT NOT NULL DEFAULT 0 CHECK(paid_minor>=0), customer_name VARCHAR(200) NOT NULL, customer_email CITEXT, customer_phone VARCHAR(20), billing_details JSONB NOT NULL DEFAULT '{}', offer_version_id UUID REFERENCES legal_document_versions(id) ON DELETE RESTRICT, created_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(), paid_at TIMESTAMPTZ(3), cancelled_at TIMESTAMPTZ(3), CHECK(discount_minor<=subtotal_minor), CHECK(total_minor=subtotal_minor-discount_minor));
CREATE INDEX orders_user_created_idx ON orders(user_id,created_at DESC);
CREATE INDEX orders_status_created_idx ON orders(status,created_at DESC);
CREATE TABLE order_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT, item_type VARCHAR(30) NOT NULL CHECK(item_type IN ('COURSE','TARIFF','GROUP','EVENT','OTHER')), course_id UUID REFERENCES courses(id) ON DELETE RESTRICT, tariff_id UUID REFERENCES tariffs(id) ON DELETE RESTRICT, group_id UUID REFERENCES "groups"(id) ON DELETE RESTRICT, description VARCHAR(300) NOT NULL, quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity>0), unit_price_minor BIGINT NOT NULL CHECK(unit_price_minor>=0), discount_minor BIGINT NOT NULL DEFAULT 0 CHECK(discount_minor>=0), total_minor BIGINT NOT NULL CHECK(total_minor>=0), price_snapshot JSONB NOT NULL DEFAULT '{}');
CREATE TABLE order_status_history (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE, from_status "OrderStatus", to_status "OrderStatus" NOT NULL, actor_id UUID REFERENCES users(id), reason TEXT, created_at TIMESTAMPTZ(3) NOT NULL DEFAULT now());
CREATE TABLE order_discounts (order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT, discount_id UUID NOT NULL REFERENCES discounts(id) ON DELETE RESTRICT, promo_code_id UUID REFERENCES promo_codes(id) ON DELETE RESTRICT, amount_minor BIGINT NOT NULL CHECK(amount_minor>=0), PRIMARY KEY(order_id,discount_id));
ALTER TABLE reservations ADD COLUMN converted_order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

CREATE TABLE payment_attempts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT, provider VARCHAR(50) NOT NULL, provider_payment_id VARCHAR(255), idempotency_key VARCHAR(128) NOT NULL UNIQUE, status "PaymentStatus" NOT NULL DEFAULT 'CREATED', amount_minor BIGINT NOT NULL CHECK(amount_minor>0), currency CHAR(3) NOT NULL CHECK(currency ~ '^[A-Z]{3}$'), checkout_url TEXT, failure_code VARCHAR(100), failure_message TEXT, provider_payload JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(), expires_at TIMESTAMPTZ(3), succeeded_at TIMESTAMPTZ(3));
CREATE UNIQUE INDEX payment_provider_id_unique ON payment_attempts(provider,provider_payment_id) WHERE provider_payment_id IS NOT NULL;
CREATE INDEX payment_order_idx ON payment_attempts(order_id,created_at DESC);
CREATE TABLE payment_provider_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), provider VARCHAR(50) NOT NULL, provider_event_id VARCHAR(255) NOT NULL, event_type VARCHAR(100) NOT NULL, signature_valid BOOLEAN NOT NULL DEFAULT false, payload JSONB NOT NULL, received_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(), processed_at TIMESTAMPTZ(3), processing_error TEXT, UNIQUE(provider,provider_event_id));
CREATE TABLE payment_allocations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), payment_attempt_id UUID NOT NULL REFERENCES payment_attempts(id) ON DELETE RESTRICT, order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE RESTRICT, amount_minor BIGINT NOT NULL CHECK(amount_minor>0), UNIQUE(payment_attempt_id,order_item_id));
CREATE TABLE refunds (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), payment_attempt_id UUID NOT NULL REFERENCES payment_attempts(id) ON DELETE RESTRICT, provider_refund_id VARCHAR(255), amount_minor BIGINT NOT NULL CHECK(amount_minor>0), reason TEXT, status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED' CHECK(status IN ('REQUESTED','APPROVED','PROCESSING','SUCCEEDED','FAILED','CANCELLED')), requested_by UUID REFERENCES users(id), approved_by UUID REFERENCES users(id), requested_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(), processed_at TIMESTAMPTZ(3));
CREATE TABLE refund_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), refund_id UUID NOT NULL REFERENCES refunds(id) ON DELETE CASCADE, status VARCHAR(20) NOT NULL, payload JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ(3) NOT NULL DEFAULT now());
CREATE TABLE invoices (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT, invoice_number VARCHAR(50) NOT NULL UNIQUE, status VARCHAR(20) NOT NULL DEFAULT 'ISSUED', issued_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(), due_at TIMESTAMPTZ(3), paid_at TIMESTAMPTZ(3), pdf_media_id UUID REFERENCES media_assets(id), fiscal_data JSONB NOT NULL DEFAULT '{}');
CREATE TABLE promo_redemptions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE RESTRICT, order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT, user_id UUID REFERENCES users(id) ON DELETE RESTRICT, discount_minor BIGINT NOT NULL CHECK(discount_minor>=0), redeemed_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(), UNIQUE(promo_code_id,order_id));

CREATE TABLE enrollment_order_items (enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE RESTRICT, order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE RESTRICT, PRIMARY KEY(enrollment_id,order_item_id));

COMMIT;
