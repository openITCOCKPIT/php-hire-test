-- Runs once on first initialisation of the MySQL data volume.
-- Creates the separate database used by the PHPUnit suite and grants the
-- application user access to it (the main `recipes` DB is created by the
-- container's MYSQL_DATABASE variable).
CREATE DATABASE IF NOT EXISTS test_recipes CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
GRANT ALL PRIVILEGES ON test_recipes.* TO 'recipes'@'%';
FLUSH PRIVILEGES;
