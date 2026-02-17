<?php
// Test database connection and query
include 'dbConnection.php';

header('Content-Type: application/json');

try {
    $con = getConnection();

    if (!$con) {
        echo json_encode([
            'error' => true,
            'message' => 'Database connection failed: ' . mysqli_connect_error()
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Database connected successfully'
    ]);

    // Test if table exists
    $sql = "SHOW TABLES LIKE 'scholarship'";
    $result = mysqli_query($con, $sql);

    if (mysqli_num_rows($result) > 0) {
        echo "\nTable 'scholarship' exists";

        // Test query for specific form
        $formNo = '683C6E8B02100';
        $sql = "SELECT * FROM scholarship WHERE formNumber = '" . $formNo . "'";
        $result = mysqli_query($con, $sql);

        if (!$result) {
            echo "\nQuery error: " . mysqli_error($con);
        } else {
            echo "\nQuery executed successfully";
            echo "\nRows found: " . mysqli_num_rows($result);

            if (mysqli_num_rows($result) > 0) {
                $row = mysqli_fetch_array($result, MYSQLI_ASSOC);
                echo "\nRecord found: " . json_encode($row);
            } else {
                echo "\nNo record found with formNumber: " . $formNo;
            }
        }
    } else {
        echo "\nTable 'scholarship' does NOT exist";

        // Show all tables
        $sql = "SHOW TABLES";
        $result = mysqli_query($con, $sql);
        echo "\nAvailable tables:";
        while ($row = mysqli_fetch_array($result)) {
            echo "\n- " . $row[0];
        }
    }

    mysqli_close($con);

} catch (Exception $e) {
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
}
?>
