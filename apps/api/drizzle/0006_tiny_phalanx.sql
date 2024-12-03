PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_participants` (
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
INSERT INTO `__new_participants`("id", "chest_no", "full_name", "section_id", "avatar", "organization_id", "batch", "gender", "created_at", "updated_at") SELECT "id", "chest_no", "full_name", "section_id", "avatar", "organization_id", "batch", "gender", "created_at", "updated_at" FROM `participants`;--> statement-breakpoint
DROP TABLE `participants`;--> statement-breakpoint
ALTER TABLE `__new_participants` RENAME TO `participants`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `chest_no_idx` ON `participants` (`chest_no`);