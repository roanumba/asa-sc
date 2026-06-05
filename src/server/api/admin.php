<?php
/**
 * Admin REST Endpoints
 * Requires authentication via requireAdmin() middleware
 */

/**
 * List all applications with optional filtering
 */
function listApplications($params) {
    requireAdmin();

    try {
        $con = getConnection();

        // Pagination
        $page = isset($params['page']) ? (int)$params['page'] : 1;
        $limit = isset($params['limit']) ? (int)$params['limit'] : 50;
        $offset = ($page - 1) * $limit;

        // Search
        $search = isset($params['search']) ? trim($params['search']) : '';

        // Build query
        $where = [];
        $bindTypes = '';
        $bindValues = [];

        if ($search) {
            $where[] = "(firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR formNumber LIKE ?)";
            $searchParam = "%$search%";
            $bindTypes .= 'ssss';
            for ($i = 0; $i < 4; $i++) {
                $bindValues[] = $searchParam;
            }
        }

        $whereClause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

        // Count total
        $countSql = "SELECT COUNT(*) as total FROM scholarship $whereClause";
        if ($bindTypes) {
            $stmt = mysqli_prepare($con, $countSql);
            $refs = [];
            foreach ($bindValues as $key => $value) {
                $refs[$key] = &$bindValues[$key];
            }
            array_unshift($refs, $bindTypes);
            call_user_func_array([$stmt, 'bind_param'], $refs);
            mysqli_stmt_execute($stmt);
            $countRow = safe_fetch_assoc($stmt);
            $totalCount = $countRow['total'];
            mysqli_stmt_close($stmt);
        } else {
            $result = mysqli_query($con, $countSql);
            $totalCount = mysqli_fetch_assoc($result)['total'];
        }

        // Get paginated data
        $sql = "SELECT * FROM scholarship $whereClause ORDER BY timeStamp DESC LIMIT $limit OFFSET $offset";
        $applications = [];
        if ($bindTypes) {
            $stmt = mysqli_prepare($con, $sql);
            $refs = [];
            foreach ($bindValues as $key => $value) {
                $refs[$key] = &$bindValues[$key];
            }
            array_unshift($refs, $bindTypes);
            call_user_func_array([$stmt, 'bind_param'], $refs);
            mysqli_stmt_execute($stmt);
            $applications = safe_fetch_all($stmt);
            mysqli_stmt_close($stmt);
        } else {
            $result = mysqli_query($con, $sql);
            while ($row = mysqli_fetch_assoc($result)) {
                $applications[] = $row;
            }
        }

        foreach ($applications as &$row) {
            // Check physical file existence
            $row['letterExists'] = !empty($row['admissionLetter']) &&
                file_exists(__DIR__ . '/../images/' . $row['admissionLetter']);
            $row['passportExists'] = !empty($row['passport']) &&
                file_exists(__DIR__ . '/../passports/' . $row['passport']);
        }

        mysqli_close($con);

        Response::success([
            'applications' => $applications,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $totalCount,
                'totalPages' => ceil($totalCount / $limit)
            ]
        ]);
    } catch (Exception $e) {
        Response::error($e->getMessage(), 500);
    }
}

/**
 * Export applications as CSV
 */
function exportApplications($params) {
    requireAdmin();

    try {
        $con = getConnection();

        $year = isset($params['year']) ? (int)$params['year'] : null;

        $whereClause = '';
        if ($year) {
            $whereClause = "WHERE YEAR(timeStamp) = $year";
        }

        $sql = "SELECT * FROM scholarship $whereClause ORDER BY timeStamp DESC";
        $result = mysqli_query($con, $sql);

        // Create CSV data
        $csvData = [];

        // Headers
        $csvData[] = [
            'Form Number', 'First Name', 'Middle Name', 'Last Name', 'Gender', 'Age',
            'Email', 'Phone Number', 'Address', 'LGA', 'Home Town', 'Parent Names',
            'Student ID', 'Admission Date', 'College Name', 'College Address', 'Major',
            'Submission Date', 'Has Admission Letter', 'Has Passport'
        ];

        // Data rows
        while ($row = mysqli_fetch_assoc($result)) {
            $csvData[] = [
                $row['formNumber'],
                $row['firstName'],
                $row['middleName'],
                $row['lastName'],
                $row['gender'],
                $row['age'],
                $row['email'],
                $row['phoneNumber'],
                $row['address'],
                $row['lga'],
                $row['homeTown'],
                $row['parentNames'],
                $row['studentId'],
                $row['admissionDate'],
                $row['collegeName'],
                $row['collegeAddress'],
                $row['studentMajor'],
                $row['timeStamp'],
                !empty($row['admissionLetter']) ? 'Yes' : 'No',
                !empty($row['passport']) ? 'Yes' : 'No'
            ];
        }

        mysqli_close($con);

        // Convert to CSV string
        $csv = '';
        foreach ($csvData as $row) {
            $csv .= '"' . implode('","', array_map(function($cell) {
                return str_replace('"', '""', $cell);
            }, $row)) . '"' . "\n";
        }

        // Send CSV file
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="applications_' . date('Y-m-d') . '.csv"');
        echo $csv;
        exit;
    } catch (Exception $e) {
        Response::error($e->getMessage(), 500);
    }
}

/**
 * Get config
 */
function getConfig() {
    requireAdmin();

    $config = json_decode(file_get_contents(__DIR__ . '/../config.json'), true);
    Response::success($config);
}

/**
 * Update config
 */
function updateConfig($input) {
    requireAdmin();

    try {
        $config = [
            'OPENING_DATE' => $input->openingDate ?? '',
            'CLOSING_DATE' => $input->closingDate ?? ''
        ];

        file_put_contents(__DIR__ . '/../config.json', json_encode($config, JSON_PRETTY_PRINT));

        Response::success($config, 'Configuration updated successfully');
    } catch (Exception $e) {
        Response::error($e->getMessage(), 500);
    }
}
