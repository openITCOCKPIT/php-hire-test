<?php

namespace App\Controller;

use App\Controller\AppController;
use Cake\Event\EventInterface;
use Cake\Http\Exception\NotFoundException;
use Cake\Mailer\Mailer;
use Cake\View\JsonView;

class RecipesController extends AppController
{
    public function viewClasses(): array
    {
        return [JsonView::class];
    }

    public function initialize(): void
    {
        parent::initialize();
        $this->viewBuilder()->setClassName('Json');
    }

   public function beforeFilter(EventInterface $event)
    {
        $this->response = $this->response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
            ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        if ($this->request->is('options')) {
            return $this->response->withStatus(200);
        }
        
        parent::beforeFilter($event);
    }

    public function index()
    {   
        $search = $this->request->getQuery('search');
        
        $sort = $this->request->getQuery('sort', 'created'); 
        $direction = strtolower($this->request->getQuery('direction', 'desc'));

        $allowedSorts = ['title', 'created']; 
        $allowedDirections = ['asc', 'desc'];

        if (!in_array($sort, $allowedSorts, true)) {
            $sort = 'created';
        }
        if (!in_array($direction, $allowedDirections, true)) {
            $direction = 'desc';
        }

        $query = $this->Recipes->find()->contain(['Ingredients']);

        if (!empty($search)) {
            $query->where([
                'OR' => [
                    'Recipes.title LIKE' => "%{$search}%",
                    'Recipes.description LIKE' => "%{$search}%"
                ]
            ]);
        }

        $query->orderBy([
            'Recipes.' . $sort => $direction
        ]);

        $this->set([
            'success' => true,
            'data' => $query->all()
        ]);
        
        $this->viewBuilder()->setOption('serialize', ['success', 'data']);
    }

    public function view($id = null)
    {
        try {
            $recipe = $this->Recipes->get($id, [
                'contain' => ['Ingredients']
            ]);

            $this->set([
                'success' => true,
                'data' => $recipe
            ]);

            $this->viewBuilder()->setOption('serialize', ['success', 'data']);

        } catch (\Exception $e) {
            throw new NotFoundException('Recipe not found');
        }
    }

    public function add()
    {
        $recipe = $this->Recipes->newEmptyEntity();
        
        $recipe = $this->Recipes->patchEntity($recipe, $this->request->getData(), [
            'associated' => ['Ingredients']
        ]);

        if ($this->Recipes->save($recipe)) {
            $this->response = $this->response->withStatus(201);
            $this->set(['success' => true, 'data' => $recipe]);
            $this->viewBuilder()->setOption('serialize', ['success', 'data']);
            return;
        }

        $this->response = $this->response->withStatus(400);
        $this->set([
            'success' => false, 
            'errors' => $recipe->getErrors(),
        ]);
        $this->viewBuilder()->setOption('serialize', ['success', 'errors']);
    }
    

    public function sendEmail($id = null)
    {
        $emailTo = $this->request->getData('email');

        if (empty($emailTo) || !filter_var($emailTo, FILTER_VALIDATE_EMAIL)) {
            $this->response = $this->response->withStatus(400);
            $this->set([
                'success' => false,
                'message' => 'Valid email is required'
            ]);

            $this->viewBuilder()->setOption('serialize', ['success', 'message']);
            return;
        }

        try {
            $recipe = $this->Recipes->get($id, [
                'contain' => ['Ingredients']
            ]);

            $body = "Hi,\n\n";
            $body .= "Your friend shared a recipe with you:\n\n";
            $body .= "{$recipe->title}\n\n";
            $body .= "Ingredients:\n";

            foreach ($recipe->ingredients as $ingredient) {
                $body .= "- {$ingredient->amount} {$ingredient->name}\n";
            }

            $body .= "\nInstructions:\n{$recipe->description}\n";

            $mailer = new Mailer('default');

            $mailer
                ->setFrom(['no-reply@recipes.local' => 'Recipe App'])
                ->setTo($emailTo)
                ->setSubject("Recipe: {$recipe->title}")
                ->deliver($body);

            $this->set([
                'success' => true,
                'message' => 'Email sent successfully'
            ]);
            $this->viewBuilder()->setOption('serialize', ['success', 'message']);

        } catch (\Exception $e) {

            $this->response = $this->response->withStatus(500);

            $this->set([
                'success' => false,
                'message' => 'Unable to send email'
            ]);
            $this->viewBuilder()->setOption('serialize', ['success', 'message']);
        }
    }
}