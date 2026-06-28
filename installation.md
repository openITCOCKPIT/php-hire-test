# Installationsanleitung

## Voraussetzungen
-	Linux auf Debian-Basis z.B. Ubuntu
-	Min 8Gb Ram
-	Min 60GB HDD

### Installation der nötigen Pakete und der Services
```bash
sudo apt install docker.io docker-compose-v2 npm
sudo npm i -g @angular/cli@14
sudo npm install -g n
sudo n 14
sudo usermod -aG docker $USER
git clone https://github.com/marekpeters35/php-hire-test.git
cd php-hire-test
git pull
git checkout marekpeters35
```
### Backend Starten
```bash
cd php-hire-test/backend
docker compose build
docker compose up
```
### Frontend Starten
```bash
cd frontend/cookbook-app/
npm i
ng serve
```

## Nach dem ersten Start
-	Den Browser auf http://localhost:4200 öffnen
-	Es Öffnet sich die Willkommen Seite
-	Hier gibt es die Möglichkeit Demorezepte zu erstellen

## Datenbank zurücksetzen
```bash
docker compose down
docker compose build
docker compose up
```

## Einen individuellen Backend Service aufsetzen

Falls es gewünscht ist kann natürlich auch ein individueller Server aufgesetzt werden.

Der Server muss folgende Voraussetzungen erfüllen:
-	Das Betriebssystem muss auf Linux Basis seien
-	Es müssen PHP 8.3, PDO und Composer installiert sein
-	Es muss MySQL in der neusten Version installiert sein und ein entsprechender User der mit Root-Rechten eingerichtet werden

<br>

Anschließend müssen die Einstellungen an folgenden Stellen angepasst werden:
-	Im Frontend unter src/services/app-service in der Methode generateApplicationUrl müssen die Ports und die URL entsprechend geändert werdend
-	Im Backend unter src/db/ dbConnection.json muss die verbindung zur DB eingetragen werden wenn sie abweichend zum Docker Setup sind 

<br>

Das Backend auf den eigenen  Server Hosten:
-	Den Inhalt des src/ Orders unter backend in den Webhost kopieren
-	Danach Composer composer dump-autoload ausführen
-	Die cookbook.sql als Migration ausführen

# Viel Spaß bei ausprobieren :)