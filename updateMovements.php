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
$user = $_POST['acc']['username'];
$amount = $_POST['val'];

$sql = "update Users set movements = json_array_append(movements, '$', ".$amount.") where username='". $user . "'";

$res = $conn->query($sql);


}
?>