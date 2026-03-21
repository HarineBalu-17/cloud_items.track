import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

// TODO: Replace with your app's actual Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Intentionally catch initialization errors for demo when default keys are used
let app, auth, db, storage;
let isFirebaseConfigured = false;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    if(firebaseConfig.apiKey !== "YOUR_API_KEY") {
        isFirebaseConfigured = true;
    }
} catch (e) {
    console.warn("Firebase not properly configured. Proceeding in mock mode.", e);
}

// DOM Elements
const authBtn = document.getElementById('authBtn');
const logoutBtn = document.getElementById('logoutBtn');
const reportLostBtn = document.getElementById('reportLostBtn');
const reportFoundBtn = document.getElementById('reportFoundBtn');

const reportModal = document.getElementById('reportModal');
const closeReportModal = document.getElementById('closeReportModal');
const modalTitle = document.getElementById('modalTitle');
const reportTypeInput = document.getElementById('reportType');
const reportForm = document.getElementById('reportForm');
const fileInput = document.getElementById('itemImage');
const fileLabel = document.querySelector('.file-label');

const authModal = document.getElementById('authModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const authForm = document.getElementById('authForm');
const tabLogin = document.getElementById('tabLogin');
const tabSignup = document.getElementById('tabSignup');

const searchInput = document.getElementById('searchInput');

let isLoginMode = true;
let currentUser = null;
let allItems = []; // Global cache for search & mock fallback

// Events - Modals
reportLostBtn.addEventListener('click', () => openReportModal('lost'));
reportFoundBtn.addEventListener('click', () => openReportModal('found'));
closeReportModal.addEventListener('click', () => reportModal.classList.add('hidden'));

authBtn.addEventListener('click', () => authModal.classList.remove('hidden'));
closeAuthModal.addEventListener('click', () => authModal.classList.add('hidden'));

fileInput.addEventListener('change', (e) => {
    if(e.target.files.length > 0) {
        fileLabel.textContent = e.target.files[0].name;
    } else {
        fileLabel.textContent = "Upload Image (Optional)";
    }
});

function openReportModal(type) {
    if (!currentUser && isFirebaseConfigured) {
        showToast('Please login to report an item', 'error');
        authModal.classList.remove('hidden');
        return;
    } else if (!isFirebaseConfigured) {
        // Allow mock usage without logging in
        showToast('Mock mode: Login not required', 'success');
    }
    
    reportTypeInput.value = type;
    modalTitle.textContent = type === 'lost' ? 'Report Lost Item' : 'Report Found Item';
    reportModal.classList.remove('hidden');
    reportForm.reset();
    fileLabel.textContent = "Upload Image (Optional)";
}

// Events - Auth Tabs
const signupOnlyFields = document.querySelectorAll('.signup-only');
const passwordHint = document.getElementById('passwordHint');
const passwordInput = document.getElementById('password');

function showSignupFields() {
    signupOnlyFields.forEach(el => el.classList.remove('hidden'));
    passwordHint.classList.remove('hidden');
    document.getElementById('fullName').required = true;
    document.getElementById('username').required = true;
}

function hideSignupFields() {
    signupOnlyFields.forEach(el => el.classList.add('hidden'));
    passwordHint.classList.add('hidden');
    document.getElementById('fullName').required = false;
    document.getElementById('username').required = false;
}

// Live password strength display
passwordInput.addEventListener('input', () => {
    if (!isLoginMode) {
        const val = passwordInput.value;
        updateHint('hintLength',  val.length >= 8);
        updateHint('hintUpper',   /[A-Z]/.test(val));
        updateHint('hintNumber',  /[0-9]/.test(val));
        updateHint('hintSpecial', /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val));
    }
});

function updateHint(id, isValid) {
    const el = document.getElementById(id);
    const baseText = {
        hintLength:  'Min. 8 characters',
        hintUpper:   'Uppercase letter',
        hintNumber:  'Number (0-9)',
        hintSpecial: 'Special character (!@#$%)'
    }[id];
    el.textContent = (isValid ? '✓ ' : '✗ ') + baseText;
    el.className = 'hint-item ' + (isValid ? 'valid' : 'invalid');
}

tabLogin.addEventListener('click', () => {
    isLoginMode = true;
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    document.getElementById('submitAuthBtn').textContent = 'Login';
    hideSignupFields();
});

tabSignup.addEventListener('click', () => {
    isLoginMode = false;
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    document.getElementById('submitAuthBtn').textContent = 'Sign Up';
    showSignupFields();
});

// Toast System
function showToast(message, type = 'success') {
    const toast = document.getElementById('notificationToast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Password validation for signup
function validateSignupPassword(password) {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[0-9]/.test(password) &&
           /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
}

// Authentication Logic
if (isFirebaseConfigured) {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        if (user) {
            authBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
        } else {
            authBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
        }
    });

    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            showToast('Logged out successfully');
        });
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const authMessage = document.getElementById('authMessage');
        const submitBtn = document.getElementById('submitAuthBtn');
        
        authMessage.textContent = '';

        if (!isLoginMode && !validateSignupPassword(password)) {
            authMessage.textContent = 'Password must be 8+ chars, with uppercase, number, and a special character.';
            authMessage.className = 'form-message';
            return;
        }

        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';

        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
                showToast('Logged in successfully!');
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                showToast('Account created successfully!');
            }
            authModal.classList.add('hidden');
            authForm.reset();
            hideSignupFields();
        } catch (error) {
            authMessage.textContent = error.message;
            authMessage.className = 'form-message';
        } finally {
            submitBtn.textContent = originalText;
        }
    });
} else {
    // Mock Auth
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const authMessage = document.getElementById('authMessage');

        if (!isLoginMode && !validateSignupPassword(password)) {
            authMessage.textContent = 'Password must be 8+ chars, with uppercase, number, and a special character.';
            authMessage.className = 'form-message';
            return;
        }
        showToast(isLoginMode ? 'Mock login successful!' : 'Mock account created!', 'success');
        authModal.classList.add('hidden');
        authForm.reset();
        hideSignupFields();
    });
}


// Submit Report logic
reportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser && isFirebaseConfigured) {
        showToast('You must be logged in', 'error');
        return;
    }

    const submitBtn = document.getElementById('submitReportBtn');
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    const type = document.getElementById('reportType').value;
    const itemName = document.getElementById('itemName').value;
    const description = document.getElementById('itemDescription').value;
    const locationStr = document.getElementById('itemLocation').value;
    const date = document.getElementById('itemDate').value;
    const contact = document.getElementById('contactInfo').value;
    const file = fileInput.files[0];

    try {
        if (!isFirebaseConfigured) throw new Error("mock");
        
        let imageUrl = null;

        if (file) {
            const storageRef = ref(storage, 'images/' + Date.now() + '_' + file.name);
            const uploadTask = await uploadBytesResumable(storageRef, file);
            imageUrl = await getDownloadURL(uploadTask.ref);
        }

        await addDoc(collection(db, "items"), {
            type,
            itemName,
            description,
            location: locationStr,
            date,
            contact,
            imageUrl,
            userId: currentUser.uid,
            createdAt: serverTimestamp()
        });

        reportModal.classList.add('hidden');
        reportForm.reset();
        showToast(`${type === 'lost' ? 'Lost' : 'Found'} item reported successfully!`);
        fetchItems(); // Reload
    } catch (error) {
        // Mock fallback mechanism
        if (error.message === "mock" || (error.code && error.code.includes('auth'))) {
            console.log("Saving locally to mock display array");
            
            // Allow basic local picture reader for mock mode if file exists
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                   mockSaveItem(type, itemName, description, locationStr, date, contact, e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                 mockSaveItem(type, itemName, description, locationStr, date, contact, null);
            }
            reportModal.classList.add('hidden');
            reportForm.reset();
        } else {
            console.error(error);
            showToast('Error: ' + error.message, 'error');
        }
    } finally {
        submitBtn.textContent = 'Submit Report';
        submitBtn.disabled = false;
    }
});

// Fetch and Display Items
async function fetchItems() {
    try {
        if (!isFirebaseConfigured) throw new Error("mock");
        const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        allItems = [];
        querySnapshot.forEach((doc) => {
            allItems.push({ id: doc.id, ...doc.data() });
        });
        renderItems(allItems);
    } catch (error) {
        if(allItems.length === 0) populateMockData();
        renderItems(allItems);
    }
}

// Render dynamic HTML items payload
function renderItems(itemsToRender) {
    const lostGrid = document.getElementById('lostItemsGrid');
    const foundGrid = document.getElementById('foundItemsGrid');
    
    let lostHTML = '';
    let foundHTML = '';
    let lostCount = 0;
    let foundCount = 0;

    itemsToRender.forEach(item => {
        // svg icons
        const locIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
        const dateIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
        const contactIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
        
        const cardHTML = `
            <div class="item-card">
                ${item.imageUrl 
                    ? `<img src="${item.imageUrl}" alt="${item.itemName}" class="item-image">`
                    : `<div class="item-image-placeholder">📷</div>`
                }
                <div class="item-content">
                    <div class="item-type ${item.type === 'lost' ? 'type-lost' : 'type-found'}">
                        ${item.type.toUpperCase()}
                    </div>
                    <h3 class="item-title">${item.itemName}</h3>
                    <p class="item-desc">${item.description}</p>
                    <div class="item-meta">
                        <div class="meta-row">${locIcon} ${item.location}</div>
                        <div class="meta-row">${dateIcon} ${item.date}</div>
                        <div class="meta-row">${contactIcon} ${item.contact}</div>
                    </div>
                </div>
            </div>
        `;

        if (item.type === 'lost') {
            lostHTML += cardHTML;
            lostCount++;
        } else {
            foundHTML += cardHTML;
            foundCount++;
        }
    });

    lostGrid.innerHTML = lostHTML || '<div class="empty-state">No lost items to display.</div>';
    foundGrid.innerHTML = foundHTML || '<div class="empty-state">No found items to display.</div>';
    
    document.getElementById('lostCount').textContent = lostCount;
    document.getElementById('foundCount').textContent = foundCount;
}

// Enhanced Search Filters
const inputLocation = document.getElementById('searchLocation');
const inputItem = document.getElementById('searchItem');
const activeFilter = document.getElementById('activeFilter');
const filterText = document.getElementById('filterText');

window.filterByLocation = () => {
    const term = inputLocation.value.toLowerCase().trim();
    if (!term) return;
    
    // Clear other input
    inputItem.value = '';
    
    const filtered = allItems.filter(item => item.location.toLowerCase().includes(term));
    renderItems(filtered);
    
    showActiveFilter(`📍 Location: "${term}"`);
};

window.filterByItem = () => {
    const term = inputItem.value.toLowerCase().trim();
    if (!term) return;
    
    // Clear other input
    inputLocation.value = '';
    
    const filtered = allItems.filter(item => 
        item.itemName.toLowerCase().includes(term) || 
        item.description.toLowerCase().includes(term)
    );
    renderItems(filtered);
    
    showActiveFilter(`🔍 Item: "${term}"`);
};

window.clearSearch = () => {
    inputLocation.value = '';
    inputItem.value = '';
    activeFilter.classList.add('hidden');
    renderItems(allItems);
};

function showActiveFilter(text) {
    filterText.textContent = text;
    activeFilter.classList.remove('hidden');
    // Scroll down slightly to results
    document.getElementById('lost-items').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Allow Enter key to submit search
inputLocation.addEventListener('keypress', (e) => { if (e.key === 'Enter') filterByLocation(); });
inputItem.addEventListener('keypress', (e) => { if (e.key === 'Enter') filterByItem(); });

// Mock Logic fallback when Firebase is not setup by User
function populateMockData() {
    allItems = [
        {
            id: 'm1', type: 'lost', itemName: 'Wireless Headphones',
            description: 'Sony WH-1000XM4, black color in a hard case. Left it near the computers.',
            location: 'Main Library, 2nd Floor', date: '2026-03-10', contact: 'user@example.com',
            imageUrl: 'Headphone_img.jpeg'
        },
        {
            id: 'm2', type: 'found', itemName: 'Water Bottle',
            description: 'Blue Hydroflask with several tech stickers on it.',
            location: 'Cafeteria near the entrance', date: '2026-03-12', contact: '555-0192',
            imageUrl: 'Waterbottle_img.jpeg'
        }
    ];
}

function mockSaveItem(type, itemName, description, locationStr, date, contact, imageUrl) {
    const newItem = {
        id: 'm' + Date.now(),
        type, itemName, description,
        location: locationStr, date, contact, imageUrl
    };
    allItems.unshift(newItem); // prepending newest at top
    showToast(`${type === 'lost' ? 'Lost' : 'Found'} item uploaded successfully!`);
    renderItems(allItems);
}

// Initial Data Pull
fetchItems();
