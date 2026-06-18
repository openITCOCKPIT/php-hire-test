<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * Ingredients Model
 *
 * @property \App\Model\Table\RecipesTable&\Cake\ORM\Association\BelongsTo $Recipes
 * @method \App\Model\Entity\Ingredient newEmptyEntity()
 * @method \App\Model\Entity\Ingredient newEntity(array $data, array $options = [])
 * @method array<\App\Model\Entity\Ingredient> newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Ingredient get(mixed $primaryKey, array|string $finder = 'all', \Psr\SimpleCache\CacheInterface|string|null $cache = null, \Closure|string|null $cacheKey = null, mixed ...$args)
 * @method \App\Model\Entity\Ingredient findOrCreate($search, ?callable $callback = null, array $options = [])
 * @method \App\Model\Entity\Ingredient patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method array<\App\Model\Entity\Ingredient> patchEntities(iterable $entities, array $data, array $options = [])
 * @method \App\Model\Entity\Ingredient|false save(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method \App\Model\Entity\Ingredient saveOrFail(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method iterable<\App\Model\Entity\Ingredient>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Ingredient>|false saveMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Ingredient>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Ingredient> saveManyOrFail(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Ingredient>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Ingredient>|false deleteMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Ingredient>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Ingredient> deleteManyOrFail(iterable $entities, array $options = [])
 */
class IngredientsTable extends Table
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

        $this->setTable('ingredients');
        $this->setDisplayField('name');
        $this->setPrimaryKey('id');

        $this->belongsTo('Recipes', [
            'foreignKey' => 'recipe_id',
            'joinType' => 'INNER',
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
            ->integer('recipe_id')
            ->notEmptyString('recipe_id');

        $validator
            ->scalar('name')
            ->maxLength('name', 255)
            ->requirePresence('name', 'create')
            ->notEmptyString('name');

        // Bounds match the DECIMAL(8,2) column: a value above 999999.99 would
        // otherwise be rejected by MySQL as a 500 rather than a clean 422.
        $validator
            ->numeric('amount')
            ->greaterThan('amount', 0, 'Amount must be greater than 0')
            ->lessThanOrEqual('amount', 999999.99, 'Amount must not exceed 999999.99')
            ->requirePresence('amount', 'create')
            ->notEmptyString('amount');

        $validator
            ->scalar('unit')
            ->maxLength('unit', 50)
            ->requirePresence('unit', 'create')
            ->notEmptyString('unit');

        return $validator;
    }

    /**
     * Returns a rules checker object that will be used for validating
     * application integrity.
     *
     * @param \Cake\ORM\RulesChecker $rules The rules object to be modified.
     * @return \Cake\ORM\RulesChecker
     */
    public function buildRules(RulesChecker $rules): RulesChecker
    {
        $rules->add($rules->existsIn(['recipe_id'], 'Recipes'), ['errorField' => 'recipe_id']);

        return $rules;
    }
}
