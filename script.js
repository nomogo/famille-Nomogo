const dbRef = firebase.firestore().collection("arbre").doc("principal");
let treeData = {};

const treeContainer = document.getElementById("tree-container");
const treeEl = document.getElementById("tree");

const ZOOM_STEP = 0.05;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.2;

let currentZoom = 1;

// Charger depuis Firestore
async function loadTree() {
  try {
    const doc = await dbRef.get();
    if (doc.exists) {
      treeData = doc.data();
    } else {
      treeData = {};
    }
  } catch (e) {
    console.error("Erreur chargement Firestore:", e);
    treeData = {};
  }
  renderTree();
  populateParentSelect();
}

// Sauvegarder dans Firestore
function saveTree() {
  dbRef.set(treeData).catch(e => console.error("Erreur sauvegarde Firestore:", e));
}

// Rendu récursif de l’arbre
function renderTree(container = treeEl, parentId = null, level = 0) {
  container.innerHTML = "";

  // Trouver enfants du parent
  const nodes = Object.entries(treeData).filter(([id, p]) => {
    if (parentId === null) {
      return !p.parent || p.parent === null || p.parent === "";
    } else {
      return p.parent === parentId;
    }
  });

  if (nodes.length === 0) return;

  // Container génération + niveau couleur
  const genContainer = document.createElement("div");
  genContainer.className = "generation";
  genContainer.dataset.level = level.toString();

  nodes.forEach(([id, person]) => {
    const nodeWrapper = document.createElement("div");
    nodeWrapper.className = "node-wrapper";

    const node = document.createElement("div");
    node.className = "node";
    node.textContent = person.name;
    node.title = "Cliquez pour modifier";
    node.onclick = () => openEditModal(id);

    nodeWrapper.appendChild(node);

    // Conteneur enfants
    const childrenContainer = document.createElement("div");
    childrenContainer.className = "children-line";

    const subtree = document.createElement("div");
    subtree.className = "subtree";

    renderTree(subtree, id, level + 1);

    childrenContainer.appendChild(subtree);
    nodeWrapper.appendChild(childrenContainer);

    genContainer.appendChild(nodeWrapper);
  });

  container.appendChild(genContainer);

  adjustZoom();
}

// Remplir le menu déroulant parents
function populateParentSelect() {
  const select = document.getElementById("parent");
  select.innerHTML = '<option value="">Aucun parent</option>';
  Object.entries(treeData).forEach(([id, person]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = person.name;
    select.appendChild(option);
  });
}

// Ajouter membre
document.getElementById("add-member-form").addEventListener("submit", e => {
  e.preventDefault();
  const nameInput = document.getElementById("name");
  const parentSelect = document.getElementById("parent");
  const name = nameInput.value.trim();
  const parent = parentSelect.value || null;

  if (!name) {
    alert("Veuillez saisir un nom");
    return;
  }

  const id = Date.now().toString();
  treeData[id] = { name, parent };
  saveTree();
  renderTree();
  populateParentSelect();
  e.target.reset();
  nameInput.focus();
});

// Modal édition
const modal = document.getElementById("edit-modal");
const overlay = document.getElementById("overlay");

function openEditModal(id) {
  modal.style.display = "flex";
  overlay.style.display = "block";
  document.getElementById("edit-name").value = treeData[id].name;

  document.getElementById("save-btn").onclick = () => {
    const newName = document.getElementById("edit-name").value.trim();
    if (!newName) {
      alert("Le nom ne peut pas être vide");
      return;
    }
    treeData[id].name = newName;
    saveTree();
    renderTree();
    populateParentSelect();
    closeEditModal();
  };

  document.getElementById("delete-btn").onclick = () => {
    // Supprimer membre
    delete treeData[id];
    // Les enfants deviennent orphelins (parent null)
    Object.entries(treeData).forEach(([cid, child]) => {
      if (child.parent === id) child.parent = null;
    });
    saveTree();
    renderTree();
    populateParentSelect();
    closeEditModal();
  };

  document.getElementById("cancel-btn").onclick = closeEditModal;
}

function closeEditModal() {
  modal.style.display = "none";
  overlay.style.display = "none";
}

// Zoom automatique si trop large
function adjustZoom() {
  // Largeur visible
  const containerWidth = treeContainer.clientWidth;
  // Largeur arbre
  const treeWidth = treeEl.scrollWidth;

  if (treeWidth > containerWidth && currentZoom > MIN_ZOOM) {
    currentZoom -= ZOOM_STEP;
    currentZoom = Math.max(currentZoom, MIN_ZOOM);
  } else if (treeWidth < containerWidth && currentZoom < MAX_ZOOM) {
    currentZoom += ZOOM_STEP;
    currentZoom = Math.min(currentZoom, MAX_ZOOM);
  }
  treeEl.style.transform = `scale(${currentZoom})`;
}

// Charger l'arbre au démarrage
loadTree();
