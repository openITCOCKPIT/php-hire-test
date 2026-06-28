<?php

namespace cookbook_service\model;

class recipe
{
    /**
     * @var int
     */
    private $id = 0;
    /**
     * @var string
     */
    private $title = '';
    /**
     * @var string
     */
    private $category = '';
    /**
     * @var string
     */
    private $description = '';
    /**
     * @var ingredient[]
     */
    private $ingredients = [];
    /**
     * @var \DateTime
     */
    private $createdAt;
    /**
     * @var bool
     */
    private $deleted = false;

    /**
     * @param array $rawRecipe
     * @return $this
     */
    public function import(array $rawRecipe) {
        if (isset($rawRecipe['id'])) {
            $this->setId(intval($rawRecipe['id']));
        }
        $this->setTitle(trim($rawRecipe['title']));
        $this->setCategory(trim($rawRecipe['category']));
        $this->setDescription($rawRecipe['description']);

        if (stristr($rawRecipe['created'], 'T') !== false) {
            $this->setCreatedAt(explode('T', $rawRecipe['created'])[0]);
        } else {
            $this->setCreatedAt($rawRecipe['created']);
        }

        $ingredients = array_map(function ($rawIngredient) {
            return (new ingredient())->import($rawIngredient);
        }, $rawRecipe['ingredients']);

        $this->setIngredients($ingredients);
        $this->setDeleted(false);

        return $this;
    }

    /**
     * @return array
     */
    public function export() {
        $ingredients = array_map(function (ingredient $ingredient) {
            return $ingredient->export();
        }, $this->ingredients);

        return [
            'id' => $this->getId(),
            'title'=> $this->getTitle(),
            'category' => $this->getCategory(),
            'ingredients'=> $ingredients,
            'description' => $this->getDescription(),
            'created' => $this->getCreatedAt()->format('Y-m-d'),
            'deleted' => $this->isDeleted()? 0: 1
        ];
    }

    /**
     * @return bool
     */
    public function isValid() {
        $title = trim($this->getTitle()) !== '';
        $category = trim($this->getCategory()) !== '';
        $description = trim($this->getDescription()) !== '';
        $ingredients = (count($this->getIngredients()) > 0);

        if(!$ingredients) {
            return false;
        }
        foreach ($this->getIngredients() as $ingredient) {
            $ingredients = ($ingredients && $ingredient->isValid());
        }

        return ($title && $category && $description && $ingredients);
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
     * @return string
     */
    public function getTitle() {
        return $this->title;
    }

    /**
     * @param string $title
     * @return $this
     */
    public function setTitle(string $title){
        $this->title = $title;
        return $this;
    }

    /**
     * @return string
     */
    public function getCategory() {
        return $this->category;
    }

    /**
     * @param string $category
     * @return $this
     */
    public function setCategory(string $category) {
        $this->category = $category;
        return $this;
    }

    /**
     * @return string
     */
    public function getDescription() {
        return $this->description;
    }

    /**
     * @param string $description
     * @return $this
     */
    public function setDescription(string $description) {
        $this->description = $description;
        return $this;
    }

    /**
     * @return ingredient[]
     */
    public function getIngredients() {
        return $this->ingredients;
    }

    /**
     * @param ingredient[] $ingredients
     * @return $this
     */
    public function setIngredients(array $ingredients) {
        $this->ingredients = $ingredients;
        return $this;
    }


    /**
     * @return \DateTime
     */
    public function getCreatedAt(): \DateTime {
        return $this->createdAt;
    }

    /**
     * @param string $rawDate
     * @return $this
     */
    public function setCreatedAt(string $rawDate) {
        $rawDateSplit = explode('-', $rawDate);
        $this->createdAt = (new \DateTime())->setDate(intval($rawDateSplit[0]), intval($rawDateSplit[1]), intval($rawDateSplit[2]));

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
}