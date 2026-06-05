<?php
/**
 * Remote Diagnostics Tool for GoDaddy Deployment
 * Checks database connection, table structure, PHP extensions, and retrieves the local PHP error_log.
 */

// Simple security check
if (!isset($_GET['secret']) || $_GET['secret'] !== 'asa2026') {
    header('Content-Type: application/json');
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized. Please specify ?secret=asa2026']);
    exit;
}

header('Content-Type: text/html; charset=utf-8');
echo "<html><head><title>System Diagnostics</title><style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; padding: 30px; max-width: 900px; margin: 0 auto; background: #fdfdfd; color: #333; }
    h1 { border-bottom: 2px solid #eaeaea; padding-bottom: 10px; color: #1a73e8; }
    h2 { margin-top: 30px; color: #202124; }
    pre { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 6px; overflow-x: auto; font-family: monospace; font-size: 13px; line-height: 1.6; }
    .card { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .success { background: #e6f4ea; color: #137333; }
    .error { background: #fce8e6; color: #c5221f; }
    .warning { background: #fef7e0; color: #b06000; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #f1f1f1; }
    th { font-weight: 600; color: #5f6368; }
</style></head><body>";

echo "<h1>System Diagnostics & Troubleshooting</h1>";

// 1. PHP & Environment Info
echo "<div class='card'>";
echo "<h2>1. General Server Info</h2>";
echo "<table>";
echo "<tr><th>PHP Version</th><td>" . PHP_VERSION . "</td></tr>";
echo "<tr><th>OS</th><td>" . PHP_OS . "</td></tr>";
echo "<tr><th>Server Software</th><td>" . htmlspecialchars($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "</td></tr>";
echo "<tr><th>.env File Exists</th><td>" . (file_exists(__DIR__ . '/../.env') ? "<span class='badge success'>Yes</span>" : "<span class='badge error'>No (missing in server/)</span>") . "</td></tr>";
echo "</table>";
echo "</div>";

// 2. Env Variables Verification
echo "<div class='card'>";
echo "<h2>2. Loaded Environment Variables (Masked)</h2>";
require_once __DIR__ . '/../envLoader.php';
$vars = ['DB_HOST', 'DB_USER', 'DB_NAME', 'APP_ENV', 'SMTP_HOST', 'SMTP_PORT', 'EMAIL_FROM', 'SMTP_USER', 'MAIL_MAILER'];
echo "<table><tr><th>Key</th><th>Value</th></tr>";
foreach ($vars as $v) {
    $val = env($v);
    if ($val === null) {
        $display = "<span class='badge error'>Not Set</span>";
    } elseif (in_array($v, ['DB_USER', 'DB_PASSWORD', 'SMTP_USER', 'SMTP_PASS'])) {
        $display = substr($val, 0, 2) . str_repeat('*', max(0, strlen($val) - 2));
    } else {
        $display = htmlspecialchars($val);
    }
    echo "<tr><td>$v</td><td>$display</td></tr>";
}
echo "</table>";
echo "</div>";

// 3. Database Check
echo "<div class='card'>";
echo "<h2>3. Database & Tables Status</h2>";
try {
    require_once __DIR__ . '/../dbConnection.php';
    $con = getConnection();
    echo "<p><span class='badge success'>Database Connection OK</span></p>";
    
    // Check for mysqlnd / mysqli_stmt_get_result support
    if (function_exists('mysqli_stmt_get_result')) {
        echo "<p><span class='badge success'>mysqli_stmt_get_result() is available</span></p>";
    } else {
        echo "<p><span class='badge error'>mysqli_stmt_get_result() is NOT available</span></p>";
        echo "<p class='warning' style='padding: 10px; border-radius: 4px;'><strong>Action Required:</strong> Your server's PHP is missing the MySQL Native Driver (mysqlnd). Please log in to your GoDaddy cPanel, go to <strong>Select PHP Version</strong>, click the <strong>Extensions</strong> tab, uncheck <code>mysqli</code>, and check <code>nd_mysqli</code> instead.</p>";
    }
    
    // Check tables
    $tables = ['scholarship', 'admin_users'];
    echo "<table><tr><th>Table Name</th><th>Exists</th><th>Row Count</th></tr>";
    foreach ($tables as $t) {
        $res = mysqli_query($con, "SHOW TABLES LIKE '$t'");
        if ($res && mysqli_num_rows($res) > 0) {
            $countRes = mysqli_query($con, "SELECT COUNT(*) as count FROM `$t`");
            $count = $countRes ? mysqli_fetch_assoc($countRes)['count'] : 'Error';
            echo "<tr><td>$t</td><td><span class='badge success'>Yes</span></td><td>$count</td></tr>";
        } else {
            echo "<tr><td>$t</td><td><span class='badge error'>No</span></td><td>N/A</td></tr>";
        }
    }
    echo "</table>";
    
    // Check if unique key is set
    $indexRes = mysqli_query($con, "SHOW INDEX FROM scholarship WHERE Key_name = 'unique_email'");
    if ($indexRes && mysqli_num_rows($indexRes) > 0) {
        echo "<p><span class='badge success'>unique_email Constraint Active</span></p>";
    } else {
        echo "<p><span class='badge warning'>unique_email Constraint NOT Active</span></p>";
    }

    mysqli_close($con);
} catch (Exception $e) {
    echo "<p><span class='badge error'>Database Connection Failed</span></p>";
    echo "<pre>" . htmlspecialchars($e->getMessage()) . "</pre>";
}
echo "</div>";

// 4. Vendor / PHPMailer Check
echo "<div class='card'>";
echo "<h2>4. Composer Dependency Validation</h2>";
$autoloadPath = __DIR__ . '/../vendor/autoload.php';
if (file_exists($autoloadPath)) {
    echo "<p><span class='badge success'>Composer autoload.php Exists</span></p>";
    require_once $autoloadPath;
    try {
        if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
            echo "<p><span class='badge success'>PHPMailer Class Loaded Successfully</span></p>";
        } else {
            echo "<p><span class='badge error'>PHPMailer Class NOT Found (Vendor folder might be incomplete)</span></p>";
        }
    } catch (Throwable $t) {
        echo "<p><span class='badge error'>PHPMailer Loading Failed: " . htmlspecialchars($t->getMessage()) . "</span></p>";
    }

    try {
        if (class_exists('setasign\Fpdi\Fpdi')) {
            echo "<p><span class='badge success'>FPDI Class Loaded Successfully</span></p>";
        } else {
            echo "<p><span class='badge error'>FPDI Class NOT Found</span></p>";
        }
    } catch (Throwable $t) {
        echo "<p><span class='badge error'>FPDI Loading Failed: " . htmlspecialchars($t->getMessage()) . "</span></p>";
    }
} else {
    echo "<p><span class='badge error'>Composer autoload.php NOT found in server/vendor/</span></p>";
}
echo "</div>";

// 5. Read PHP Error Log
echo "<div class='card'>";
echo "<h2>5. PHP Error Log (Last 30 lines)</h2>";
$logFiles = [
    __DIR__ . '/error_log',
    __DIR__ . '/../error_log',
    __DIR__ . '/../../error_log',
    __DIR__ . '/../../../error_log',
];

$foundLog = null;
foreach ($logFiles as $log) {
    if (file_exists($log) && is_readable($log)) {
        $foundLog = $log;
        break;
    }
}

if ($foundLog) {
    echo "<p>Found log file at: <code>" . htmlspecialchars(realpath($foundLog)) . "</code></p>";
    $lines = file($foundLog);
    $lastLines = array_slice($lines, -30);
    echo "<pre>";
    foreach ($lastLines as $line) {
        echo htmlspecialchars($line);
    }
    echo "</pre>";
} else {
    echo "<p><span class='badge warning'>No readable PHP error_log file found.</span></p>";
    echo "<p class='info'>Checked locations:</p><ul>";
    foreach ($logFiles as $log) {
        echo "<li><code>" . htmlspecialchars($log) . "</code></li>";
    }
    echo "</ul>";
}
echo "</div>";

echo "</body></html>";
