PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_oauth_accounts` (
	`provider_id` text NOT NULL,
	`provider_user_id` text NOT NULL,
	`user_id` text NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`provider_id`, `provider_user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_oauth_accounts`("provider_id", "provider_user_id", "user_id", "updated_at") SELECT "provider_id", "provider_user_id", "user_id", "updated_at" FROM `oauth_accounts`;--> statement-breakpoint
DROP TABLE `oauth_accounts`;--> statement-breakpoint
ALTER TABLE `__new_oauth_accounts` RENAME TO `oauth_accounts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_passkeys` (
	`id` text PRIMARY KEY NOT NULL,
	`public_key` text NOT NULL,
	`user_id` text NOT NULL,
	`counter` integer DEFAULT 0 NOT NULL,
	`device_type` text,
	`backed_up` integer DEFAULT false NOT NULL,
	`transports` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_passkeys`("id", "public_key", "user_id", "counter", "device_type", "backed_up", "transports", "created_at") SELECT "id", "public_key", "user_id", "counter", "device_type", "backed_up", "transports", "created_at" FROM `passkeys`;--> statement-breakpoint
DROP TABLE `passkeys`;--> statement-breakpoint
ALTER TABLE `__new_passkeys` RENAME TO `passkeys`;--> statement-breakpoint
CREATE TABLE `__new_passwords` (
	`user_id` text PRIMARY KEY NOT NULL,
	`hashed_password` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_passwords`("user_id", "hashed_password", "updated_at") SELECT "user_id", "hashed_password", "updated_at" FROM `passwords`;--> statement-breakpoint
DROP TABLE `passwords`;--> statement-breakpoint
ALTER TABLE `__new_passwords` RENAME TO `passwords`;--> statement-breakpoint
CREATE TABLE `__new_users_table` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`plan` text DEFAULT 'free' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users_table`("id", "name", "email", "plan", "created_at", "updated_at") SELECT "id", "name", "email", "plan", "created_at", "updated_at" FROM `users_table`;--> statement-breakpoint
DROP TABLE `users_table`;--> statement-breakpoint
ALTER TABLE `__new_users_table` RENAME TO `users_table`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_email_unique` ON `users_table` (`email`);