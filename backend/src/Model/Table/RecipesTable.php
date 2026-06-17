<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\Query\SelectQuery;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * Recipes Model
 *
 * @property \App\Model\Table\IngredientsTable&\Cake\ORM\Association\HasMany $Ingredients
 *
 * @method \App\Model\Entity\Recipe newEmptyEntity()
 * @method \App\Model\Entity\Recipe newEntity(array $data, array $options = [])
 * @method array<\App\Model\Entity\Recipe> newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Recipe get(mixed $primaryKey, array|string $finder = 'all', \Psr\SimpleCache\CacheInterface|string|null $cache = null, \Closure|string|null $cacheKey = null, mixed ...$args)
 * @method \App\Model\Entity\Recipe findOrCreate($search, ?callable $callback = null, array $options = [])
 * @method \App\Model\Entity\Recipe patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method array<\App\Model\Entity\Recipe> patchEntities(iterable $entities, array $data, array $options = [])
 * @method \App\Model\Entity\Recipe|false save(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method \App\Model\Entity\Recipe saveOrFail(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method iterable<\App\Model\Entity\Recipe>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Recipe>|false saveMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Recipe>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Recipe> saveManyOrFail(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Recipe>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Recipe>|false deleteMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Recipe>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Recipe> deleteManyOrFail(iterable $entities, array $options = [])
 *
 * @mixin \Cake\ORM\Behavior\TimestampBehavior
 */
class RecipesTable extends Table
{
    /**
     * Initialize method
     *
     * @param array<string, mixed> $config The configuration for the Table.
     * @return void
     */
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('recipes');
        $this->setDisplayField('title');
        $this->setPrimaryKey('id');

        $this->addBehavior('Timestamp');

        $this->hasMany('Ingredients', [
            'foreignKey' => 'recipe_id',
            'dependent' => true,
        ]);
    }

    /**
     * Default validation rules.
     *
     * @param \Cake\Validation\Validator $validator Validator instance.
     * @return \Cake\Validation\Validator
     */
    public function validationDefault(Validator $validator): Validator
    {
        $validator
            ->scalar('title')
            ->maxLength('title', 255)
            ->requirePresence('title', 'create')
            ->notEmptyString('title');

        $validator
            ->scalar('description')
            ->requirePresence('description', 'create')
            ->notEmptyString('description');

        return $validator;
    }
}
