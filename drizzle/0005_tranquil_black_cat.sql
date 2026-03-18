ALTER TABLE `styling_progress` ADD `userId` varchar(128);--> statement-breakpoint
ALTER TABLE `styling_progress` ADD `step1` enum('pending','in_progress','done') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `styling_progress` ADD `step2` enum('pending','in_progress','done') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `styling_progress` ADD `step3` enum('pending','in_progress','done') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `styling_progress` ADD `step4` enum('pending','in_progress','done') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `styling_progress` ADD `step5` enum('pending','in_progress','done') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `styling_progress` ADD `step6` enum('pending','in_progress','done') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `styling_progress` ADD `step7` enum('pending','in_progress','done') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `styling_progress` ADD `adminNote` text;