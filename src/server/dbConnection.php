<?php

function getConnection() {

    $dbhost = "localhost";
//    $user = 'roanumba';
//    $pass = '0uguacPanel||';
    $user = 'root';
    $pass = '';
    $db = 'asa_sc';
    $con = mysqli_connect($dbhost, $user, $pass, $db);
    return $con;
}
?>

