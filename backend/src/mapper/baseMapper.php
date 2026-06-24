<?php
namespace cookbook_service\mapper;

use cookbook_service\exception\cookbookException;

abstract class baseMapper
{
    /**
     * @var \PDO
     */
    private static $pdo;

    /**
     * @throws \Exception
     */
    public function __construct() {
        if (self::$pdo === NULL) {
            $this->setPdo();
        }
    }

    /**
     * @return \PDO
     */
    protected function getPdo() {
        return self::$pdo;
    }


    public function testConnection() {
        $sql = 'SELECT count(id) cnt FROM connection_test';
        $stmt = $this->getPdo()->prepare($sql);

        $stmt->execute();

        $result = $stmt->fetch(\PDO::FETCH_OBJ);

        if ($result->cnt === 0) {
            throw new cookbookException('The Database was not setup correct');
        }

        return $result->cnt;
    }

    /**
     * @return baseMapper
     * @throws \Exception
     */
    private function setPdo(){
        $configPath = $_SERVER['DOCUMENT_ROOT'] . '/db/dbConnection.json';
        $configJson = new \stdClass();

        if (file_exists($configPath)) {
            $configJsonAsString = file_get_contents($configPath);
            $configJson =  json_decode($configJsonAsString, false);
        }

        try {
            $extra = [\PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"];
            self::$pdo = new \PDO('mysql:host='.$configJson->host.';dbname=' . $configJson->database, $configJson->user, $configJson->password, $extra);
            self::$pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_WARNING);
        } catch (\Exception $ex) {
            throw new cookbookException('Database connection failed with message:'. $ex->getMessage());
        }

        return $this;
    }
}