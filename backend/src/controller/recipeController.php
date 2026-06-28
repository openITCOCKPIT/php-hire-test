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
    public function checkExistRecipes() {
        try {
            return $this->responseJson(['checkExistRecipes'=> $this->getRecipeMapper()->checkExistRecipes()]);
        } catch (cookbookException $cookbookException) {
            return $this->responseError(400, $cookbookException->getMessage());
        }
    }

    /**
     * @return string
     */
    public function recipeList() {
        try {
            $recipes = array_map(function(recipe $recipe) {
                return $recipe->export();
            }, $this->getRecipeMapper()->loadRecipeList());

            return $this->responseJson(['recipes'=> $recipes]);
        } catch (cookbookException $cookbookException) {
            return $this->responseError(400, $cookbookException->getMessage());
        }
    }

    /**
     * @param array $data
     * @return string
     */
    public function recipeDetails(array $data) {
        if(!array_key_exists('recipeId', $data) || intval($data['recipeId']) <= 0) {
            return $this->responseError(406, 'Missing incomining recipeId!');
        }

        try {
            $recipe = $this->getRecipeMapper()->loadRecipeById(intval($data['recipeId']));
            $recipe->setIngredients($this->getIngredientMapper()->loadIngredientsForRecipe($recipe->getId()));

            return $this->responseJson(['recipe'=> $recipe->export()]);
        } catch (cookbookException $cookbookException) {
            return $this->responseError(400, $cookbookException->getMessage());
        }
    }

    /**
     * @param array $data
     * @return string
     */
    public function createRecipe(array $data) {
       if (!isset($data['recipe'])) {
           return $this->responseError(406, 'Missing incomining recipe!');
       }
       $recipe = (new recipe())->import($data['recipe']);

       if (!$recipe->isValid()) {
           return $this->responseError(406, 'Recipe is not valid!');
       }

       try {
            $recipe->setId($this->getRecipeMapper()->createRecipe($recipe));
            $this->getIngredientMapper()->createIngredientsForRecipe($recipe);

            return $this->responseJson(['newRecipeId' => $recipe->getId()]);
       } catch (cookbookException $cookbookException) {
            return $this->responseError(intval($cookbookException->getCode()), $cookbookException->getMessage());
       }
    }

    /**
     * @param array $data
     * @return string
     */
    public function editRecipe(array $data) {
        if(!isset($data['recipe'])) {
            return $this->responseError(406, 'Missing incomining recipe!');
        }
        $recipe = (new recipe())->import($data['recipe']);

        if ($recipe->getId() === 0) {
            return $this->responseError(404, 'Cant recipe id at incoming data!');
        }
        try {
            $existRecipe = $this->getRecipeMapper()->loadRecipeById($recipe->getId());

            if ($existRecipe->getId() === 0 || $existRecipe->getId() !== $recipe->getId()) {
                return $this->responseError(404, 'Cant find recipe with given id!');
            }

            if (!$recipe->isValid()) {
                return $this->responseError(406, 'Recipe is not valid!');
            }

            $this->getRecipeMapper()->updateRecipe($recipe);
            $this->getIngredientMapper()->replaceRecipeIngredients($recipe);

            return $this->responseJson(['success' => true]);
        } catch (cookbookException $cookbookException) {
            return $this->responseError(intval($cookbookException->getCode()), $cookbookException->getMessage());
        }
    }

    /**
     * @param array $data
     * @return string
     */
    public function deleteRecipe(array $data){
        if(!isset($data['recipeId'])) {
            return $this->responseError(406, 'Missing incomining recipe id!');
        }

        try {
            $recipe = $this->getRecipeMapper()->loadRecipeById(intval($data['recipeId']));

            if ($recipe->getId() === 0) {
                return $this->responseError(404, 'Cant recipe id at incoming data!');
            }
            $existRecipe = $this->getRecipeMapper()->loadRecipeById($recipe->getId());

            if ($existRecipe->getId() === 0 || $existRecipe->getId() !== $recipe->getId()) {
                return $this->responseError(404, 'Cant find recipe with given id!');
            }
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