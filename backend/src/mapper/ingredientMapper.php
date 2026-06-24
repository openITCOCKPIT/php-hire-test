<?php

namespace cookbook_service\mapper;

use cookbook_service\exception\cookbookException;
use cookbook_service\model\ingredient;

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
     * @param $recipeId
     * @throws cookbookException
     */
    public function deleteAllIngredientsForRecipe($recipeId){
        $sql = "UPDATE ingredient SET deleted=1 WHERE recipeId=:recipeId";

        $stmt = $this->getPdo()->prepare($sql);
        $stmt->bindValue('recipeId', $recipeId, \PDO::PARAM_INT);

        if(!$stmt->execute()) {
            throw new cookbookException('Cant delete ingredients for recipe with id'.$recipeId);
        }
    }

    /**
     * @param array $rawIngredient
     * @return ingredient
     */
    private function convertRawIngredient(array $rawIngredient) {
        return (new ingredient())
            ->setId(intval($rawIngredient['id']))
            ->setUnitOfMeasure($rawIngredient['unitOfMeasure'])
            ->setRecipeId($rawIngredient['recipeId'])
            ->setAmount(floatval($rawIngredient['amount']))
            ->setDeleted(false);
    }
}