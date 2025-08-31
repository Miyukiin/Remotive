CREATE TYPE "public"."list_color" AS ENUM('BLUE', 'GRAY', 'GREEN', 'ORANGE', 'PINK', 'PURPLE', 'RED', 'YELLOW');--> statement-breakpoint
ALTER TABLE "lists" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "lists" ADD COLUMN "color" "list_color" DEFAULT 'GRAY' NOT NULL;