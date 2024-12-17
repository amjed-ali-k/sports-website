ALTER TABLE `participants` ADD `no` text;--> statement-breakpoint
CREATE UNIQUE INDEX `participants_no_unique` ON `participants` (`no`);