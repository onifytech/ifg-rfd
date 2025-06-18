CREATE TABLE "rfd" (
	"id" text PRIMARY KEY NOT NULL,
	"rfd_number" integer NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"author_id" text NOT NULL,
	"google_doc_id" text NOT NULL,
	"google_doc_url" text NOT NULL,
	"tags" text,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_synced_at" timestamp,
	CONSTRAINT "rfd_rfd_number_unique" UNIQUE("rfd_number"),
	CONSTRAINT "rfd_google_doc_id_unique" UNIQUE("google_doc_id")
);
--> statement-breakpoint
CREATE TABLE "rfd_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"rfd_id" text NOT NULL,
	"author_id" text NOT NULL,
	"content" text NOT NULL,
	"parent_id" text,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfd_endorsement" (
	"id" text PRIMARY KEY NOT NULL,
	"rfd_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rfd_endorsement_rfd_id_user_id_unique" UNIQUE("rfd_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "rfd_status_history" (
	"id" text PRIMARY KEY NOT NULL,
	"rfd_id" text NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"changed_by_id" text NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfd_tag" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rfd_tag_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "rfd_tag_relation" (
	"id" text PRIMARY KEY NOT NULL,
	"rfd_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"google_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"picture" text,
	"avatar_base64" text,
	"avatar_updated_at" timestamp,
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "rfd" ADD CONSTRAINT "rfd_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfd_comment" ADD CONSTRAINT "rfd_comment_rfd_id_rfd_id_fk" FOREIGN KEY ("rfd_id") REFERENCES "public"."rfd"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfd_comment" ADD CONSTRAINT "rfd_comment_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfd_endorsement" ADD CONSTRAINT "rfd_endorsement_rfd_id_rfd_id_fk" FOREIGN KEY ("rfd_id") REFERENCES "public"."rfd"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfd_endorsement" ADD CONSTRAINT "rfd_endorsement_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfd_status_history" ADD CONSTRAINT "rfd_status_history_rfd_id_rfd_id_fk" FOREIGN KEY ("rfd_id") REFERENCES "public"."rfd"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfd_status_history" ADD CONSTRAINT "rfd_status_history_changed_by_id_user_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfd_tag_relation" ADD CONSTRAINT "rfd_tag_relation_rfd_id_rfd_id_fk" FOREIGN KEY ("rfd_id") REFERENCES "public"."rfd"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfd_tag_relation" ADD CONSTRAINT "rfd_tag_relation_tag_id_rfd_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."rfd_tag"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;