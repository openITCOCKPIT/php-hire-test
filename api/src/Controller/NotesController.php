<?php
declare(strict_types=1);

namespace App\Controller;

use Cake\Http\Exception\NotFoundException;
use Cake\Http\Response;

/**
 * Notes API — personal notes attached to a recipe (#20).
 *
 * @property \App\Model\Table\NotesTable $Notes
 */
class NotesController extends AppController
{
    /**
     * GET /recipes/{recipeId}/notes — notes for a recipe, newest first.
     *
     * @param int $recipeId Recipe id.
     * @return void
     * @throws \Cake\Http\Exception\NotFoundException When the recipe does not exist.
     */
    public function index(int $recipeId): void
    {
        $this->requireRecipe($recipeId);

        $notes = $this->Notes->find()
            ->where(['recipe_id' => $recipeId])
            ->orderBy(['created' => 'DESC', 'id' => 'DESC'])
            ->all();

        $this->set('notes', $notes);
        $this->viewBuilder()->setClassName('Json')->setOption('serialize', ['notes']);
    }

    /**
     * POST /recipes/{recipeId}/notes — add a note to a recipe.
     *
     * @param int $recipeId Recipe id.
     * @return \Cake\Http\Response|null A 422 response on failure, or null to render the note.
     * @throws \Cake\Http\Exception\NotFoundException When the recipe does not exist.
     */
    public function add(int $recipeId): ?Response
    {
        $this->requireRecipe($recipeId);

        $note = $this->Notes->newEntity((array)$this->request->getData());
        $note->recipe_id = $recipeId;

        if (!$this->Notes->save($note)) {
            return $this->jsonResponse(422, ['errors' => $note->getErrors()]);
        }

        $this->response = $this->response->withStatus(201);
        $this->set('note', $note);
        $this->viewBuilder()->setClassName('Json')->setOption('serialize', ['note']);

        return null;
    }

    /**
     * DELETE /notes/{id} — delete a note.
     *
     * @param int $id Note id.
     * @return \Cake\Http\Response The JSON result.
     * @throws \Cake\Http\Exception\NotFoundException When the note does not exist.
     */
    public function delete(int $id): Response
    {
        $note = $this->Notes->find()->where(['id' => $id])->first();
        if ($note === null) {
            throw new NotFoundException('Note not found');
        }

        $this->Notes->deleteOrFail($note);

        return $this->jsonResponse(200, ['deleted' => true]);
    }

    /**
     * Ensure the recipe exists, or throw a 404.
     *
     * @param int $recipeId Recipe id.
     * @return void
     * @throws \Cake\Http\Exception\NotFoundException When the recipe does not exist.
     */
    private function requireRecipe(int $recipeId): void
    {
        if (!$this->Notes->Recipes->exists(['id' => $recipeId])) {
            throw new NotFoundException('Recipe not found');
        }
    }

    /**
     * Build a JSON response with a status code and payload.
     *
     * @param int $status HTTP status code.
     * @param array $payload Body to JSON-encode.
     * @return \Cake\Http\Response
     */
    private function jsonResponse(int $status, array $payload): Response
    {
        return $this->response
            ->withStatus($status)
            ->withType('application/json')
            ->withStringBody((string)json_encode($payload));
    }
}
