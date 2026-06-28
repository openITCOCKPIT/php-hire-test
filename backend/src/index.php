<?php
    error_reporting(0);
    //for debugging
    //error_reporting(E_ALL);

    require_once $_SERVER['DOCUMENT_ROOT'].'/vendor/autoload.php';
    $incomingController = new \cookbook_service\controller\incomingController();

    try {
        echo $incomingController->routeIncomingRequest();
    } catch (\cookbook_service\exception\cookbookException $cookbookException) {
        echo $incomingController->error(intval($cookbookException->getCode()), $cookbookException->getMessage());
    } catch (Exception $exception) { // Never expose default Exceptions!
        echo $incomingController->error(400, 'Fatal Error: Service is not working!');
    }