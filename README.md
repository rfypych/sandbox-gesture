# 🎮 Particle Hand Game

Sebuah game web interaktif yang menakjubkan dimana Anda dapat mengontrol partikel menggunakan gerakan tangan melalui webcam! Game ini mendukung desktop dan mobile dengan kontrol touch sebagai fallback.

## ✨ Fitur Utama

- **Hand Tracking Real-time**: Menggunakan MediaPipe untuk deteksi gerakan tangan yang akurat
- **Sistem Partikel Canggih**: Ribuan partikel dengan efek visual yang memukau
- **Responsive Design**: Berfungsi sempurna di desktop dan mobile
- **Multiple Interaction Modes**: 4 mode interaksi berbeda dengan gesture tangan
- **Scoring System**: Sistem poin dan combo untuk gameplay yang engaging
- **Performance Optimized**: Object pooling dan frame rate optimization

## 🎯 Cara Bermain

### Gesture Tangan:
- **✋ Tangan Terbuka**: Menarik partikel ke arah telapak tangan
- **✊ Kepalan Tangan**: Menolak partikel dari tangan
- **🤏 Gesture Pinch**: Spawn partikel baru di antara jari
- **👊 Kepalan Ketat**: Membuat ledakan partikel

### Kontrol Mobile:
- **Touch & Drag**: Menarik partikel ke arah sentuhan
- **Control Buttons**: Pilih mode interaksi manual

## 🚀 Instalasi & Menjalankan

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```

3. **Build untuk Production**:
   ```bash
   npm run build
   ```

4. **Preview Build**:
   ```bash
   npm run preview
   ```

## 🛠️ Teknologi yang Digunakan

- **Frontend**: TypeScript, HTML5 Canvas, CSS3
- **Build Tool**: Vite
- **Hand Tracking**: MediaPipe Hands
- **Physics**: Custom particle physics engine
- **Responsive**: CSS Media Queries

## 📱 Kompatibilitas

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Mobile, Samsung Internet
- **Webcam**: Diperlukan untuk hand tracking
- **Touch**: Fallback control untuk mobile

## 🎨 Fitur Visual

- **Particle Trails**: Jejak partikel yang indah
- **Gradient Backgrounds**: Background animasi yang dinamis
- **Glow Effects**: Efek cahaya pada partikel
- **Smooth Animations**: Animasi 60fps yang halus
- **Responsive UI**: Interface yang adaptif

## 🏆 Sistem Scoring

- **Base Points**: Poin dasar dari interaksi
- **Combo System**: Multiplier untuk interaksi beruntun
- **Particle Bonus**: Bonus dari jumlah partikel aktif
- **Gesture Bonus**: Poin ekstra untuk gesture khusus

## 🔧 Konfigurasi

Game secara otomatis menyesuaikan:
- Jumlah partikel berdasarkan performa device
- Frame rate untuk mobile optimization
- UI scaling untuk berbagai ukuran layar

## 📝 Tips Bermain

1. **Pencahayaan**: Pastikan pencahayaan cukup untuk hand tracking
2. **Background**: Hindari background yang terlalu ramai
3. **Jarak**: Posisikan tangan 30-60cm dari kamera
4. **Gesture**: Lakukan gesture dengan jelas dan perlahan

## 🐛 Troubleshooting

- **Kamera tidak terdeteksi**: Refresh browser dan izinkan akses kamera
- **Hand tracking lambat**: Coba kurangi pencahayaan atau ganti background
- **Performance issues**: Game otomatis menyesuaikan kualitas

## 🤝 Kontribusi

Silakan buat issue atau pull request untuk perbaikan dan fitur baru!

## 📄 Lisensi

MIT License - Silakan gunakan untuk proyek pribadi atau komersial.

---

**Selamat bermain dan nikmati pengalaman mengontrol partikel dengan tangan Anda! 🎉**
