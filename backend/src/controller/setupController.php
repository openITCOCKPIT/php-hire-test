<?php

namespace cookbook_service\controller;

use cookbook_service\exception\cookbookException;
use cookbook_service\mapper\ingredientMapper;
use cookbook_service\mapper\recipeMapper;
use cookbook_service\model\ingredient;
use cookbook_service\model\recipe;

class setupController extends baseController
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
     * @throws cookbookException
     */
    public function testConnection() {
        (new ingredientMapper())->testConnection();
    }

    /**
     * @return string
     */
    public function setupExampleRecipes() {
        $exampleRecipesFilePath = $_SERVER['DOCUMENT_ROOT'] . '/db/exampleRecipes.json';

        if (!file_exists($exampleRecipesFilePath)) {
            return $this->responseError(400, 'Cant find example recipes file!');
        }
        $exampleRecipesAsString = file_get_contents($exampleRecipesFilePath);
        $rawExampleRecipes = json_decode($exampleRecipesAsString, true);

        if (!is_array($rawExampleRecipes) || !array_key_exists('recipes', $rawExampleRecipes)) {
            return $this->responseError(400, 'Cant read example recipes file!');
        }
        $rawExampleRecipes = $rawExampleRecipes['recipes'];

        if (empty($rawExampleRecipes)) {
            return $this->responseError(400, 'Example recipes file was empty');
        }

        foreach ($rawExampleRecipes as $rawExampleRecipe) {
            try {
                $this->setupExampleRecipe($rawExampleRecipe);
            } catch (cookbookException $cookbookException) {
                return $this->responseError($cookbookException->getCode(), $cookbookException->getMessage());
            }
        }

        return $this->responseJson(['success' => true]);
    }

    /**
     * @param array $rawExampleRecipe
     * @throws cookbookException
     * @return $this
     */
    private function setupExampleRecipe(array $rawExampleRecipe) {
        $recipe = (new recipe())->import($rawExampleRecipe);
        $recipe->setId($this->getRecipeMapper()->createRecipe($recipe));

        $this->getIngredientMapper()->createIngredientsForRecipe($recipe);

        return $this;
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