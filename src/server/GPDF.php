<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/dbConnection.php';

// Map the modern Fpdf namespace to the global FPDF class that FPDI expects
if (!class_exists('FPDF')) {
    class_alias('Fpdf\\Fpdf', 'FPDF');
}

use setasign\Fpdi\Fpdi;

// Use Composer-managed FPDF/FPDI; point to bundled fonts for backward compatibility
if (!defined('FPDF_FONTPATH')) {
    define('FPDF_FONTPATH', __DIR__ . '/lib/font/');
}

class PDF extends Fpdi {

    function writeText($x, $y, $txt) {
        $this->SetXY($x, $y);
        $this->Write(10, $txt);
    }

}

function replaceWitheSpace($txt) {
    return str_replace(array("\r", "\n"), ' ', $txt);
}

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'GPDF.php'):

$formYear = filter_input(INPUT_POST, "year", FILTER_VALIDATE_INT);
$accessCode = filter_input(INPUT_POST, "accd");
if ($accessCode==='AsaGpdf||') {
    $pdf = new PDF();

    $con = getConnection();
    $start = $formYear . '-01-01 00:00:00';
    $end   = $formYear . '-12-31 23:59:59';
    $stmt = mysqli_prepare($con, "SELECT * FROM scholarship WHERE timeStamp >= ? AND timeStamp < ?");
    mysqli_stmt_bind_param($stmt, "ss", $start, $end);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    while ($rows = mysqli_fetch_array($result, MYSQLI_ASSOC)) {

        $pdf->AddPage();

        $pdf->SetFont('Arial', 'B', 16);
        $pdf->Cell(0, 10, $formYear.' ASA-SC Scholarship Application Form', 0, 1);
        $pdf->SetFont('Arial', '', 14);
        $pdf->Cell(0, 10, '      ', 0, 1);
        $pdf->Cell(0, 10, 'Applicant\'s Name _________________________________________________ ', 0, 1);
        $pdf->Cell(0, 10, 'Email Address ___________________________', 0, 1);
        $pdf->Cell(0, 10, 'Age ____', 0, 1);
        $pdf->Cell(0, 10, 'Current Address ______________________________________________________', 0, 1);
        $pdf->Cell(0, 10, 'Phone Number  ___________________', 0, 1);
        $pdf->Cell(0, 10, 'LGA _______________________Home Town ____________________ ', 0, 1);
        $pdf->Cell(0, 10, 'Parent/Guardian Names ______________________________________________', 0, 1);
        $pdf->Cell(0, 10, ' ', 0, 1);


        $pdf->Cell(0, 12, '---------------------------------   College Admission Information   --------------------------------', 0, 1);
        $pdf->Cell(0, 10, 'Student ID________________', 0, 1);
        $pdf->Cell(0, 10, 'Date of Admission______________', 0, 1);
        $pdf->Cell(0, 10, 'Name of College/ University ______________________________________________', 0, 1);
        $pdf->Cell(0, 10, 'Address _______________________________________________________________ ', 0, 1);
        $pdf->Cell(0, 10, 'Proposed Major Area of Study __________________________________________', 0, 1);
        $pdf->Cell(0, 10, ' ', 0, 1);
        $pdf->Cell(0, 10, ' ', 0, 1);
        $pdf->Cell(0, 10, ' ', 0, 1);
        $pdf->Cell(0, 10, ' ', 0, 1);
        $pdf->Cell(0, 10, ' ', 0, 1);
        $pdf->Cell(0, 10, 'Signature of Applicant ____________________________Date ______________', 0, 1);
        $pdf->Cell(0, 10, 'Signature of Parent or Guardian _____________________   Date ____________', 0, 1);

        $pdf->SetFont('Arial', 'I', 12);
        $pdf->writeText(150, 10, $rows["formNumber"]);
        $pdf->writeText(60, 30, $rows["firstName"] . '    ' . $rows["middleName"] . '    ' . $rows["lastName"]);
        $pdf->writeText(45, 40, $rows["email"]);
        $pdf->writeText(25, 50, $rows["age"]);

        $pdf->writeText(50, 60, replaceWitheSpace($rows["address"]));
        $pdf->writeText(60, 70, $rows["phoneNumber"]);
        $pdf->writeText(30, 80, $rows["lga"]);
        $pdf->writeText(120, 80, $rows["homeTown"]);
        $pdf->writeText(70, 90, replaceWitheSpace($rows["parentNames"]));


        $pdf->writeText(40, 122, $rows["studentId"]);
        $pdf->writeText(60, 132, $rows["admissionDate"]);
        $pdf->writeText(80, 142, $rows["collegeName"]);
        $pdf->writeText(35, 152, replaceWitheSpace($rows["collegeAddress"]));
        $pdf->writeText(80, 162, $rows["studentMajor"]);
        $pdf->writeText(80, 172, $rows["profile"]);
        $pdf->writeText(150, 192, $rows["timeStamp"]);


        $letter = $rows["admissionLetter"];
        $file_ext = pathinfo($letter, PATHINFO_EXTENSION);
        $letterPath = __DIR__ . '/images/' . $letter;
        if ($file_ext && $file_ext !== "pdf" && file_exists($letterPath)) {
            $pdf->AddPage();
            $pdf->Image($letterPath, 10, 10, 200, 350);
            $pdf->SetFont('Arial', 'I', 12);
            $pdf->writeText(150, 10, $rows["formNumber"]);
        } else if ($file_ext && $file_ext === "pdf" && file_exists($letterPath)) {

            try {
                $pagecount = $pdf->setSourceFile($letterPath);
                $counter = 1;
                while ($counter <= $pagecount) {
                    $pdf->AddPage();
                    $tplidx = $pdf->ImportPage($counter);

                    $pdf->useTemplate($tplidx, 10, 10, 200);
                    $pdf->writeText(150, 10, $rows["formNumber"]);
                    $counter++;
                }
            } catch (Exception $exc) {
                $pdf->AddPage();
                $pdf->writeText(150, 10, $rows["formNumber"]);
                $pdf->SetFont('Arial', 'I', 24);
                $pdf->writeText(50, 160, $rows["admissionLetter"]);
            }


        } else if ($file_ext) {
            $pdf->AddPage();
            $pdf->writeText(150, 10, $rows["formNumber"]);
            $pdf->SetFont('Arial', 'I', 24);
            $pdf->writeText(50, 160, $rows["admissionLetter"]);
        } else {
            $pdf->AddPage();
            $pdf->writeText(150, 10, $rows["formNumber"]);
            $pdf->SetFont('Arial', 'I', 24);
            $pdf->writeText(50, 160, "No Admission Letter");
        }
    }
    mysqli_stmt_close($stmt);
    mysqli_close($con);
    $pdf->Output();
 
} else {
    echo '
<form action="GPDF.php" method="post">
    Year <input type="text"  name="year" >
    Enter Access Code <input type="password" name="accd" min="11"><input type="submit" >
</form>
     ';
}

endif;
?>