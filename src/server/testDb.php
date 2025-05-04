<?php
include 'dbConnection.php';
    try {
        $mysqli = getConnection();
if ($mysqli->connect_error) {
    echo 'Errno: '.$mysqli->connect_errno;
    echo '<br>';
    echo 'Error: '.$mysqli->connect_error;
    exit();
  }
// select * from scholarship '
    $sql = "SELECT * FROM scholarship";
    $result = $mysqli->query($sql);
    if ($result->num_rows > 0) {
        // output data of each row
        while($row = $result->fetch_assoc()) {
            echo "id: " . $row["formNumber"]. " - Name: " . $row["firstName"]. " " . $row["email"]. "<br>";
        }
    } else {
        echo "0 results";
    }
  echo 'Success: A proper connection to MySQL was made.';
  echo '<br>';
  echo 'Host information: ';
  echo '<br>';
  echo 'Protocol version: ';

  $mysqli->close();
} catch (Exception $exc) {
        $error = $exc->getMessage();
        echo 'Error: '.$error;
    }
?>