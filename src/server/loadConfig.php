<?php
include 'clientHandler.php';

function load()
{
  // load the config file config.json
    $config = file_get_contents('config.json');
    return json_decode($config);
}