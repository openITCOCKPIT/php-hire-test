<?php
declare(strict_types=1);

namespace App\Model;

use App\Config\Database;

class RecipeModel
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Get all recipes with optional search and sort
     */
    public function findAll(
        string $search = '',
        string $sortBy = 'created_at',
        string $sortDir = 'DESC'
    ): array {
        $allowedSortColumns = ['title', 'created_at', 'duration'];
        $allowedSortDirs    = ['ASC', 'DESC'];

        $sortBy  = in_array($sortBy, $allowedSortColumns, true) ? $sortBy : 'created_at';
        $sortDir = in_array(strtoupper($sortDir), $allowedSortDirs, true) ? strtoupper($sortDir) : 'DESC';

        $sql = 'SELECT id, title, description, temperature, duration, created_at FROM recipes';
        $params = [];

        if ($search !== '') {
            $sql .= ' WHERE title LIKE :search OR description LIKE :search2';
            $params[':search']  = '%' . $search . '%';
            $params[':search2'] = '%' . $search . '%';
        }

        $sql .= " ORDER BY {$sortBy} {$sortDir}";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    /**
     * Get a single recipe with its ingredients
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT id, title, description, temperature, duration, created_at
             FROM recipes WHERE id = :id LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $recipe = $stmt->fetch();

        if ($recipe === false) {
            return null;
        }

        $recipe['ingredients'] = $this->getIngredients($id);

        return $recipe;
    }

    /**
     * Get ingredients for a recipe
     */
    public function getIngredients(int $recipeId): array
    {
        $stmt = $this->db->prepare(
            'SELECT id, amount, name FROM ingredients
             WHERE recipe_id = :recipe_id ORDER BY sort_order ASC'
        );
        $stmt->execute([':recipe_id' => $recipeId]);

        return $stmt->fetchAll();
    }

    /**
     * Create a new recipe with its ingredients
     */
    public function create(array $data): int
    {
        $this->db->beginTransaction();

        try {
            $stmt = $this->db->prepare(
                'INSERT INTO recipes (title, description, temperature, duration)
                 VALUES (:title, :description, :temperature, :duration)'
            );
            $stmt->execute([
                ':title'       => $data['title'],
                ':description' => $data['description'],
                ':temperature' => $data['temperature'] ?? null,
                ':duration'    => $data['duration'] ?? null,
            ]);

            $recipeId = (int) $this->db->lastInsertId();

            if (!empty($data['ingredients']) && is_array($data['ingredients'])) {
                $this->insertIngredients($recipeId, $data['ingredients']);
            }

            $this->db->commit();

            return $recipeId;
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Update an existing recipe
     */
    public function update(int $id, array $data): bool
    {
        $this->db->beginTransaction();

        try {
            $stmt = $this->db->prepare(
                'UPDATE recipes SET title = :title, description = :description,
                 temperature = :temperature, duration = :duration
                 WHERE id = :id'
            );
            $stmt->execute([
                ':title'       => $data['title'],
                ':description' => $data['description'],
                ':temperature' => $data['temperature'] ?? null,
                ':duration'    => $data['duration'] ?? null,
                ':id'          => $id,
            ]);

            // Replace ingredients
            $this->db->prepare('DELETE FROM ingredients WHERE recipe_id = :id')
                     ->execute([':id' => $id]);

            if (!empty($data['ingredients']) && is_array($data['ingredients'])) {
                $this->insertIngredients($id, $data['ingredients']);
            }

            $this->db->commit();

            return true;
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Delete a recipe
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM recipes WHERE id = :id');
        $stmt->execute([':id' => $id]);

        return $stmt->rowCount() > 0;
    }

    /**
     * Insert ingredients for a recipe
     */
    private function insertIngredients(int $recipeId, array $ingredients): void
    {
        $stmt = $this->db->prepare(
            'INSERT INTO ingredients (recipe_id, amount, name, sort_order)
             VALUES (:recipe_id, :amount, :name, :sort_order)'
        );

        foreach ($ingredients as $index => $ingredient) {
            if (empty($ingredient['name'])) {
                continue;
            }
            $stmt->execute([
                ':recipe_id'  => $recipeId,
                ':amount'     => $ingredient['amount'] ?? '',
                ':name'       => $ingredient['name'],
                ':sort_order' => $index,
            ]);
        }
    }
}
