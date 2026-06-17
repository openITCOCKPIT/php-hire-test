# Recipe Management System

A full-stack web application designed for a seamless recipe browsing and creation experience. Built with Angular for a reactive frontend and CakePHP for a robust backend, containerized with Docker for easy deployment and development.


# Project Structure
The project follows a modular structure to separate concerns between the frontend and the backend:

```
.
├── backend/            # CakePHP Application
├── frontend/           # Angular Application
├── docker-compose.yml  # Container orchestration
└── README.md
```

## Features

1. Browse & Search: Effortlessly find recipes from the collection.
2. AI-Powered Optimization: Integrated AI assistant to optimize recipe titles, descriptions, and automatically extract ingredient lists.
3. Recipe Preview: Real-time recipe preview via AJAX hover functionality.
4. Create Recipes: Add new recipes with dynamic ingredient management.
4. Responsive Design: Fully styled with Bootstrap 5.x for cross-browser compatibility.

*Prerequisites*
Docker and Docker Compose installed on your machine.
Node.js (for local frontend development, if not using containers).

### Getting Started:

**1. Cloning the Repository**
```
git clone https://github.com/Moh-alkurdi/php-hire-test.git
cd recipe-management
```

**2. Running the Application:**
The easiest way to run the full stack is via Docker. The ```docker-compose``` setup automatically handles the database initialization and service linking.
```docker-compose up --build```
Once the containers are up, the application will be accessible via your browser. The database schema is automatically generated on startup, so no manual SQL import is required.


# Technology Stack:

* Frontend: Angular (TypeScript), Bootstrap 5, RxJS.
* Backend: CakePHP (PHP 8.3).
* Database: MySQL 8.0.
* DevOps: Docker & Docker Compose.

# Notes for Reviewers
* AI Integration: The system uses a prompt-engineered AI service to process recipe inputs.
* CI/CD Ready: The project structure is optimized for automated build pipelines, including Jenkins, by maintaining clear dependency definitions *(package.json, composer.json)* :).


Developed by **Mohammed Alkurdi**.  
*Danke für Ihre Zeit und Mühe. Ich freue mich auf Ihre Rückmeldung.*