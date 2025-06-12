-- Add avatar storage fields to user table
-- Run: pnpm run db:push to apply these changes

ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS "avatar_base64" TEXT,
ADD COLUMN IF NOT EXISTS "avatar_updated_at" TIMESTAMP;

-- Create index for efficient avatar update queries
CREATE INDEX IF NOT EXISTS "idx_user_avatar_updated_at" ON "user" ("avatar_updated_at");

-- Optional: Add comment to document the purpose
COMMENT ON COLUMN "user"."avatar_base64" IS 'Base64 encoded user avatar image data';
COMMENT ON COLUMN "user"."avatar_updated_at" IS 'Timestamp when avatar was last synced from Google';