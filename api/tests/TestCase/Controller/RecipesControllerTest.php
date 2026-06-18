<?php
declare(strict_types=1);

namespace App\Test\TestCase\Controller;

use Cake\TestSuite\EmailTrait;
use Cake\TestSuite\IntegrationTestTrait;
use Cake\TestSuite\TestCase;
use Laminas\Diactoros\UploadedFile;

/**
 * @uses \App\Controller\RecipesController
 */
class RecipesControllerTest extends TestCase
{
    use EmailTrait;
    use IntegrationTestTrait;

    protected array $fixtures = [
        'app.Recipes',
        'app.Ingredients',
    ];

    /**
     * Uploaded image files created during a test, cleaned up in tearDown.
     *
     * @var list<string>
     */
    private array $uploadedFiles = [];

    protected function tearDown(): void
    {
        foreach ($this->uploadedFiles as $relative) {
            $full = WWW_ROOT . 'uploads' . DS . str_replace('/', DS, $relative);
            if (is_file($full)) {
                unlink($full);
            }
        }
        $this->uploadedFiles = [];
        parent::tearDown();
    }

    /**
     * Build a one-pixel PNG temp file and wrap it as an uploaded file.
     */
    private function pngUpload(): UploadedFile
    {
        $png = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        );
        $tmp = tempnam(sys_get_temp_dir(), 'png');
        file_put_contents($tmp, $png);

        return new UploadedFile($tmp, strlen($png), UPLOAD_ERR_OK, 'photo.png', 'image/png');
    }

    public function testIndexReturnsRecipesWithIngredients(): void
    {
        $this->get('/api/recipes');

        $this->assertResponseOk();
        $this->assertContentType('application/json');

        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertArrayHasKey('recipes', $body);
        $this->assertCount(2, $body['recipes']);

        // Find the chocolate cake regardless of sort order.
        $titles = array_column($body['recipes'], 'title');
        $cake = $body['recipes'][array_search('Chocolate cake', $titles, true)];
        // amount is a decimal string, not a float
        $this->assertSame('100.00', $cake['ingredients'][0]['amount']);
        $this->assertCount(3, $cake['ingredients']);
    }

    public function testIndexSortsByTitleAscending(): void
    {
        $this->get('/api/recipes?sort=title&direction=ASC');

        $this->assertResponseOk();
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $titles = array_column($body['recipes'], 'title');
        $this->assertSame(['Chocolate cake', 'Pancakes'], $titles);
    }

    public function testIndexSortsByCreatedDescendingByDefault(): void
    {
        $this->get('/api/recipes');

        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $titles = array_column($body['recipes'], 'title');
        // Pancakes (2026-06-16) is newer than Chocolate cake (2026-06-15).
        $this->assertSame(['Pancakes', 'Chocolate cake'], $titles);
    }

    public function testIndexRejectsInjectedSortAndFallsBack(): void
    {
        $this->get('/api/recipes?sort=title;DROP TABLE recipes&direction=evil');

        // Unknown sort/direction must not error; it falls back to the default order.
        $this->assertResponseOk();
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertCount(2, $body['recipes']);
    }

    public function testIndexSearchMatchesTitle(): void
    {
        $this->get('/api/recipes?search=choc');

        $this->assertResponseOk();
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $titles = array_column($body['recipes'], 'title');
        $this->assertSame(['Chocolate cake'], $titles);
    }

    public function testIndexSearchMatchesDescription(): void
    {
        // "fry" appears only in the Pancakes description, not its title.
        $this->get('/api/recipes?search=fry');

        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $titles = array_column($body['recipes'], 'title');
        $this->assertSame(['Pancakes'], $titles);
    }

    public function testIndexSearchNoMatchReturnsEmpty(): void
    {
        $this->get('/api/recipes?search=zzz-nothing');

        $this->assertResponseOk();
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertCount(0, $body['recipes']);
    }

    public function testIndexSearchComposesWithSort(): void
    {
        // Both recipes contain "a"; sorted by title ascending.
        $this->get('/api/recipes?search=a&sort=title&direction=ASC');

        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $titles = array_column($body['recipes'], 'title');
        $this->assertSame(['Chocolate cake', 'Pancakes'], $titles);
    }

    public function testSendMailDeliversToTheGivenAddress(): void
    {
        $this->post('/api/recipes/1/send-mail', ['email' => 'friend@example.com']);

        $this->assertResponseOk();
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertTrue($body['sent']);
        $this->assertMailCount(1);
        $this->assertMailSentTo('friend@example.com');
        $this->assertMailContainsHtml('Chocolate cake');
    }

    public function testSendMailInvalidEmailReturns422(): void
    {
        $this->post('/api/recipes/1/send-mail', ['email' => 'not-an-email']);

        $this->assertResponseCode(422);
        $this->assertResponseContains('valid e-mail');
        $this->assertNoMailSent();
    }

    public function testSendMailUnknownRecipeReturns404(): void
    {
        $this->post('/api/recipes/9999/send-mail', ['email' => 'friend@example.com']);

        $this->assertResponseCode(404);
        $this->assertNoMailSent();
    }

    public function testViewReturnsSingleRecipeWithIngredients(): void
    {
        $this->get('/api/recipes/1');

        $this->assertResponseOk();
        $this->assertContentType('application/json');

        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertArrayHasKey('recipe', $body);
        $this->assertSame('Chocolate cake', $body['recipe']['title']);
        $this->assertSame('2026-06-15T00:00:00+00:00', $body['recipe']['created']);
        $this->assertCount(3, $body['recipe']['ingredients']);
    }

    public function testViewUnknownIdReturnsJson404(): void
    {
        $this->get('/api/recipes/9999');

        $this->assertResponseCode(404);
        $this->assertContentType('application/json');
        $this->assertResponseContains('Recipe not found');
    }

    public function testErrorResponseCarriesCorsHeader(): void
    {
        // Thrown-exception responses (404) must also get CORS headers, or the
        // browser blocks them and the SPA cannot read the status.
        $this->get('/api/recipes/9999');

        $this->assertResponseCode(404);
        $this->assertHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    }

    public function testPreviewReturnsTrimmedPayload(): void
    {
        $this->get('/api/recipes/1/preview');

        $this->assertResponseOk();
        $this->assertContentType('application/json');

        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertSame('Chocolate cake', $body['preview']['title']);
        $this->assertArrayHasKey('descriptionExcerpt', $body['preview']);
        $this->assertSame('100.00', $body['preview']['ingredients'][0]['amount']);
    }

    public function testPreviewCapsIngredientsAtFiveAndTruncatesDescription(): void
    {
        $recipes = $this->getTableLocator()->get('Recipes');
        $recipe = $recipes->newEntity([
            'title' => 'Big recipe',
            'description' => str_repeat('x', 250),
            'ingredients' => array_map(
                fn ($i) => ['name' => "ing$i", 'amount' => 1, 'unit' => 'g'],
                range(1, 6),
            ),
        ], ['associated' => ['Ingredients']]);
        $recipes->saveOrFail($recipe);

        $this->get("/api/recipes/{$recipe->id}/preview");

        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertCount(5, $body['preview']['ingredients'], 'capped at 5');
        $this->assertSame(201, mb_strlen($body['preview']['descriptionExcerpt']), '200 chars + ellipsis');
        $this->assertStringEndsWith('…', $body['preview']['descriptionExcerpt']);
    }

    public function testPreviewUnknownIdReturnsJson404(): void
    {
        $this->get('/api/recipes/9999/preview');

        $this->assertResponseCode(404);
        $this->assertContentType('application/json');
    }

    public function testAddCreatesRecipeWithIngredients(): void
    {
        $this->post('/api/recipes', [
            'title' => 'Omelette',
            'description' => 'Beat and fry.',
            'ingredients' => [
                ['name' => 'eggs', 'amount' => 3, 'unit' => 'pcs'],
                ['name' => 'butter', 'amount' => 1.5, 'unit' => 'tbsp'],
            ],
        ]);

        $this->assertResponseCode(201);
        $this->assertContentType('application/json');

        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertSame('Omelette', $body['recipe']['title']);
        $this->assertCount(2, $body['recipe']['ingredients']);
        // amount comes back as a canonical decimal string
        $this->assertSame('1.50', $body['recipe']['ingredients'][1]['amount']);

        $this->assertSame(3, $this->getTableLocator()->get('Recipes')->find()->count());
    }

    public function testViewIncludesTemperatureAndDuration(): void
    {
        $this->get('/api/recipes/1');

        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertSame(200, $body['recipe']['temperature']);
        $this->assertSame(40, $body['recipe']['duration']);
    }

    public function testAddPersistsTemperatureAndDuration(): void
    {
        $this->post('/api/recipes', [
            'title' => 'Roast',
            'temperature' => 180,
            'duration' => 90,
            'ingredients' => [['name' => 'beef', 'amount' => 1, 'unit' => 'kg']],
        ]);

        $this->assertResponseCode(201);
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertSame(180, $body['recipe']['temperature']);
        $this->assertSame(90, $body['recipe']['duration']);
    }

    public function testAddRejectsOutOfRangeTemperature(): void
    {
        $this->post('/api/recipes', [
            'title' => 'Too hot',
            'temperature' => 600,
            'ingredients' => [['name' => 'x', 'amount' => 1, 'unit' => 'g']],
        ]);

        $this->assertResponseCode(422);
        $this->assertResponseContains('Temperature must be between');
    }

    public function testAddMissingTitleReturns422(): void
    {
        $this->post('/api/recipes', [
            'ingredients' => [['name' => 'x', 'amount' => 1, 'unit' => 'g']],
        ]);

        $this->assertResponseCode(422);
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertArrayHasKey('title', $body['errors']);
    }

    public function testAddNegativeAmountReturns422(): void
    {
        $this->post('/api/recipes', [
            'title' => 'Bad amount',
            'ingredients' => [['name' => 'x', 'amount' => -5, 'unit' => 'g']],
        ]);

        $this->assertResponseCode(422);
        $this->assertResponseContains('greater than 0');
    }

    public function testAddEmptyIngredientsReturns422(): void
    {
        $this->post('/api/recipes', ['title' => 'No ingredients', 'ingredients' => []]);

        $this->assertResponseCode(422);
        $this->assertResponseContains('At least one ingredient');
    }

    public function testAddIngredientsAsSingleObjectReturns422(): void
    {
        // A bare object instead of a list: the marshaller drops the scalar
        // values, so without checking the marshalled entity this would persist
        // a recipe with zero ingredients.
        $recipes = $this->getTableLocator()->get('Recipes');
        $before = $recipes->find()->count();

        $this->post('/api/recipes', [
            'title' => 'Broken',
            'ingredients' => ['name' => 'eggs', 'amount' => 3, 'unit' => 'pcs'],
        ]);

        $this->assertResponseCode(422);
        $this->assertResponseContains('At least one ingredient');
        $this->assertSame($before, $recipes->find()->count(), 'No recipe should be persisted');
    }

    public function testAddIngredientsWithNonObjectElementsReturns422(): void
    {
        $recipes = $this->getTableLocator()->get('Recipes');
        $before = $recipes->find()->count();

        $this->post('/api/recipes', [
            'title' => 'Ghost',
            'ingredients' => ['not-an-object'],
        ]);

        $this->assertResponseCode(422);
        $this->assertSame($before, $recipes->find()->count(), 'No recipe should be persisted');
    }

    public function testAddAmountExceedingColumnRangeReturns422(): void
    {
        // 9999999 exceeds DECIMAL(8,2)'s max (999999.99); must be a clean 422,
        // not a 500 database error.
        $this->post('/api/recipes', [
            'title' => 'Overflow',
            'ingredients' => [['name' => 'x', 'amount' => 9999999, 'unit' => 'g']],
        ]);

        $this->assertResponseCode(422);
        $this->assertResponseContains('must not exceed');
    }

    public function testEditUpdatesRecipeAndReplacesIngredients(): void
    {
        $this->put('/api/recipes/1', [
            'title' => 'Chocolate cake (v2)',
            'temperature' => 180,
            'ingredients' => [['name' => 'cocoa', 'amount' => 75, 'unit' => 'g']],
        ]);

        $this->assertResponseOk();
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertSame('Chocolate cake (v2)', $body['recipe']['title']);
        $this->assertSame(180, $body['recipe']['temperature']);
        // ingredients fully replaced (was 3, now 1)
        $this->assertCount(1, $body['recipe']['ingredients']);
        $this->assertSame('cocoa', $body['recipe']['ingredients'][0]['name']);

        // the old ingredients are gone, not orphaned
        $remaining = $this->getTableLocator()->get('Ingredients')->find()->where(['recipe_id' => 1])->count();
        $this->assertSame(1, $remaining);
    }

    public function testEditCanClearMetadata(): void
    {
        // Recipe 1 starts with temperature 200, duration 40; clear them.
        $this->put('/api/recipes/1', [
            'title' => 'Chocolate cake',
            'temperature' => null,
            'duration' => null,
            'ingredients' => [['name' => 'cocoa', 'amount' => 75, 'unit' => 'g']],
        ]);

        $this->assertResponseOk();
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertNull($body['recipe']['temperature']);
        $this->assertNull($body['recipe']['duration']);
    }

    public function testEditUnknownIdReturns404(): void
    {
        $this->put('/api/recipes/9999', [
            'title' => 'x',
            'ingredients' => [['name' => 'a', 'amount' => 1, 'unit' => 'g']],
        ]);
        $this->assertResponseCode(404);
    }

    public function testEditWithEmptyIngredientsReturns422(): void
    {
        $this->put('/api/recipes/1', ['title' => 'x', 'ingredients' => []]);
        $this->assertResponseCode(422);
    }

    public function testDeleteRemovesRecipeAndCascadesIngredients(): void
    {
        $this->delete('/api/recipes/1');

        $this->assertResponseOk();
        $this->assertResponseContains('"deleted":true');

        $recipes = $this->getTableLocator()->get('Recipes');
        $this->assertFalse($recipes->exists(['id' => 1]));
        $orphans = $this->getTableLocator()->get('Ingredients')->find()->where(['recipe_id' => 1])->count();
        $this->assertSame(0, $orphans);
    }

    public function testDeleteUnknownIdReturns404(): void
    {
        $this->delete('/api/recipes/9999');
        $this->assertResponseCode(404);
    }

    public function testUploadImageStoresFileAndSetsPath(): void
    {
        $this->configRequest(['files' => ['image' => $this->pngUpload()]]);
        $this->post('/api/recipes/1/image');

        $this->assertResponseOk();
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $path = $body['recipe']['image_path'];
        $this->uploadedFiles[] = $path;

        $this->assertMatchesRegularExpression('#^recipes/[0-9a-f]{32}\.png$#', $path);
        $this->assertFileExists(WWW_ROOT . 'uploads' . DS . str_replace('/', DS, $path));
        // the response is a complete recipe, ingredients included
        $this->assertCount(3, $body['recipe']['ingredients']);
    }

    public function testUploadImageRejectsNonImageType(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'txt');
        file_put_contents($tmp, 'not an image');
        $file = new UploadedFile($tmp, 12, UPLOAD_ERR_OK, 'note.txt', 'text/plain');

        $this->configRequest(['files' => ['image' => $file]]);
        $this->post('/api/recipes/1/image');

        $this->assertResponseCode(422);
        $this->assertResponseContains('JPEG, PNG or WebP');
    }

    public function testUploadImageRejectsSpoofedContent(): void
    {
        // Text claiming to be a PNG: passes the media-type check, fails getimagesize.
        $tmp = tempnam(sys_get_temp_dir(), 'fake');
        file_put_contents($tmp, 'this is not really a png');
        $file = new UploadedFile($tmp, 24, UPLOAD_ERR_OK, 'fake.png', 'image/png');

        $this->configRequest(['files' => ['image' => $file]]);
        $this->post('/api/recipes/1/image');

        $this->assertResponseCode(422);
        $this->assertResponseContains('not a valid image');
    }

    public function testUploadImageTooLargeReturns422(): void
    {
        $tmp = tempnam(sys_get_temp_dir(), 'big');
        $fh = fopen($tmp, 'w');
        fseek($fh, 5 * 1024 * 1024); // 5 MB + 1 byte
        fwrite($fh, '0');
        fclose($fh);
        $file = new UploadedFile($tmp, (int)filesize($tmp), UPLOAD_ERR_OK, 'big.png', 'image/png');

        $this->configRequest(['files' => ['image' => $file]]);
        $this->post('/api/recipes/1/image');

        $this->assertResponseCode(422);
        $this->assertResponseContains('5 MB');
    }

    public function testUploadImageUnknownIdReturns404(): void
    {
        $this->configRequest(['files' => ['image' => $this->pngUpload()]]);
        $this->post('/api/recipes/9999/image');
        $this->assertResponseCode(404);
    }

    public function testDeleteImageRemovesFileAndClearsPath(): void
    {
        $this->configRequest(['files' => ['image' => $this->pngUpload()]]);
        $this->post('/api/recipes/1/image');
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $path = $body['recipe']['image_path'];
        $full = WWW_ROOT . 'uploads' . DS . str_replace('/', DS, $path);
        $this->assertFileExists($full);

        $this->delete('/api/recipes/1/image');

        $this->assertResponseOk();
        $this->assertFileDoesNotExist($full);

        $this->get('/api/recipes/1');
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertNull($body['recipe']['image_path']);
    }

    public function testInvalidRecipeIsNotPersisted(): void
    {
        $recipes = $this->getTableLocator()->get('Recipes');
        $before = $recipes->find()->count();

        $this->post('/api/recipes', [
            'title' => 'Should not persist',
            'ingredients' => [['name' => 'x', 'amount' => -5, 'unit' => 'g']],
        ]);

        $this->assertResponseCode(422);
        $this->assertSame(
            $before,
            $recipes->find()->count(),
            'A validation failure must not leave an orphan recipe',
        );
    }
}
