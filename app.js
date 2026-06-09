const WA_NUMBER = "243972511957";
const STORAGE_KEYS = {
  products: "nkBusinessProducts",
  cart: "nkBusinessCart",
  theme: "nkBusinessTheme"
};

const categories = [
  "Gourdes",
  "Vêtements femme",
  "Montres",
  "Sacs",
  "Chaussures",
  "Autres accessoires"
];

const categoryImages = {
  "Gourdes": "0% 0%",
  "Vêtements femme": "50% 0%",
  "Montres": "100% 0%",
  "Sacs": "0% 100%",
  "Chaussures": "50% 100%",
  "Autres accessoires": "100% 100%"
};

const defaultProducts = [
  {
    id: "gourde-isotherme",
    name: "Gourde Isotherme Élégance",
    category: "Gourdes",
    price: 18
  },
  {
    id: "ensemble-femme",
    name: "Ensemble Femme Signature",
    category: "Vêtements femme",
    price: 42
  },
  {
    id: "montre-prestige",
    name: "Montre Prestige Dorée",
    category: "Montres",
    price: 55
  },
  {
    id: "sac-luxe",
    name: "Sac Noir Luxe",
    category: "Sacs",
    price: 48
  },
  {
    id: "sneakers-ivoire",
    name: "Chaussures Ivoire Premium",
    category: "Chaussures",
    price: 39
  },
  {
    id: "accessoires-pack",
    name: "Pack Accessoires Chic",
    category: "Autres accessoires",
    price: 24
  }
];

let products = loadProducts();
let cart = loadCart();
let activeCategory = "Tous";
let editingProductId = "";

const productsGrid = document.getElementById("productsGrid");
const categoryFilters = document.getElementById("categoryFilters");
const cartButton = document.getElementById("cartButton");
const cartCount = document.getElementById("cartCount");
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const checkoutButton = document.getElementById("checkoutButton");
const themeToggle = document.getElementById("themeToggle");
const imageModal = document.getElementById("imageModal");
const modalVisual = document.getElementById("modalVisual");
const modalTitle = document.getElementById("modalTitle");
const modalPrice = document.getElementById("modalPrice");
const modalClose = document.getElementById("modalClose");
const adminEntry = document.getElementById("adminEntry");
const adminGate = document.getElementById("adminGate");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminPassword = document.getElementById("adminPassword");
const adminGateClose = document.getElementById("adminGateClose");
const adminPanel = document.getElementById("adminPanel");
const adminClose = document.getElementById("adminClose");
const productForm = document.getElementById("productForm");
const productId = document.getElementById("productId");
const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productCategory = document.getElementById("productCategory");
const productImage = document.getElementById("productImage");
const productFileName = document.getElementById("productFileName");
const productSubmit = document.getElementById("productSubmit");
const productCancel = document.getElementById("productCancel");
const adminList = document.getElementById("adminList");
const toastStack = document.getElementById("toastStack");

initTheme();
populateCategorySelect();
renderCategoryFilters();
renderProducts();
renderCart();
renderAdminList();

themeToggle.addEventListener("click", toggleTheme);
cartButton.addEventListener("click", openCart);
checkoutButton.addEventListener("click", checkoutCart);
modalClose.addEventListener("click", closeImageModal);
imageModal.addEventListener("click", (event) => {
  if (event.target === imageModal) closeImageModal();
});

document.querySelectorAll("[data-cart-open]").forEach((button) => {
  button.addEventListener("click", openCart);
});

document.querySelectorAll("[data-cart-close]").forEach((button) => {
  button.addEventListener("click", closeCart);
});

adminEntry.addEventListener("click", openAdminGate);
adminGateClose.addEventListener("click", closeAdminGate);
adminClose.addEventListener("click", closeAdminPanel);
productCancel.addEventListener("click", resetAdminForm);
productImage.addEventListener("change", () => {
  productFileName.textContent = productImage.files?.[0]?.name || "Aucun fichier sélectionné";
});

adminGate.addEventListener("click", (event) => {
  if (event.target === adminGate) closeAdminGate();
});

adminLoginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (adminPassword.value === "00001") {
    closeAdminGate();
    openAdminPanel();
    adminPassword.value = "";
    showToast("Panneau admin ouvert.");
    return;
  }

  adminLoginForm.classList.remove("shake");
  void adminLoginForm.offsetWidth;
  adminLoginForm.classList.add("shake");
  showToast("Mot de passe incorrect.");
});

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = productName.value.trim();
  const price = Number(productPrice.value);
  const category = productCategory.value;
  const imageFile = productImage.files?.[0] || null;

  if (!name || !category || !Number.isFinite(price) || price <= 0) {
    showToast("Vérifiez les informations du produit.");
    return;
  }

  let imageData = "";
  if (imageFile) {
    try {
      imageData = await prepareUploadedImage(imageFile);
    } catch (error) {
      showToast(error.message || "Image non valide.");
      return;
    }
  }

  if (editingProductId) {
    products = products.map((product) => (
      product.id === editingProductId
        ? { ...product, name, price, category, imageData: imageData || product.imageData || "" }
        : product
    ));
    showToast("Produit modifié.");
  } else {
    products = [
      ...products,
      {
        id: makeId(),
        name,
        price,
        category,
        imageData
      }
    ];
    showToast("Produit ajouté.");
  }

  saveProducts();
  resetAdminForm();
  renderProducts();
  renderCart();
  renderAdminList();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeImageModal();
  closeCart();
  closeAdminGate();
  closeAdminPanel();
});

function loadProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.products));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (error) {
    console.warn(error);
  }
  return defaultProducts;
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart));
    if (Array.isArray(saved)) return saved;
  } catch (error) {
    console.warn(error);
  }
  return [];
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

function saveCart() {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
}

function makeId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `product-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatMoney(value) {
  return `${Math.round(Number(value) || 0)} $`;
}

function prepareUploadedImage(file) {
  if (!file.type.startsWith("image/")) {
    return Promise.reject(new Error("Veuillez choisir un fichier image."));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Impossible de lire l'image."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Image non valide."));
      image.onload = () => {
        const maxSize = 1200;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function populateCategorySelect() {
  productCategory.replaceChildren();
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category === "Autres accessoires" ? "Autres" : category;
    productCategory.append(option);
  });
}

function renderCategoryFilters() {
  categoryFilters.replaceChildren();
  ["Tous", ...categories].forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-filter";
    button.textContent = category;
    button.classList.toggle("active", activeCategory === category);
    button.addEventListener("click", () => {
      activeCategory = category;
      renderCategoryFilters();
      renderProducts();
    });
    categoryFilters.append(button);
  });
}

function renderProducts() {
  const visibleProducts = activeCategory === "Tous"
    ? products
    : products.filter((product) => product.category === activeCategory);

  productsGrid.replaceChildren();

  if (!visibleProducts.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Aucun article dans cette catégorie.";
    productsGrid.append(empty);
    return;
  }

  visibleProducts.forEach((product) => {
    productsGrid.append(createProductCard(product));
  });
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const imageButton = document.createElement("button");
  imageButton.type = "button";
  imageButton.className = "product-image";
  imageButton.setAttribute("aria-label", `Voir ${product.name}`);
  applyProductImage(imageButton, product);
  imageButton.addEventListener("click", () => openImageModal(product));

  const info = document.createElement("div");
  info.className = "product-info";

  const category = document.createElement("div");
  category.className = "product-category";
  category.textContent = product.category;

  const name = document.createElement("h3");
  name.className = "product-name";
  name.textContent = product.name;

  const footer = document.createElement("div");
  footer.className = "product-footer";

  const price = document.createElement("div");
  price.className = "price";
  price.textContent = formatMoney(product.price);

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "small-action";
  addButton.textContent = "Ajouter au panier";
  addButton.addEventListener("click", () => addToCart(product.id));

  const buyButton = document.createElement("button");
  buyButton.type = "button";
  buyButton.className = "small-action buy";
  buyButton.textContent = "Acheter";
  buyButton.addEventListener("click", () => buyNow([{ product, quantity: 1 }]));

  actions.append(addButton, buyButton);
  footer.append(price, actions);
  info.append(category, name, footer);
  card.append(imageButton, info);
  return card;
}

function applyProductImage(element, product) {
  if (product.imageData) {
    element.style.backgroundImage = `url("${product.imageData}")`;
    element.style.backgroundSize = "cover";
    element.style.backgroundPosition = "center";
    return;
  }

  element.style.backgroundImage = 'url("assets/product-sheet.png")';
  element.style.backgroundSize = "300% 200%";
  element.style.setProperty("--image-position", categoryImages[product.category] || "100% 100%");
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart();
  renderCart();
  showToast("Article ajouté au panier.");
}

function renderCart() {
  cart = cart.filter((item) => products.some((product) => product.id === item.id));
  saveCart();

  const detailedItems = getCartDetails();
  cartItems.replaceChildren();

  if (!detailedItems.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Votre panier est vide.";
    cartItems.append(empty);
  } else {
    detailedItems.forEach((item) => cartItems.append(createCartItem(item)));
  }

  const total = detailedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const count = detailedItems.reduce((sum, item) => sum + item.quantity, 0);
  cartTotal.textContent = formatMoney(total);
  cartCount.textContent = count;
}

function getCartDetails() {
  return cart
    .map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.id)
    }))
    .filter((item) => item.product);
}

function createCartItem(item) {
  const row = document.createElement("div");
  row.className = "cart-item";

  const thumb = document.createElement("div");
  thumb.className = "cart-thumb";
  applyProductImage(thumb, item.product);

  const body = document.createElement("div");

  const title = document.createElement("h3");
  title.textContent = item.product.name;

  const meta = document.createElement("div");
  meta.className = "cart-meta";

  const price = document.createElement("span");
  price.textContent = formatMoney(item.product.price * item.quantity);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-item";
  remove.textContent = "Supprimer";
  remove.addEventListener("click", () => removeFromCart(item.id));

  const qtyRow = document.createElement("div");
  qtyRow.className = "qty-row";

  const minus = document.createElement("button");
  minus.type = "button";
  minus.textContent = "−";
  minus.setAttribute("aria-label", "Diminuer la quantité");
  minus.addEventListener("click", () => updateQuantity(item.id, item.quantity - 1));

  const quantity = document.createElement("strong");
  quantity.textContent = item.quantity;

  const plus = document.createElement("button");
  plus.type = "button";
  plus.textContent = "+";
  plus.setAttribute("aria-label", "Augmenter la quantité");
  plus.addEventListener("click", () => updateQuantity(item.id, item.quantity + 1));

  qtyRow.append(minus, quantity, plus);
  meta.append(price, remove);
  body.append(title, meta, qtyRow);
  row.append(thumb, body);
  return row;
}

function updateQuantity(productId, quantity) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  cart = cart.map((item) => item.id === productId ? { ...item, quantity } : item);
  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
  showToast("Article supprimé.");
}

function checkoutCart() {
  const detailedItems = getCartDetails();
  if (!detailedItems.length) {
    showToast("Le panier est vide.");
    return;
  }
  buyNow(detailedItems);
}

function buyNow(items) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const lines = items
    .map((item) => `- ${item.product.name} x${item.quantity}: ${formatMoney(item.product.price * item.quantity)}`)
    .join("\n");
  const message = `Bonjour, je souhaite acheter les articles suivants:\n${lines}\nTotal: ${formatMoney(total)}`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
}

function openCart() {
  cartPanel.classList.add("open");
  cartOverlay.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartPanel.classList.remove("open");
  cartOverlay.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
}

function openImageModal(product) {
  applyProductImage(modalVisual, product);
  modalTitle.textContent = product.name;
  modalPrice.textContent = formatMoney(product.price);
  imageModal.classList.add("open");
  imageModal.setAttribute("aria-hidden", "false");
}

function closeImageModal() {
  imageModal.classList.remove("open");
  imageModal.setAttribute("aria-hidden", "true");
}

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(saved || (prefersDark ? "dark" : "light"));
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(current);
  localStorage.setItem(STORAGE_KEYS.theme, current);
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.querySelector("span").textContent = theme === "dark" ? "☀" : "☾";
}

function openAdminGate() {
  adminGate.classList.add("open");
  adminGate.setAttribute("aria-hidden", "false");
  setTimeout(() => adminPassword.focus(), 80);
}

function closeAdminGate() {
  adminGate.classList.remove("open");
  adminGate.setAttribute("aria-hidden", "true");
}

function openAdminPanel() {
  adminPanel.classList.add("open");
  adminPanel.setAttribute("aria-hidden", "false");
}

function closeAdminPanel() {
  adminPanel.classList.remove("open");
  adminPanel.setAttribute("aria-hidden", "true");
  resetAdminForm();
}

function resetAdminForm() {
  editingProductId = "";
  productId.value = "";
  productName.value = "";
  productPrice.value = "";
  productCategory.value = categories[0];
  productImage.value = "";
  productFileName.textContent = "Aucun fichier sélectionné";
  productSubmit.textContent = "Ajouter";
}

function renderAdminList() {
  adminList.replaceChildren();

  products.forEach((product) => {
    const row = document.createElement("div");
    row.className = "admin-row";

    const details = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = product.name;
    const meta = document.createElement("span");
    meta.textContent = `${product.category} · ${formatMoney(product.price)}`;
    details.append(name, meta);

    const actions = document.createElement("div");
    actions.className = "admin-actions";

    const edit = document.createElement("button");
    edit.type = "button";
    edit.textContent = "Modifier";
    edit.addEventListener("click", () => editProduct(product.id));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Suppr.";
    remove.addEventListener("click", () => deleteProduct(product.id));

    actions.append(edit, remove);
    row.append(details, actions);
    adminList.append(row);
  });
}

function editProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  editingProductId = id;
  productId.value = id;
  productName.value = product.name;
  productPrice.value = product.price;
  productCategory.value = product.category;
  productImage.value = "";
  productFileName.textContent = "Aucun nouveau fichier sélectionné";
  productSubmit.textContent = "Modifier";
}

function deleteProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  const confirmed = confirm(`Supprimer "${product.name}" ?`);
  if (!confirmed) return;

  products = products.filter((item) => item.id !== id);
  cart = cart.filter((item) => item.id !== id);
  saveProducts();
  saveCart();
  resetAdminForm();
  renderProducts();
  renderCart();
  renderAdminList();
  showToast("Produit supprimé.");
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastStack.append(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    setTimeout(() => toast.remove(), 180);
  }, 2600);
}
