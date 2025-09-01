ALTER TABLE "audit_logs" ADD COLUMN "subject_user_id" integer;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_subject_user_id_users_id_fk" FOREIGN KEY ("subject_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_by_subject" ON "audit_logs" USING btree ("subject_user_id","created_at");