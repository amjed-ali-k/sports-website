ALTER TABLE `categories` RENAME TO `events`;--> statement-breakpoint
ALTER TABLE `events` RENAME COLUMN "certificate_template" TO "certificate_templates";--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
DROP INDEX IF EXISTS `categories_name_unique`;--> statement-breakpoint
ALTER TABLE `events` ADD `start_date` text NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `end_date` text NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `description` text;--> statement-breakpoint
ALTER TABLE `events` ADD `event_start_time` text;--> statement-breakpoint
ALTER TABLE `events` ADD `event_end_time` text;--> statement-breakpoint
ALTER TABLE `events` ADD `registration_start_date` text;--> statement-breakpoint
ALTER TABLE `events` ADD `registration_end_date` text;--> statement-breakpoint
ALTER TABLE `events` ADD `logo` text;--> statement-breakpoint
ALTER TABLE `events` ADD `max_registration_per_participant` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `organization_id` integer NOT NULL REFERENCES organizations(id);--> statement-breakpoint
ALTER TABLE `events` DROP COLUMN `participation_certificate_template`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_group_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`points_first` integer NOT NULL,
	`points_second` integer NOT NULL,
	`points_third` integer NOT NULL,
	`gender` text NOT NULL,
	`event_id` integer NOT NULL,
	`min_participants` integer NOT NULL,
	`max_participants` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_group_items`("id", "name", "points_first", "points_second", "points_third", "gender", "event_id", "min_participants", "max_participants", "created_at") SELECT "id", "name", "points_first", "points_second", "points_third", "gender", "event_id", "min_participants", "max_participants", "created_at" FROM `group_items`;--> statement-breakpoint
DROP TABLE `group_items`;--> statement-breakpoint
ALTER TABLE `__new_group_items` RENAME TO `group_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`points_first` integer NOT NULL,
	`points_second` integer NOT NULL,
	`gender` text NOT NULL,
	`points_third` integer NOT NULL,
	`event_id` integer NOT NULL,
	`max_participants` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_items`("id", "name", "points_first", "points_second", "gender", "points_third", "event_id", "max_participants", "created_at") SELECT "id", "name", "points_first", "points_second", "gender", "points_third", "event_id", "max_participants", "created_at" FROM `items`;--> statement-breakpoint
DROP TABLE `items`;--> statement-breakpoint
ALTER TABLE `__new_items` RENAME TO `items`;--> statement-breakpoint
ALTER TABLE `admins` ADD `description` text;--> statement-breakpoint
ALTER TABLE `admins` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `admins` ADD `organization_id` integer NOT NULL REFERENCES organizations(id);--> statement-breakpoint
ALTER TABLE `participants` ADD `organization_id` integer NOT NULL REFERENCES organizations(id);--> statement-breakpoint
ALTER TABLE `sections` ADD `organization_id` integer NOT NULL REFERENCES organizations(id);--> statement-breakpoint
ALTER TABLE `settings` ADD `organization_id` integer NOT NULL REFERENCES organizations(id);--> statement-breakpoint
ALTER TABLE `registrations` DROP COLUMN `group_id`;