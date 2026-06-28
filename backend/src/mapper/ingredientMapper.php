<?php

namespace cookbook_service\mapper;

use cookbook_service\exception\cookbookException;
use cookbook_service\model\ingredient;
use cookbook_service\model\recipe;

class ingredientMapper extends baseMapper
{
    /**
     * @param int $recipeId
     * @throws cookbookException
     * @return ingredient[]
     */
    public function loadIngredientsForRecipe(int $recipeId){
        $sql = 'SELECT * FROM ingredient WHERE recipeId=:recipeId AND deleted=0 ORDER BY ingredientName ASC';

        $stmt = $this->getPdo()->prepare($sql);
        $stmt->bindValue('recipeId', $recipeId, \PDO::PARAM_INT);
        $stmt->execute();

        $rawIngredients = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        if (!is_array($rawIngredients) || empty($rawIngredients)) {
            throw new cookbookException('no ingredients for recipe with id '.$recipeId.' found');
        }

        return array_map(function (array $rawIngredient) {
            return $this->convertRawIngredient($rawIngredient);
        }, $rawIngredients);
    }

    /**
     * @param recipe $recipe
     * @return $this
     * @throws cookbookException
     */
    public function replaceRecipeIngredients(recipe $recipe) {
        return ($this->deleteAllIngredientsForRecipe($recipe->getId())->createIngredientsForRecipe($recipe));
    }

    /**
     * @param recipe $recipe
     * @return $this
     * @throws cookbookException
     */
    public function createIngredientsForRecipe(recipe $recipe) {
        foreach ($recipe->getIngredients() as $ingredient) {
          $sql = 'INSERT INTO ingredient (recipeId, ingredientName, unitOfMeasure, amount)
                  VALUES (:recipeId, :ingredientName, :unitOfMeasure, :amount)';


          $stmt = $this->getPdo()->prepare($sql);
          $stmt->bindValue('recipeId', $recipe->getId(), \PDO::PARAM_INT);
          $stmt->bindValue('ingredientName', $ingredient->getIngredientName());
          $stmt->bindValue('unitOfMeasure', $ingredient->getUnitOfMeasure());
          $stmt->bindValue('amount', $ingredient->getAmount());

          if(!$stmt->execute()) {
              throw new cookbookException('cant create ingredients for recipe');
          }
        }

        return $this;
    }

    /**
     * @param $recipeId
     * @return $this
     * @throws cookbookException
     */
    public function deleteAllIngredientsForRecipe($recipeId){
        $sql = "UPDATE ingredient SET deleted=1 WHERE recipeId=:recipeId";

        $stmt = $this->getPdo()->prepare($sql);
        $stmt->bindValue('recipeId', $recipeId, \PDO::PARAM_INT);

        if(!$stmt->execute()) {
            throw new cookbookException('Cant delete ingredients for recipe with id'.$recipeId);
        }

        return $this;
    }

    /**
     * @param array $rawIngredient
     * @return ingredient
     */
    private function convertRawIngredient(array $rawIngredient) {
        return (new ingredient())
            ->setId(intval($rawIngredient['id']))
            ->setIngredientName($rawIngredient['ingredientName'])
            ->setUnitOfMeasure($rawIngredient['unitOfMeasure'])
            ->setRecipeId($rawIngredient['recipeId'])
            ->setAmount(floatval($rawIngredient['amount']))
            ->setDeleted(false);
    }
}