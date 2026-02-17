<?php
// Test the findFormByFormNumber function
include 'dbConnection.php';

header('Content-Type: application/json');

// Simulate the request
$requestBody = '{"method":"findFormByFormNumber","params":{"formNumber":"683C6E8B02100"}}';
$json = json_decode($requestBody);

echo "Request received:\n";
echo "Method: " . $json->method . "\n";
echo "Form Number: " . $json->params->formNumber . "\n\n";

try {
    $formNo = strtoupper($json->params->formNumber);
    echo "Searching for: " . $formNo . "\n";
    
    $con = getConnection();
    
    if (!$con) {
        echo "ERROR: Database connection failed: " . mysqli_connect_error() . "\n";
        exit;
    }
    
    echo "Database connected\n";

    $sql = "SELECT * FROM scholarship WHERE formNumber = '" . $formNo . "'";
    echo "SQL: " . $sql . "\n";
    
    $result = mysqli_query($con, $sql);
    
    if (!$result) {
        echo "ERROR: Query failed: " . mysqli_error($con) . "\n";
        mysqli_close($con);
        exit;
    }
    
    echo "Query executed successfully\n";
    echo "Rows found: " . mysqli_num_rows($result) . "\n";
    
    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_array($result, MYSQLI_ASSOC);
        echo "\nRecord found:\n";
        echo json_encode($row, JSON_PRETTY_PRINT);
    } else {
        echo "\nNo record found\n";
        
        // Check if any records exist
        $countSql = "SELECT COUNT(*) as total FROM scholarship";
        $countResult = mysqli_query($con, $countSql);
        $countRow = mysqli_fetch_assoc($countResult);
        echo "Total records in table: " . $countRow['total'] . "\n";
        
        // Show some sample form numbers
        $sampleSql = "SELECT formNumber FROM scholarship LIMIT 5";
        $sampleResult = mysqli_query($con, $sampleSql);
        echo "\nSample form numbers in database:\n";
        while ($sample = mysqli_fetch_assoc($sampleResult)) {
            echo "- " . $sample['formNumber'] . "\n";
        }
    }

    mysqli_close($con);

} catch (Exception $exc) {
    echo "EXCEPTION: " . $exc->getMessage() . "\n";
}
?>
