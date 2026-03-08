CREATE TABLE `email_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(256) NOT NULL,
	`nickname` varchar(50) NOT NULL,
	`termsAgreed` boolean NOT NULL DEFAULT false,
	`privacyAgreed` boolean NOT NULL DEFAULT false,
	`marketingAgreed` boolean NOT NULL DEFAULT false,
	`ageAgreed` boolean NOT NULL DEFAULT false,
	`emailVerified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `kakao_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kakaoId` varchar(64) NOT NULL,
	`nickname` varchar(50) NOT NULL,
	`email` varchar(320),
	`profileImageUrl` text,
	`termsAgreed` boolean NOT NULL DEFAULT false,
	`privacyAgreed` boolean NOT NULL DEFAULT false,
	`marketingAgreed` boolean NOT NULL DEFAULT false,
	`ageAgreed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kakao_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `kakao_users_kakaoId_unique` UNIQUE(`kakaoId`)
);
--> statement-breakpoint
CREATE TABLE `naver_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`naverId` varchar(64) NOT NULL,
	`nickname` varchar(50) NOT NULL,
	`email` varchar(320),
	`profileImageUrl` text,
	`termsAgreed` boolean NOT NULL DEFAULT false,
	`privacyAgreed` boolean NOT NULL DEFAULT false,
	`marketingAgreed` boolean NOT NULL DEFAULT false,
	`ageAgreed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `naver_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `naver_users_naverId_unique` UNIQUE(`naverId`)
);
