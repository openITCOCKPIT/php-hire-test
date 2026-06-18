<?php
declare(strict_types=1);

namespace App\Middleware;

use Cake\Http\Response;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

/**
 * Adds CORS headers so the Angular SPA (a different origin, e.g.
 * http://localhost:4200) can call this JSON API from the browser.
 *
 * Preflight OPTIONS requests are answered directly with an empty 200 response
 * carrying the CORS headers, so they never reach routing.
 */
class CorsMiddleware implements MiddlewareInterface
{
    /**
     * Add CORS headers to the response and short-circuit OPTIONS preflight.
     *
     * @param \Psr\Http\Message\ServerRequestInterface $request The incoming request.
     * @param \Psr\Http\Server\RequestHandlerInterface $handler The next handler.
     * @return \Psr\Http\Message\ResponseInterface The response carrying CORS headers.
     */
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler,
    ): ResponseInterface {
        // Short-circuit the preflight request; there is no OPTIONS route.
        if (strtoupper($request->getMethod()) === 'OPTIONS') {
            $response = new Response();
        } else {
            $response = $handler->handle($request);
        }

        $allowedOrigin = (string)env('CORS_ALLOW_ORIGIN', 'http://localhost:4200');

        return $response
            ->withHeader('Access-Control-Allow-Origin', $allowedOrigin)
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }
}
