CREATE TABLE `store` (
	`id` numeric PRIMARY KEY NOT NULL,
	`name` text,
	`address` text,
	`latitude` numeric,
	`longitude` numeric,
	`currencyCode` text,
	`productsById` text,
	`schedules` text,
	`features` text,
	`rate` numeric,
	`rateCount` numeric
);
