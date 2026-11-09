CREATE TABLE "interview_record" (
	"user_id" text NOT NULL,
	"id" text NOT NULL,
	"data" jsonb NOT NULL,
	CONSTRAINT "interview_record_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "learning_sync_state" (
	"user_id" text PRIMARY KEY NOT NULL,
	"revision" integer DEFAULT 0 NOT NULL,
	"last_mutation_id" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "study_set_item" DROP CONSTRAINT "study_set_item_study_set_id_study_set_id_fk";
--> statement-breakpoint
ALTER TABLE "study_set_item" DROP CONSTRAINT "study_set_item_study_set_id_question_id_pk";--> statement-breakpoint
ALTER TABLE "study_set" DROP CONSTRAINT "study_set_pkey";--> statement-breakpoint
ALTER TABLE "study_set_item" ADD COLUMN "user_id" text;--> statement-breakpoint
UPDATE "study_set_item" AS item SET "user_id" = parent."user_id" FROM "study_set" AS parent WHERE item."study_set_id" = parent."id";--> statement-breakpoint
ALTER TABLE "study_set_item" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "study_set" ADD CONSTRAINT "study_set_user_id_id_pk" PRIMARY KEY("user_id","id");--> statement-breakpoint
ALTER TABLE "study_set_item" ADD CONSTRAINT "study_set_item_user_id_study_set_id_question_id_pk" PRIMARY KEY("user_id","study_set_id","question_id");--> statement-breakpoint
ALTER TABLE "interview_record" ADD CONSTRAINT "interview_record_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_sync_state" ADD CONSTRAINT "learning_sync_state_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_set_item" ADD CONSTRAINT "study_set_item_user_id_study_set_id_study_set_user_id_id_fk" FOREIGN KEY ("user_id","study_set_id") REFERENCES "public"."study_set"("user_id","id") ON DELETE cascade ON UPDATE no action;
