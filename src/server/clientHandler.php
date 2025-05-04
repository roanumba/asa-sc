<?php
//function parseUrl($str){
//    $xpld=explode('&',$str) ;
//    $array=array();
//    foreach ($xpld as $x=>$v){
//        list($key,$value) = explode("=", $v);
//        if (!isset($array[$key])) {
//            $vv=array();
//        }
//         $vv[]=$value;
//         $array[$key]=$vv;
//
//     }
//    return $array;
//}

$method = $_SERVER['REQUEST_METHOD'];

date_default_timezone_set('America/Los_Angeles');

function execFunc($function,$params){
   try {
        if ($function) {
            $resp = $function($params);
            return array('method' => $function, "data" => $resp);
        }
    }catch (Exception $exc) {
        $error = $exc->getMessage();
        return array('error' => TRUE, 'message' => $error);
    }
    return array('error' => TRUE, 'message' => 'Cannot find method '.$function);

}
try{
    if ($method === 'GET') {
        //    echo (json_encode(array("query"=>$_GET, "id" => $id,"path"=>$_SERVER['PATH_INFO'])));


        $resp = execFunc($_GET['method'],$_GET);
        echo json_encode($resp);
    } elseif ($method === 'POST') {
        $request_body = file_get_contents('php://input');
        $json = json_decode($request_body);


        $resp = execFunc($json->method,$json->params);
        echo json_encode($resp);

    } else {
        echo(json_encode(array("error" => TRUE, "message" => 'unknown method')));
    }
} catch (Exception $exc) {
    $error = $exc->getMessage();
    echo(json_encode(array('error' => TRUE, 'message' => $error)));
}


// function calc($params) {
//    return array("query"=>$params['k']) ;
// }

