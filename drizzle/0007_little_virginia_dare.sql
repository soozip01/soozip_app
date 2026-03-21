CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(200) NOT NULL,
	`brandName` varchar(100),
	`imageUrl` text,
	`quantity` int NOT NULL,
	`unitPrice` int NOT NULL,
	`totalPrice` int NOT NULL,
	`itemStatus` enum('normal','return_requested','exchange_requested','returned','exchanged') NOT NULL DEFAULT 'normal',
	`reviewWritten` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(30) NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending_payment','paid','preparing','shipping','delivered','confirmed','cancelled') NOT NULL DEFAULT 'paid',
	`totalAmount` int NOT NULL,
	`shippingFee` int NOT NULL DEFAULT 0,
	`discountAmount` int NOT NULL DEFAULT 0,
	`finalAmount` int NOT NULL,
	`recipientName` varchar(50) NOT NULL,
	`recipientPhone` varchar(20) NOT NULL,
	`postalCode` varchar(10) NOT NULL,
	`address` varchar(200) NOT NULL,
	`addressDetail` varchar(100),
	`deliveryMemo` varchar(100),
	`trackingNumber` varchar(50),
	`courierName` varchar(30),
	`paymentMethod` varchar(30),
	`paymentKey` varchar(100),
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `product_inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userNickname` varchar(50) NOT NULL,
	`productId` int NOT NULL,
	`title` varchar(100) NOT NULL,
	`content` text NOT NULL,
	`isSecret` boolean NOT NULL DEFAULT false,
	`answer` text,
	`answeredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userNickname` varchar(50) NOT NULL,
	`productId` int NOT NULL,
	`orderItemId` int,
	`rating` int NOT NULL,
	`content` text NOT NULL,
	`imageUrls` text,
	`isVisible` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `return_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderItemId` int NOT NULL,
	`orderId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('return','exchange') NOT NULL,
	`reason` enum('change_of_mind','defective','wrong_item','size_issue','other') NOT NULL,
	`reasonDetail` text,
	`status` enum('requested','approved','rejected','completed') NOT NULL DEFAULT 'requested',
	`adminNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `return_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlists_id` PRIMARY KEY(`id`)
);
