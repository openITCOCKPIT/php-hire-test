<?php
declare(strict_types=1);

namespace App\Controller;

use Cake\Http\Response;

/**
 * Health-check endpoint.
 *
 * Used by monitoring and by the Angular app (issue #3) to confirm the API is
 * reachable. Returns a fixed JSON payload and touches nothing else, so it stays
 * green even if the database is down.
 */
class StatusController extends AppController
{
    /**
     * GET /status -> {"status":"ok"}
     */
    public function index(): Response
    {
        return $this->response
            ->withType('application/json')
            ->withStringBody((string)json_encode(['status' => 'ok']));
    }

    /**
     * GET / -> a small JSON index of the API.
     *
     * The backend is a JSON API, not a website — the user-facing UI is the
     * Angular app. Hitting the root in a browser therefore returns this index
     * rather than an HTML page, pointing at the available endpoints.
     */
    public function home(): Response
    {
        return $this->response
            ->withType('application/json')
            ->withStringBody((string)json_encode([
                'name' => 'Recipe Collection API',
                'documentation' => 'The user interface is the Angular app (see README).',
                'endpoints' => [
                    'GET /status',
                    'GET /recipes',
                    'GET /recipes/{id}',
                    'POST /recipes',
                ],
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }
}
