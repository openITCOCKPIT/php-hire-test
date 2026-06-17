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
}
