<?php
function parseUrl($str){
    $xpld=explode('&',$str) ;
    $array=array();
    foreach ($xpld as $x=>$v){
        list($key,$value) = explode("=", $v);
        if (!isset($array[$key])) {
            $vv=array();
        }
         $vv[]=$value;
         $array[$key]=$vv;

     }
    return $array;
}
$url = 'http://username:password@hostname:9090/path?a=1&b=6&a=78&arg=value#anchor';

$sarr=parse_url($url);
parse_str($sarr['query'], $arr);

print_r($arr)    ;
print_r($sarr)    ;

$array=parseUrl($sarr['query']);
print_r($array);
print_r($array['a'][0]);

?>
