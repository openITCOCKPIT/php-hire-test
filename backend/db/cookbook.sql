CREATE TABLE `connection_test` (
                                   `id` INT(10) NOT NULL
) COLLATE='utf8mb3_general_ci'  ENGINE=InnoDB;

INSERT INTO `connection_test` (`id`) VALUES ('1');

CREATE TABLE `recipe` (
                          `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
                          `title` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb3_general_ci',
                          `category` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb3_general_ci',
                          `description` TEXT NULL DEFAULT NULL COLLATE 'utf8mb3_general_ci',
                          `createdAt` DATE NULL DEFAULT NULL,
                          `deleted` TINYINT(3) NULL DEFAULT '0',
                          PRIMARY KEY (`id`) USING BTREE,
                          INDEX `category` (`category`) USING BTREE,
                          INDEX `createdAt` (`createdAt`) USING BTREE,
                          INDEX `deleted` (`deleted`) USING BTREE,
                          FULLTEXT INDEX `title` (`title`),
                          FULLTEXT INDEX `description` (`description`)
) COLLATE='utf8mb3_general_ci' ENGINE=InnoDB;

CREATE TABLE `ingredient` (
                              `id` INT(10) NOT NULL AUTO_INCREMENT,
                              `recipeId` INT(10) NOT NULL,
                              `ingredientName` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb3_general_ci',
                              `unitOfMeasure` VARCHAR(20) NULL DEFAULT NULL COLLATE 'utf8mb3_general_ci',
                              `amount` DECIMAL(20,6) NULL DEFAULT '0.000000',
                              `deleted` TINYINT(3) NULL DEFAULT '0',
                              PRIMARY KEY (`id`) USING BTREE,
                              INDEX `recipe_id` (`recipeId`) USING BTREE,
                              INDEX `ingredient_name` (`ingredientName`) USING BTREE,
                              INDEX `unit_of_measure` (`unitOfMeasure`) USING BTREE,
                              INDEX `deleted` (`deleted`) USING BTREE,
                              INDEX `amount` (`amount`) USING BTREE,
                              FULLTEXT INDEX `ingredient_name_ft` (`ingredientName`)
) COLLATE='utf8mb3_general_ci' ENGINE=InnoDB;


