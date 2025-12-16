# 📖 Hızlı Başlangıç Rehberi

## Kurulum (2 dakika)

```bash
# Proje dizinine git
cd clinic-appointments-panel

# Bağımlılıkları kur
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda açılır: **http://localhost:3000**

---

## Proje Yapısı

```
clinic-appointments-panel/
├── 📱 app/                    # Next.js uygulama
│   ├── layout.tsx             # Root layout (SkipLink dahil)
│   ├── page.tsx               # Ana sayfa
│   ├── globals.css            # CSS variables, tema, breakpoints
│   ├── doctor/page.tsx        # Doktor dashboard
│   └── patient/page.tsx       # Hasta dashboard
│
├── 🎨 components/
│   ├── clinic/                # Randevu bileşenleri
│   │   ├── AgendaView.tsx     # ✨ Mobil liste görünümü (yeni)
│   │   ├── AppointmentWizard.tsx  # ✨ 3-adımlı wizard (yeni)
│   │   ├── PagerChatPanel.tsx # ✨ Sticky chat (yeni)
│   │   └── ...
│   ├── a11y/                  # Erişilebilirlik bileşenleri
│   │   └── SkipLink.tsx       # ✨ Skip link (yeni)
│   ├── theme/
│   │   └── ThemeToggle.tsx    # Tema değiştirici
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   └── __tests__/             # Component testleri
│       └── ThemeToggle.test.tsx  # ✨ Test örneği (yeni)
│
├── 🔧 lib/
│   ├── hooks.ts               # ✨ useResponsive, useKeyboardNavigation, useIdempotencyKey (yeni)
│   ├── api.ts                 # ✨ API utilities (yeni)
│   ├── types.ts               # ✨ TypeScript definitions (yeni)
│   ├── dateUtils.ts           # ✨ Tarih işlemleri (yeni)
│   ├── fileUtils.ts           # ✨ Dosya işlemleri (yeni)
│   └── __tests__/             # Unit testleri
│       ├── dateUtils.test.ts  # ✨ Tarih testleri (yeni)
│       └── fileUtils.test.ts  # ✨ Dosya testleri (yeni)
│
├── 🧪 cypress/
│   ├── e2e/
│   │   └── main.cy.ts         # ✨ E2E senaryoları (yeni)
│   └── support/
│       └── e2e.ts             # ✨ Cypress setup (yeni)
│
├── 📋 Konfigürasyon
│   ├── .eslintrc.json         # ✨ ESLint (Airbnb + A11y) (yeni)
│   ├── .prettierrc            # ✨ Prettier (yeni)
│   ├── jest.config.js         # ✨ Jest (yeni)
│   ├── jest.setup.js          # ✨ Jest setup (yeni)
│   ├── cypress.config.ts      # ✨ Cypress (yeni)
│   └── .github/workflows/ci.yml  # ✨ CI/CD (yeni)
│
└── 📚 Dökümantasyon
    ├── STANDARDS.md           # ✨ Proje standartları (yeni)
    ├── CHECKLIST.md           # ✨ Kontrol listesi (yeni)
    ├── CONFIG.md              # ✨ Konfigürasyon rehberi (yeni)
    ├── IMPLEMENTATION_REPORT.md  # ✨ Detaylı rapor (yeni)
    └── COMPLETION_SUMMARY.md  # ✨ Özet (yeni)
```

---

## 🎯 Temel Görevler

### Kod Kalitesi

```bash
# ESLint: Hata kontrolü ve otomatik düzeltme
npm run lint              # Hataları göster
npm run lint:fix          # Otomatik düzelt

# Prettier: Kod formatı
npm run format            # Formatlama uygula

# TypeScript: Tip kontrolü
npx tsc --noEmit          # Tip hatalarını kontrol et
```

### Testler

```bash
# Unit testler (Jest)
npm test                  # Tüm testleri çalıştır
npm run test:watch        # Watch modunda çalıştır
npm run test:coverage     # Coverage raporu

# E2E testler (Cypress)
npm run e2e              # Interaktif UI
npm run e2e:headless     # Headless modda çalıştır
```

### Build & Deploy

```bash
# Development
npm run dev              # http://localhost:3000

# Production
npm run build            # Build et
npm run start            # Production modda çalıştır
```

---

## 🎨 Önemli Bileşenler

### AgendaView (Mobil Liste)
```tsx
import { AgendaView } from '@/components/clinic/AgendaView';

<AgendaView 
  appointments={appointments}
  onSelectAppointment={handleSelect}
/>
```
**Kullanım**: Mobil/tablet ekranlarda (`< 1024px`)

### AppointmentWizard (Randevu Modali)
```tsx
import { AppointmentWizard } from '@/components/clinic/AppointmentWizard';

<AppointmentWizard
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  selectedTime="14:00"
  selectedDate="2025-12-17"
  doctorName="Dr. Aylin"
  patients={patients}
  onConfirm={handleConfirm}
/>
```
**Özellikler**: 3 adım, semantik HTML, idempotency

### PagerChatPanel (Sticky Chat)
```tsx
import { PagerChatPanel } from '@/components/clinic/PagerChatPanel';

<PagerChatPanel
  isOpen={isChatOpen}
  onOpenChange={setIsChatOpen}
  messages={messages}
  onSendMessage={handleSend}
  isOnline={doctorOnline}
  showUnreadBadge={unreadCount}
/>
```
**Pozisyon**: Ekranın sağ alt köşesi (`position: fixed`)

---

## 🔧 Hooks ve Utilities

### useResponsive Hook
```tsx
import { useResponsive } from '@/lib/hooks';

const { isMobile, isTablet, isDesktop, size } = useResponsive();

// size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
// isMobile: boolean
// isTablet: boolean
// isDesktop: boolean
```

### useIdempotencyKey Hook
```tsx
import { useIdempotencyKey } from '@/lib/hooks';

const idempotencyKey = useIdempotencyKey(); // UUID v4

// Fetch ile kullan
fetch('/api/appointments', {
  method: 'POST',
  headers: { 'X-Idempotency-Key': idempotencyKey },
  body: JSON.stringify(data)
});
```

### API Utilities
```tsx
import { apiPost, apiPatch, apiDelete, withRetry } from '@/lib/api';

// POST with idempotency
const result = await apiPost('/api/appointments', data, idempotencyKey);

// PATCH with retry
const updated = await withRetry(() => 
  apiPatch('/api/appointments/123', data)
);

// DELETE
await apiDelete('/api/appointments/123', idempotencyKey);
```

### Tarih ve Dosya Utilities
```tsx
import { 
  toISODate, addDays, isWeekendISO, isPastISO, minutesUntil 
} from '@/lib/dateUtils';
import { formatBytes } from '@/lib/fileUtils';

const today = toISODate(new Date()); // '2025-12-17'
const tomorrow = addDays(today, 1); // '2025-12-18'
const isWeekend = isWeekendISO(today); // false
const isPast = isPastISO(today, '2025-01-01'); // false

const size = formatBytes(1024); // '1.0 KB'
```

---

## 📋 CSS Variables

### Renkler
```css
/* Ana renkler */
--primary: #4FB8C8;
--secondary: #B9E8EB;
--accent: #A7D3E0;
--background: #F7FFFF;
--foreground: #2C3E50;

/* Slot durumları */
--slot-booked: #EF4444;    /* Kırmızı */
--slot-empty: #10B981;     /* Yeşil */
--slot-locked: #F59E0B;    /* Sarı */
```

### Breakpoints
```css
xs: 320px   /* Telefonlar */
sm: 480px   /* Büyük telefonlar */
md: 768px   /* Tabletler */
lg: 1024px  /* Masaüstü */
xl: 1280px  /* Geniş masaüstü */
```

---

## ♿ Erişilebilirlik

### Keyboard Navigation
- **Tab** / **Shift+Tab**: Öğeler arası hareket
- **Arrow tuşları**: Liste öğeleri
- **Enter** / **Space**: Aktivasyon
- **Esc**: Kapat
- **Home** / **End**: İlk/son

### ARIA Attributes
```tsx
<button aria-label="Sohbeti aç">💬</button>
<div role="progressbar" aria-valuenow={1} aria-valuemin={1} aria-valuemax={3} />
<input aria-describedby="help-text" />
<p id="help-text">Yardım metni</p>
```

### Skip Link (Header)
SkipLink otomatik olarak `app/layout.tsx` içine eklenmiş.

Keyboard kullanıcıları **Ctrl+Shift+L** (VS Code'da Cmd+K Cmd+L) ile atlayabilir.

---

## 🔐 Güvenlik - Idempotency

Her POST isteğinde **UUID v4** header'ı gönderilir:

```
X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

Bu, aynı isteğin iki kez yapılması durumunda yanlışlıkla iki randevu oluşturulmasını engeller.

---

## 📊 Test Komutları

```bash
# Jest Unit Tests
npm test                  # Tüm testleri çalıştır
npm test -- --watch      # Watch modda
npm test -- --coverage   # Coverage raporu
npm test -- dateUtils    # Belirli dosya

# Cypress E2E Tests
npm run e2e              # Interaktif (UI açılır)
npm run e2e:headless     # Headless (background)
npx cypress run --spec "cypress/e2e/main.cy.ts"

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Otomatik düzelt
npm run format           # Prettier format
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
npm run start
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=Klinik Randevu Sistemi
```

---

## 📞 Yaygın Sorunlar

### Tests başarısız oluyorsa
```bash
npm run lint:fix          # Linter hatalarını düzelt
npm test -- --clearCache  # Jest cache temizle
```

### Build başarısız oluyorsa
```bash
rm -rf .next              # .next dizinini sil
npm install               # Paketleri yeniden kur
npm run build             # Yeniden build et
```

### E2E tests hata veriyorsa
```bash
npm run e2e              # Interaktif mode'da test et
npx cypress open         # Cypress UI aç
```

---

## 📚 Daha Fazla Bilgi

Detaylı dökümantasyon:
- **STANDARDS.md** - Proje standartları
- **CHECKLIST.md** - Kontrol listesi
- **CONFIG.md** - Konfigürasyon rehberi
- **IMPLEMENTATION_REPORT.md** - Detaylı rapor

---

## ✨ İpuçları

1. **Responsive Tasarım**: `useResponsive()` hook'u kullan
2. **API Çağrıları**: `lib/api.ts` utilities'ini kullan
3. **Erişilebilirlik**: ARIA labelleri her zaman ekle
4. **Testler**: Her utility için test yaz
5. **Tipler**: `lib/types.ts` kullan

---

**Başarılı geliştirme!** 🚀

Son güncelleme: 17 Aralık 2025
