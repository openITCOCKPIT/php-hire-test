<?php

namespace cookbook_service\model;

class ingredient
{
    /**
     * @var int
     */
    private $id = 0;
    /**
     * @var string
     */
    private $ingredientName = '';
    /**
     * @var int
     */
    private $recipeId = 0;
    /**
     * @var string
     */
    private $unitOfMeasure = '';
    /**
     * @var float
     */
    private $amount = 0.0;
    /**
     * @var bool
     */
    private $deleted = false;

    /**
     * @param array $rawIngredient
     * @return $this
     */
    public function import(array $rawIngredient){
        $this->setId(intval($rawIngredient['id']));
        $this->setUnitOfMeasure($rawIngredient['unitOfMeasure']);
        $this->setRecipeId(intval($rawIngredient['recipeId']));
        $this->setAmount(floatval($rawIngredient['amount']));
        $this->setDeleted(false);

        return $this;
    }

    /**
     * @return array
     */
    public function export() {
        return [
            'id' => $this->getId(),
            'ingredientName' => $this->getIngredientName(),
            'recipeId' => $this->getRecipeId(),
            'unitOfMeasure' => $this->getUnitOfMeasure(),
            'amount' => $this->amount,
            'deleted' => $this->isDeleted()? 1: 0
        ];
    }

    /**
     * @return bool
     */
    public function isValid() {
        $ingredientName = (trim($this->getIngredientName()) !== '');
        $amount = ($this->getAmount() > 0.00);

        return ($ingredientName && $amount);
    }

    /**
     * @return int
     */
    public function getId() {
        return $this->id;
    }

    /**
     * @param int $id
     * @return $this
     */
    public function setId(int $id) {
        $this->id = $id;
        return $this;
    }

    /**
     * @return int
     */
    public function getRecipeId() {
        return $this->recipeId;
    }

    /**
     * @param int $recipeId
     * @return $this
     */
    public function setRecipeId(int $recipeId) {
        $this->recipeId = $recipeId;
        return $this;
    }

    /**
     * @return string
     */
    public function getUnitOfMeasure() {
        return $this->unitOfMeasure;
    }

    /**
     * @param string $unitOfMeasure
     * @return $this
     */
    public function setUnitOfMeasure(string $unitOfMeasure) {
        $this->unitOfMeasure = $unitOfMeasure;
        return $this;
    }

    /**
     * @return float
     */
    public function getAmount() {
        return $this->amount;
    }

    /**
     * @param float $amount
     * @return $this
     */
    public function setAmount(float $amount) {
        $this->amount = $amount;
        return $this;
    }

    /**
     * @return bool
     */
    public function isDeleted() {
        return $this->deleted;
    }

    /**
     * @param bool $deleted
     * @return $this
     */
    public function setDeleted(bool $deleted) {
        $this->deleted = $deleted;
        return $this;
    }

    /**
     * @return string
     */
    public function getIngredientName() {
        return $this->ingredientName;
    }

    /**
     * @param string $ingredientName
     * @return $this
     */
    public function setIngredientName(string $ingredientName) {
        $this->ingredientName = $ingredientName;
        return $this;
    }
}