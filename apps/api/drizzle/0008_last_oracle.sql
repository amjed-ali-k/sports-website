ALTER TABLE `group_items` ADD `icon_name` text;--> statement-breakpoint
ALTER TABLE `group_items` ADD `can_register` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `group_items` ADD `is_finished` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `group_items` ADD `is_result_published` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `items` ADD `can_register` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `items` ADD `is_finished` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `items` ADD `is_result_published` integer DEFAULT 0 NOT NULL;