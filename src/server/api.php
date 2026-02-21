<?php
include_once 'dbConnection.php';

include_once 'clientHandler.php';
include_once 'formService.php';

function calc($params) {
   return array("query"=>$params['k']) ;
}
