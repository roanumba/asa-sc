<?php

function getConnection() {

    $dbhost = "localhost";
//    $user = 'roanumba';
//    $pass = '0uguacPanel||';
    $user = 'root';
    $pass = 'root';
    $db = 'asa_sc';
    // $port = '8889';
    $con = mysqli_connect($dbhost, $user, $pass, $db);
    return $con;
}
?>

