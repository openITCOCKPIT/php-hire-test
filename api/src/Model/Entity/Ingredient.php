<?php
declare(strict_types=1);

namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Ingredient Entity
 *
 * @property int $id
 * @property int $recipe_id
 * @property string $name
 * @property string $amount
 * @property string $unit
 *
 * @property \App\Model\Entity\Recipe $recipe
 */
class Ingredient extends Entity
{
    /**
     * Fields that can be mass assigned using newEntity() or patchEntity().
     *
     * Note that when '*' is set to true, this allows all unspecified fields to
     * be mass assigned. For security purposes, it is advised to set '*' to false
     * (or remove it), and explicitly make individual fields accessible as needed.
     *
     * @var array<string, bool>
     */
    protected array $_accessible = [
        'recipe_id' => true,
        'name' => true,
        'amount' => true,
        'unit' => true,
        'recipe' => true,
    ];
}
