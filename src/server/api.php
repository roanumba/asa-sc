<?php
include 'dbConnection.php';

include 'clientHandler.php';
include 'formService.php';

function calc($params) {
   return array("query"=>$params['k']) ;
}
