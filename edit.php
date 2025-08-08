<?php
include "db.php";

$id = intval($_POST['id']);
$name = trim($_POST['name']);

if ($id && $name !== "") {
    $stmt = $conn->prepare("UPDATE members SET name = ? WHERE id = ?");
    $stmt->bind_param("si", $name, $id);
    $stmt->execute();
    $stmt->close();
}
?>
