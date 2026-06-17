<?php
declare(strict_types=1);

namespace App\Controller;

use App\Model\RecipeModel;

class RecipeController
{
    private RecipeModel $model;

    public function __construct()
    {
        $this->model = new RecipeModel();
    }

    /**
     * GET /api/recipes
     * Query params: search, sort_by, sort_dir
     */
    public function index(): void
    {
        $search  = trim((string) ($_GET['search'] ?? ''));
        $sortBy  = (string) ($_GET['sort_by'] ?? 'created_at');
        $sortDir = (string) ($_GET['sort_dir'] ?? 'DESC');

        $recipes = $this->model->findAll($search, $sortBy, $sortDir);

        $this->json($recipes);
    }

    /**
     * GET /api/recipes/{id}
     */
    public function show(int $id): void
    {
        $recipe = $this->model->findById($id);

        if ($recipe === null) {
            $this->json(['error' => 'Recipe not found'], 404);
            return;
        }

        $this->json($recipe);
    }

    /**
     * GET /api/recipes/{id}/preview
     * Returns a lightweight preview (no full ingredients list)
     */
    public function preview(int $id): void
    {
        $recipe = $this->model->findById($id);

        if ($recipe === null) {
            $this->json(['error' => 'Recipe not found'], 404);
            return;
        }

        // Return a concise preview
        $this->json([
            'id'          => $recipe['id'],
            'title'       => $recipe['title'],
            'description' => mb_substr($recipe['description'], 0, 200) . (mb_strlen($recipe['description']) > 200 ? '…' : ''),
            'temperature' => $recipe['temperature'],
            'duration'    => $recipe['duration'],
            'created_at'  => $recipe['created_at'],
            'ingredients' => array_slice($recipe['ingredients'], 0, 5),
        ]);
    }

    /**
     * POST /api/recipes
     */
    public function create(): void
    {
        $data = $this->getJsonBody();

        $errors = $this->validate($data);
        if (!empty($errors)) {
            $this->json(['errors' => $errors], 422);
            return;
        }

        try {
            $id     = $this->model->create($data);
            $recipe = $this->model->findById($id);
            $this->json($recipe, 201);
        } catch (\Throwable $e) {
            $this->json(['error' => 'Failed to create recipe'], 500);
        }
    }

    /**
     * PUT /api/recipes/{id}
     */
    public function update(int $id): void
    {
        if ($this->model->findById($id) === null) {
            $this->json(['error' => 'Recipe not found'], 404);
            return;
        }

        $data   = $this->getJsonBody();
        $errors = $this->validate($data);

        if (!empty($errors)) {
            $this->json(['errors' => $errors], 422);
            return;
        }

        try {
            $this->model->update($id, $data);
            $this->json($this->model->findById($id));
        } catch (\Throwable $e) {
            $this->json(['error' => 'Failed to update recipe'], 500);
        }
    }

    /**
     * DELETE /api/recipes/{id}
     */
    public function delete(int $id): void
    {
        if (!$this->model->delete($id)) {
            $this->json(['error' => 'Recipe not found'], 404);
            return;
        }

        $this->json(['message' => 'Recipe deleted successfully']);
    }

    /**
     * POST /api/recipes/{id}/send-email
     */
    public function sendEmail(int $id): void
    {
        $recipe = $this->model->findById($id);

        if ($recipe === null) {
            $this->json(['error' => 'Recipe not found'], 404);
            return;
        }

        $data  = $this->getJsonBody();
        $email = trim((string) ($data['email'] ?? ''));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->json(['errors' => ['email' => 'Please provide a valid email address']], 422);
            return;
        }

        $subject = '🍽️ Recipe: ' . $recipe['title'];
        $body    = $this->buildEmailBody($recipe);

        $headers = [
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'From: Recipe Collection <noreply@recipe-collection.local>',
            'X-Mailer: PHP/' . PHP_VERSION,
        ];

        $sent = mail($email, $subject, $body, implode("\r\n", $headers));

        if ($sent) {
            $this->json(['message' => "Recipe sent to {$email}"]);
        } else {
            $this->json(['error' => 'Failed to send email. Please check server mail configuration.'], 500);
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private function validate(array $data): array
    {
        $errors = [];

        if (empty(trim((string) ($data['title'] ?? '')))) {
            $errors['title'] = 'Title is required';
        } elseif (mb_strlen($data['title']) > 255) {
            $errors['title'] = 'Title must not exceed 255 characters';
        }

        if (empty(trim((string) ($data['description'] ?? '')))) {
            $errors['description'] = 'Description is required';
        }

        return $errors;
    }

    private function getJsonBody(): array
    {
        $raw = file_get_contents('php://input');
        if (empty($raw)) {
            return [];
        }

        return json_decode($raw, true, 512, JSON_THROW_ON_ERROR) ?? [];
    }

    private function json(mixed $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    private function buildEmailBody(array $recipe): string
    {
        $ingredientsHtml = '';
        foreach ($recipe['ingredients'] as $ing) {
            $ingredientsHtml .= sprintf(
                '<li><strong>%s</strong> %s</li>',
                htmlspecialchars($ing['amount']),
                htmlspecialchars($ing['name'])
            );
        }

        $temp        = $recipe['temperature'] ? "<p>🌡️ Temperature: {$recipe['temperature']}°C</p>" : '';
        $duration    = $recipe['duration'] ? "<p>⏱️ Duration: {$recipe['duration']} minutes</p>" : '';
        $created     = date('d.m.Y', strtotime($recipe['created_at']));
        $title       = htmlspecialchars($recipe['title']);
        $description = nl2br(htmlspecialchars($recipe['description']));

        return <<<HTML
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><title>{$title}</title></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="background: #f97316; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0;">🍽️ {$title}</h1>
                <small>Created: {$created}</small>
            </div>
            <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; padding: 20px;">
                {$temp}{$duration}
                <h2>Ingredients</h2>
                <ul>{$ingredientsHtml}</ul>
                <h2>Description</h2>
                <p style="line-height: 1.6;">{$description}</p>
                <hr>
                <small style="color: #9ca3af;">Sent from Recipe Collection App</small>
            </div>
        </body>
        </html>
        HTML;
    }
}
