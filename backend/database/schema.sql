-- Amrit Chhaya Foundation MySQL Database Schema

CREATE DATABASE IF NOT EXISTS `amritchhaya_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `amritchhaya_db`;

-- Disable foreign key checks for table creation
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users (Admin Auth)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('SUPER_ADMIN', 'ADMIN') NOT NULL DEFAULT 'ADMIN',
  `refresh_token` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Pooja Categories
DROP TABLE IF EXISTS `pooja_categories`;
CREATE TABLE `pooja_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Poojas
DROP TABLE IF EXISTS `poojas`;
CREATE TABLE `poojas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `category_id` INT NULL,
  `description` TEXT,
  `short_description` VARCHAR(255),
  `image` VARCHAR(255),
  `starting_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `duration` VARCHAR(50) DEFAULT '2 Hours',
  `featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `pooja_categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Pooja Features
DROP TABLE IF EXISTS `pooja_features`;
CREATE TABLE `pooja_features` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pooja_id` INT NOT NULL,
  `feature_text` VARCHAR(255) NOT NULL,
  FOREIGN KEY (`pooja_id`) REFERENCES `poojas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Pooja Variants
DROP TABLE IF EXISTS `pooja_variants`;
CREATE TABLE `pooja_variants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pooja_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`pooja_id`) REFERENCES `poojas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Pooja Slots
DROP TABLE IF EXISTS `pooja_slots`;
CREATE TABLE `pooja_slots` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pooja_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `start_time` VARCHAR(10) NOT NULL,
  `end_time` VARCHAR(10) NOT NULL,
  `available` BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (`pooja_id`) REFERENCES `poojas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Customers / Devotees
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(150),
  `gotra` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Bookings
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` VARCHAR(50) PRIMARY KEY, -- e.g. ACF-2026-000123
  `pooja_id` INT NOT NULL,
  `variant_id` INT NOT NULL,
  `slot_id` INT NULL,
  `booking_date` DATE NOT NULL,
  `customer_id` INT NOT NULL,
  `special_request` TEXT NULL,
  `prasad_required` BOOLEAN DEFAULT FALSE,
  `amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'INR',
  `booking_status` ENUM('PENDING_PAYMENT', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED') DEFAULT 'PENDING_PAYMENT',
  `payment_status` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`pooja_id`) REFERENCES `poojas`(`id`),
  FOREIGN KEY (`variant_id`) REFERENCES `pooja_variants`(`id`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Booking Addresses
DROP TABLE IF EXISTS `booking_addresses`;
CREATE TABLE `booking_addresses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `line1` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `pincode` VARCHAR(20) NOT NULL,
  `country` VARCHAR(100) DEFAULT 'India',
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Payments
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` VARCHAR(50) NULL,
  `donation_id` VARCHAR(50) NULL,
  `razorpay_order_id` VARCHAR(100) NOT NULL,
  `razorpay_payment_id` VARCHAR(100) NULL,
  `razorpay_signature` VARCHAR(255) NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'INR',
  `status` ENUM('CREATED', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'CREATED',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Yatras
DROP TABLE IF EXISTS `yatras`;
CREATE TABLE `yatras` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `description` TEXT,
  `duration` VARCHAR(50),
  `starting_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `image` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Yatra Itineraries
DROP TABLE IF EXISTS `yatra_itineraries`;
CREATE TABLE `yatra_itineraries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `yatra_id` INT NOT NULL,
  `day` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT,
  FOREIGN KEY (`yatra_id`) REFERENCES `yatras`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Yatra Bookings
DROP TABLE IF EXISTS `yatra_bookings`;
CREATE TABLE `yatra_bookings` (
  `id` VARCHAR(50) PRIMARY KEY,
  `yatra_id` INT NOT NULL,
  `date_id` INT NULL,
  `number_of_people` INT NOT NULL DEFAULT 1,
  `customer_id` INT NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') DEFAULT 'PENDING',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`yatra_id`) REFERENCES `yatras`(`id`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Donation Categories
DROP TABLE IF EXISTS `donation_categories`;
CREATE TABLE `donation_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. Donations
DROP TABLE IF EXISTS `donations`;
CREATE TABLE `donations` (
  `id` VARCHAR(50) PRIMARY KEY,
  `category_id` INT NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `donor_id` INT NOT NULL,
  `anonymous` BOOLEAN DEFAULT FALSE,
  `payment_status` ENUM('PENDING', 'PAID', 'FAILED') DEFAULT 'PENDING',
  `receipt_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `donation_categories`(`id`),
  FOREIGN KEY (`donor_id`) REFERENCES `customers`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. Goshala (Cows)
DROP TABLE IF EXISTS `cows`;
CREATE TABLE `cows` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `breed` VARCHAR(100),
  `age` INT,
  `image` VARCHAR(255),
  `adoption_available` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. Gallery
DROP TABLE IF EXISTS `gallery`;
CREATE TABLE `gallery` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `image` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 18. Blogs
DROP TABLE IF EXISTS `blogs`;
CREATE TABLE `blogs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `content` LONGTEXT NOT NULL,
  `image` VARCHAR(255),
  `category` VARCHAR(100),
  `status` ENUM('DRAFT', 'PUBLISHED') DEFAULT 'PUBLISHED',
  `seo_title` VARCHAR(200),
  `seo_description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 19. Events
DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `description` TEXT,
  `date` DATETIME NULL,
  `location` VARCHAR(255),
  `image` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 20. Testimonials
DROP TABLE IF EXISTS `testimonials`;
CREATE TABLE `testimonials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `role` VARCHAR(100) DEFAULT 'Devotee',
  `message` TEXT NOT NULL,
  `rating` INT DEFAULT 5,
  `image` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 21. Enquiries
DROP TABLE IF EXISTS `enquiries`;
CREATE TABLE `enquiries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(150),
  `message` TEXT NOT NULL,
  `status` ENUM('NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'CLOSED') DEFAULT 'NEW',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Seed Data
INSERT INTO `pooja_categories` (`id`, `name`, `slug`) VALUES
(1, 'Dosha Puja', 'dosha-puja'),
(2, 'Shiv Puja', 'shiv-puja');

INSERT INTO `poojas` (`id`, `name`, `slug`, `category_id`, `description`, `short_description`, `image`, `starting_price`, `duration`, `featured`, `status`) VALUES
(1, 'Kaal Sarp Dosh Puja', 'kaal-sarp-dosh-puja', 1, 'Complete Kaal Sarp Dosh Shanti Puja performed by expert Vedic priests in Ujjain.', 'Special puja for Kaal Sarp Dosh', 'https://images.unsplash.com/photo-1609137144813-7d9921338f24', 5100.00, '2 Hours', TRUE, 'ACTIVE');

INSERT INTO `pooja_variants` (`id`, `pooja_id`, `name`, `price`) VALUES
(1, 1, 'Basic', 5100.00),
(2, 1, 'With Prasad', 7100.00);

INSERT INTO `pooja_features` (`id`, `pooja_id`, `feature_text`) VALUES
(1, 1, 'Pandit Ji'),
(2, 1, 'Puja Samagri'),
(3, 1, 'Prasad');

INSERT INTO `pooja_slots` (`id`, `pooja_id`, `date`, `start_time`, `end_time`, `available`) VALUES
(1, 1, '2026-09-20', '09:00', '11:00', TRUE),
(2, 1, '2026-09-20', '12:00', '14:00', FALSE);

INSERT INTO `donation_categories` (`id`, `name`, `slug`) VALUES
(1, 'Gau Seva', 'gau-seva'),
(2, 'Annadan', 'annadan'),
(3, 'Temple Seva', 'temple-seva');

INSERT INTO `cows` (`id`, `name`, `breed`, `age`, `image`, `adoption_available`) VALUES
(1, 'Gauri', 'Gir', 6, 'https://images.unsplash.com/photo-1546445317-29f4545f9d52', TRUE);

INSERT INTO `yatras` (`id`, `name`, `slug`, `description`, `duration`, `starting_price`, `image`) VALUES
(1, 'Ujjain Darshan', 'ujjain-darshan', 'Complete Ujjain Darshan package including Mahakaleshwar, Harsiddhi, and Ram Ghat.', '2 Days / 1 Night', 4999.00, 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66');

INSERT INTO `yatra_itineraries` (`id`, `yatra_id`, `day`, `title`, `description`) VALUES
(1, 1, 1, 'Ujjain Temple Darshan', 'Arrival and visit to Kal Bhairav and Harsiddhi Temple.'),
(2, 1, 2, 'Mahakal Bhasma Aarti', 'Early morning VIP Darshan and Bhasma Aarti.');

INSERT INTO `testimonials` (`id`, `name`, `role`, `message`, `rating`) VALUES
(1, 'Ramesh Kumar', 'Devotee', 'Wonderful experience during Kaal Sarp Dosh Puja. Pandit Ji was very knowledgeable.', 5);
