<?php 

if(!defined(ABSPATH)){
    $pagePath = explode('/wp-content/', dirname(__FILE__));
    include_once('../../../../wp-load.php');
}

$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
if($contentType === "application/json"){
  	$data = trim(file_get_contents("php://input"));
  	$posts = json_decode($data, true);

	$id = $posts['id'];
	if(wp_delete_post($id, true)){
		echo json_encode('success');
	}else {
		echo json_encode('error');	
	}
	
}


