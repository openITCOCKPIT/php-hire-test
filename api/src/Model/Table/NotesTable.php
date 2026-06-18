<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * Notes Model
 *
 * @property \App\Model\Table\RecipesTable&\Cake\ORM\Association\BelongsTo $Recipes
 *
 * @method \App\Model\Entity\Note newEmptyEntity()
 * @method \App\Model\Entity\Note newEntity(array $data, array $options = [])
 * @method array<\App\Model\Entity\Note> newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Note get(mixed $primaryKey, array|string $finder = 'all', \Psr\SimpleCache\CacheInterface|string|null $cache = null, \Closure|string|null $cacheKey = null, mixed ...$args)
 * @method \App\Model\Entity\Note findOrCreate($search, ?callable $callback = null, array $options = [])
 * @method \App\Model\Entity\Note patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method array<\App\Model\Entity\Note> patchEntities(iterable $entities, array $data, array $options = [])
 * @method \App\Model\Entity\Note|false save(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method \App\Model\Entity\Note saveOrFail(\Cake\Datasource\EntityInterface $entity, array $options = [])
 * @method iterable<\App\Model\Entity\Note>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Note>|false saveMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Note>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Note> saveManyOrFail(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Note>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Note>|false deleteMany(iterable $entities, array $options = [])
 * @method iterable<\App\Model\Entity\Note>|\Cake\Datasource\ResultSetInterface<\App\Model\Entity\Note> deleteManyOrFail(iterable $entities, array $options = [])
 *
 * @mixin \Cake\ORM\Behavior\TimestampBehavior
 */
class NotesTable extends Table
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

        $this->setTable('notes');
        $this->setDisplayField('id');
        $this->setPrimaryKey('id');

        // Only `created` exists (no `modified` column).
        $this->addBehavior('Timestamp', [
            'events' => ['Model.beforeSave' => ['created' => 'new']],
        ]);

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
            ->scalar('author')
            ->maxLength('author', 100)
            ->allowEmptyString('author');

        $validator
            ->scalar('body')
            ->requirePresence('body', 'create')
            ->notEmptyString('body');

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
