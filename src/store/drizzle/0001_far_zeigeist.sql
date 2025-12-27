PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_store` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`address` text,
	`latitude` real,
	`longitude` real,
	`currencyCode` text,
	`productsById` text,
	`schedules` text,
	`features` text,
	`rate` real,
	`rateCount` integer
);
--> statement-breakpoint
INSERT INTO `__new_store`("id", "name", "address", "latitude", "longitude", "currencyCode", "productsById", "schedules", "features", "rate", "rateCount") SELECT "id", "name", "address", "latitude", "longitude", "currencyCode", "productsById", "schedules", "features", "rate", "rateCount" FROM `store`;--> statement-breakpoint
DROP TABLE `store`;--> statement-breakpoint
ALTER TABLE `__new_store` RENAME TO `store`;--> statement-breakpoint
PRAGMA foreign_keys=ON;