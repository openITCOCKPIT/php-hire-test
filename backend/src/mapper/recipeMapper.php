<?php

namespace cookbook_service\mapper;

use cookbook_service\exception\cookbookException;
use cookbook_service\model\recipe;

class recipeMapper extends baseMapper
{
    /**
     * @return recipe[]
     */
    public function loadRecipeList() {
        $sql = 'SELECT id, title, category, createdAt FROM recipe WHERE deleted=0 ORDER BY title ASC';

        $stmt = $this->getPdo()->prepare($sql);
        $stmt->execute();

        $rawRecipeList = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        if(empty($rawRecipeList)) {
            return [];
        }

        return array_map(function ($rawRecipe) {
           return $this->convertRawRecipe($rawRecipe);
        },  $rawRecipeList);
    }

    /**
     * @param int $recipeId
     * @return recipe
     * @throws cookbookException
     */
    public function loadRecipeById(int $recipeId) {
        $sql = 'SELECT * FROM recipe WHERE deleted=0 AND id=:id';

        $stmt = $this->getPdo()->prepare($sql);
        $stmt->bindValue('id', $recipeId, \PDO::PARAM_INT);
        $stmt->execute();

        $rawRecipe = $stmt->fetch(\PDO::FETCH_ASSOC);

        if(!is_array($rawRecipe) || empty($rawRecipe)) {
            throw new cookbookException('Cant find Recipe with given id!');
        }

        return $this->convertRawRecipe($rawRecipe);
    }

    /**
     * @param recipe $recipe
     * @return int
     * @throws cookbookException
     */
    public function createRecipe(Recipe $recipe) {
        $sql = 'INSERT INTO recipe (title, category, description, createdAt) 
                VALUES            (:title, :category, :description, :createdAt)';

        $stmt = $this->getPdo()->prepare($sql);
        $stmt->bindValue('title', $recipe->getTitle());
        $stmt->bindValue('category', $recipe->getCategory());
        $stmt->bindValue('description', $recipe->getDescription());
        $stmt->bindValue('createdAt', $recipe->getCreatedAt()->format('Y-m-d'));

        if(!$stmt->execute()) {
            throw new cookbookException('Cant create recipe!', 400);
        }

        return intval($this->getPdo()->lastInsertId());
    }

    /**
     * @param recipe $recipe
     * @return $this
     * @throws cookbookException
     */
    public function updateRecipe(Recipe $recipe) {
        $sql = 'UPDATE recipe  SET title=:title, category=:category, description=:description
                WHERE id=:id';

        $stmt = $this->getPdo()->prepare($sql);
        $stmt->bindValue('title', $recipe->getTitle());
        $stmt->bindValue('category', $recipe->getCategory());
        $stmt->bindValue('description', $recipe->getDescription());
        $stmt->bindValue('id', $recipe->getId(), \PDO::PARAM_INT);

        if(!$stmt->execute()) {
            throw new cookbookException('Cant update recipe!', 400);
        }

        return $this;
    }

    /**
     * @param int $recipeId
     * @return void
     * @throws cookbookException
     */
    public function deleteRecipe(int $recipeId) {
        $sql = "UPDATE recipe SET deleted=1 WHERE recipeId=:recipeId";

        $stmt = $this->getPdo()->prepare($sql);
        $stmt->bindValue('recipeId', $recipeId, \PDO::PARAM_INT);

        if(!$stmt->execute()) {
            throw new cookbookException('Cant delete recipe with id'.$recipeId);
        }
    }

    /**
     * @param array $rawRecipe
     * @return recipe
     */
    private function convertRawRecipe(array $rawRecipe) {
        return (new recipe())
            ->setId(intval($rawRecipe['id']))
            ->setCategory($rawRecipe['category'])
            ->setTitle($rawRecipe['title'])
            ->setCreatedAt($rawRecipe['createdAt'])
            ->setDescription($rawRecipe['description'])
            ->setDeleted(false);
    }
}