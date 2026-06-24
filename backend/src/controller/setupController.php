<?php

namespace cookbook_service\controller;

use cookbook_service\exception\cookbookException;
use cookbook_service\mapper\ingredientMapper;

class setupController extends baseController
{
    /**
     * @return void
     * @throws cookbookException
     */
    public function testConnection() {
        (new ingredientMapper())->testConnection();
    }

    public function setupExampleRecipes(){
        return '';
    }
}