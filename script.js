// js halaman
const ruteData = [
  { dari:"Banda Aceh", ke:"Medan", harga:"Rp 135.000", durasi:"8 jam", kelas:"Ekonomi AC" },
  { dari:"Medan", ke:"Jakarta", harga:"Rp 280.000", durasi:"24 jam", kelas:"VIP Sleeper" },
  { dari:"Jakarta", ke:"Surabaya", harga:"Rp 175.000", durasi:"12 jam", kelas:"Eksekutif" },
  { dari:"Surabaya", ke:"Bali", harga:"Rp 120.000", durasi:"5 jam", kelas:"Ekonomi AC" },
  { dari:"Padang", ke:"Pekanbaru", harga:"Rp 95.000", durasi:"6 jam", kelas:"Ekonomi AC" },
  { dari:"Makassar", ke:"Pare-Pare", harga:"Rp 75.000", durasi:"4 jam", kelas:"Ekonomi AC" },
];

function renderRuteCards() {
  const wrap = document.getElementById('ruteCards');
  wrap.innerHTML = ruteData.map(r => `
    <div class="card">
      <div class="card-body" style="padding:1.3rem;">
        <span class="card-tag">${r.kelas}</span>
        <h3 style="font-size:1.05rem;">${r.dari} → ${r.ke}</h3>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:.8rem;">
          <div>
            <div style="font-size:1.2rem; font-weight:800; color:var(--accent);">${r.harga}</div>
            <div style="font-size:.78rem; color:var(--muted);">⏱ ${r.durasi}</div>
          </div>
          <a href="pesananTiket.html" class="btn btn-outline btn-sm">Pesan</a>
        </div>
      </div>
    </div>
  `).join('');
}

// ========== Counter Animasi ==========
function animateCounter(id, target, suffix = '', decimals = 0) {
  let start = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    document.getElementById(id).textContent = decimals
      ? start.toFixed(decimals) + suffix
      : Math.floor(start).toLocaleString('id') + suffix;
  }, 25);
}

// ========== Cari Tiket ==========
function cariTiket(e) {
  e.preventDefault();
  const asal = document.getElementById('asalKota').value;
  const tujuan = document.getElementById('tujuanKota').value;
  if (asal === tujuan) {
    showToast('⚠️ Kota asal dan tujuan tidak boleh sama!');
    return;
  }
  window.location.href = `pesananTiket.html?dari=${encodeURIComponent(asal)}&ke=${encodeURIComponent(tujuan)}`;
}

// ========== Toast ==========
function showToast(msg) {
  const t = document.getElementById('toastMsg');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ========== Set tanggal min (halaman.html only) ==========
if (document.getElementById('tglBerangkat')) {
  document.getElementById('tglBerangkat').min = new Date().toISOString().split('T')[0];
}

// ========== Init (halaman.html only) ==========
if (document.getElementById('ruteCards')) {
  renderRuteCards();
}

// Jalankan counter saat elemen masuk viewport (halaman.html only)
if (document.getElementById('statPenumpang')) {
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animateCounter('statPenumpang', 48500, '+');
      animateCounter('statRute', 520, '+');
      animateCounter('statArmada', 210, '+');
      animateCounter('statRating', 4.8, '⭐', 1);
      observer.disconnect();
    }
  });
  observer.observe(document.getElementById('statPenumpang'));
}



// pesanan tiket

// ============== CONFIG ==============
const HARGA = { ekonomi: 80000, eksekutif: 150000, vip: 250000 };
const PROMO = { 'BUSHEMAT30': .30, 'HEMAT10': .10, 'NEWUSER': .15 };
let jumlahPenumpang = 1;
let kursiDipilih = [];
let kursiTerpesan = [3, 7, 12, 18, 24]; // index seat terpesan
let diskonPersen = 0;

// ============== UTILS ==============
function fmt(n) { return 'Rp ' + n.toLocaleString('id'); }
function showToast(msg) {
  const t = document.getElementById('toastMsg');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}
function setStep(n) {
  for (let i = 1; i <= 4; i++) {
    const ind = document.getElementById('step'+i+'Ind');
    ind.classList.remove('active','done');
    if (i < n) ind.classList.add('done');
    else if (i === n) ind.classList.add('active');
  }
  for (let i = 1; i <= 5; i++) {
    document.getElementById('panel'+i).style.display = i === n ? 'block' : 'none';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============== COUNTER PENUMPANG ==============
function ubahPenumpang(delta) {
  jumlahPenumpang = Math.min(4, Math.max(1, jumlahPenumpang + delta));
  document.getElementById('jmlPenumpang').textContent = jumlahPenumpang;
  kursiDipilih = [];
  hitungHarga();
  updateSummary();
}

// ============== HARGA ==============
function hitungHarga() {
  const kelas = document.getElementById('kelasLayanan').value;
  const asal  = document.getElementById('kotaAsal').value;
  const tujuan= document.getElementById('kotaTujuan').value;
  const tgl   = document.getElementById('tanggalBrgkt').value;

  const kelasLabel = { ekonomi:'Ekonomi AC', eksekutif:'Eksekutif', vip:'VIP Sleeper' };
  const hargaSatuan = kelas ? HARGA[kelas] : 0;
  const total = hargaSatuan * jumlahPenumpang;
  const diskon = Math.round(total * diskonPersen);
  const bayar = total - diskon;

  document.getElementById('sumRute').textContent      = (asal && tujuan) ? `${asal} → ${tujuan}` : '–';
  document.getElementById('sumTanggal').textContent   = tgl ? new Date(tgl).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) : '–';
  document.getElementById('sumKelas').textContent     = kelas ? kelasLabel[kelas] : '–';
  document.getElementById('sumPenumpang').textContent = jumlahPenumpang + ' orang';
  document.getElementById('sumHargaSatuan').textContent = hargaSatuan ? fmt(hargaSatuan) : '–';
  document.getElementById('sumDiskon').textContent    = diskon > 0 ? '−' + fmt(diskon) : 'Rp 0';
  document.getElementById('sumTotal').textContent     = bayar > 0 ? fmt(bayar) : '–';
  renderTabelDetailPesanan();
}

function updateSummary() {
  hitungHarga();
  document.getElementById('sumKursi').textContent = kursiDipilih.length ? kursiDipilih.join(', ') : '–';
}

// ============== PROMO ==============
function terapkanPromo() {
  const kode = document.getElementById('kodePromo').value.trim().toUpperCase();
  const info = document.getElementById('promoInfo');
  if (PROMO[kode]) {
    diskonPersen = PROMO[kode];
    info.innerHTML = `<span style="color:var(--success);">✅ Promo berhasil! Diskon ${diskonPersen*100}% diterapkan.</span>`;
    showToast('🎉 Kode promo berhasil diterapkan!');
  } else {
    diskonPersen = 0;
    info.innerHTML = `<span style="color:var(--danger);">❌ Kode promo tidak valid atau sudah kadaluarsa.</span>`;
  }
  hitungHarga();
}

// ============== SEAT PICKER ==============
function renderSeat() {
  const grid = document.getElementById('seatGrid');
  const layout = [
    ['A1','A2',null,'A3','A4'],
    ['B1','B2',null,'B3','B4'],
    ['C1','C2',null,'C3','C4'],
    ['D1','D2',null,'D3','D4'],
    ['E1','E2',null,'E3','E4'],
    ['F1','F2',null,'F3','F4'],
    ['G1','G2',null,'G3','G4'],
  ];
  let idx = 0;
  grid.innerHTML = layout.map(row => {
    return '<div class="seat-row">' + row.map(seat => {
      if (!seat) return '<div class="seat-aisle"></div>';
      const i = idx++;
      const isBooked = kursiTerpesan.includes(i);
      const isSelected = kursiDipilih.includes(seat);
      const cls = isBooked ? 'booked' : isSelected ? 'selected' : 'available';
      return `<div class="seat ${cls}" id="seat-${seat}" onclick="toggleSeat('${seat}',${isBooked})">${seat}</div>`;
    }).join('') + '</div>';
  }).join('');
}

function toggleSeat(id, booked) {
  if (booked) { showToast('⚠️ Kursi ini sudah dipesan.'); return; }
  const idx = kursiDipilih.indexOf(id);
  if (idx > -1) {
    kursiDipilih.splice(idx, 1);
  } else {
    if (kursiDipilih.length >= jumlahPenumpang) {
      showToast(`⚠️ Anda hanya bisa memilih ${jumlahPenumpang} kursi.`);
      return;
    }
    kursiDipilih.push(id);
  }
  renderSeat();
  const info = document.getElementById('seatInfo');
  info.textContent = kursiDipilih.length
    ? `Kursi terpilih: ${kursiDipilih.join(', ')} (${kursiDipilih.length}/${jumlahPenumpang})`
    : 'Belum ada kursi dipilih.';
  updateSummary();
}

// ============== FORM PENUMPANG DINAMIS ==============
function renderFormPenumpang() {
  const wrap = document.getElementById('formPenumpangWrap');
  wrap.innerHTML = Array.from({length: jumlahPenumpang}, (_, i) => `
    <div style="border:1.5px solid var(--border); border-radius:8px; padding:1.1rem; margin-bottom:1rem;">
      <div style="font-weight:700; font-size:.92rem; color:var(--primary); margin-bottom:.8rem;">Penumpang ${i+1} ${kursiDipilih[i] ? '– Kursi ' + kursiDipilih[i] : ''}</div>
      <div class="form-row">
        <div class="form-group">
          <label>Nama Lengkap <span class="req">*</span></label>
          <input type="text" class="form-control" id="nama_${i}" placeholder="Sesuai KTP"/>
        </div>
        <div class="form-group">
          <label>No. KTP / Identitas <span class="req">*</span></label>
          <input type="text" class="form-control" id="ktp_${i}" maxlength="16" placeholder="16 digit"/>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Jenis Kelamin</label>
          <select class="form-control" id="jk_${i}">
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
        <div class="form-group">
          <label>Tanggal Lahir</label>
          <input type="date" class="form-control" id="tl_${i}"/>
        </div>
      </div>
    </div>
  `).join('');
}

// ============== VALIDASI & NAVIGASI STEP ==============
function lanjutStep2() {
  const asal   = document.getElementById('kotaAsal').value;
  const tujuan = document.getElementById('kotaTujuan').value;
  const tgl    = document.getElementById('tanggalBrgkt').value;
  const kelas  = document.getElementById('kelasLayanan').value;
  let ok = true;

  const show = (id, show) => { document.getElementById(id).classList.toggle('show', show); };
  const markErr = (id, err) => { document.getElementById(id).classList.toggle('error', err); };

  show('err-asal',  !asal);   markErr('kotaAsal',  !asal);
  show('err-tujuan',!tujuan); markErr('kotaTujuan',!tujuan);
  show('err-tgl',   !tgl);    markErr('tanggalBrgkt',!tgl);
  show('err-kelas', !kelas);  markErr('kelasLayanan',!kelas);
  if (!asal || !tujuan || !tgl || !kelas) ok = false;

  if (asal && tujuan && asal === tujuan) {
    showToast('⚠️ Kota asal dan tujuan tidak boleh sama!');
    ok = false;
  }

  if (ok) { renderSeat(); setStep(2); }
}

function lanjutStep3() {
  if (kursiDipilih.length < jumlahPenumpang) {
    showToast(`⚠️ Pilih ${jumlahPenumpang} kursi terlebih dahulu.`);
    return;
  }
  renderFormPenumpang();
  setStep(3);
}

function lanjutStep4() {
  const email = document.getElementById('emailPemesan').value;
  const wa    = document.getElementById('noWA').value;
  const bayar = document.getElementById('metodeBayar').value;
  let ok = true;

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  document.getElementById('err-email').classList.toggle('show', !emailValid);
  document.getElementById('emailPemesan').classList.toggle('error', !emailValid);
  if (!emailValid) ok = false;

  const waValid = /^08[0-9]{8,12}$/.test(wa);
  document.getElementById('err-wa').classList.toggle('show', !waValid);
  document.getElementById('noWA').classList.toggle('error', !waValid);
  if (!waValid) ok = false;

  const bayarValid = bayar !== '';
  document.getElementById('err-bayar').classList.toggle('show', !bayarValid);
  if (!bayarValid) ok = false;

  // cek nama penumpang
  for (let i = 0; i < jumlahPenumpang; i++) {
    const nama = document.getElementById('nama_'+i)?.value;
    if (!nama) { showToast('⚠️ Nama penumpang ' + (i+1) + ' harus diisi.'); ok = false; break; }
  }

  if (!ok) return;
  renderTabelDetailPesanan();

  // buat konfirmasi
  const kelas = document.getElementById('kelasLayanan').value;
  const kelasLabel = { ekonomi:'Ekonomi AC', eksekutif:'Eksekutif', vip:'VIP Sleeper' };
  const hargaSatuan = HARGA[kelas];
  const total  = hargaSatuan * jumlahPenumpang;
  const diskon = Math.round(total * diskonPersen);
  const bayarTotal = total - diskon;
  const namaList = Array.from({length:jumlahPenumpang}, (_,i) => document.getElementById('nama_'+i).value);
  const metodeLabel = { qris:'QRIS', bni:'Transfer BNI', bca:'Transfer BCA', mandiri:'Transfer Mandiri', gopay:'GoPay', ovo:'OVO' };

  document.getElementById('konfirmasiDetail').innerHTML = `
    <div class="alert alert-info" style="margin-bottom:1rem;">Harap periksa kembali detail pesanan Anda sebelum membayar.</div>
    <div class="order-summary">
      <h4>Detail Perjalanan</h4>
      <div class="summary-row"><span>Rute</span><span style="font-weight:600;">${document.getElementById('kotaAsal').value} → ${document.getElementById('kotaTujuan').value}</span></div>
      <div class="summary-row"><span>Tanggal</span><span>${new Date(document.getElementById('tanggalBrgkt').value).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span></div>
      <div class="summary-row"><span>Kelas</span><span>${kelasLabel[kelas]}</span></div>
      <div class="summary-row"><span>Kursi</span><span>${kursiDipilih.join(', ')}</span></div>
      <div class="summary-row"><span>Penumpang</span><span>${namaList.join(', ')}</span></div>
      <div class="summary-row"><span>Email</span><span>${email}</span></div>
      <div class="summary-row"><span>WhatsApp</span><span>${wa}</span></div>
      <div class="summary-row"><span>Pembayaran</span><span>${metodeLabel[bayar]}</span></div>
      ${diskon > 0 ? `<div class="summary-row"><span>Diskon (${diskonPersen*100}%)</span><span style="color:var(--success);">−${fmt(diskon)}</span></div>` : ''}
      <div class="summary-row total"><span>Total Bayar</span><span style="color:var(--accent);">${fmt(bayarTotal)}</span></div>
    </div>
  `;
  setStep(4);
}

function kembaliStep(n) { setStep(n); }

function bayarSekarang() {
  const kode = 'BN-' + Math.random().toString(36).toUpperCase().slice(2,8);
  document.getElementById('kodeBooking').textContent = kode;
  document.getElementById('panel4').style.display = 'none';
  document.getElementById('panel5').style.display = 'block';
  // Update step semua done
  for (let i = 1; i <= 4; i++) {
    document.getElementById('step'+i+'Ind').classList.remove('active');
    document.getElementById('step'+i+'Ind').classList.add('done');
  }
  showToast('🎉 Pembayaran berhasil! Tiket dikirim ke email Anda.');
}

// ============== TABEL DETAIL PESANAN ==============
function renderTabelDetailPesanan() {
  const tbody = document.getElementById('tabelDetailPesanan');
  if (!tbody) return;

  const asal    = document.getElementById('kotaAsal')?.value;
  const tujuan  = document.getElementById('kotaTujuan')?.value;
  const tgl     = document.getElementById('tanggalBrgkt')?.value;
  const kelas   = document.getElementById('kelasLayanan')?.value;
  const bayar   = document.getElementById('metodeBayar')?.value;
  const email   = document.getElementById('emailPemesan')?.value;
  const wa      = document.getElementById('noWA')?.value;

  const kelasLabel   = { ekonomi:'Ekonomi AC', eksekutif:'Eksekutif', vip:'VIP Sleeper' };
  const metodeLabel  = { qris:'QRIS', bni:'Transfer BNI', bca:'Transfer BCA', mandiri:'Transfer Mandiri', gopay:'GoPay', ovo:'OVO' };
  const hargaSatuan  = kelas ? HARGA[kelas] : 0;
  const total        = hargaSatuan * jumlahPenumpang;
  const diskon       = Math.round(total * diskonPersen);
  const bayarTotal   = total - diskon;

  const tglFmt = tgl
    ? new Date(tgl).toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    : null;

  const rows = [
    { label: '🗺️ Rute',         value: asal && tujuan ? `${asal} → ${tujuan}` : null },
    { label: '📅 Tanggal',       value: tglFmt },
    { label: '💺 Kelas',         value: kelas ? kelasLabel[kelas] : null },
    { label: '👥 Penumpang',     value: `${jumlahPenumpang} orang` },
    { label: '🪑 Kursi',         value: kursiDipilih.length ? kursiDipilih.join(', ') : null },
    { label: '💰 Harga/kursi',   value: hargaSatuan ? fmt(hargaSatuan) : null },
    { label: '🏷️ Diskon',        value: diskon > 0 ? `−${fmt(diskon)} (${diskonPersen*100}%)` : 'Rp 0', discount: diskon > 0 },
    { label: '💳 Pembayaran',    value: bayar ? metodeLabel[bayar] : null },
    { label: '📧 Email',         value: email || null },
    { label: '📱 WhatsApp',      value: wa || null },
    { label: '🧾 Total Bayar',   value: bayarTotal > 0 ? fmt(bayarTotal) : null, isTotal: true },
  ];

  const hasAnyValue = rows.some(r => r.value !== null && r.value !== 'Rp 0');

  if (!hasAnyValue) {
    tbody.innerHTML = `<tr><td colspan="2" style="text-align:center; color:var(--muted); font-size:.85rem; padding:1rem;">Isi form untuk melihat detail pesanan</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => {
    if (!r.value || (!r.isTotal && !r.discount && r.value === 'Rp 0')) return '';
    const valStyle = r.isTotal
      ? 'font-weight:800; color:var(--accent); font-size:1rem;'
      : r.discount
        ? 'color:var(--success); font-weight:600;'
        : 'font-weight:600;';
    const rowStyle = r.isTotal ? 'background:var(--light);' : '';
    return `
      <tr style="${rowStyle}">
        <td style="color:var(--muted); font-size:.85rem; width:45%;">${r.label}</td>
        <td style="${valStyle} font-size:.88rem;">${r.value}</td>
      </tr>`;
  }).join('');
}

// ============== INIT (pesananTiket.html only) ==============
if (document.getElementById('tanggalBrgkt')) {
  document.getElementById('tanggalBrgkt').min = new Date().toISOString().split('T')[0];
}

// Ambil query params dari halaman beranda
if (document.getElementById('kotaAsal')) {
  const params = new URLSearchParams(window.location.search);
  if (params.get('dari')) {
    const sel = document.getElementById('kotaAsal');
    [...sel.options].forEach(o => { if (o.text === params.get('dari')) o.selected = true; });
  }
  if (params.get('ke')) {
    const sel = document.getElementById('kotaTujuan');
    [...sel.options].forEach(o => { if (o.text === params.get('ke')) o.selected = true; });
  }
  hitungHarga();

  // Update tabel detail saat input Step 3 berubah (delegasi event)
  document.addEventListener('change', function(e) {
    if (['emailPemesan','noWA','metodeBayar'].includes(e.target.id)) {
      renderTabelDetailPesanan();
    }
  });
  document.addEventListener('input', function(e) {
    if (['emailPemesan','noWA'].includes(e.target.id)) {
      renderTabelDetailPesanan();
    }
  });
}


// berita js
// ======= DATA BERITA =======
const beritaData = [
  {
    judul: "Armada Bus Baru Beroperasi di Rute Aceh–Medan",
    ringkasan: "BusNusantara meluncurkan 10 unit bus VIP Sleeper terbaru dengan fasilitas premium untuk rute Banda Aceh–Medan mulai bulan ini.",
    tanggal: "5 Juni 2025",
    kategori: "Armada",
    emoji: "🚌"
  },
  {
    judul: "Diskon Spesial Lebaran 30% Untuk Semua Rute",
    ringkasan: "Rayakan Lebaran dengan perjalanan hemat! Dapatkan diskon 30% untuk pemesanan tiket dengan kode BUSHEMAT30 hingga 10 Juni 2025.",
    tanggal: "20 Mei 2025",
    kategori: "Promo",
    emoji: "🎉"
  },
  {
    judul: "Peluncuran Fitur Lacak Bus Real-Time",
    ringkasan: "Kini Anda bisa memantau posisi bus secara langsung melalui aplikasi dan website BusNusantara. Tidak perlu menunggu lama di terminal.",
    tanggal: "1 Mei 2025",
    kategori: "Operasional",
    emoji: "📍"
  },
  {
    judul: "Perubahan Jadwal Rute Jakarta–Surabaya",
    ringkasan: "Mulai 15 Juni 2025, jadwal keberangkatan rute Jakarta–Surabaya mengalami penyesuaian. Harap cek jadwal terbaru sebelum memesan.",
    tanggal: "12 April 2025",
    kategori: "Operasional",
    emoji: "🕐"
  },
  {
    judul: "Kebijakan Baru Reschedule Tiket Tanpa Biaya",
    ringkasan: "BusNusantara memberlakukan kebijakan reschedule gratis hingga 2 jam sebelum keberangkatan untuk semua kelas layanan.",
    tanggal: "3 April 2025",
    kategori: "Kebijakan",
    emoji: "📋"
  },
  {
    judul: "Tambah Rute Baru: Makassar–Pare-Pare",
    ringkasan: "Mulai April 2025, BusNusantara membuka rute baru Makassar–Pare-Pare dengan 3 jadwal keberangkatan setiap harinya.",
    tanggal: "28 Maret 2025",
    kategori: "Operasional",
    emoji: "🗺️"
  },
];

// ======= DATA PENGUMUMAN =======
const pengumumanData = [
  { judul:"Diskon Hari Kemerdekaan 20% Semua Rute", kategori:"Promo", tanggal:"2025-08-01", status:"Akan Datang" },
  { judul:"Armada Bus Baru Rute Aceh–Medan Beroperasi", kategori:"Armada", tanggal:"2025-06-05", status:"Aktif" },
  { judul:"Diskon Lebaran 30% Semua Rute", kategori:"Promo", tanggal:"2025-05-20", status:"Berakhir" },
  { judul:"Fitur Lacak Bus Real-Time Diluncurkan", kategori:"Operasional", tanggal:"2025-05-01", status:"Aktif" },
  { judul:"Reschedule Gratis Diberlakukan Mulai April 2025", kategori:"Kebijakan", tanggal:"2025-04-03", status:"Aktif" },
  { judul:"Rute Baru Makassar–Pare-Pare Dibuka", kategori:"Operasional", tanggal:"2025-03-28", status:"Aktif" },
  { judul:"Promo Akhir Tahun 25% Untuk Member", kategori:"Promo", tanggal:"2024-12-20", status:"Berakhir" },
  { judul:"Perubahan Terminal Keberangkatan Yogyakarta", kategori:"Operasional", tanggal:"2024-11-15", status:"Berakhir" },
  { judul:"Peluncuran Program Loyalitas BusPoints", kategori:"Kebijakan", tanggal:"2024-10-01", status:"Aktif" },
  { judul:"Renovasi Bus Kelas VIP Selesai", kategori:"Armada", tanggal:"2024-09-10", status:"Berakhir" },
  { judul:"Kerjasama dengan GoPay dan OVO Resmi", kategori:"Kebijakan", tanggal:"2024-08-05", status:"Aktif" },
  { judul:"Promo Double Miles Akhir Pekan", kategori:"Promo", tanggal:"2024-07-01", status:"Berakhir" },
];

// ======= STATE =======
let filteredData = [...pengumumanData];
let sortKey = '';
let sortAsc = true;
let currentPage = 1;
const perPage = 6;

// ======= RENDER BERITA =======
function renderBerita() {
  const grid = document.getElementById('beritaGrid');
  grid.innerHTML = beritaData.map(b => `
    <div class="berita-card">
      <div style="background:linear-gradient(135deg,var(--primary),#0f2540); height:160px; display:flex; align-items:center; justify-content:center; font-size:4rem;">${b.emoji}</div>
      <div class="berita-body">
        <span class="card-tag">${b.kategori}</span>
        <h3>${b.judul}</h3>
        <p>${b.ringkasan}</p>
        <div class="berita-meta">
          <span>📅 ${b.tanggal}</span>
          <a href="#" style="color:var(--accent); font-weight:600;" onclick="bukaBerita('${encodeURIComponent(JSON.stringify(b))}'); return false;">Baca →</a>
        </div>
      </div>
    </div>
  `).join('');
}

// ======= RENDER TABEL =======
function renderTabel() {
  const tbody = document.getElementById('tabelBody');
  const foot  = document.getElementById('tabelFoot');
  const start = (currentPage - 1) * perPage;
  const slice = filteredData.slice(start, start + perPage);

  if (slice.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--muted);">Tidak ada pengumuman ditemukan.</td></tr>`;
    foot.textContent = 'Tidak ada data.';
    renderPaginasi();
    return;
  }

  const badgeMap = { Aktif:'badge-success', Berakhir:'badge-danger', 'Akan Datang':'badge-info' };

  tbody.innerHTML = slice.map((d, i) => `
    <tr>
      <td style="color:var(--muted); font-size:.82rem;">${start + i + 1}</td>
      <td style="font-weight:600; max-width:280px;">${d.judul}</td>
      <td><span class="badge badge-info">${d.kategori}</span></td>
      <td>${new Date(d.tanggal).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</td>
      <td><span class="badge ${badgeMap[d.status]}">${d.status}</span></td>
      <td><button class="btn btn-outline btn-sm" onclick="lihatDetail(${pengumumanData.indexOf(d)})">Detail</button></td>
    </tr>
  `).join('');

  foot.textContent = `Menampilkan ${start+1}–${Math.min(start+perPage, filteredData.length)} dari ${filteredData.length} pengumuman`;
  document.getElementById('jumlahHasil').textContent = `${filteredData.length} hasil`;
  renderPaginasi();
}

// ======= FILTER =======
function filterTabel() {
  const q = document.getElementById('searchPengumuman').value.toLowerCase();
  const kat = document.getElementById('filterKategori').value;
  const stat = document.getElementById('filterStatus').value;
  filteredData = pengumumanData.filter(d => {
    return (!q || d.judul.toLowerCase().includes(q) || d.kategori.toLowerCase().includes(q))
      && (!kat || d.kategori === kat)
      && (!stat || d.status === stat);
  });
  currentPage = 1;
  renderTabel();
}

function resetFilter() {
  document.getElementById('searchPengumuman').value = '';
  document.getElementById('filterKategori').value = '';
  document.getElementById('filterStatus').value = '';
  filteredData = [...pengumumanData];
  currentPage = 1;
  renderTabel();
}

// ======= SORT =======
function sortTabel(key) {
  if (sortKey === key) sortAsc = !sortAsc;
  else { sortKey = key; sortAsc = true; }
  filteredData.sort((a,b) => {
    const va = a[key]; const vb = b[key];
    return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
  });
  renderTabel();
}

// ======= PAGINATION =======
function renderPaginasi() {
  const total = Math.ceil(filteredData.length / perPage);
  const wrap = document.getElementById('pagination');
  if (total <= 1) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = Array.from({length:total}, (_,i) => `
    <button class="btn btn-sm ${i+1===currentPage ? 'btn-primary' : 'btn-outline'}" onclick="gantiPage(${i+1})">${i+1}</button>
  `).join('');
}

function gantiPage(n) {
  currentPage = n;
  renderTabel();
  document.querySelector('.section').scrollIntoView({behavior:'smooth'});
}

// ======= MODAL =======
function lihatDetail(idx) {
  const d = pengumumanData[idx];
  const badgeMap = { Aktif:'badge-success', Berakhir:'badge-danger', 'Akan Datang':'badge-info' };
  document.getElementById('modalContent').innerHTML = `
    <span class="badge ${badgeMap[d.status]}" style="margin-bottom:.8rem;">${d.status}</span>
    <h3 style="font-size:1.15rem; font-weight:700; color:var(--primary); margin-bottom:.6rem;">${d.judul}</h3>
    <div style="display:flex; gap:.8rem; font-size:.85rem; color:var(--muted); margin-bottom:1rem;">
      <span>📅 ${new Date(d.tanggal).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span>
      <span>🏷️ ${d.kategori}</span>
    </div>
    <p style="font-size:.9rem; color:var(--text); line-height:1.7;">Detail lengkap pengumuman ini akan tersedia segera. Untuk informasi lebih lanjut, hubungi tim layanan pelanggan BusNusantara di <strong>0800-123-4567</strong>.</p>
    <div style="margin-top:1.2rem; display:flex; justify-content:flex-end;">
      <button class="btn btn-primary btn-sm" onclick="tutupModal()">Tutup</button>
    </div>
  `;
  document.getElementById('modalOverlay').style.display = 'flex';
}

function bukaBerita(encoded) {
  const b = JSON.parse(decodeURIComponent(encoded));
  document.getElementById('modalContent').innerHTML = `
    <span class="badge badge-info" style="margin-bottom:.8rem;">${b.kategori}</span>
    <h3 style="font-size:1.2rem; font-weight:700; color:var(--primary); margin-bottom:.6rem;">${b.judul}</h3>
    <div style="font-size:.83rem; color:var(--muted); margin-bottom:1rem;">📅 ${b.tanggal}</div>
    <p style="font-size:.92rem; color:var(--text); line-height:1.8;">${b.ringkasan}</p>
    <div style="margin-top:1.2rem;">
      <button class="btn btn-primary btn-sm" onclick="tutupModal()">Tutup</button>
    </div>
  `;
  document.getElementById('modalOverlay').style.display = 'flex';
}

function tutupModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) tutupModal();
});

// ======= INIT =======
renderBerita();
renderTabel();



// bantuan
// ===== DATA FAQ =====
const faqData = [
  { q:"Bagaimana cara memesan tiket bus di BusNusantara?", a:"Kunjungi halaman Pesan Tiket, pilih kota asal dan tujuan, tanggal berangkat, kelas layanan, lalu pilih kursi dan isi data penumpang. Tiket akan langsung dikirim ke email dan WhatsApp Anda setelah pembayaran." },
  { q:"Apa saja metode pembayaran yang tersedia?", a:"Kami mendukung QRIS, transfer bank (BNI, BCA, Mandiri), GoPay, OVO, dan DANA. Semua transaksi diproses secara aman dan terenkripsi." },
  { q:"Bisakah saya membatalkan atau mengubah jadwal tiket?", a:"Ya, tiket bisa di-reschedule hingga 2 jam sebelum keberangkatan tanpa biaya tambahan. Pembatalan dapat dilakukan hingga 6 jam sebelum keberangkatan dengan pengembalian dana 80% dari harga tiket." },
  { q:"Bagaimana cara menggunakan kode promo?", a:"Masukkan kode promo pada kolom yang tersedia di halaman Pesan Tiket setelah memilih rute dan kelas. Klik 'Terapkan' untuk mengaktifkan diskon secara otomatis." },
  { q:"Bagaimana jika saya kehilangan e-tiket?", a:"Tiket dapat dikirim ulang ke email atau WhatsApp yang terdaftar. Hubungi kami di 0800-123-4567 atau gunakan formulir kontak dengan menyertakan kode booking Anda." },
  { q:"Apakah ada bagasi tambahan yang diizinkan?", a:"Setiap penumpang diizinkan membawa bagasi maksimal 20 kg tanpa biaya tambahan. Bagasi lebih dari 20 kg dikenakan biaya Rp 5.000 per kg." },
  { q:"Bagaimana cara melacak posisi bus saya?", a:"Fitur lacak bus tersedia di menu utama website dan aplikasi BusNusantara. Masukkan kode booking Anda untuk melihat posisi bus secara real-time." },
  { q:"Berapa lama proses refund setelah pembatalan?", a:"Proses refund membutuhkan waktu 3–7 hari kerja tergantung metode pembayaran. Transfer bank biasanya 3 hari kerja, sedangkan e-wallet 1–2 hari kerja." },
];

// ===== DATA RIWAYAT DEMO =====
const riwayatData = [
  { kode:"BN-XK2903", rute:"Banda Aceh → Medan", tanggal:"2025-05-20", kelas:"Eksekutif", total:300000, status:"Selesai" },
  { kode:"BN-YM5821", rute:"Medan → Jakarta", tanggal:"2025-04-15", kelas:"VIP Sleeper", total:560000, status:"Selesai" },
  { kode:"BN-ZL7740", rute:"Jakarta → Surabaya", tanggal:"2025-03-28", kelas:"Ekonomi AC", total:160000, status:"Selesai" },
  { kode:"BN-QP3314", rute:"Padang → Pekanbaru", tanggal:"2025-03-10", kelas:"Ekonomi AC", total:95000, status:"Dibatalkan" },
  { kode:"BN-RT9901", rute:"Bandung → Yogyakarta", tanggal:"2025-06-25", kelas:"Eksekutif", total:300000, status:"Menunggu" },
];
let riwayatFiltered = [...riwayatData];

// ===== CEK STATUS =====
const demoStatus = {
  'BN-XK2903': { rute:"Banda Aceh → Medan", tanggal:"20 Mei 2025", kelas:"Eksekutif", status:"Selesai" },
  'BN-YM5821': { rute:"Medan → Jakarta", tanggal:"15 Apr 2025", kelas:"VIP Sleeper", status:"Selesai" },
  'BN-ZL7740': { rute:"Jakarta → Surabaya", tanggal:"28 Mar 2025", kelas:"Ekonomi AC", status:"Selesai" },
  'BN-QP3314': { rute:"Padang → Pekanbaru", tanggal:"10 Mar 2025", kelas:"Ekonomi AC", status:"Dibatalkan" },
  'BN-RT9901': { rute:"Bandung → Yogyakarta", tanggal:"25 Jun 2025", kelas:"Eksekutif", status:"Menunggu Pembayaran" },
};

function cekStatus() {
  const kode = document.getElementById('inputKodeBooking').value.trim();
  const hasil = document.getElementById('hasilCek');
  if (!kode) { hasil.innerHTML = '<div class="alert alert-danger">Masukkan kode booking terlebih dahulu.</div>'; return; }
  const data = demoStatus[kode];
  if (data) {
    const badgeMap = { Selesai:'badge-success', Dibatalkan:'badge-danger', 'Menunggu Pembayaran':'badge-warning' };
    hasil.innerHTML = `
      <div class="alert alert-success">✅ Kode booking ditemukan!</div>
      <div class="table-wrapper" style="max-width:520px;">
        <table>
          <tbody>
            <tr><td style="font-weight:600; color:var(--muted); width:140px;">Kode Booking</td><td style="font-weight:700;">${kode}</td></tr>
            <tr><td style="font-weight:600; color:var(--muted);">Rute</td><td>${data.rute}</td></tr>
            <tr><td style="font-weight:600; color:var(--muted);">Tanggal</td><td>${data.tanggal}</td></tr>
            <tr><td style="font-weight:600; color:var(--muted);">Kelas</td><td>${data.kelas}</td></tr>
            <tr><td style="font-weight:600; color:var(--muted);">Status</td><td><span class="badge ${badgeMap[data.status]}">${data.status}</span></td></tr>
          </tbody>
        </table>
      </div>`;
  } else {
    hasil.innerHTML = `<div class="alert alert-danger">❌ Kode booking <strong>${kode}</strong> tidak ditemukan. Periksa kembali kode Anda.</div>`;
  }
}
if (document.getElementById('inputKodeBooking')) {
  document.getElementById('inputKodeBooking').addEventListener('keydown', e => {
    if (e.key === 'Enter') cekStatus();
  });
}

// ===== TABEL RIWAYAT =====
function renderRiwayat() {
  const tbody = document.getElementById('tabelRiwayat');
  const badgeMap = { Selesai:'badge-success', Dibatalkan:'badge-danger', Menunggu:'badge-warning' };
  if (riwayatFiltered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:var(--muted);">Tidak ada data ditemukan.</td></tr>`;
    document.getElementById('infoRiwayat').textContent = '0 hasil';
    return;
  }
  tbody.innerHTML = riwayatFiltered.map(d => `
    <tr>
      <td style="font-weight:700; font-family:monospace;">${d.kode}</td>
      <td>${d.rute}</td>
      <td>${new Date(d.tanggal).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</td>
      <td>${d.kelas}</td>
      <td style="font-weight:600;">Rp ${d.total.toLocaleString('id')}</td>
      <td><span class="badge ${badgeMap[d.status]}">${d.status}</span></td>
    </tr>
  `).join('');
  document.getElementById('infoRiwayat').textContent = riwayatFiltered.length + ' hasil';
}

function filterRiwayat() {
  const q = document.getElementById('cariRiwayat').value.toLowerCase();
  const stat = document.getElementById('filterStatusRiwayat').value;
  riwayatFiltered = riwayatData.filter(d =>
    (!q || d.kode.toLowerCase().includes(q) || d.rute.toLowerCase().includes(q)) &&
    (!stat || d.status === stat)
  );
  renderRiwayat();
}

// ===== FAQ =====
function renderFAQ(data) {
  const list = document.getElementById('faqList');
  if (data.length === 0) {
    list.innerHTML = '<p style="color:var(--muted); font-size:.9rem;">Tidak ada pertanyaan yang cocok.</p>';
    return;
  }
  list.innerHTML = data.map((f, i) => `
    <div class="faq-item">
      <button class="faq-q" onclick="toggleFAQ(${i})" id="faqQ${i}">
        ${f.q}
        <span class="faq-icon">+</span>
      </button>
      <div class="faq-a" id="faqA${i}">${f.a}</div>
    </div>
  `).join('');
}

function toggleFAQ(i) {
  const btn = document.getElementById('faqQ'+i);
  const ans = document.getElementById('faqA'+i);
  const isOpen = btn.classList.contains('open');
  // tutup semua
  document.querySelectorAll('.faq-q').forEach(b => b.classList.remove('open'));
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
  if (!isOpen) { btn.classList.add('open'); ans.classList.add('open'); }
}

function filterFAQ() {
  const q = document.getElementById('cariFAQ').value.toLowerCase();
  const filtered = faqData.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  renderFAQ(filtered);
}

// ===== FORM KONTAK =====
if (document.getElementById('kontakPesan')) document.getElementById('kontakPesan').addEventListener('input', function() {
  const len = this.value.length;
  if (len > 500) this.value = this.value.slice(0, 500);
  document.getElementById('charCount').textContent = Math.min(len, 500) + ' / 500 karakter';
});

let nilaiRating = 0;
function setRating(n) {
  nilaiRating = n;
  document.getElementById('nilaiRating').value = n;
  document.querySelectorAll('.star').forEach(s => {
    s.textContent = parseInt(s.dataset.v) <= n ? '★' : '☆';
    s.style.color = parseInt(s.dataset.v) <= n ? 'var(--accent)' : '#ccc';
  });
}

function kirimKontak() {
  const nama  = document.getElementById('kontakNama').value.trim();
  const email = document.getElementById('kontakEmail').value.trim();
  const topik = document.getElementById('kontakTopik').value;
  const pesan = document.getElementById('kontakPesan').value.trim();
  const alertBox = document.getElementById('alertKontak');
  let ok = true;

  const show = (id, show) => document.getElementById(id).classList.toggle('show', show);
  const markErr = (id, err) => document.getElementById(id).classList.toggle('error', err);

  show('err-kNama', !nama); markErr('kontakNama', !nama); if (!nama) ok = false;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  show('err-kEmail', !emailOk); markErr('kontakEmail', !emailOk); if (!emailOk) ok = false;
  show('err-kTopik', !topik); if (!topik) ok = false;
  show('err-kPesan', !pesan); markErr('kontakPesan', !pesan); if (!pesan) ok = false;

  if (!ok) return;

  alertBox.innerHTML = `
    <div class="alert alert-success">
      ✅ Pesan Anda telah terkirim! Tim kami akan menghubungi <strong>${email}</strong> dalam 1x24 jam.
    </div>`;
  // Reset form
  ['kontakNama','kontakEmail','kontakTelp','kontakPesan','kontakKode'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('kontakTopik').value = '';
  document.getElementById('charCount').textContent = '0 / 500 karakter';
  setRating(0);
  showToast('📤 Pesan berhasil terkirim!');
  alertBox.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toastMsg');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ===== INIT (bantuan.html only) =====
if (document.getElementById('faqList')) {
  renderFAQ(faqData);
}
if (document.getElementById('tabelRiwayat')) {
  renderRiwayat();
}