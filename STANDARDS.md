# Klinik Randevu Yönetim Sistemi

Modern, erişilebilir ve responsive bir diş kliniği randevu yönetim uygulaması.

## 🎯 Proje Standartları

### 1. **Mimari ve Performans**
- ✅ Next.js 16+ kurulumu
- ✅ React 19.2 ile modern bileşenler
- ✅ Tailwind CSS v4 responsive design
- ✅ Shadcn/UI bileşen kütüphanesi
- ✅ Code splitting ve lazy loading (`React.lazy`)

### 2. **Responsive Breakpoints**
- **Mobil (320px - 480px)**: Agenda View (liste görünümü)
- **Tablet (768px - 1024px)**: Haftalık görünüm, sidebar gizlenir
- **Desktop (>1024px)**: Tam takvim + Sürükle/Bırak

### 3. **Renk Paleti ve Slot Durumları**
- 🔴 **Dolu**: #EF4444 (Kırmızı)
- 🟢 **Boş**: #10B981 (Yeşil)
- 🟡 **Kilitli/Beklemede**: #F59E0B (Sarı)
- Tema: Açık/Koyu modu destekli

### 4. **Erişilebilirlik (WCAG AA)**
- ✅ Semantik HTML: `<form>`, `<fieldset>`, `<article>`, `<section>`
- ✅ ARIA etiketleri (aria-label, aria-pressed, aria-busy, vb.)
- ✅ Klavye navigasyonu (Tab, Arrow keys, Enter)
- ✅ Kontrast kontrolü

### 5. **Bileşenler**
- `AgendaView`: Mobil liste görünümü
- `AppointmentWizard`: 3-adımlı randevu modali (Hasta → Slot → Özet)
- `PagerChatPanel`: Sticky chat penceresi (position: fixed)
- `ThemeToggle`: Tema değiştirici

### 6. **Güvenlik ve Idempotency**
- ✅ POST istekleri için `X-Idempotency-Key` (UUID v4)
- ✅ Form validasyonu ve hata yönetimi
- ✅ Toast bildirimler (Sonner)

## 📋 Başlamak

### Kurulum
```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Kod Kalitesi
```bash
# ESLint ve Prettier
npm run lint
npm run lint:fix
npm run format

# Testler
npm test                 # Jest unit tests
npm run test:coverage    # Coverage raporu
npm run e2e             # Cypress interaktif
npm run e2e:headless    # Headless E2E tests
```

## 📦 Proje Yapısı

```
clinic-appointments-panel/
├── app/                          # Next.js uygulama
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Ana sayfa
│   ├── globals.css              # Global stil ve temalar
│   └── doctor/, patient/        # Route sayfaları
├── components/
│   ├── clinic/                  # Randevu bileşenleri
│   │   ├── AgendaView.tsx       # Mobil liste
│   │   ├── AppointmentWizard.tsx # Randevu modali
│   │   ├── PagerChatPanel.tsx   # Sohbet
│   │   └── ...
│   ├── theme/                   # Tema bileşenleri
│   ├── ui/                      # Shadcn UI bileşenleri
│   └── __tests__/               # Component testleri
├── lib/
│   ├── hooks.ts                 # Responsive, keyboard, idempotency
│   ├── utils.ts                 # Utility fonksiyonlar
│   ├── dateUtils.ts             # Tarih işlemleri
│   ├── fileUtils.ts             # Dosya işlemleri
│   └── __tests__/               # Unit testleri
├── cypress/
│   ├── e2e/                     # E2E test senaryoları
│   └── support/                 # Cypress konfigürasyonu
├── jest.config.js               # Jest konfigürasyonu
├── jest.setup.js                # Jest setup
├── cypress.config.ts            # Cypress konfigürasyonu
├── .eslintrc.json               # ESLint kuralları
├── .prettierrc                  # Prettier formatı
└── package.json                 # Bağımlılıklar ve scriptler
```

## 🎨 Design System

### CSS Variables (globals.css)
- `--primary`: #4FB8C8
- `--secondary`: #B9E8EB
- `--accent`: #A7D3E0
- `--background`: #F7FFFF (light), #2C3E50 (dark)
- `--slot-booked`: #EF4444 (kırmızı)
- `--slot-empty`: #10B981 (yeşil)
- `--slot-locked`: #F59E0B (sarı)

### Responsive Utilities
```tsx
import { useResponsive } from "@/lib/hooks";

const { isMobile, isTablet, isDesktop } = useResponsive();
```

## 🔐 Idempotency Yönetimi

```tsx
import { useIdempotencyKey } from "@/lib/hooks";

const idempotencyKey = useIdempotencyKey(); // UUID v4

// Backend'e gönder
fetch("/api/appointments", {
  method: "POST",
  headers: {
    "X-Idempotency-Key": idempotencyKey,
  },
  body: JSON.stringify({ /* ... */ }),
});
```

## 🧪 Test Stratejisi

### Unit Tests (Jest)
- Tarih ve dosya işlemleri (`lib/__tests__/`)
- Bileşen davranışları (`components/__tests__/`)

### E2E Tests (Cypress)
- Randevu alma akışı
- Hasta paneli etkileşimleri
- Tema değişimi
- Responsive view testi

## 🌐 Tarayıcı Uyumluluğu
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS 12+)

## 📝 Semantik HTML Örnekleri

### Wizard Form
```tsx
<form onSubmit={handleSubmit}>
  <fieldset>
    <legend>Hasta Seçimi</legend>
    {/* Radio buttons */}
  </fieldset>
  
  <fieldset>
    <label htmlFor="reason">Sebep</label>
    <textarea id="reason" />
  </fieldset>
</form>
```

### Agenda List
```tsx
<section aria-label="Randevu listesi" data-testid="agenda-view">
  {appointments.map(appt => (
    <article key={appt.id} role="button" tabIndex={0}>
      {/* Content */}
    </article>
  ))}
</section>
```

## 🚀 Deployment

```bash
npm run build
npm run start
```

Vercel, Netlify ve diğer Node.js hosting'lere uyumlu.

## 📚 Kaynaklar

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/UI](https://ui.shadcn.com)
- [React Big Calendar](https://jquense.github.io/react-big-calendar)
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref)

## 📄 Lisans

MIT
