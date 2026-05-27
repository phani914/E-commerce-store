// ShopHub E-Commerce Functionality Engine

// 1. PRODUCT DATABASE
const PRODUCTS = [
    {
        id: "headphones",
        title: "Premium Wireless Headphones",
        category: "Electronics",
        price: 6699,
        rating: 4.8,
        stock: 18,
        image: "assets/images/headphones.png",
        description: "Immersive wireless audio with soft ear cushions, deep bass, and all-day comfort for work, travel, and downtime."
    },
    {
        id: "water-bottle",
        title: "Stainless Steel Water Bottle",
        category: "Accessories",
        price: 2099,
        rating: 4.6,
        stock: 32,
        image: "assets/images/water-bottle.png",
        description: "A sleek insulated bottle that keeps drinks cold or hot for hours with a leak-resistant lid and durable finish."
    },
    {
        id: "running-shoes",
        title: "Running Shoes Pro",
        category: "Footwear",
        price: 8399,
        rating: 4.9,
        stock: 12,
        image: "assets/images/running-shoes.png",
        description: "Lightweight running shoes with responsive cushioning, breathable uppers, and supportive traction for everyday miles."
    },
    {
        id: "tshirt",
        title: "Casual Cotton T-Shirt",
        category: "Clothing",
        price: 2499,
        rating: 4.5,
        stock: 40,
        image: "assets/images/tshirt.png",
        description: "A soft premium cotton tee with a relaxed fit, polished fabric texture, and easy styling for daily wear."
    },
    {
        id: "phone-charger",
        title: "Portable Phone Charger",
        category: "Electronics",
        price: 3349,
        rating: 4.7,
        stock: 25,
        image: "assets/images/phone-charger.png",
        description: "Compact backup power with fast charging support, clear battery indicators, and a travel-ready slim profile."
    },
    {
        id: "yoga-mat",
        title: "Yoga Mat Premium",
        category: "Sports",
        price: 3799,
        rating: 4.6,
        stock: 20,
        image: "assets/images/yoga-mat.png",
        description: "A cushioned non-slip mat with a carry strap, built for stable stretching, yoga sessions, and floor workouts."
    },
    {
        id: "desk-lamp",
        title: "Minimalist LED Desk Lamp",
        category: "Home Office",
        price: 4599,
        rating: 4.7,
        stock: 16,
        image: "assets/images/desk-lamp.png",
        description: "A sleek adjustable lamp with warm-to-cool lighting, compact desk presence, and a refined matte finish."
    },
    {
        id: "smart-watch",
        title: "Everyday Smart Watch",
        category: "Electronics",
        price: 10899,
        rating: 4.8,
        stock: 22,
        image: "assets/images/smart-watch.png",
        description: "A modern wearable with a bright display, comfortable sport band, and daily health and notification features."
    },
    {
        id: "backpack",
        title: "Sleek Everyday Backpack",
        category: "Accessories",
        price: 5899,
        rating: 4.6,
        stock: 19,
        image: "assets/images/backpack.png",
        description: "A practical daily backpack with organized storage, padded straps, and a clean style for commute or travel."
    },
    {
        id: "coffee-mugs",
        title: "Ceramic Coffee Mug Set",
        category: "Home Goods",
        price: 2899,
        rating: 4.5,
        stock: 28,
        image: "assets/images/coffee-mugs.png",
        description: "A modern two-mug set with comfortable handles, smooth ceramic finish, and calm colors for everyday coffee."
    }
];

// 2. DOM CONTENT LOADING WRAPPER
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initFormValidation();
    initAuthUi();
    updateCartBadge();

    // Check current page context
    const productsGrid = document.getElementById("productsGrid");
    const productDetailPage = document.getElementById("productDetailPage");
    const cartItemsContainer = document.getElementById("cartItemsContainer");

    if (productDetailPage) {
        initProductDetailPage();
    } else if (productsGrid) {
        initProductsPage();
    } else if (cartItemsContainer) {
        initCartPage();
    }
});

// 3. PERSISTENT THEME SYSTEM
function initTheme() {
    const themeToggle = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);

    if (isDark) {
        document.documentElement.classList.add("dark-theme");
        document.body.classList.add("dark-theme");
        if (themeToggle) themeToggle.checked = true;
    } else {
        document.documentElement.classList.remove("dark-theme");
        document.body.classList.remove("dark-theme");
        if (themeToggle) themeToggle.checked = false;
    }

    if (themeToggle) {
        // Remove old listeners to prevent stacking
        const newToggle = themeToggle.cloneNode(true);
        themeToggle.parentNode.replaceChild(newToggle, themeToggle);
        
        newToggle.addEventListener("change", () => {
            if (newToggle.checked) {
                document.documentElement.classList.add("dark-theme");
                document.body.classList.add("dark-theme");
                localStorage.setItem("theme", "dark");
            } else {
                document.documentElement.classList.remove("dark-theme");
                document.body.classList.remove("dark-theme");
                localStorage.setItem("theme", "light");
            }
        });
    }
}

// 4. SHARED FORM VALIDATION
function initFormValidation() {
    const forms = document.querySelectorAll("form");
    forms.forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault();

            const isValid = validateForm(form);
            if (!isValid) {
                const firstInvalid = form.querySelector(".is-invalid");
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            const isNewsletter = form.classList.contains("newsletter-form");
            const isSignIn = form.classList.contains("signin-form");
            const isSignUp = form.classList.contains("signup-form");
            const authResult = (isSignIn || isSignUp) ? handleAuthFormSubmission(form) : null;

            if (authResult && !authResult.success) {
                const firstInvalid = form.querySelector(".is-invalid");
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            form.reset();
            clearFormValidation(form);
            let toastTitle = "Message sent";
            let toastMessage = "Thanks for contacting us. Our support team will get back to you soon.";

            if (isNewsletter) {
                toastTitle = "Subscription added";
                toastMessage = "Thank you for subscribing to ShopHub updates.";
            } else if (isSignIn) {
                saveAuthSession(authResult.user);
                toastTitle = "Signed in";
                toastMessage = `Welcome back, ${authResult.user.name.split(" ")[0]}.`;
            } else if (isSignUp) {
                saveAuthSession(authResult.user);
                toastTitle = "Account created";
                toastMessage = "Your ShopHub account has been created for this demo.";
            }

            showToast(
                toastTitle,
                toastMessage
            );

            if (isSignIn || isSignUp) {
                handlePostAuthCart();
            }
        });

        getFormFields(form).forEach(field => {
            field.addEventListener("input", () => {
                validateField(field);
                validateDependentFields(field, form);
            });
            field.addEventListener("blur", () => validateField(field));
        });
    });
}

function getFormFields(form) {
    return Array.from(form.querySelectorAll("input, textarea, select"))
        .filter(field => !["hidden", "submit", "button"].includes(field.type));
}

function validateForm(form) {
    return getFormFields(form).map(field => validateField(field)).every(Boolean);
}

function validateField(field) {
    const value = field.value.trim();
    let message = "";

    if (field.type === "checkbox" && field.required && !field.checked) {
        message = "Please confirm this option.";
    } else if (field.required && !value) {
        message = "This field is required.";
    } else if (field.type === "email" && value && !isValidEmail(value)) {
        message = "Enter a valid email address.";
    } else if (field.name === "name" && value && !isValidFullName(value)) {
        message = "Enter a valid name using letters, spaces, apostrophes, hyphens, or periods.";
    } else if (field.name === "phone" && value && !isValidPhone(value)) {
        message = "Enter a valid 10-digit phone number.";
    } else if (field.maxLength > 0 && value && value.length > field.maxLength) {
        message = `Enter no more than ${field.maxLength} characters.`;
    } else if (field.pattern && value && !(new RegExp(`^(?:${field.pattern})$`)).test(value)) {
        message = "Enter a valid value.";
    } else if (field.minLength > 0 && value && value.length < field.minLength) {
        message = `Enter at least ${field.minLength} characters.`;
    } else if (field.dataset.passwordStrength && value && !isStrongPassword(value)) {
        message = "Use uppercase, lowercase, a number, and a symbol.";
    } else if (field.dataset.match) {
        const matchField = document.getElementById(field.dataset.match);
        if (matchField && value && value !== matchField.value.trim()) {
            message = "Passwords do not match.";
        }
    }

    setFieldValidationState(field, message);
    return !message;
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isValidFullName(value) {
    return /^[A-Za-z][A-Za-z\s'.-]{1,58}$/.test(value);
}

function isValidPhone(value) {
    return value.replace(/\D/g, "").length === 10;
}

function isStrongPassword(value) {
    return /[a-z]/.test(value) &&
           /[A-Z]/.test(value) &&
           /\d/.test(value) &&
           /[^A-Za-z0-9]/.test(value);
}

function validateDependentFields(field, form) {
    const dependentFields = getFormFields(form).filter(item => item.dataset.match === field.id && item.value.trim());
    dependentFields.forEach(validateField);
}

function setFieldValidationState(field, message) {
    const errorId = `${field.id || field.name}-error`;
    let error = document.getElementById(errorId);

    if (!error) {
        error = document.createElement("div");
        error.id = errorId;
        error.className = "form-error";
        const wrapper = field.closest(".auth-check");
        if (wrapper) {
            wrapper.insertAdjacentElement("afterend", error);
        } else {
            field.insertAdjacentElement("afterend", error);
        }
    }

    if (message) {
        field.classList.add("is-invalid");
        const wrapper = field.closest(".auth-check");
        if (wrapper) wrapper.classList.add("is-invalid");
        field.setAttribute("aria-invalid", "true");
        field.setAttribute("aria-describedby", errorId);
        error.textContent = message;
    } else {
        field.classList.remove("is-invalid");
        const wrapper = field.closest(".auth-check");
        if (wrapper) wrapper.classList.remove("is-invalid");
        field.removeAttribute("aria-invalid");
        field.removeAttribute("aria-describedby");
        error.textContent = "";
    }
}

function clearFormValidation(form) {
    getFormFields(form).forEach(field => setFieldValidationState(field, ""));
}

// 5. AUTH SESSION INTERFACE
const AUTH_ACCOUNTS_KEY = "shophub_accounts";
const AUTH_USER_KEY = "shophub_user";

function normalizeEmail(value) {
    return value.trim().toLowerCase();
}

function getAuthAccounts() {
    try {
        const raw = localStorage.getItem(AUTH_ACCOUNTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error("Failed to parse account local storage", e);
        return [];
    }
}

function saveAuthAccounts(accounts) {
    localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function findAuthAccount(email) {
    const normalizedEmail = normalizeEmail(email);
    return getAuthAccounts().find(account => account.email === normalizedEmail) || null;
}

function handleAuthFormSubmission(form) {
    const isSignIn = form.classList.contains("signin-form");
    const emailField = form.querySelector('input[name="email"]');
    const passwordField = form.querySelector('input[name="password"]');
    const email = normalizeEmail(emailField?.value || "");
    const password = passwordField?.value || "";

    if (isSignIn) {
        const account = findAuthAccount(email);

        if (!account || account.password !== password) {
            setFieldValidationState(passwordField, "Email or password is incorrect.");
            return { success: false };
        }

        return {
            success: true,
            user: {
                name: account.name,
                email: account.email,
                mode: "signin"
            }
        };
    }

    const nameField = form.querySelector('input[name="name"]');
    const phoneField = form.querySelector('input[name="phone"]');

    if (findAuthAccount(email)) {
        setFieldValidationState(emailField, "An account with this email already exists. Please sign in.");
        return { success: false };
    }

    const account = {
        name: nameField.value.trim().replace(/\s+/g, " "),
        phone: phoneField.value.replace(/\D/g, ""),
        email,
        password,
        createdAt: new Date().toISOString()
    };

    saveAuthAccounts([...getAuthAccounts(), account]);

    return {
        success: true,
        user: {
            name: account.name,
            email: account.email,
            mode: "signup"
        }
    };
}

function getAuthUser() {
    try {
        const raw = localStorage.getItem(AUTH_USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.error("Failed to parse user local storage", e);
        return null;
    }
}

function isSignedIn() {
    const user = getAuthUser();
    return Boolean(user && user.email);
}

function saveAuthSession(user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({
        name: user.name,
        email: normalizeEmail(user.email),
        mode: user.mode,
        signedInAt: new Date().toISOString()
    }));
    initAuthUi();
}

function signOut() {
    localStorage.removeItem(AUTH_USER_KEY);
    initAuthUi();
    showToast("Signed out", "You have been signed out of your ShopHub account.", "fa-right-from-bracket");
}

function initAuthUi() {
    const authButtons = document.querySelectorAll(".auth-button");
    const user = getAuthUser();

    authButtons.forEach(button => {
        if (user?.email) {
            button.textContent = user.name ? `Hi, ${user.name.split(" ")[0]}` : "My Account";
            button.setAttribute("title", user.email);
        } else {
            button.textContent = "Sign In / Sign Up";
            button.removeAttribute("title");
        }
    });

    const accountPanel = document.getElementById("authAccountPanel");
    const accountName = document.getElementById("authAccountName");
    const accountEmail = document.getElementById("authAccountEmail");
    const signOutBtn = document.getElementById("signOutBtn");

    if (accountPanel) {
        accountPanel.hidden = !user?.email;
    }

    if (accountName && user?.name) {
        accountName.textContent = `Hi, ${user.name.split(" ")[0]}`;
    }

    if (accountEmail && user?.email) {
        accountEmail.textContent = user.email;
    }

    if (signOutBtn && !signOutBtn.dataset.bound) {
        signOutBtn.dataset.bound = "true";
        signOutBtn.addEventListener("click", signOut);
    }

    const authHeader = document.querySelector(".auth-header");
    if (!authHeader || !getPendingCartRequest()) return;

    if (!document.querySelector(".auth-cart-notice")) {
        const notice = document.createElement("div");
        notice.className = "auth-cart-notice";

        const icon = document.createElement("i");
        icon.className = "fas fa-shopping-cart";
        icon.setAttribute("aria-hidden", "true");
        notice.appendChild(icon);

        const text = document.createElement("span");
        text.textContent = "Sign in or create an account to add your selected product to the cart.";
        notice.appendChild(text);

        authHeader.appendChild(notice);
    }
}

function requestAuthForCart(product, quantity) {
    localStorage.setItem("shophub_pending_cart", JSON.stringify({
        id: product.id,
        quantity,
        returnTo: `${window.location.pathname.split("/").pop() || "products.html"}${window.location.search}`
    }));
    showToast("Sign In Required", "Please sign in or create an account before adding items to your cart.", "fa-user-lock");
    setTimeout(() => {
        window.location.href = "auth.html?intent=add-to-cart";
    }, 700);
}

function getPendingCartRequest() {
    try {
        const raw = localStorage.getItem("shophub_pending_cart");
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.error("Failed to parse pending cart local storage", e);
        return null;
    }
}

function clearPendingCartRequest() {
    localStorage.removeItem("shophub_pending_cart");
}

function handlePostAuthCart() {
    const pendingCart = getPendingCartRequest();
    if (!pendingCart) return;

    const product = PRODUCTS.find(item => item.id === pendingCart.id);
    clearPendingCartRequest();

    if (product) {
        addQuantityToCart(product, Number(pendingCart.quantity) || 1, { requireAuth: false, quiet: true });
    }

    setTimeout(() => {
        window.location.href = "cart.html";
    }, 900);
}

// 6. CART STORAGE INTERFACE
function getCart() {
    try {
        const raw = localStorage.getItem("shophub_cart");
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error("Failed to parse cart local storage", e);
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem("shophub_cart", JSON.stringify(cart));
}

function updateCartBadge() {
    const badges = document.querySelectorAll(".cart-count");
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    badges.forEach(badge => {
        badge.textContent = totalCount.toString();
    });
}

// 7. TOAST NOTIFICATION ENGINE
function showToast(title, message, iconClass = "fa-check-circle") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast-notification";

    const iconDiv = document.createElement("div");
    iconDiv.className = "toast-icon";
    const icon = document.createElement("i");
    icon.className = `fas ${iconClass}`;
    icon.setAttribute("aria-hidden", "true");
    iconDiv.appendChild(icon);
    toast.appendChild(iconDiv);

    const contentDiv = document.createElement("div");
    contentDiv.className = "toast-content";

    const titleEl = document.createElement("div");
    titleEl.className = "toast-title";
    titleEl.textContent = title;
    contentDiv.appendChild(titleEl);

    const messageEl = document.createElement("div");
    messageEl.className = "toast-message";
    messageEl.textContent = message;
    contentDiv.appendChild(messageEl);
    toast.appendChild(contentDiv);

    const closeBtn = document.createElement("button");
    closeBtn.className = "toast-close";
    closeBtn.setAttribute("aria-label", "Close notification");
    const closeIcon = document.createElement("i");
    closeIcon.className = "fas fa-times";
    closeIcon.setAttribute("aria-hidden", "true");
    closeBtn.appendChild(closeIcon);
    closeBtn.addEventListener("click", () => {
        toast.classList.remove("show");
        toast.classList.add("hide");
        setTimeout(() => toast.remove(), 300);
    });
    toast.appendChild(closeBtn);

    container.appendChild(toast);

    // Trigger reflow for slide transition
    toast.offsetHeight;
    toast.classList.add("show");

    // Auto dismiss after 4 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove("show");
            toast.classList.add("hide");
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

// 8. PRODUCTS PAGE IMPLEMENTATION
function initProductsPage() {
    const searchInput = document.getElementById("productSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const sortBy = document.getElementById("sortBy");

    if (searchInput) searchInput.addEventListener("input", filterAndRenderProducts);
    if (categoryFilter) categoryFilter.addEventListener("change", filterAndRenderProducts);
    if (sortBy) sortBy.addEventListener("change", filterAndRenderProducts);

    // Modal close hooks
    const closeBtn = document.getElementById("modalCloseBtn");
    const backdrop = document.getElementById("modalBackdrop");
    if (closeBtn) closeBtn.addEventListener("click", closeQuickView);
    if (backdrop) backdrop.addEventListener("click", closeQuickView);

    // Initial render
    filterAndRenderProducts();
}

function filterAndRenderProducts() {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;

    const searchQuery = (document.getElementById("productSearch")?.value || "").toLowerCase().trim();
    const category = document.getElementById("categoryFilter")?.value || "all";
    const sortBy = document.getElementById("sortBy")?.value || "featured";

    let filtered = PRODUCTS.filter(product => {
        const matchesCategory = (category === "all" || product.category === category);
        const matchesSearch = product.title.toLowerCase().includes(searchQuery) ||
                              product.category.toLowerCase().includes(searchQuery) ||
                              product.description.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    // Sorting
    if (sortBy === "price-low") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
        filtered.sort((a, b) => b.rating - a.rating);
    }

    // Clear grid securely
    grid.replaceChildren();

    // Update count text
    const countEl = document.getElementById("productCount");
    if (countEl) {
        countEl.textContent = `Showing ${filtered.length} of ${PRODUCTS.length} products`;
    }

    if (filtered.length === 0) {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "empty-state";
        
        const searchIcon = document.createElement("i");
        searchIcon.className = "fas fa-search";
        searchIcon.setAttribute("aria-hidden", "true");
        emptyDiv.appendChild(searchIcon);
        
        const heading = document.createElement("h3");
        heading.textContent = "No products found";
        emptyDiv.appendChild(heading);
        
        const message = document.createElement("p");
        message.textContent = "Try adjusting your search keywords or category filters.";
        emptyDiv.appendChild(message);
        
        grid.appendChild(emptyDiv);
        return;
    }

    filtered.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
    });
}

function createProductCard(product) {
    const cardCol = document.createElement("div");
    cardCol.className = "card product-card h-100";
    cardCol.setAttribute("data-id", product.id);

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "product-image";

    const img = document.createElement("img");
    img.className = "card-img-top";
    img.setAttribute("src", product.image);
    img.setAttribute("alt", product.title);
    img.setAttribute("loading", "lazy");
    const imgLink = document.createElement("a");
    imgLink.setAttribute("href", getProductUrl(product));
    imgLink.setAttribute("aria-label", `View ${product.title}`);
    imgLink.appendChild(img);
    imgWrapper.appendChild(imgLink);
    cardCol.appendChild(imgWrapper);

    const info = document.createElement("div");
    info.className = "card-body product-info";

    const catBadge = document.createElement("span");
    catBadge.className = "product-category-label";
    catBadge.textContent = product.category;
    info.appendChild(catBadge);

    const title = document.createElement("h3");
    title.className = "card-title";
    const titleLink = document.createElement("a");
    titleLink.setAttribute("href", getProductUrl(product));
    titleLink.textContent = product.title;
    title.appendChild(titleLink);
    info.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "product-meta";

    const ratingSpan = document.createElement("span");
    const ratingIcon = document.createElement("i");
    ratingIcon.className = "fas fa-star";
    ratingIcon.setAttribute("aria-hidden", "true");
    ratingSpan.appendChild(ratingIcon);
    ratingSpan.appendChild(document.createTextNode(` ${product.rating}`));
    meta.appendChild(ratingSpan);

    const stockSpan = document.createElement("span");
    stockSpan.textContent = `${product.stock} in stock`;
    meta.appendChild(stockSpan);
    info.appendChild(meta);

    const desc = document.createElement("p");
    desc.className = "card-text product-description";
    desc.textContent = product.description;
    info.appendChild(desc);

    const price = document.createElement("p");
    price.className = "card-text product-price";
    price.textContent = `₹${product.price.toLocaleString("en-IN")}`;
    info.appendChild(price);

    const actions = document.createElement("div");
    actions.className = "product-card-actions";

    const quickViewBtn = document.createElement("button");
    quickViewBtn.className = "btn btn-secondary";
    quickViewBtn.textContent = "Quick View";
    quickViewBtn.addEventListener("click", () => openQuickView(product));
    actions.appendChild(quickViewBtn);

    const addToCartBtn = document.createElement("button");
    addToCartBtn.className = "btn btn-primary";
    const cartIcon = document.createElement("i");
    cartIcon.className = "fas fa-shopping-cart";
    cartIcon.setAttribute("aria-hidden", "true");
    addToCartBtn.appendChild(cartIcon);
    addToCartBtn.appendChild(document.createTextNode(" Add to Cart"));
    addToCartBtn.addEventListener("click", () => addToCart(product));
    actions.appendChild(addToCartBtn);

    info.appendChild(actions);
    cardCol.appendChild(info);

    return cardCol;
}

function getProductUrl(product) {
    return `product.html?id=${encodeURIComponent(product.id)}`;
}

function addToCart(product) {
    addQuantityToCart(product, 1);
}

function addQuantityToCart(product, quantity = 1, options = {}) {
    const settings = {
        requireAuth: true,
        quiet: false,
        ...options
    };

    if (settings.requireAuth && !isSignedIn()) {
        requestAuthForCart(product, quantity);
        return false;
    }

    let cart = normalizeCart(getCart());
    const existingItem = cart.find(item => item.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const nextQuantity = currentQuantity + quantity;

    if (nextQuantity > product.stock) {
        showToast("Stock Limit Reached", `Only ${product.stock} units are currently available.`, "fa-exclamation-triangle");
        return false;
    }

    if (existingItem) {
        existingItem.quantity = nextQuantity;
    } else {
        cart.push({ id: product.id, quantity });
    }

    saveCart(cart);
    updateCartBadge();
    const unitLabel = quantity > 1 ? `${quantity} units of ${product.title} have` : `${product.title} has`;
    if (!settings.quiet) {
        showToast("Added to Cart", `${unitLabel} been added to your cart.`, "fa-shopping-cart");
    }
    return true;
}

function openQuickView(product) {
    const modal = document.getElementById("quickViewModal");
    if (!modal) return;

    document.getElementById("modalProductImage").setAttribute("src", product.image);
    document.getElementById("modalProductImage").setAttribute("alt", product.title);
    document.getElementById("modalProductCategory").textContent = product.category;
    document.getElementById("modalProductTitle").textContent = product.title;
    document.getElementById("modalProductRating").textContent = product.rating.toString();
    document.getElementById("modalProductStock").textContent = `${product.stock} in stock`;
    document.getElementById("modalProductDescription").textContent = product.description;
    document.getElementById("modalProductPrice").textContent = `₹${product.price.toLocaleString("en-IN")}`;

    const modalAddBtn = document.getElementById("modalAddToCartBtn");
    const newAddBtn = modalAddBtn.cloneNode(true);
    newAddBtn.addEventListener("click", () => {
        addToCart(product);
        closeQuickView();
    });
    modalAddBtn.parentNode.replaceChild(newAddBtn, modalAddBtn);

    document.body.classList.add("modal-open");
    modal.classList.add("active");
}

function closeQuickView() {
    const modal = document.getElementById("quickViewModal");
    if (!modal) return;
    document.body.classList.remove("modal-open");
    modal.classList.remove("active");
}

// 9. PRODUCT DETAIL PAGE IMPLEMENTATION
function initProductDetailPage() {
    const productId = new URLSearchParams(window.location.search).get("id") || PRODUCTS[0].id;
    const product = PRODUCTS.find(item => item.id === productId);

    if (!product) {
        renderMissingProduct();
        return;
    }

    renderProductDetail(product);
    renderRelatedProducts(product);
}

function renderProductDetail(product) {
    document.title = `Ecommerce Store - ${product.title}`;

    setText("breadcrumbProduct", product.title);
    setText("detailProductCategory", product.category);
    setText("detailProductTitle", product.title);
    setText("detailProductRating", product.rating.toString());
    setText("detailProductStock", `${product.stock} in stock`);
    setText("detailProductDescription", product.description);
    setText("detailProductPrice", `₹${product.price.toLocaleString("en-IN")}`);

    const image = document.getElementById("detailProductImage");
    if (image) {
        image.setAttribute("src", product.image);
        image.setAttribute("alt", product.title);
    }

    const qtyInput = document.getElementById("detailProductQty");
    const minusBtn = document.getElementById("detailQtyMinus");
    const plusBtn = document.getElementById("detailQtyPlus");
    const addBtn = document.getElementById("detailAddToCartBtn");

    const setQuantity = value => {
        const quantity = Math.min(Math.max(value, 1), product.stock);
        if (qtyInput) qtyInput.value = quantity.toString();
        if (minusBtn) minusBtn.disabled = quantity <= 1;
        if (plusBtn) plusBtn.disabled = quantity >= product.stock;
    };

    setQuantity(1);

    if (minusBtn) {
        minusBtn.addEventListener("click", () => {
            setQuantity(Number(qtyInput.value) - 1);
        });
    }

    if (plusBtn) {
        plusBtn.addEventListener("click", () => {
            setQuantity(Number(qtyInput.value) + 1);
        });
    }

    if (addBtn) {
        addBtn.addEventListener("click", () => {
            addQuantityToCart(product, Number(qtyInput.value));
        });
    }
}

function renderRelatedProducts(product) {
    const grid = document.getElementById("relatedProductsGrid");
    if (!grid) return;

    const related = PRODUCTS
        .filter(item => item.id !== product.id)
        .sort((a, b) => {
            if (a.category === product.category && b.category !== product.category) return -1;
            if (a.category !== product.category && b.category === product.category) return 1;
            return b.rating - a.rating;
        })
        .slice(0, 4);

    grid.replaceChildren();
    related.forEach(item => grid.appendChild(createRelatedProductCard(item)));
}

function createRelatedProductCard(product) {
    const card = createProductCard(product);
    const quickViewBtn = card.querySelector(".product-card-actions .btn-secondary");
    if (quickViewBtn) {
        const viewLink = document.createElement("a");
        viewLink.className = quickViewBtn.className;
        viewLink.setAttribute("href", getProductUrl(product));
        viewLink.textContent = "View Product";
        quickViewBtn.replaceWith(viewLink);
    }
    return card;
}

function renderMissingProduct() {
    const content = document.getElementById("productDetailContent");
    const relatedSection = document.querySelector(".related-products-section");
    setText("breadcrumbProduct", "Not Found");
    document.title = "Ecommerce Store - Product Not Found";

    if (relatedSection) relatedSection.remove();
    if (!content) return;

    content.className = "empty-state product-empty-state";
    content.replaceChildren();

    const icon = document.createElement("i");
    icon.className = "fas fa-box-open";
    icon.setAttribute("aria-hidden", "true");
    content.appendChild(icon);

    const heading = document.createElement("h1");
    heading.textContent = "Product not found";
    content.appendChild(heading);

    const message = document.createElement("p");
    message.textContent = "This item may have moved or is no longer available.";
    content.appendChild(message);

    const browseLink = document.createElement("a");
    browseLink.className = "btn btn-primary";
    browseLink.setAttribute("href", "products.html");
    browseLink.textContent = "Browse Products";
    content.appendChild(browseLink);
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

// 10. CART PAGE IMPLEMENTATION
function initCartPage() {
    const checkoutBtn = document.getElementById("checkoutBtn");
    const clearCartBtn = document.getElementById("clearCartBtn");

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            if (getCart().length === 0) {
                showToast("Cart Is Empty", "Add a product before starting checkout.", "fa-shopping-cart");
                return;
            }
            showToast("Checkout Initiated", "Redirecting you to secure payment details...", "fa-credit-card");
        });
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", clearCart);
    }

    renderCart();
}

function renderCart() {
    const container = document.getElementById("cartItemsContainer");
    if (!container) return;

    const cart = normalizeCart(getCart());
    saveCart(cart);
    updateCartBadge();

    if (cart.length === 0) {
        container.replaceChildren();
        
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "empty-cart";
        
        const cartIcon = document.createElement("i");
        cartIcon.className = "fas fa-shopping-cart";
        cartIcon.setAttribute("aria-hidden", "true");
        emptyDiv.appendChild(cartIcon);
        
        const title = document.createElement("h3");
        title.textContent = "Your cart is empty";
        emptyDiv.appendChild(title);
        
        const message = document.createElement("p");
        message.textContent = "Browse our catalog to add products to your cart.";
        emptyDiv.appendChild(message);
        
        const browseBtn = document.createElement("a");
        browseBtn.setAttribute("href", "products.html");
        browseBtn.className = "btn btn-primary";
        browseBtn.textContent = "Browse Products";
        emptyDiv.appendChild(browseBtn);
        
        container.appendChild(emptyDiv);
        updateCartSummary(0, 0);
        return;
    }

    container.replaceChildren();

    let subtotal = 0;

    cart.forEach(cartItem => {
        const product = PRODUCTS.find(p => p.id === cartItem.id);
        if (!product) return;

        const itemSubtotal = product.price * cartItem.quantity;
        subtotal += itemSubtotal;

        const itemDiv = document.createElement("div");
        itemDiv.className = "cart-item";

        const img = document.createElement("img");
        img.className = "cart-item-image";
        img.setAttribute("src", product.image);
        img.setAttribute("alt", product.title);
        img.setAttribute("loading", "lazy");

        const imgLink = document.createElement("a");
        imgLink.className = "cart-item-image-link";
        imgLink.setAttribute("href", getProductUrl(product));
        imgLink.setAttribute("aria-label", `View ${product.title}`);
        imgLink.appendChild(img);
        itemDiv.appendChild(imgLink);

        const infoDiv = document.createElement("div");
        infoDiv.className = "cart-item-info";
        
        const titleEl = document.createElement("h4");
        const titleLink = document.createElement("a");
        titleLink.setAttribute("href", getProductUrl(product));
        titleLink.textContent = product.title;
        titleEl.appendChild(titleLink);
        infoDiv.appendChild(titleEl);

        const catEl = document.createElement("p");
        catEl.textContent = product.category;
        infoDiv.appendChild(catEl);

        const stockEl = document.createElement("span");
        stockEl.className = "cart-stock-note";
        stockEl.textContent = `${product.stock} available`;
        infoDiv.appendChild(stockEl);

        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-button";
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", () => {
            removeCartItem(product.id);
            showToast("Item Removed", `${product.title} has been removed from your cart.`, "fa-trash-alt");
        });
        infoDiv.appendChild(removeBtn);
        itemDiv.appendChild(infoDiv);

        const qtyDiv = document.createElement("div");
        qtyDiv.className = "cart-quantity";

        const minusBtn = document.createElement("button");
        minusBtn.setAttribute("type", "button");
        minusBtn.setAttribute("aria-label", `Decrease quantity for ${product.title}`);
        minusBtn.textContent = "-";
        minusBtn.disabled = cartItem.quantity <= 1;
        minusBtn.addEventListener("click", () => {
            if (cartItem.quantity > 1) {
                updateQuantity(product.id, cartItem.quantity - 1);
            }
        });
        qtyDiv.appendChild(minusBtn);

        const qtyInput = document.createElement("input");
        qtyInput.setAttribute("type", "text");
        qtyInput.setAttribute("value", cartItem.quantity.toString());
        qtyInput.setAttribute("readonly", "true");
        qtyInput.setAttribute("aria-label", "Quantity");
        qtyDiv.appendChild(qtyInput);

        const plusBtn = document.createElement("button");
        plusBtn.setAttribute("type", "button");
        plusBtn.setAttribute("aria-label", `Increase quantity for ${product.title}`);
        plusBtn.textContent = "+";
        plusBtn.disabled = cartItem.quantity >= product.stock;
        plusBtn.addEventListener("click", () => {
            if (cartItem.quantity < product.stock) {
                updateQuantity(product.id, cartItem.quantity + 1);
            } else {
                showToast("Stock Limit Reached", `Only ${product.stock} units are currently available.`, "fa-exclamation-triangle");
            }
        });
        qtyDiv.appendChild(plusBtn);
        itemDiv.appendChild(qtyDiv);

        const priceDiv = document.createElement("div");
        priceDiv.className = "cart-item-total";
        
        const itemPrice = document.createElement("p");
        itemPrice.textContent = `₹${itemSubtotal.toLocaleString("en-IN")}`;
        priceDiv.appendChild(itemPrice);

        const singlePrice = document.createElement("span");
        singlePrice.textContent = `₹${product.price.toLocaleString("en-IN")} each`;
        priceDiv.appendChild(singlePrice);
        itemDiv.appendChild(priceDiv);

        container.appendChild(itemDiv);
    });

    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    updateCartSummary(subtotal, itemCount);
}

function normalizeCart(cart) {
    const mergedItems = cart.reduce((items, item) => {
        const product = PRODUCTS.find(p => p.id === item.id);
        if (!product) return items;

        const quantity = Math.max(Number(item.quantity) || 1, 1);
        items.set(product.id, (items.get(product.id) || 0) + quantity);
        return items;
    }, new Map());

    return Array.from(mergedItems, ([id, quantity]) => {
        const product = PRODUCTS.find(product => product.id === id);
        return {
            id,
            quantity: Math.min(quantity, product.stock)
        };
    });
}

function updateCartSummary(subtotal, itemCount) {
    const subtotalEl = document.getElementById("subtotal");
    const shippingEl = document.getElementById("shipping");
    const totalEl = document.getElementById("total");
    const countEl = document.getElementById("cartItemCount");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const clearCartBtn = document.getElementById("clearCartBtn");

    const shipping = itemCount === 0 ? 0 : (subtotal >= 4000 ? 0 : 250);
    const total = subtotal + shipping;

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString("en-IN")}`;
    if (shippingEl) shippingEl.textContent = itemCount === 0 ? "₹0" : (shipping === 0 ? "Free" : `₹${shipping.toLocaleString("en-IN")}`);
    if (totalEl) totalEl.textContent = `₹${total.toLocaleString("en-IN")}`;
    if (countEl) countEl.textContent = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;
    if (checkoutBtn) checkoutBtn.disabled = itemCount === 0;
    if (clearCartBtn) clearCartBtn.disabled = itemCount === 0;
}

function removeCartItem(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    updateCartBadge();
    renderCart();
}

function updateQuantity(id, newQty) {
    let cart = getCart();
    const item = cart.find(item => item.id === id);
    const product = PRODUCTS.find(product => product.id === id);
    if (item) {
        const maxQty = product ? product.stock : newQty;
        item.quantity = Math.min(Math.max(newQty, 1), maxQty);
        saveCart(cart);
        updateCartBadge();
        renderCart();
    }
}

function clearCart() {
    if (getCart().length === 0) return;
    saveCart([]);
    updateCartBadge();
    renderCart();
    showToast("Cart Cleared", "All items have been removed from your cart.", "fa-trash-alt");
}
