<?php

function getConnection() {

    $dbhost = "localhost";
    // MAMP default credentials
    $user = 'root';
    $pass = 'root';  // MAMP default password
    $db = 'asa_sc';

    // Try to connect
    $con = mysqli_connect($dbhost, $user, $pass, $db);

    // If connection fails, provide detailed error
    if (!$con) {
        error_log("MySQL Connection Error: " . mysqli_connect_error());
        throw new Exception("Database connection failed: " . mysqli_connect_error());
    }

    return $con;
}
?>

