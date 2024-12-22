CREATE TABLE `certificates` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`type` text,
	`data` text,
	`ref` integer,
	`itemId` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `certificates_key_unique` ON `certificates` (`key`);