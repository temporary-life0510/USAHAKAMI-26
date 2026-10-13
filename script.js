// STATE DATA APLIKASI
let currentUser = null;
let currentSaldo = 50000; // Saldo awal simulasi
let transactionHistory = [];
let activeService = '';
let selectedNominal = 0;

// SIMULASI DATABASE USER REGISTER
let registeredUsers = [
    { name: "Pengguna Setia", phone: "08123456789", email: "user@usahakita.com", password: "123", saldo: 50000 }
];

// ELEMEN DOM
const headerGuest = document.getElementById('header-guest');
const headerUser = document.getElementById('header-user');
const userNameDisplay = document.getElementById('user-name-display');
const userPhoneDisplay = document.getElementById('user-phone-display');
const userSaldoDisplay = document.getElementById('user-saldo');
const accName = document.getElementById('acc-name');
const accPhone = document.getElementById('acc-phone');
const accEmail = document.getElementById('acc-email');

// NAVIGASI MENU BAWAH (Dashboard, Transaksi, Akun)
function switchTab(tabName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    if (tabName === 'dashboard') {
        document.getElementById('view-dashboard').classList.add('active');
        event.currentTarget.classList.add('active');
    } else if (tabName === 'transaksi') {
        document.getElementById('view-transaksi').classList.add('active');
        event.currentTarget.classList.add('active');
        renderHistory();
    } else if (tabName === 'akun') {
        if (!currentUser) {
            alert('Silakan login terlebih dahulu untuk mengakses menu Akun.');
            openAuthModal();
            return;
        }
        document.getElementById('view-akun').classList.add('active');
        event.currentTarget.classList.add('active');
    }
}

// MODAL AUTH
const authModal = document.getElementById('authModal');
const openAuthModalBtn = document.getElementById('openAuthModalBtn');
const closeAuthModalBtn = document.getElementById('closeAuthModal');

if (openAuthModalBtn) {
    openAuthModalBtn.addEventListener('click', () => {
        authModal.classList.add('show');
    });
}

function openAuthModal() {
    authModal.classList.add('show');
}

closeAuthModalBtn.addEventListener('click', () => {
    authModal.classList.remove('show');
});

function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabLoginBtn.classList.add('active');
        tabRegisterBtn.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabLoginBtn.classList.remove('active');
        tabRegisterBtn.classList.add('active');
    }
}

// PROSES REGISTER BARU (Wajib: No HP, Nama Lengkap, Email)
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const phone = document.getElementById('regPhone').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    const existing = registeredUsers.find(u => u.phone === phone);
    if (existing) {
        alert('Nomor HP sudah terdaftar. Silakan login.');
        switchAuthTab('login');
        return;
    }

    const newUser = { name, phone, email, password, saldo: 50000 };
    registeredUsers.push(newUser);
    
    alert('Registrasi akun berhasil! Silakan masuk.');
    switchAuthTab('login');
}

// PROSES LOGIN (No HP & Password)
function handleLogin(e) {
    e.preventDefault();
    const phone = document.getElementById('loginPhone').value;
    const password = document.getElementById('loginPassword').value;

    const user = registeredUsers.find(u => u.phone === phone && u.password === password);
    if (!user) {
        alert('Nomor HP atau Password salah!');
        return;
    }

    currentUser = user;
    currentSaldo = user.saldo;
    updateUIUser();
    authModal.classList.remove('show');
    alert(`Selamat datang, ${user.name}!`);
}

function updateUIUser() {
    if (currentUser) {
        headerGuest.classList.add('hidden');
        headerUser.classList.remove('hidden');
        userNameDisplay.textContent = currentUser.name;
        userPhoneDisplay.textContent = currentUser.phone;
        userSaldoDisplay.textContent = currentSaldo.toLocaleString('id-ID');

        accName.textContent = currentUser.name;
        accPhone.textContent = currentUser.phone;
        accEmail.textContent = currentUser.email;
    } else {
        headerGuest.classList.remove('hidden');
        headerUser.classList.add('hidden');
    }
}

// LOGOUT
function logoutAccount() {
    currentUser = null;
    updateUIUser();
    switchTab('dashboard');
    alert('Anda telah keluar dari akun.');
}

// MODAL LUPA / RESET PASSWORD
const forgotModal = document.getElementById('forgotModal');

function openForgotPasswordModal() {
    authModal.classList.remove('show');
    forgotModal.classList.add('show');
}

function closeForgotPasswordModal() {
    forgotModal.classList.remove('show');
}

function openResetPasswordModal() {
    forgotModal.classList.add('show');
}

function handleForgotPassword(e) {
    e.preventDefault();
    const target = document.getElementById('resetTarget').value;
    const method = document.getElementById('resetMethod').value;

    alert(`Tautan / kode reset password baru telah dikirimkan ke ${target} via ${method.toUpperCase()}.`);
    closeForgotPasswordModal();
}

// TOP UP SALDO KE ADMIN WA (082255886736)
document.getElementById('topupBtn').addEventListener('click', () => {
    const adminNumber = "6282255886736";
    const message = encodeURIComponent(`Halo Admin USAHAKITA, saya ingin melakukan pengisian saldo (Top Up). Nama: ${currentUser ? currentUser.name : 'Tamu'}, No HP: ${currentUser ? currentUser.phone : '-'}`);
    window.open(`https://wa.me/${adminNumber}?text=${message}`, '_blank');
});

// TRANSAKSI & PEMOTONGAN SALDO
const transactionModal = document.getElementById('transactionModal');

function openTransaction(serviceName) {
    if (!currentUser) {
        alert('Silakan login terlebih dahulu untuk melakukan transaksi.');
        openAuthModal();
        return;
    }

    activeService = serviceName;
    document.getElementById('modal-service-title').textContent = `Transaksi ${serviceName}`;
    
    const ewalletContainer = document.getElementById('ewalet-options-container');
    if (serviceName === 'E-Wallet') {
        ewalletContainer.classList.remove('hidden');
    } else {
        ewalletContainer.classList.add('hidden');
    }

    setupNominalOptions(serviceName);
    transactionModal.classList.add('show');
}

function closeTransactionModal() {
    transactionModal.classList.remove('show');
}

// 5 PILIHAN NOMINAL TRANSAKSI
function setupNominalOptions(service) {
    const nominalGrid = document.getElementById('nominal-options');
    nominalGrid.innerHTML = '';

    let nominals = [];
    if (service === 'Pulsa' || service === 'Paket Data') {
        nominals = [10000, 20000, 50000, 100000, 150000];
    } else if (service === 'Listrik Prabayar') {
        nominals = [20000, 50000, 100000, 200000, 500000];
    } else if (service === 'E-Wallet') {
        nominals = [15000, 25000, 50000, 100000, 200000];
    }

    nominals.forEach((amt, idx) => {
        const btn = document.createElement('div');
        btn.className = `nominal-btn ${idx === 0 ? 'selected' : ''}`;
        btn.textContent = `Rp ${amt.toLocaleString('id-ID')}`;
        btn.onclick = () => {
            document.querySelectorAll('.nominal-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedNominal = amt;
            document.getElementById('selected-nominal-display').textContent = selectedNominal.toLocaleString('id-ID');
        };
        nominalGrid.appendChild(btn);
    });

    selectedNominal = nominals[0];
    document.getElementById('selected-nominal-display').textContent = selectedNominal.toLocaleString('id-ID');
}

function processTransaction(e) {
    e.preventDefault();
    const targetNo = document.getElementById('trxTargetNo').value;
    let detailService = activeService;

    if (activeService === 'E-Wallet') {
        const ewalletType = document.querySelector('input[name="ewalletType"]:checked').value;
        detailService = `E-Wallet (${ewalletType})`;
    }

    // Cek saldo mencukupi atau tidak
    if (currentSaldo < selectedNominal) {
        alert('Saldo Anda tidak mencukupi! Silakan lakukan pengisian saldo melalui WhatsApp Admin: 082255886736.');
        return;
    }

    // Saldo dikurangi sesuai jumlah transaksi
    currentSaldo -= selectedNominal;
    currentUser.saldo = currentSaldo;
    userSaldoDisplay.textContent = currentSaldo.toLocaleString('id-ID');

    // Catat ke riwayat transaksi
    const newTrx = {
        title: `${detailService} - ${targetNo}`,
        date: new Date().toLocaleString('id-ID'),
        amount: selectedNominal
    };
    transactionHistory.unshift(newTrx);

    alert(`Transaksi ${detailService} senilai Rp ${selectedNominal.toLocaleString('id-ID')} berhasil! Saldo Anda telah dikurangi.`);
    closeTransactionModal();
    document.getElementById('trxTargetNo').value = '';
}

function renderHistory() {
    const historyList = document.getElementById('transaction-history-list');
    historyList.innerHTML = '';

    if (transactionHistory.length === 0) {
        historyList.innerHTML = `<p class="empty-text">Belum ada riwayat transaksi.</p>`;
        return;
    }

    transactionHistory.forEach(trx => {
        const item = document.createElement('div');
        item.className = 'trx-item';
        item.innerHTML = `
            <div class="trx-info">
                <h5>${trx.title}</h5>
                <p>${trx.date}</p>
            </div>
            <div class="trx-amount">-Rp ${trx.amount.toLocaleString('id-ID')}</div>
        `;
        historyList.appendChild(item);
    });
}
