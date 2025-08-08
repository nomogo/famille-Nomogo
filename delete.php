<?php
include "db.php";

$id = intval($_POST['id']);

if ($id) {
    // Avant suppression, orphelins les enfants du membre supprimé
    $stmt1 = $conn->prepare("UPDATE members SET parent_id = NULL WHERE parent_id = ?");
    $stmt1->bind_param("i", $id);
    $stmt1->execute();
    $stmt1->close();

    // Supprimer le membre
    $stmt2 = $conn->prepare("DELETE FROM members WHERE id = ?");
    $stmt2->bind_param("i", $id);
    $stmt2->execute();
    $stmt2->close();
}
?>
