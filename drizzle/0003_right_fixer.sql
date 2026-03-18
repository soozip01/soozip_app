CREATE TABLE `designer_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`designerId` int NOT NULL,
	`reviewerNickname` varchar(50) NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`stylingType` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `designer_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `designers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nickname` varchar(50) NOT NULL,
	`email` varchar(320) NOT NULL,
	`profileImageUrl` text,
	`bio` varchar(200),
	`specialties` text,
	`portfolioUrls` text,
	`completedFurniture` int NOT NULL DEFAULT 0,
	`completedFullOnline` int NOT NULL DEFAULT 0,
	`completedFullOffline` int NOT NULL DEFAULT 0,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`applyReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `designers_id` PRIMARY KEY(`id`),
	CONSTRAINT `designers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `styling_bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookerNickname` varchar(50) NOT NULL,
	`bookerEmail` varchar(320),
	`stylingType` enum('배치솔루션','풀스타') NOT NULL,
	`designerId` int,
	`preferredDate` varchar(20) NOT NULL,
	`preferredTime` varchar(10),
	`roomSize` varchar(20),
	`description` text,
	`surveyCompleted` boolean NOT NULL DEFAULT false,
	`status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `styling_bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `styling_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requesterNickname` varchar(50) NOT NULL,
	`requesterEmail` varchar(320),
	`stylingType` enum('배치솔루션','풀스타') NOT NULL,
	`roomSize` varchar(20),
	`roomType` varchar(50),
	`budget` varchar(50),
	`description` text,
	`preferredDate` varchar(20),
	`status` enum('waiting','matched','completed','cancelled') NOT NULL DEFAULT 'waiting',
	`matchedDesignerId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `styling_requests_id` PRIMARY KEY(`id`)
);
