<?php
/**
 * Routes configuration.
 *
 * In this file, you set up routes to your controllers and their actions.
 * Routes are very important mechanism that allows you to freely connect
 * different URLs to chosen controllers and their actions (functions).
 *
 * It's loaded within the context of `Application::routes()` method which
 * receives a `RouteBuilder` instance `$routes` as method argument.
 *
 * CakePHP(tm) : Rapid Development Framework (https://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 * @link          https://cakephp.org CakePHP(tm) Project
 * @license       https://opensource.org/licenses/mit-license.php MIT License
 */

use Cake\Routing\Route\DashedRoute;
use Cake\Routing\RouteBuilder;

/*
 * This file is loaded in the context of the `Application` class.
 * So you can use `$this` to reference the application class instance
 * if required.
 */
return function (RouteBuilder $routes): void {
    /*
     * The default class to use for all routes
     *
     * The following route classes are supplied with CakePHP and are appropriate
     * to set as the default:
     *
     * - Route
     * - InflectedRoute
     * - DashedRoute
     *
     * If no call is made to `Router::defaultRouteClass()`, the class used is
     * `Route` (`Cake\Routing\Route\Route`)
     *
     * Note that `Route` does not do any inflections on URLs which will result in
     * inconsistently cased URLs when used with `{plugin}`, `{controller}` and
     * `{action}` markers.
     */
    $routes->setRouteClass(DashedRoute::class);

    $routes->scope('/', function (RouteBuilder $builder): void {
        /*
         * Root: a small JSON index of the API (this backend is a JSON API, not a
         * website — the UI is the Angular app). Replaces the CakePHP skeleton home.
         */
        $builder->get('/', ['controller' => 'Status', 'action' => 'home']);
    });

    /*
     * All resources live under /api so that, when the SPA and API are served from
     * a single origin (issue #18), the Angular client routes (e.g. /recipes/5)
     * and the API endpoints (/api/recipes/5) never collide.
     */
    $routes->scope('/api', function (RouteBuilder $builder): void {
        // Health-check endpoint (issue #2): GET /api/status -> {"status":"ok"}
        $builder->get('/status', ['controller' => 'Status', 'action' => 'index']);

        // Recipe read API (issue #5) and write/edit/delete (#6/#17).
        $builder->get('/recipes', ['controller' => 'Recipes', 'action' => 'index']);
        $builder->post('/recipes', ['controller' => 'Recipes', 'action' => 'add']);
        // Preview must precede /recipes/{id} so "{id}/preview" is not read as an id.
        $builder->get('/recipes/{id}/preview', ['controller' => 'Recipes', 'action' => 'preview'])
            ->setPatterns(['id' => '\d+'])
            ->setPass(['id']);
        $builder->post('/recipes/{id}/send-mail', ['controller' => 'Recipes', 'action' => 'sendMail'])
            ->setPatterns(['id' => '\d+'])
            ->setPass(['id']);
        $builder->post('/recipes/{id}/image', ['controller' => 'Recipes', 'action' => 'uploadImage'])
            ->setPatterns(['id' => '\d+'])
            ->setPass(['id']);
        $builder->delete('/recipes/{id}/image', ['controller' => 'Recipes', 'action' => 'deleteImage'])
            ->setPatterns(['id' => '\d+'])
            ->setPass(['id']);
        $builder->get('/recipes/{id}', ['controller' => 'Recipes', 'action' => 'view'])
            ->setPatterns(['id' => '\d+'])
            ->setPass(['id']);
        $builder->put('/recipes/{id}', ['controller' => 'Recipes', 'action' => 'edit'])
            ->setPatterns(['id' => '\d+'])
            ->setPass(['id']);
        $builder->delete('/recipes/{id}', ['controller' => 'Recipes', 'action' => 'delete'])
            ->setPatterns(['id' => '\d+'])
            ->setPass(['id']);

        // No fallbacks(): this API only serves the explicit routes above; any
        // other path returns a JSON 404 via the error renderer.
    });

    /*
     * If you need a different set of middleware or none at all,
     * open new scope and define routes there.
     *
     * ```
     * $routes->scope('/api', function (RouteBuilder $builder): void {
     *     // No $builder->applyMiddleware() here.
     *
     *     // Parse specified extensions from URLs
     *     // $builder->setExtensions(['json', 'xml']);
     *
     *     // Connect API actions here.
     * });
     * ```
     */
};
