<?php
/**
 * Database Migration Script
 * Set up the admin_users table, seed the default admin, and add unique constraint on scholarship emails.
 */

// Simple security check
if (!isset($_GET['secret']) || $_GET['secret'] !== 'asa2026') {
    header('Content-Type: application/json');
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized. Please check the migration URL secret key.']);
    exit;
}

header('Content-Type: text/html; charset=utf-8');
echo "<html><head><title>Database Migration</title><style>body { font-family: sans-serif; line-height: 1.5; padding: 20px; max-width: 800px; margin: 0 auto; background: #f9f9f9; } pre { background: #eee; padding: 10px; border-radius: 4px; overflow-x: auto; } .success { color: green; font-weight: bold; } .error { color: red; font-weight: bold; } .info { color: #555; }</style></head><body>";
echo "<h1>Database Migration & Diagnostics</h1>";

try {
    require_once __DIR__ . '/../dbConnection.php';
    $con = getConnection();
    echo "<p class='success'>✓ Database connection successful!</p>";

    // 1. Create admin_users table
    echo "<h3>1. Creating `admin_users` table...</h3>";
    $createAdminTableSql = "
        CREATE TABLE IF NOT EXISTS admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            role ENUM('admin', 'super_admin') DEFAULT 'admin',
            is_active BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";
    
    if (mysqli_query($con, $createAdminTableSql)) {
        echo "<p class='success'>✓ `admin_users` table ready.</p>";
    } else {
        throw new Exception("Failed to create `admin_users` table: " . mysqli_error($con));
    }

    // 2. Seed default admin user if not exists
    echo "<h3>2. Seeding default admin user...</h3>";
    $checkAdminQuery = "SELECT id FROM admin_users WHERE username = 'admin' LIMIT 1";
    $checkAdminResult = mysqli_query($con, $checkAdminQuery);
    
    if (mysqli_num_rows($checkAdminResult) === 0) {
        $username = 'admin';
        // Password: Admin@123
        $passwordHash = password_hash('Admin@123', PASSWORD_BCRYPT);
        $email = 'admin@africangalore.com';
        $fullName = 'Administrator';
        $role = 'super_admin';

        $stmt = mysqli_prepare($con, "INSERT INTO admin_users (username, password_hash, email, full_name, role) VALUES (?, ?, ?, ?, ?)");
        mysqli_stmt_bind_param($stmt, "sssss", $username, $passwordHash, $email, $fullName, $role);
        
        if (mysqli_stmt_execute($stmt)) {
            echo "<p class='success'>✓ Seeded default admin user: <strong>username: admin | password: Admin@123</strong></p>";
            echo "<p class='info'><em>IMPORTANT: Please log in using these credentials and update your email/password in the future.</em></p>";
        } else {
            throw new Exception("Failed to seed admin user: " . mysqli_error($con));
        }
        mysqli_stmt_close($stmt);
    } else {
        echo "<p class='info'>Admin user 'admin' already exists. Skipping seeding.</p>";
    }

    // 3. Resolve duplicate emails in scholarship table before applying UNIQUE constraint
    echo "<h3>3. Checking for duplicate candidate emails...</h3>";
    $dupQuery = "SELECT LOWER(email) as email, COUNT(*) as count FROM scholarship GROUP BY LOWER(email) HAVING count > 1";
    $dupResult = mysqli_query($con, $dupQuery);
    
    if (mysqli_num_rows($dupResult) > 0) {
        echo "<p class='info'>Found duplicate candidate emails. Renaming duplicates...</p>";
        while ($dupRow = mysqli_fetch_assoc($dupResult)) {
            $email = $dupRow['email'];
            echo "Processing duplicate group: <code>" . htmlspecialchars($email) . "</code><br>";
            
            // Get all records for this email, sorted by timeStamp DESC (newest first)
            $recordsQuery = "SELECT formNumber, timeStamp FROM scholarship WHERE LOWER(email) = '" . mysqli_real_escape_string($con, $email) . "' ORDER BY timeStamp DESC";
            $recordsResult = mysqli_query($con, $recordsQuery);
            
            $isFirst = true;
            while ($record = mysqli_fetch_assoc($recordsResult)) {
                if ($isFirst) {
                    echo "— Keeping newest record: Form " . $record['formNumber'] . " (Date: " . $record['timeStamp'] . ")<br>";
                    $isFirst = false;
                    continue;
                }
                
                // Parse email parts to insert suffix before domain
                $parts = explode('@', $email);
                $newEmail = $parts[0] . '+' . $record['formNumber'] . '@' . ($parts[1] ?? 'gmail.com');
                
                echo "— Renaming older record: Form " . $record['formNumber'] . " -> New Email: <code>" . htmlspecialchars($newEmail) . "</code><br>";
                
                $updateQuery = "UPDATE scholarship SET email = '" . mysqli_real_escape_string($con, $newEmail) . "' WHERE formNumber = '" . mysqli_real_escape_string($con, $record['formNumber']) . "'";
                if (!mysqli_query($con, $updateQuery)) {
                    throw new Exception("Failed to update record " . $record['formNumber'] . ": " . mysqli_error($con));
                }
            }
        }
        echo "<p class='success'>✓ All duplicate candidate emails resolved.</p>";
    } else {
        echo "<p class='info'>No duplicate candidate emails found.</p>";
    }

    // 4. Add UNIQUE constraint index on scholarship email
    echo "<h3>4. Applying UNIQUE constraint on `scholarship.email`...</h3>";
    $indexCheckQuery = "SHOW INDEX FROM scholarship WHERE Key_name = 'unique_email'";
    $indexCheckResult = mysqli_query($con, $indexCheckQuery);
    
    if (mysqli_num_rows($indexCheckResult) > 0) {
        echo "<p class='info'>UNIQUE index 'unique_email' already exists. Re-creating to verify constraints...</p>";
        mysqli_query($con, "ALTER TABLE scholarship DROP INDEX unique_email");
    }
    
    $alterQuery = "ALTER TABLE scholarship ADD UNIQUE KEY unique_email (email)";
    if (mysqli_query($con, $alterQuery)) {
        echo "<p class='success'>✓ UNIQUE index constraint successfully applied to `scholarship.email`.</p>";
    } else {
        throw new Exception("Failed to add UNIQUE constraint: " . mysqli_error($con));
    }

    echo "<h2>Migration successfully completed!</h2>";
    echo "<p>Please delete this file (`migrate.php`) from your server or rename it once you are done to ensure security.</p>";
    mysqli_close($con);
} catch (Exception $e) {
    echo "<h2 class='error'>Migration Failed!</h2>";
    echo "<p class='error'>Error Message: " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "</body></html>";
