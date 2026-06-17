<?php
declare(strict_types=1);

/**
 * CakePHP(tm) : Rapid Development Framework (https://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice
 *
 * @copyright     Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 * @link          https://cakephp.org CakePHP(tm) Project
 * @since         1.2.0
 * @license       https://opensource.org/licenses/mit-license.php MIT License
 */
namespace App\Test\TestCase\Controller;

use Cake\Core\Configure;
use Cake\TestSuite\IntegrationTestTrait;
use Cake\TestSuite\TestCase;

/**
 * PagesControllerTest class
 */
class PagesControllerTest extends TestCase
{
    use IntegrationTestTrait;

    /**
     * testDisplay method
     *
     * @return void
     */
    public function testDisplay()
    {
        Configure::write('debug', true);
        $this->get('/pages/home');
        $this->assertResponseOk();
        $this->assertResponseContains('CakePHP');
        $this->assertResponseContains('<html>');
    }

    /**
     * Errors are rendered as JSON (not an HTML page) in production — this is a
     * JSON-only API (see App\Controller\ErrorController).
     *
     * @return void
     */
    public function testMissingTemplateRendersJsonInProduction()
    {
        Configure::write('debug', false);
        $this->get('/pages/not_existing');

        // In production a missing template is reported as a 404.
        $this->assertResponseError();
        $this->assertContentType('application/json');
        // Internals are hidden behind a generic message.
        $this->assertResponseContains('Not Found');
    }

    /**
     * In debug mode the JSON error carries the underlying message.
     *
     * @return void
     */
    public function testMissingTemplateRendersJsonInDebug()
    {
        Configure::write('debug', true);
        $this->get('/pages/not_existing');

        $this->assertResponseFailure();
        $this->assertContentType('application/json');
        $this->assertResponseContains('not_existing.php');
    }

    /**
     * Test directory traversal protection
     *
     * @return void
     */
    public function testDirectoryTraversalProtection()
    {
        $this->get('/pages/../Layout/ajax');
        $this->assertResponseCode(403);
        $this->assertResponseContains('Forbidden');
    }

    // The skeleton's two CSRF tests were removed on purpose: this is a stateless
    // JSON API and the cookie-based CsrfProtectionMiddleware was intentionally
    // dropped (see src/Application.php and docs/implementation/02-cakephp-skeleton.md).
}
