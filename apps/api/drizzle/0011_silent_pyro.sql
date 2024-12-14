ALTER TABLE `group_items` ADD `status` text DEFAULT 'scheduled' NOT NULL;--> statement-breakpoint
ALTER TABLE `group_registrations` ADD `section_id` integer REFERENCES sections(id);--> statement-breakpoint
ALTER TABLE `items` ADD `status` text DEFAULT 'scheduled' NOT NULL;