CREATE TABLE `group_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`points_first` integer NOT NULL,
	`points_second` integer NOT NULL,
	`points_third` integer NOT NULL,
	`gender` text NOT NULL,
	`category_id` integer NOT NULL,
	`min_participants` integer NOT NULL,
	`max_participants` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `group_registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group_item_id` integer NOT NULL,
	`participant_ids` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`group_item_id`) REFERENCES `group_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `group_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group_registration_id` integer NOT NULL,
	`position` text NOT NULL,
	`points` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`group_registration_id`) REFERENCES `group_registrations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`points_first` integer NOT NULL,
	`points_second` integer NOT NULL,
	`gender` text NOT NULL,
	`points_third` integer NOT NULL,
	`category_id` integer NOT NULL,
	`max_participants` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_items`("id", "name", "points_first", "points_second", "gender", "points_third", "category_id", "max_participants", "created_at") SELECT "id", "name", "points_first", "points_second", "gender", "points_third", "category_id", "max_participants", "created_at" FROM `items`;--> statement-breakpoint
DROP TABLE `items`;--> statement-breakpoint
ALTER TABLE `__new_items` RENAME TO `items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;