<?php

if($_SERVER['REQUEST_METHOD'] == 'POST'){

    // foreach($_POST as $val){
    //     echo $val.'\n';
    // }
$username = "root";
$password = "1234567890";
$database = "banklist";
$servername = "localhost";

$conn = new mysqli($servername, $username, $password,$database);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
} 
$user = $_POST['username'];

$sql = "delete from Users where username='". $user . "'";

$conn->query($sql);
if($conn->query($sql) ===TRUE){
    echo json_encode(array("status"=>200));
}
else{
    echo json_encode(array("status"=>404));
}

}

?>