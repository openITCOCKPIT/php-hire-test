<?php
declare(strict_types=1);

namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Recipe Entity
 *
 * @property int $id
 * @property string $title
 * @property string|null $description
 * @property int|null $temperature
 * @property int|null $duration
 * @property string|null $image_path
 * @property \Cake\I18n\DateTime $created
 *
 * @property \App\Model\Entity\Ingredient[] $ingredients
 */
class Recipe extends Entity
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
        'title' => true,
        'description' => true,
        'temperature' => true,
        'duration' => true,
        'ingredients' => true,
        // created is owned by the Timestamp behaviour, image_path by the upload
        // endpoint — neither is mass-assignable from request JSON.
        'created' => false,
        'image_path' => false,
    ];
}
