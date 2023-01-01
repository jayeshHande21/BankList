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

$sql = "select * from Users where username='". $user . "'";

$res = $conn->query($sql);
if($res->num_rows>0){
    $row = $res->fetch_assoc();
    echo json_encode($row);
}
else{
    echo json_encode(array("error"=>404));
}

}

?>