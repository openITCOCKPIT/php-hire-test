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
        $this->get('/status');

        $this->assertResponseOk();
        $this->assertContentType('application/json');
        $this->assertResponseEquals('{"status":"ok"}');
    }

    public function testStatusSendsCorsHeader(): void
    {
        $this->get('/status');

        $this->assertHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    }
}
