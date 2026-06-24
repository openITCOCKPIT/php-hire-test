<?php

namespace cookbook_service\controller;

use cookbook_service\exception\cookbookException;
use cookbook_service\mapper\ingredientMapper;
use cookbook_service\mapper\recipeMapper;
use cookbook_service\model\recipe;

class recipeController extends baseController
{
    /**
     * @var recipeMapper
     */
    private $recipeMapper;
    /**
     * @var ingredientMapper
     */
    private $ingredientMapper;

    /**
     * @return string
     */
    public function recipeList() {
        $recipes = array_map(function(recipe $recipe) {
            return $recipe->export();
        }, $this->getRecipeMapper()->loadRecipeList());

        return $this->responseJson(['recipes'=> $recipes]);
    }

    /**
     * @param array $data
     * @return string
     */
    public function recipeDetails(array $data) {
        if(!array_key_exists('recipeId', $data) || intval($data['recipeId']) === 0) {
            return $this->responseError(406, 'Missing requiered param recipeId');
        }

        try {
            $recipe = $this->getRecipeMapper()->loadRecipeById((int) $data['recipeId']);
            $recipe->setIngredients($this->getIngredientMapper()->loadIngredientsForRecipe($recipe->getId()));

            return $this->responseJson(['recipe'=> $recipe]);
        } catch (cookbookException $cookbookException) {
            return $this->responseError(400, $cookbookException->getMessage());
        }
    }

    /**
     * @param array $data
     * @return string
     */
    public function createRecipe(array $data) {
        return '';
    }

    /**
     * @param array $data
     * @return string
     */
    public function editRecipe(array $data) {
        return '';
    }

    /**
     * @param array $data
     * @return string
     */
    public function deleteRecipe(array $data){
        if (!array_key_exists('recipeId', $data)) {
            return $this->responseError(406, 'Missing requiered param recipeId');
        }

        try {
             $recipe = $this->getRecipeMapper()->loadRecipeById((int) $data['recipeId']);
             $this->getIngredientMapper()->deleteAllIngredientsForRecipe($recipe->getId());
             $this->getRecipeMapper()->deleteRecipe($recipe->getId());

             return $this->responseJson(['success' => true]);
        } catch (cookbookException $cookbookException) {
            return $this->responseError(intval($cookbookException->getCode()), $cookbookException->getMessage());
        }
    }

    /**
     * @return recipeMapper
     */
    protected function getRecipeMapper() {
        if ($this->recipeMapper === NULL) {
            $this->recipeMapper = new recipeMapper();
        }

        return $this->recipeMapper;
    }

    /**
     * @return ingredientMapper
     */
    protected function getIngredientMapper() {
        if ($this->ingredientMapper === NULL) {
            $this->ingredientMapper = new ingredientMapper();
        }

        return $this->ingredientMapper;
    }
}