// ===================================
// PHARMAZS JAVASCRIPT
// ===================================


// ACCOUNT STORAGE
function getAccounts() {
    return JSON.parse(localStorage.getItem("pharmazsAccounts") || "[]");
}


// SWITCH LOGIN AND SIGN UP

document.getElementById("goSignup").addEventListener("click", function(e) {
    e.preventDefault();

    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("signupForm").classList.remove("hidden");
});

document.getElementById("goLogin").addEventListener("click", function(e) {
    e.preventDefault();

    document.getElementById("signupForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
});


// SIGN UP

document.getElementById("register").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("ownerName").value.trim();
    const pharmacy = document.getElementById("pharmacyName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (password !== confirm) {
        alert("Passwords do not match!");
        return;
    }

    let accounts = getAccounts();

    if (accounts.some(account => account.email === email)) {
        alert("This email is already registered!");
        return;
    }

    accounts.push({
        name: name,
        pharmacy: pharmacy,
        email: email,
        password: password
    });

    localStorage.setItem("pharmazsAccounts", JSON.stringify(accounts));

    alert("Welcome to PHARMAZS! Your demo account has been created.");

    document.getElementById("register").reset();

    document.getElementById("signupForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
});


// LOGIN

document.getElementById("login").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const accounts = getAccounts();

    const account = accounts.find(
        item => item.email === email && item.password === password
    );

    if (!account) {
        alert("Incorrect email or password. Please try again.");
        return;
    }

    openDashboard(account);
});


// SHOW DASHBOARD

function openDashboard(account) {

    document.getElementById("authPage").classList.add("hidden");
    document.getElementById("appPage").classList.remove("hidden");

    document.getElementById("welcomeName").textContent = account.name;

    sessionStorage.setItem("pharmazsLoggedIn", account.email);

    document.getElementById("currentDate").textContent =
        new Date().toLocaleDateString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

    renderMedicines();
    renderExpirationAlerts();
}


// RESTORE SESSION

function restoreSession() {

    const email = sessionStorage.getItem("pharmazsLoggedIn");

    if (!email) return;

    const account = getAccounts().find(item => item.email === email);

    if (account) {
        openDashboard(account);
    } else {
        sessionStorage.removeItem("pharmazsLoggedIn");
    }
}

restoreSession();


// LOGOUT

document.getElementById("logoutBtn").addEventListener("click", function() {

    sessionStorage.removeItem("pharmazsLoggedIn");

    document.getElementById("appPage").classList.add("hidden");
    document.getElementById("authPage").classList.remove("hidden");

    document.getElementById("login").reset();

    alert("You have successfully logged out!");

});


// MEDICINE SAMPLE DATA

function daysFromNow(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);

    return date.toISOString().split("T")[0];
}

const defaultMedicines = [
    {
        name: "Paracetamol 500mg",
        category: "Tablet",
        stock: 5,
        price: 5,
        expiry: daysFromNow(90)
    },
    {
        name: "Amoxicillin 500mg",
        category: "Antibiotic",
        stock: 120,
        price: 12,
        expiry: daysFromNow(20)
    },
    {
        name: "Vitamin C 500mg",
        category: "Vitamin",
        stock: 200,
        price: 8,
        expiry: daysFromNow(25)
    }
];

function getMedicines() {

    const saved = localStorage.getItem("pharmazsMedicines");

    if (saved) {
        return JSON.parse(saved);
    }

    localStorage.setItem(
        "pharmazsMedicines",
        JSON.stringify(defaultMedicines)
    );

    return defaultMedicines;
}

function saveMedicines(medicines) {
    localStorage.setItem("pharmazsMedicines", JSON.stringify(medicines));
}


// INVENTORY STATUS

function getStatus(medicine) {

    const today = new Date();
    const expiry = new Date(medicine.expiry + "T00:00:00");
    const difference = Math.ceil(
        (expiry - today) / (1000 * 60 * 60 * 24)
    );

    if (difference <= 30 && difference >= 0) {
        return {
            label: "Expiring Soon",
            className: "expiring-status"
        };
    }

    if (difference < 0) {
        return {
            label: "Expired",
            className: "low-status"
        };
    }

    if (medicine.stock <= 10) {
        return {
            label: "Low Stock",
            className: "low-status"
        };
    }

    return {
        label: "Available",
        className: "good-status"
    };
}


// DISPLAY MEDICINES

function renderMedicines(search = "") {

    const medicines = getMedicines();

    const table = document.getElementById("medicineTable");

    table.replaceChildren();

    const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(search.toLowerCase())
    );

    filtered.forEach(medicine => {

        const row = document.createElement("tr");

        const status = getStatus(medicine);

        const values = [
            medicine.name,
            medicine.category,
            medicine.stock,
            "₱" + Number(medicine.price).toFixed(2),
            medicine.expiry
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = status.className;
        badge.textContent = status.label;

        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        table.appendChild(row);

    });

    document.getElementById("totalMedicines").textContent =
        medicines.length;

    document.getElementById("lowStock").textContent =
        medicines.filter(item => item.stock <= 10).length;

    document.getElementById("expiringCount").textContent =
        medicines.filter(item => {
            const days = Math.ceil(
                (new Date(item.expiry + "T00:00:00") - new Date()) /
                (1000 * 60 * 60 * 24)
            );

            return days <= 30 && days >= 0;
        }).length;

}


// SEARCH

document.getElementById("searchMedicine").addEventListener("input", function() {
    renderMedicines(this.value);
});


// ADD MEDICINE MODAL

const modal = document.getElementById("medicineModal");

document.getElementById("addMedicineBtn").addEventListener("click", function() {
    modal.classList.remove("hidden");
});

document.getElementById("closeModal").addEventListener("click", function() {
    modal.classList.add("hidden");
});


// SAVE NEW MEDICINE

document.getElementById("medicineForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const medicine = {
        name: document.getElementById("newMedicineName").value.trim(),
        category: document.getElementById("newCategory").value.trim(),
        stock: Number(document.getElementById("newStock").value),
        price: Number(document.getElementById("newPrice").value),
        expiry: document.getElementById("newExpiry").value
    };

    if (
        !medicine.name ||
        !medicine.category ||
        !medicine.expiry ||
        !Number.isFinite(medicine.stock) ||
        !Number.isFinite(medicine.price) ||
        medicine.stock < 0 ||
        medicine.price < 0
    ) {
        alert("Please enter valid medicine information.");
        return;
    }

    const medicines = getMedicines();

    medicines.push(medicine);

    saveMedicines(medicines);

    renderMedicines();
    renderExpirationAlerts();

    this.reset();

    modal.classList.add("hidden");

    alert("Medicine successfully added to PHARMAZS!");
});


// EXPIRATION RISK DETECTION

function renderExpirationAlerts() {

    const medicines = getMedicines();

    const container = document.getElementById("expirationList");

    container.replaceChildren();

    const risky = medicines.filter(medicine => {

        const days = Math.ceil(
            (new Date(medicine.expiry + "T00:00:00") - new Date()) /
            (1000 * 60 * 60 * 24)
        );

        return days <= 30;
    });

    if (risky.length === 0) {

        const message = document.createElement("div");
        message.className = "panel";
        message.textContent = "No medicines are expiring within 30 days.";

        container.appendChild(message);
        return;
    }

    risky.forEach(medicine => {

        const days = Math.ceil(
            (new Date(medicine.expiry + "T00:00:00") - new Date()) /
            (1000 * 60 * 60 * 24)
        );

        const card = document.createElement("div");
        card.className = "expiration-card";

        const title = document.createElement("strong");
        title.textContent = medicine.name;

        const detail = document.createElement("p");

        detail.textContent = days < 0
            ? "Expired " + Math.abs(days) + " day(s) ago. Remove from sale and follow pharmacy disposal procedures."
            : "Expires in " + days + " day(s). Check stock and prioritize appropriate stock rotation.";

        card.append(title, detail);
        container.appendChild(card);

    });

}


// AI DEMAND FORECAST SIMULATION

document.getElementById("forecastBtn").addEventListener("click", function() {

    const medicine = document.getElementById("forecastMedicine").value;

    const result = document.getElementById("forecastResult");

    const predictions = {
        "Paracetamol 500mg": 28,
        "Amoxicillin 500mg": 15,
        "Vitamin C 500mg": 12
    };

    const increase = predictions[medicine];

    result.classList.remove("hidden");

    result.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = "Forecast Result";

    const name = document.createElement("p");
    name.textContent = "Medicine: " + medicine;

    const demand = document.createElement("p");
    demand.textContent = "Illustrative predicted demand increase: " + increase + "%";

    const recommendation = document.createElement("p");
    recommendation.textContent =
        "Recommendation: Review historical sales and current stock before ordering.";

    const note = document.createElement("small");
    note.textContent =
        "Demonstration only. This is a sample rule-based prediction, not an actual AI model.";

    result.append(heading, name, demand, recommendation, note);

});


// NAVIGATION ACTIVE STATE

document.querySelectorAll(".nav-link").forEach(link => {

    link.addEventListener("click", function() {

        document.querySelectorAll(".nav-link").forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");

    });

});