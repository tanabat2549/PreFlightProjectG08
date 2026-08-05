CREATE TABLE "auspicious_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"is_buddha_day" boolean DEFAULT false,
	"is_auspicious_day" boolean DEFAULT false,
	"title" varchar(255) NOT NULL,
	"recommended_activities" text,
	CONSTRAINT "auspicious_days_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "daily_horoscopes" (
	"id" serial PRIMARY KEY NOT NULL,
	"zodiac_sign" varchar(50) NOT NULL,
	"date" date NOT NULL,
	"lucky_color" varchar(50) NOT NULL,
	"lucky_number" varchar(50) NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fortunes" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"work_fortune" text NOT NULL,
	"love_fortune" text NOT NULL,
	"money_fortune" text NOT NULL,
	"study_fortune" text NOT NULL,
	"health_fortune" text NOT NULL,
	CONSTRAINT "fortunes_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"temple_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "siemsee_histories" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"fortune_id" integer NOT NULL,
	"drawn_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "temples" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"address" text,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"open_time" varchar(10),
	"close_time" varchar(10),
	"image_url" text,
	"rating_avg" double precision DEFAULT 0,
	"rating_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(100),
	"phone" varchar(20),
	"password" text,
	"birth_date" date NOT NULL,
	"google_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_temple_id_temples_id_fk" FOREIGN KEY ("temple_id") REFERENCES "public"."temples"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "siemsee_histories" ADD CONSTRAINT "siemsee_histories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "siemsee_histories" ADD CONSTRAINT "siemsee_histories_fortune_id_fortunes_id_fk" FOREIGN KEY ("fortune_id") REFERENCES "public"."fortunes"("id") ON DELETE no action ON UPDATE no action;