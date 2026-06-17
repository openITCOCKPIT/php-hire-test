<?php
declare(strict_types=1);

namespace App\Test\TestCase\Controller;

use Cake\TestSuite\IntegrationTestTrait;
use Cake\TestSuite\TestCase;

/**
 * @uses \App\Controller\StatusController
 */
class StatusControllerTest extends TestCase
{
    use IntegrationTestTrait;

    public function testStatusReturnsOkJson(): void
    {
        $this->get('/api/status');

        $this->assertResponseOk();
        $this->assertContentType('application/json');
        $this->assertResponseEquals('{"status":"ok"}');
    }

    public function testStatusSendsCorsHeader(): void
    {
        $this->get('/api/status');

        $this->assertHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    }

    public function testRootReturnsJsonApiIndex(): void
    {
        $this->get('/');

        $this->assertResponseOk();
        $this->assertContentType('application/json');
        $this->assertResponseContains('Recipe Collection API');
        $this->assertResponseContains('/recipes');
    }

    public function testUnknownRouteReturnsJson404(): void
    {
        $this->get('/does-not-exist');

        $this->assertResponseCode(404);
        $this->assertContentType('application/json');
    }
}
