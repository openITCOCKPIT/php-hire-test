<?php
namespace cookbook_service\controller;

use cookbook_service\exception\cookbookException;

class incomingController extends baseController {
    /**
     * @var recipeController
     */
    private $recipeController;
    /**
     * @var setupController
     */
    private $setupController;

    function __construct() {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST');
        header("Access-Control-Allow-Headers: X-Requested-With");

        $_POST = json_decode(file_get_contents('php://input'), true);
    }

    /**
     * @param string $action
     * @param array $data
     * @throws cookbookException
     * @return string
     */
    public function routeIncomingRequest(string $action, array $data = []) {
        $this->getSetupController()->testConnection();

        return match ($action) {
            'halloService' => $this->responseJson(['success'=> true]),
            'recipeList' => $this->getRecipeController()->recipeList(),
            'recipeDetails' => $this->getRecipeController()->recipeDetails($data),
            'createRecipe' => $this->getRecipeController()->createRecipe($data),
            'editRecipe' => $this->getRecipeController()->editRecipe($data),
            'deleteRecipe' => $this->getRecipeController()->deleteRecipe($data),
            'setupExampleRecipes' => $this->getSetupController()->setupExampleRecipes(),
            default => $this->responseError(404, 'The given request was not found'),
        };
    }

    /**
     * @param int $code
     * @param string $msg
     * @return string
     */
    public function error(int $code, string $msg ){
        return $this->responseError($code, $msg);
    }

    /**
     * @return recipeController
     */
    private function getRecipeController() {
        if ($this->recipeController === NULL) {
           $this->recipeController = new recipeController();
        }

        return $this->recipeController;
    }

    /**
     * @return setupController
     */
    private function getSetupController() {
        if ($this->setupController === NULL) {
            $this->setupController = new setupController();
        }

        return $this->setupController;
    }

}