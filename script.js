document.addEventListener("DOMContentLoaded", () => {
    const treeContainer = document.getElementById("tree-container");
    const addMemberBtn = document.getElementById("addMemberBtn");
    const memberName = document.getElementById("memberName");
    const parentSelect = document.getElementById("parentSelect");

    const editModal = document.getElementById("editModal");
    const overlay = document.getElementById("overlay");
    const editNameInput = document.getElementById("editName");
    const saveBtn = document.getElementById("saveBtn");
    const deleteBtn = document.getElementById("deleteBtn");
    const cancelBtn = document.getElementById("cancelBtn");

    let members = [];
    let currentEditId = null;

    // Charger et afficher arbre
    function loadTree() {
        fetch("load.php")
            .then(res => res.json())
            .then(data => {
                members = data;
                renderTree();
                fillParentOptions();
            });
    }

    // Construire HTML récursif de l'arbre
    function renderTree() {
        treeContainer.innerHTML = generateTreeHTML(null);
    }

    function generateTreeHTML(parentId) {
        const children = members.filter(m => m.parent_id == parentId);
        if (children.length === 0) return "";
        let html = "<ul>";
        children.forEach(child => {
            html += `<li data-id="${child.id}">${escapeHtml(child.name)}</li>`;
            html += generateTreeHTML(child.id);
        });
        html += "</ul>";
        return html;
    }

    // Remplir la liste des parents dans le select
    function fillParentOptions() {
        parentSelect.innerHTML = '<option value="">(Aucun parent - racine)</option>';
        members.forEach(m => {
            parentSelect.innerHTML += `<option value="${m.id}">${escapeHtml(m.name)}</option>`;
        });
    }

    // Échapper texte pour éviter injection HTML
    function escapeHtml(text) {
        return text.replace(/[&<>"']/g, (match) => {
            const map = { '&': "&amp;", '<': "&lt;", '>': "&gt;", '"': "&quot;", "'": "&#039;" };
            return map[match];
        });
    }

    // Ajouter membre
    addMemberBtn.addEventListener("click", () => {
        const name = memberName.value.trim();
        const parent_id = parentSelect.value || null;

        if (!name) {
            alert("Veuillez entrer un nom.");
            return;
        }

        fetch("add.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ name, parent_id })
        }).then(() => {
            memberName.value = "";
            loadTree();
        });
    });

    // Ouvrir modal édition au clic sur un membre
    treeContainer.addEventListener("click", e => {
        if (e.target.tagName === "LI") {
            currentEditId = e.target.dataset.id;
            const member = members.find(m => m.id == currentEditId);
            if (!member) return;

            editNameInput.value = member.name;
            openModal();
        }
    });

    // Modal contrôle
    saveBtn.addEventListener("click", () => {
        const newName = editNameInput.value.trim();
        if (!newName) {
            alert("Le nom ne peut pas être vide.");
            return;
        }

        fetch("edit.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ id: currentEditId, name: newName })
        }).then(() => {
            closeModal();
            loadTree();
        });
    });

    deleteBtn.addEventListener("click", () => {
        if (!confirm("Voulez-vous vraiment supprimer ce membre ? Tous ses descendants deviendront orphelins.")) {
            return;
        }

        fetch("delete.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ id: currentEditId })
        }).then(() => {
            closeModal();
            loadTree();
        });
    });

    cancelBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", closeModal);

    function openModal() {
        editModal.classList.remove("hidden");
        overlay.classList.remove("hidden");
        editNameInput.focus();
    }

    function closeModal() {
        editModal.classList.add("hidden");
        overlay.classList.add("hidden");
        currentEditId = null;
    }

    loadTree();
});
