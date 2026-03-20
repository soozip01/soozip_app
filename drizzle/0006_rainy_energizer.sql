CREATE TABLE `refresh_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenHash` varchar(256) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`revoked` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `refresh_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `refresh_tokens_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `soozip_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` enum('kakao','naver','email') NOT NULL,
	`providerId` varchar(128) NOT NULL,
	`email` varchar(320),
	`nickname` varchar(50) NOT NULL,
	`profileImageUrl` text,
	`passwordHash` varchar(256),
	`emailVerified` boolean NOT NULL DEFAULT false,
	`termsAgreed` boolean NOT NULL DEFAULT false,
	`privacyAgreed` boolean NOT NULL DEFAULT false,
	`marketingAgreed` boolean NOT NULL DEFAULT false,
	`ageAgreed` boolean NOT NULL DEFAULT false,
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `soozip_users_id` PRIMARY KEY(`id`)
);
