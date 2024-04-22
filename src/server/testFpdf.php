<?php

require('./lib/fpdf.php');

require('dbConnection.php');

class PDF extends FPDF {

    function writeText($x, $y, $txt) {
        $this->SetXY($x, $y);
        $this->Write(10, $txt);
    }

}

function replaceWitheSpace($txt) {
    return str_replace(array("\r", "\n"), ' ', $txt);
}

$formYear = filter_input(INPUT_POST, "year");
$accessCode = filter_input(INPUT_POST, "accd");
if ($accessCode == 'AsaGpdf||') {
    $pdf = new PDF();

    $con = getConnection();
    $sql = "select * from  scholarship where timeStamp>='".
        $formYear."-01-01 00:00:00' and timeStamp<'".$formYear."-12-31 23:59:59'";
    $result = mysqli_query($con, $sql);

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
        $file_ext = strtolower(end(explode('.', $letter)));
        if ($file_ext && $file_ext !== "pdf") {
            $pdf->AddPage();
            $pdf->Image('images/' . $letter, 10, 10, 200, 350);
            $pdf->SetFont('Arial', 'I', 12);
            $pdf->writeText(150, 10, $rows["formNumber"]);
        } else if ($file_ext && $file_ext === "pdf") {

            try {
                $pagecount = $pdf->setSourceFile('images/' . $letter);
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



//            $pdf->setSourceFile($file);
//            $tpl = $pdf->importPage(1, '/MediaBox');
//            $pdf->addPage();
//            $pdf->useTemplate($tpl);
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
    mysqli_close($con);
    $pdf->Output();
    ob_end_flush();
} else {
    echo '
<form action="testFpdf.php" method="post">
    Year <input type="text"  name="year" >
    Enter Access Code <input type="password" name="accd" min="11"><input type="submit" >
</form>      
     ';
}
?>