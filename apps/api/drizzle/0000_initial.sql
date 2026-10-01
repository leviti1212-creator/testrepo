CREATE TABLE `adapter_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source` text NOT NULL,
	`started_at` integer NOT NULL,
	`finished_at` integer,
	`ok` integer,
	`fetched` integer,
	`inserted` integer,
	`updated` integer,
	`error` text
);
--> statement-breakpoint
CREATE INDEX `adapter_runs_source_started` ON `adapter_runs` (`source`,`started_at`);--> statement-breakpoint
CREATE TABLE `listings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source` text NOT NULL,
	`source_id` text NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`price` real,
	`shipping_cost` real,
	`currency` text DEFAULT 'USD' NOT NULL,
	`condition` text DEFAULT 'unknown' NOT NULL,
	`listing_type` text DEFAULT 'fixed' NOT NULL,
	`location` text,
	`seller_name` text NOT NULL,
	`seller_json` text NOT NULL,
	`product_key` text,
	`product_json` text,
	`images_json` text DEFAULT '[]' NOT NULL,
	`posted_at` integer NOT NULL,
	`fetched_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`deal_score` real,
	`raw_json` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `listings_source_source_id` ON `listings` (`source`,`source_id`);--> statement-breakpoint
CREATE INDEX `listings_posted_at` ON `listings` (`posted_at`);--> statement-breakpoint
CREATE INDEX `listings_product_key` ON `listings` (`product_key`);--> statement-breakpoint
CREATE INDEX `listings_status` ON `listings` (`status`);--> statement-breakpoint
CREATE TABLE `price_observations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_key` text NOT NULL,
	`price` real NOT NULL,
	`condition` text NOT NULL,
	`source` text NOT NULL,
	`kind` text NOT NULL,
	`listing_id` integer,
	`observed_at` integer NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `price_obs_product_time` ON `price_observations` (`product_key`,`observed_at`);--> statement-breakpoint
CREATE TABLE `watches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`query` text,
	`categories_json` text DEFAULT '[]' NOT NULL,
	`product_keys_json` text DEFAULT '[]' NOT NULL,
	`min_storage_gb` integer,
	`max_price` real,
	`conditions_json` text DEFAULT '[]' NOT NULL,
	`sources_json` text DEFAULT '[]' NOT NULL,
	`shipped_only` integer DEFAULT false NOT NULL,
	`notify_via_json` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL
);
