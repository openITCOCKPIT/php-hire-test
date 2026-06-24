<?php
namespace cookbook_service\controller;

abstract class baseController
{
    /**
     * @param array $data
     * @return string
     */
    protected function responseJson(array $data) {
        http_response_code(200);
        $this->setResponseHeader('json');

        return json_encode([$data]);
    }

    /**
     * @param int $statusCode
     * @param string $error
     * @return string
     */
    protected function responseError(int $statusCode, string $error) {
        http_response_code($statusCode);
        $this->setResponseHeader('json');

        return json_encode(['error' => $error]);
    }

    /**
     * @param string $contendTypeShort
     * @return $this
     */
    protected function setResponseHeader(string $contendTypeShort) {
        $contendType = '';

        switch (strtolower($contendTypeShort)) {
            case 'json':
                $contendType = 'application/json';
                break;
            case 'html':
                $contendType = 'text/html';
                break;
            default:
                $contendType = 'text/plain';
                break;
        }

        header('Content-Type: ' . $contendType);
        return $this;
    }
}