CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`orderId` text NOT NULL,
	`userId` integer NOT NULL,
	`providerId` integer NOT NULL,
	`conversationId` integer,
	`serviceType` text NOT NULL,
	`serviceDescription` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`scheduledAt` integer,
	`isAsap` integer DEFAULT true NOT NULL,
	`locationAddress` text,
	`locationLat` text,
	`locationLng` text,
	`specialInstructions` text,
	`estimatedCostMin` integer,
	`estimatedCostMax` integer,
	`finalCost` integer,
	`durationMinutes` integer,
	`providerEta` integer,
	`providerLat` text,
	`providerLng` text,
	`startedAt` integer,
	`completedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_orderId_unique` ON `bookings` (`orderId`);--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`oderId` text NOT NULL,
	`userId` integer NOT NULL,
	`title` text,
	`status` text DEFAULT 'active' NOT NULL,
	`serviceType` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `conversations_oderId_unique` ON `conversations` (`oderId`);--> statement-breakpoint
CREATE TABLE `favoriteProviders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`providerId` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversationId` integer NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`messageType` text DEFAULT 'text' NOT NULL,
	`metadata` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `paymentMethods` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`cardType` text NOT NULL,
	`lastFour` text NOT NULL,
	`expiryMonth` integer NOT NULL,
	`expiryYear` integer NOT NULL,
	`isDefault` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `providers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`imageUrl` text,
	`bannerUrl` text,
	`rating` integer DEFAULT 0,
	`reviewCount` integer DEFAULT 0,
	`hourlyRate` integer,
	`callOutFee` integer DEFAULT 0,
	`address` text,
	`latitude` text,
	`longitude` text,
	`phone` text,
	`website` text,
	`hoursJson` text,
	`servicesJson` text,
	`amenitiesJson` text,
	`isAvailable` integer DEFAULT true NOT NULL,
	`availableIn` integer DEFAULT 5,
	`specialties` text,
	`ecoFriendly` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `providers_name_unique` ON `providers` (`name`);--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`referrerId` integer NOT NULL,
	`referredUserId` integer,
	`referralCode` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`rewardAmount` integer DEFAULT 10,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `referrals_referralCode_unique` ON `referrals` (`referralCode`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`providerId` integer NOT NULL,
	`bookingId` integer NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`tipAmount` integer DEFAULT 0,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `searchHistory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`query` text NOT NULL,
	`latitude` text,
	`longitude` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `searchHistory_user_createdAt_idx` ON `searchHistory` (`userId`,`createdAt`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`phone` text,
	`avatarUrl` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`locationEnabled` integer DEFAULT false NOT NULL,
	`notificationsEnabled` integer DEFAULT false NOT NULL,
	`onboardingCompleted` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	`lastSignedIn` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);