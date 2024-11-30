CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`certificate_template` text,
	`participation_certificate_template` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "name", "certificate_template", "participation_certificate_template", "created_at", "updated_at") SELECT "id", "name", "certificate_template", "participation_certificate_template", "created_at", "updated_at" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_items` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category_id` integer NOT NULL,
	`is_group` integer DEFAULT false NOT NULL,
	`gender` text NOT NULL,
	`maxParticipants` integer DEFAULT 0 NOT NULL,
	`points_first` integer NOT NULL,
	`points_second` integer NOT NULL,
	`points_third` integer NOT NULL,
	`status` text DEFAULT 'yet_to_begin' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_items`("id", "name", "category_id", "is_group", "gender", "maxParticipants", "points_first", "points_second", "points_third", "status", "created_at", "updated_at") SELECT "id", "name", "category_id", "is_group", "gender", "maxParticipants", "points_first", "points_second", "points_third", "status", "created_at", "updated_at" FROM `items`;--> statement-breakpoint
DROP TABLE `items`;--> statement-breakpoint
ALTER TABLE `__new_items` RENAME TO `items`;--> statement-breakpoint
CREATE TABLE `__new_participants` (
	`id` integer PRIMARY KEY NOT NULL,
	`chest_no` text NOT NULL,
	`full_name` text NOT NULL,
	`section_id` integer NOT NULL,
	`avatar` text,
	`semester` integer NOT NULL,
	`gender` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_participants`("id", "chest_no", "full_name", "section_id", "avatar", "semester", "gender", "created_at", "updated_at") SELECT "id", "chest_no", "full_name", "section_id", "avatar", "semester", "gender", "created_at", "updated_at" FROM `participants`;--> statement-breakpoint
DROP TABLE `participants`;--> statement-breakpoint
ALTER TABLE `__new_participants` RENAME TO `participants`;--> statement-breakpoint
CREATE UNIQUE INDEX `chest_no_idx` ON `participants` (`chest_no`);--> statement-breakpoint
CREATE TABLE `__new_registrations` (
	`id` integer PRIMARY KEY NOT NULL,
	`item_id` integer NOT NULL,
	`participant_id` integer NOT NULL,
	`group_id` integer,
	`meta_info` text,
	`status` text DEFAULT 'registered' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_registrations`("id", "item_id", "participant_id", "group_id", "meta_info", "status", "created_at", "updated_at") SELECT "id", "item_id", "participant_id", "group_id", "meta_info", "status", "created_at", "updated_at" FROM `registrations`;--> statement-breakpoint
DROP TABLE `registrations`;--> statement-breakpoint
ALTER TABLE `__new_registrations` RENAME TO `registrations`;--> statement-breakpoint
CREATE TABLE `__new_results` (
	`id` integer PRIMARY KEY NOT NULL,
	`item_id` integer NOT NULL,
	`position` text NOT NULL,
	`registration_id` integer NOT NULL,
	`points` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_results`("id", "item_id", "position", "registration_id", "points", "created_at", "updated_at") SELECT "id", "item_id", "position", "registration_id", "points", "created_at", "updated_at" FROM `results`;--> statement-breakpoint
DROP TABLE `results`;--> statement-breakpoint
ALTER TABLE `__new_results` RENAME TO `results`;