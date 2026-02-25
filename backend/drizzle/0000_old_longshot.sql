CREATE TABLE `articles` (
	`id` varchar(36) NOT NULL,
	`title` varchar(150) NOT NULL,
	`content` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`status` enum('Draft','Published') DEFAULT 'Draft',
	`author_id` varchar(36) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_analytics` (
	`id` varchar(36) NOT NULL,
	`article_id` varchar(36) NOT NULL,
	`view_count` int DEFAULT 0,
	`date` timestamp NOT NULL,
	CONSTRAINT `daily_analytics_id` PRIMARY KEY(`id`),
	CONSTRAINT `daily_analytics_article_id_date_unique` UNIQUE(`article_id`,`date`)
);
--> statement-breakpoint
CREATE TABLE `read_logs` (
	`id` varchar(36) NOT NULL,
	`article_id` varchar(36) NOT NULL,
	`reader_identifier` varchar(255) NOT NULL,
	`view_date` date NOT NULL,
	CONSTRAINT `read_logs_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_daily_view` UNIQUE(`article_id`,`reader_identifier`,`view_date`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`name` varchar(191) NOT NULL,
	`email` varchar(191) NOT NULL,
	`password` varchar(191) NOT NULL,
	`role` enum('author','reader') NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
