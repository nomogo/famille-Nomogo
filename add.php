<?php
include "db.php";

$name = trim($_POST['name']);
$parent_id = $_POST['parent_id'] ?? null;

// Si parent_id est une chaîne vide, on met NULL
if ($parent_id === "") {
    $parent_id = null;
} else {
    $parent_id = intval($parent_id);
}

if ($name !== "") {
    if ($parent_id === null) {
        $stmt = $conn->prepare("INSERT INTO members (name, parent_id) VALUES (?, NULL)");
        $stmt->bind_param("s", $name);
    } else {
        $stmt = $conn->prepare("INSERT INTO members (name, parent_id) VALUES (?, ?)");
        $stmt->bind_param("si", $name, $parent_id);
    }
    $stmt->execute();
    $stmt->close();
}
?>
