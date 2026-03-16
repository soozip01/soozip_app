CREATE TABLE `furniture_info` (
	`id` int AUTO_INCREMENT NOT NULL,
	`progressId` int NOT NULL,
	`userNickname` varchar(50) NOT NULL,
	`inputType` enum('link','photo') NOT NULL,
	`productLink` text,
	`productOption` varchar(200),
	`photoUrl` text,
	`productName` varchar(100),
	`width` varchar(20),
	`depth` varchar(20),
	`height` varchar(20),
	`notes` varchar(300),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `furniture_info_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `styling_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userNickname` varchar(50) NOT NULL,
	`stylingType` enum('배치솔루션','풀스타') NOT NULL,
	`currentStep` int NOT NULL DEFAULT 1,
	`totalSteps` int NOT NULL,
	`status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
	`bookingId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `styling_progress_id` PRIMARY KEY(`id`)
);
