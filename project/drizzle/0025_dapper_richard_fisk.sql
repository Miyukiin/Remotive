ALTER TABLE "roles" ALTER COLUMN "role_name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "role_name" SET DEFAULT 'No Role Yet'::text;--> statement-breakpoint
DROP TYPE "public"."role_name";--> statement-breakpoint
CREATE TYPE "public"."role_name" AS ENUM('No Role Yet', 'Project Manager', 'Project Member');--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "role_name" SET DEFAULT 'No Role Yet'::"public"."role_name";--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "role_name" SET DATA TYPE "public"."role_name" USING "role_name"::"public"."role_name";