CREATE TABLE `admins` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`description` text,
	`avatar` text,
	`organization_id` integer NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `admins` (`email`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`description` text,
	`event_start_time` text,
	`event_end_time` text,
	`registration_start_date` text,
	`registration_end_date` text,
	`certificate_templates` text,
	`logo` text,
	`max_registration_per_participant` integer NOT NULL,
	`organization_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `group_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`points_first` integer NOT NULL,
	`points_second` integer NOT NULL,
	`points_third` integer NOT NULL,
	`gender` text NOT NULL,
	`icon_name` text,
	`event_id` integer NOT NULL,
	`can_register` integer DEFAULT 1 NOT NULL,
	`is_finished` integer DEFAULT 0 NOT NULL,
	`is_result_published` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`min_participants` integer NOT NULL,
	`max_participants` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `group_registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group_item_id` integer NOT NULL,
	`name` text,
	`section_id` integer,
	`participant_ids` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`group_item_id`) REFERENCES `group_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `group_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group_registration_id` integer NOT NULL,
	`group-item_id` integer NOT NULL,
	`position` text NOT NULL,
	`points` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`group_registration_id`) REFERENCES `group_registrations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group-item_id`) REFERENCES `group_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`points_first` integer NOT NULL,
	`points_second` integer NOT NULL,
	`gender` text NOT NULL,
	`points_third` integer NOT NULL,
	`icon_name` text,
	`can_register` integer DEFAULT 1 NOT NULL,
	`is_finished` integer DEFAULT 0 NOT NULL,
	`is_result_published` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`event_id` integer NOT NULL,
	`max_participants` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `participants` (
	`id` integer PRIMARY KEY NOT NULL,
	`chest_no` text NOT NULL,
	`full_name` text NOT NULL,
	`section_id` integer NOT NULL,
	`avatar` text,
	`organization_id` integer NOT NULL,
	`batch` text NOT NULL,
	`gender` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `chest_no_idx` ON `participants` (`chest_no`);--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` integer PRIMARY KEY NOT NULL,
	`item_id` integer NOT NULL,
	`participant_id` integer NOT NULL,
	`meta_info` text,
	`status` text DEFAULT 'registered' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `results` (
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
CREATE TABLE `sections` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`logo` text,
	`color` text,
	`organization_id` integer NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`organization_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);