ALTER TABLE `order_items` MODIFY COLUMN `productId` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` ADD `optionLabel` varchar(200);--> statement-breakpoint
ALTER TABLE `orders` ADD `couponDiscount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `pointUsed` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `ordererName` varchar(50);--> statement-breakpoint
ALTER TABLE `orders` ADD `ordererPhone` varchar(20);--> statement-breakpoint
ALTER TABLE `orders` ADD `ordererEmail` varchar(320);