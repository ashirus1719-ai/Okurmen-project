CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "contact" VARCHAR(120) NOT NULL,
    "direction" VARCHAR(24) NOT NULL,
    "format" VARCHAR(24) NOT NULL,
    "status" VARCHAR(24) NOT NULL DEFAULT 'new',
    "consent_version" VARCHAR(40) NOT NULL,
    "dedupe_key" VARCHAR(140) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "leads_dedupe_key_key" ON "leads"("dedupe_key");
CREATE INDEX "leads_status_created_at_idx" ON "leads"("status", "created_at");
