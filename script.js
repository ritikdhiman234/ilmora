const products = {
  immunity: {
    id: "immunity",
    name: "Immunity Booster",
    price: 499,
    description: "A botanical blend for your everyday wellness routine.",
    art: "❧",
    color: "#e8eee2"
  },
  churna: {
    id: "churna",
    name: "Digestive Care Churna",
    price: 349,
    description: "A traditional-inspired herbal blend.",
    art: "✺",
    color: "#f2ecdc"
  },
  hairoil: {
    id: "hairoil",
    name: "Herbal Hair Oil",
    price: 399,
    description: "A plant-inspired addition to your hair-care routine.",
    art: "❧",
    color: "#e3eee5"
  },
  facecream: {
    id: "facecream",
    name: "Skin Glow Face Cream",
    price: 449,
    description: "A cream for your everyday skincare routine.",
    art: "✿",
    color: "#f4e8e2"
  }
};

const cart = {};

const $ = (selector, root = document) =>
  root.querySelector(selector);

const $$ = (selector, root = document) =>
  [...root.querySelectorAll(selector)];

const money = amount =>
  `₹${amount.toLocaleString("en-IN")}`;

const cartCount = $("#cartCount");
const drawerCount = $("#drawerCount");
const cartItems = $("#cartItems");
const cartSummary = $("#cartSummary");
const overlay = $("#overlay");
const drawer = $("#cartDrawer");
const toast = $("#toast");

let toastTimeout;

// Show notification
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

// Calculate total cart quantity
function totalItems() {
  return Object.values(cart).reduce(
    (sum, item) => sum + item.qty,
    0
  );
}

// Calculate cart subtotal
function subtotal() {
  return Object.values(cart).reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );
}

// Add product to cart
function addToCart(id) {
  const product = products[id];

  if (!product) return;

  if (cart[id]) {
    cart[id].qty += 1;
  } else {
    cart[id] = {
      ...product,
      qty: 1
    };
  }

  renderCart();

  showToast(`${product.name} added to your bag`);
}

// Increase or decrease quantity
function changeQuantity(id, amount) {
  if (!cart[id]) return;

  cart[id].qty += amount;

  if (cart[id].qty <= 0) {
    delete cart[id];
  }

  renderCart();
}

// Remove product
function removeItem(id) {
  delete cart[id];

  renderCart();

  showToast("Item removed from your bag");
}

// Update cart interface
function renderCart() {
  const count = totalItems();

  cartCount.textContent = count;
  drawerCount.textContent = `(${count})`;

  const entries = Object.values(cart);

  if (!entries.length) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <span>♡</span>
        <h3>Your bag is taking a little rest.</h3>
        <p>Add something lovely to get started.</p>
        <button class="button" id="continueShopping">
          Explore products ↗
        </button>
      </div>
    `;

    cartSummary.hidden = true;
    return;
  }

  cartItems.innerHTML = entries.map(item => `
    <article class="cart-line">
      <div class="cart-thumb"
           style="background:${item.color}">
        ${item.art}
      </div>

      <div>
        <h3>${item.name}</h3>
        <p>${money(item.price)} each</p>

        <div class="qty-control">
          <button data-qty="-1"
                  data-id="${item.id}"
                  aria-label="Decrease quantity">
            −
          </button>

          <span>${item.qty}</span>

          <button data-qty="1"
                  data-id="${item.id}"
                  aria-label="Increase quantity">
            +
          </button>
        </div>
      </div>

      <div class="cart-line-price">
        ${money(item.price * item.qty)}

        <button class="remove-item"
                data-remove="${item.id}">
          Remove
        </button>
      </div>
    </article>
  `).join("");

  $("#cartSubtotal").textContent = money(subtotal());

  cartSummary.hidden = false;
}

// Open shopping cart
function openCart() {
  drawer.classList.add("open");
  overlay.classList.add("open");

  drawer.setAttribute("aria-hidden", "false");

  document.body.classList.add("locked");
}

// Close shopping cart
function closeCart() {
  drawer.classList.remove("open");
  overlay.classList.remove("open");

  drawer.setAttribute("aria-hidden", "true");

  document.body.classList.remove("locked");
}

// Open product details
function openProduct(id) {
  const product = products[id];

  if (!product) return;

  $("#modalTitle").textContent = product.name;
  $("#modalDescription").textContent = product.description;
  $("#modalPrice").textContent = money(product.price);

  $("#modalArt").style.background = product.color;
  $("#modalArt").textContent = product.art;

  $("#modalAdd").dataset.add = id;

  $("#productModal").hidden = false;

  document.body.classList.add("locked");
}

// Close product details
function closeProduct() {
  $("#productModal").hidden = true;

  document.body.classList.remove("locked");
}

// Mobile navigation
$("#menuToggle").addEventListener("click", () => {
  const open = $("#mainNav").classList.toggle("open");

  $("#menuToggle").setAttribute(
    "aria-expanded",
    String(open)
  );

  $("#menuToggle").setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation"
  );
});

// Navigation links
$$(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    $$(".nav-link").forEach(item =>
      item.classList.remove("active")
    );

    link.classList.add("active");

    $("#mainNav").classList.remove("open");

    $("#menuToggle").setAttribute(
      "aria-expanded",
      "false"
    );
  });
});

// Search panel
$("#searchToggle").addEventListener("click", () => {
  const panel = $("#searchPanel");

  panel.classList.toggle("open");

  if (panel.classList.contains("open")) {
    $("#searchInput").focus();
  }
});

// Clear search
$("#searchClear").addEventListener("click", () => {
  $("#searchInput").value = "";
  filterProducts("");
});

// Filter products
function filterProducts(query) {
  const normalized = query.trim().toLowerCase();

  let visible = 0;

  $$(".product-card").forEach(card => {
    const product = products[card.dataset.product];

    if (!product) return;

    const searchableText =
      `${product.name} ${product.description}`.toLowerCase();

    const match = searchableText.includes(normalized);

    card.hidden = !match;

    if (match) visible++;
  });

  $("#searchEmpty").hidden = visible !== 0;

  if (query.trim()) {
    $("#products").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

$("#searchInput").addEventListener("input", event => {
  filterProducts(event.target.value);
});

// Cart buttons
$("#cartToggle").addEventListener("click", openCart);

$("#cartClose").addEventListener("click", closeCart);

overlay.addEventListener("click", closeCart);

// Cart quantity and remove buttons
$("#cartItems").addEventListener("click", event => {
  const qtyButton = event.target.closest("[data-qty]");

  const removeButton = event.target.closest("[data-remove]");

  if (qtyButton) {
    changeQuantity(
      qtyButton.dataset.id,
      Number(qtyButton.dataset.qty)
    );
  }

  if (removeButton) {
    removeItem(removeButton.dataset.remove);
  }

  if (event.target.id === "continueShopping") {
    closeCart();
  }
});

// Product buttons
document.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");

  const viewButton = event.target.closest("[data-view]");

  if (addButton) {
    addToCart(addButton.dataset.add);
  }

  if (viewButton) {
    openProduct(viewButton.dataset.view);
  }
});

// Product modal
$("#modalClose").addEventListener("click", closeProduct);

$("#productModal").addEventListener("click", event => {
  if (event.target.id === "productModal") {
    closeProduct();
  }
});

// Close overlays with Escape key
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
    closeProduct();

    $("#searchPanel").classList.remove("open");
  }
});

// Checkout demo
$("#checkoutButton").addEventListener("click", () => {
  showToast(
    "Checkout is a demo — connect a payment provider before launch."
  );
});

// Newsletter validation
$("#newsletterForm").addEventListener("submit", event => {
  event.preventDefault();

  const input = $("#emailInput");
  const message = $("#newsletterMessage");

  if (!input.value.trim() || !input.checkValidity()) {
    message.textContent =
      "Please enter a valid email address.";

    message.style.color = "#a13c2d";

    input.focus();

    return;
  }

  message.textContent =
    "Thanks for your interest! Newsletter signup is in demo mode.";

  message.style.color = "#28563b";

  input.value = "";
});

// Current year in footer
$("#year").textContent = new Date().getFullYear();

// Initial cart display
renderCart();