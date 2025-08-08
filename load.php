<?php
require 'db.php';

$result = $conn->query("SELECT * FROM membres ORDER BY id ASC");
$membres = [];

while ($row = $result->fetch_assoc()) {
    $membres[] = $row;
}

echo json_encode($membres);

$conn->close();
?>
