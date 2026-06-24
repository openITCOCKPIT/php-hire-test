<?php
    require_once $_SERVER['DOCUMENT_ROOT'].'/vendor/autoload.php';

    $incomingController = new \cookbook_service\controller\incomingController();
    $incomingAction = '';
    $incomingData = [];

    if (isset($_POST['action'])) {
        $incomingAction = $_POST['action'];
        $incomingData = $_POST;
    } elseif (isset($_GET['action'])) {
        $incomingAction = $_GET['action'];
        $incomingData = $_GET;
    }

    try {
        echo $incomingController->routeIncomingRequest($incomingAction, $incomingData);
    } catch (\cookbook_service\exception\cookbookException $cookbookException) {
        echo $incomingController->error(intval($cookbookException->getCode()), $cookbookException->getMessage());
    }
    catch (Exception $exception) {
        echo $incomingController->error(400, 'Fatal Error: Service is not working!');
    }