<?php

namespace cookbook_service\model;

class ingredient
{
    /**
     * @var int
     */
    private $id = 0;
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

    public function export() {
        return [
            'id' => $this->getId(),
            'recipeId' => $this->getRecipeId(),
            'unitOfMeasure' => $this->getUnitOfMeasure(),
            'amount' => $this->amount,
            'deleted' => $this->isDeleted()? 1: 0
        ];
    }

    public function getId() {
        return $this->id;
    }

    public function setId(int $id) {
        $this->id = $id;
        return $this;
    }

    public function getRecipeId() {
        return $this->recipeId;
    }

    public function setRecipeId(int $recipeId) {
        $this->recipeId = $recipeId;
        return $this;
    }

    public function getUnitOfMeasure() {
        return $this->unitOfMeasure;
    }

    public function setUnitOfMeasure(string $unitOfMeasure) {
        $this->unitOfMeasure = $unitOfMeasure;
        return $this;
    }

    public function getAmount() {
        return $this->amount;
    }

    public function setAmount(float $amount) {
        $this->amount = $amount;
        return $this;
    }

    public function isDeleted() {
        return $this->deleted;
    }

    public function setDeleted(bool $deleted) {
        $this->deleted = $deleted;
        return $this;
    }


}