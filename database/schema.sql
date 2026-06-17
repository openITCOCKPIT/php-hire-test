-- Recipe Collection Database Schema
-- MySQL >= 8.0

CREATE DATABASE IF NOT EXISTS recipe_collection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE recipe_collection;

CREATE TABLE IF NOT EXISTS recipes (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    temperature INT NULL COMMENT 'Baking/cooking temperature in °C',
    duration    INT NULL COMMENT 'Duration in minutes',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ingredients (
    id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT UNSIGNED NOT NULL,
    amount    VARCHAR(50) NOT NULL COMMENT 'e.g. 100g, 2, 50ml',
    name      VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    INDEX idx_recipe_id (recipe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data
INSERT INTO recipes (title, description, temperature, duration, created_at) VALUES
('Chocolate Cake', 'A rich and moist chocolate cake perfect for any occasion. Bake it at 200°C for 40 minutes. This is an example recipe for our hiring test - Om Nom Nom\n\nThis is just an example, we never tasted it, so maybe don\'t bake it :)', 200, 40, '2026-06-15 10:00:00'),
('Banana Bread', 'A moist and delicious banana bread that makes use of overripe bananas. Perfect for breakfast or as a snack. Bake at 175°C for 60 minutes until golden brown.', 175, 60, '2026-06-10 09:00:00'),
('Pasta Carbonara', 'Classic Italian pasta dish with eggs, cheese, pancetta and black pepper. Cook pasta until al dente. No cream needed — the silky sauce comes from emulsifying eggs with the pasta water.', NULL, 20, '2026-06-12 18:30:00'),
('Caesar Salad', 'Classic Caesar salad with homemade dressing, croutons and parmesan. Crisp romaine lettuce tossed in a tangy anchovy-garlic dressing. Top with freshly shaved parmesan and crunchy croutons.', NULL, 15, '2026-06-08 12:00:00'),
('Lemon Cheesecake', 'Creamy and tangy no-bake lemon cheesecake with a buttery biscuit base. Chill for at least 4 hours before serving. The perfect make-ahead dessert for dinner parties.', NULL, 30, '2026-06-05 14:00:00');

INSERT INTO ingredients (recipe_id, amount, name, sort_order) VALUES
(1, '100g', 'sugar', 1),
(1, '50g', 'flour', 2),
(1, '2', 'eggs', 3),
(1, '150g', 'chocolate', 4),
(1, '50ml', 'milk', 5),
(2, '3', 'ripe bananas', 1),
(2, '200g', 'flour', 2),
(2, '150g', 'sugar', 3),
(2, '80g', 'butter', 4),
(2, '2', 'eggs', 5),
(2, '1 tsp', 'baking soda', 6),
(3, '400g', 'spaghetti', 1),
(3, '150g', 'pancetta or guanciale', 2),
(3, '4', 'egg yolks', 3),
(3, '100g', 'pecorino romano', 4),
(3, '1 tsp', 'black pepper', 5),
(4, '1', 'romaine lettuce', 1),
(4, '50g', 'parmesan', 2),
(4, '2 tbsp', 'caesar dressing', 3),
(4, '100g', 'croutons', 4),
(4, '2', 'anchovy fillets', 5),
(5, '300g', 'cream cheese', 1),
(5, '200ml', 'heavy cream', 2),
(5, '2', 'lemons (zest and juice)', 3),
(5, '150g', 'digestive biscuits', 4),
(5, '75g', 'butter', 5),
(5, '100g', 'icing sugar', 6);
