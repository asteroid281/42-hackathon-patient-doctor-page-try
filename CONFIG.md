# Uygulama Ayarları ve Yapılandırma

## Renk Paleti

### Ana Renkler
```css
--primary: #4FB8C8;           /* Mavi-yeşilimsi */
--secondary: #B9E8EB;         /* Açık mavi */
--accent: #A7D3E0;            /* Yumuşak mavi */
--background: #F7FFFF;        /* Çok açık */
--foreground: #2C3E50;        /* Koyu gri-mavi */
```

### Dark Mode (otomatik)
Dark mode CSS variables `app/globals.css` içinde tanımlanmıştır.

## Breakpoints

```tsx
xs: 320px   // Telefonlar
sm: 480px   // Büyük telefonlar
md: 768px   // Tabletler
lg: 1024px  // Masaüstü
xl: 1280px  // Geniş masaüstü
```

## Responsive Stratejisi

### Mobil (xs-sm)
- AgendaView (liste görünümü)
- Sürükle-bırak deaktif
- Sticky chat açılır
- Stack layout

### Tablet (md)
- Haftalık takvim
- Sidebar gizli
- Sürükle-bırak etkin
- Düzeltilmiş sidebar

### Desktop (lg+)
- Tam aylık takvim
- Sidebar görünür
- Sürükle-bırak tam etkinleştirilmiş
- Side-by-side layout

## Slot Durumları

```tsx
booked:  #EF4444  // Kırmızı   - Dolu/Kullanılan
empty:   #10B981  // Yeşil     - Boş/Müsait
locked:  #F59E0B  // Sarı      - Kilitli/Bloke
```

## Zaman Ayarları

```tsx
const CLINIC_HOURS = {
  openTime: "09:00",    // Açılış
  closeTime: "17:00",   // Kapanış
  appointmentDuration: "30 minutes",
  breakTime: "13:00-14:00", // Öğle molası
};

const WEEKENDS = [0, 6]; // Pazar, Cumartesi
```

## API Ayarları

### Idempotency
Her POST isteğinde `X-Idempotency-Key` header'ı zorunludur:
```
X-Idempotency-Key: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx (UUID v4)
```

### Request/Response
- Content-Type: application/json
- Timeout: 30s
- Retry: 3 kez (exponential backoff)

## Dosya Upload Ayarları

```tsx
const FILE_LIMITS = {
  maxSize: 10 * 1024 * 1024, // 10 MB
  allowedTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/dicom",
  ],
};
```

## Erişilebilirlik Ayarları

### Kontrast Oranları
- Normal yazı: minimum 4.5:1 (WCAG AA)
- Büyük yazı: minimum 3:1
- UI bileşenleri: minimum 3:1

### Keyboard Navigation
- Tab tuşu: Sonraki eleman
- Shift+Tab: Önceki eleman
- Arrow tuşları: Liste öğeleri arasında
- Enter/Space: Aktivasyon
- Esc: Kapat/İptal

### Focus Indicators
- Tüm etkileşimli öğeler keyboard erişilebilir
- Focus ring: `ring-2 ring-primary`
- Focus visible: opacity-100

## Performance İyileştirmeleri

### Code Splitting
```tsx
const CalendarView = lazy(() => import('./CalendarView'));
const ReportsView = lazy(() => import('./ReportsView'));
```

### Image Optimization
- Format: WebP (fallback: JPEG)
- Sizes: responsive
- Loading: lazy

### Bundle Size
- ES build: ~45 KB (gzipped)
- Initial: ~120 KB
- Chunk: <= 200 KB

## Analytics ve Monitoring

```tsx
// GTM event örneği
gtag.event('appointment_booked', {
  doctor_id: 'd1',
  patient_id: 'p1',
  date: '2025-12-17',
  time: '14:00',
});
```

## Güvenlik Notları

1. **CSRF Protection**: Form submit'lerde token kullanın
2. **XSS Prevention**: Tüm user input sanitize edilmeli
3. **CORS**: Backend'den whitelist edilmeli
4. **Rate Limiting**: API endpoints'te rate limit gerekli
5. **SSL/TLS**: HTTPS zorunlu

## Ortam Değişkenleri

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=Klinik Randevu Sistemi
NEXT_PUBLIC_VERSION=0.1.0
```

## Tarayıcı Desteği

| Browser | Min Version | Notes |
|---------|------------|-------|
| Chrome  | 90+        | Full support |
| Firefox | 88+        | Full support |
| Safari  | 14+        | Full support |
| Edge    | 90+        | Full support |
| iOS Safari | 12.2+   | Full support |

## Deployment Ayarları

### Vercel
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

### Environment
- Development: http://localhost:3000
- Staging: https://staging.example.com
- Production: https://example.com

## Maintenance Checklist

- [ ] Weekly: Linter ve test sonuçlarını kontrol et
- [ ] Monthly: Bağımlılıkları güncelleyin
- [ ] Quarterly: Performance audit
- [ ] Quarterly: Accessibility audit
- [ ] Bi-annually: Browser compatibility test
- [ ] Annually: Security audit

---

**Dokumen güncellemesi**: 17 Aralık 2025
