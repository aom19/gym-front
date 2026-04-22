# gym-front — TODO

## ✅ Implementat

- Auth (login, logout, forgot/reset parolă, verificare email)
- Layout admin cu sidebar și navigare
- Dashboard admin (statistici generale)
- Pagină utilizatori staff (CRUD complet)
- Pagină membri (CRUD complet)
- Pagină locații (CRUD complet)
- Pagină roluri & permisiuni (CRUD + matrix permisiuni)
- Preferințe utilizator (limbă, temă)
- Middleware protecție rute (ADMIN, FRONT_DESK)
- i18n (ro / en / ru)
- Check-in System (tabel, check-in manual, check-out, filtrare locație)
- Planuri de abonament (CRUD complet, tabel, formular Sheet, serviciu)
- Plăți (CRUD complet, tabel, modal, badge-uri status, serviciu)
- Servicii frontend: subscription-plans, subscriptions, payments, checkins
- Traduceri i18n actualizate (subscriptions, checkins, payments)
- Exerciții admin (pagină `/admin/exercises`, `ExercisesTable`, serviciu `exercises.ts`)
- Antrenamente admin (pagină `/admin/workouts`, `WorkoutsTable`, serviciu `workouts.ts`)
- Clase de grup admin (pagină `/admin/classes`, `GroupClassesTable`, serviciu `group-classes.ts`)
- Pagină publică clase (`/classes`) — calendar clase disponibile
- Program locație (`LocationScheduleManager`, serviciu `location-schedule.ts`)
- Progres fitness admin (pagină `/admin/progress`, `FitnessProgressTable`, serviciu `fitness-progress.ts`)
- Istoric check-in-uri (`/admin/checkins/history`) cu filtrare dată/locație/căutare + export CSV
- Gestiune abonamente membri (componentă `MemberSubscriptions` în tabelul membri)
- Pagina rezervări clasă (`/admin/classes/:id/bookings`, `ClassBookingsManager`)
- Dashboard Trainer (`/admin/trainer-dashboard`)
- Grafice progres fitness (recharts — greutate + grăsime corporală)
- Buton „Rezervă" clase publice (`UpcomingClassesList` pe pagina `/classes`)
- Pagină rapoarte admin (`/admin/reports`) — KPI-uri, grafice, statistici
- Token refresh automat (interceptor axios cu deduplicare)
- Stare globală user în zustand (sync cu cookie)
- Paginare server-side pe TOATE tabelele (useServerTable hook, SortableHeader, TablePagination)
- Căutare server-side pe TOATE tabelele (debounced, API search)
- Sortare coloane server-side pe TOATE tabelele
- Error boundary per pagină admin (`error.tsx`)

---

## 🔴 Prioritate înaltă (MVP real)

### Check-in System
- [x] Pagină `/admin/checkins` — tabel check-in-uri de azi cu filtrare per locație
- [x] Componentă `CheckInTable` — coloane: membru, locație, oră intrare, oră ieșire, cine a făcut check-in
- [x] Modal check-in manual — căutare membru după nume/email + buton check-in
- [x] Buton check-out per înregistrare
- [x] Pagină `/admin/checkins/history` — istoric complet cu filtrare dată + locație + export

### QR Check-in
- [ ] Pagina `/checkin` (publică, pentru tabletă la recepție) — scanner QR cu cameră
- [ ] Integrare librărie QR scan (ex. `@zxing/browser`)
- [ ] Afișare rezultat scan: Membru acceptat (verde) / Abonament expirat (roșu) / Necunoscut
- [ ] Pagina `/member/qr-card` — QR card al membrului pentru self-check-in

### Planuri de abonament
- [x] Pagină `/admin/subscription-plans` — CRUD planuri (ADMIN only)
- [x] Componentă `SubscriptionPlansTable` — coloane: nume, preț, durată, locații, status
- [x] Formular creare/editare plan (Sheet): durată în zile, preț, maxIntrări, scope (o locație / toate)
- [x] Serviciu `src/services/subscription-plans.ts`

### Abonamente membre
- [x] Secțiune abonament în pagina de detaliu a unui membru
- [x] Modal activare abonament nou — selectare plan + dată start + legare plată
- [x] Afișare status abonament cu badge colorat: ACTIV (verde), EXPIRAT (roșu), ANULAT (gri)
- [x] Indicator zile rămase / intrări rămase
- [x] Serviciu `src/services/subscriptions.ts`

### Plăți
- [x] Pagină `/admin/payments` — tabel plăți cu filtrare dată + status + metodă
- [x] Componentă `PaymentsTable`
- [x] Modal înregistrare plată (Sheet): sumă, metodă (numerar/card/transfer), notă
- [x] Badge status plată: PAID (verde), PENDING (galben), REFUNDED (albastru)
- [x] Serviciu `src/services/payments.ts`

---

## 🟡 Prioritate medie

### Exerciții & Antrenamente
- [x] Pagină `/admin/exercises` — CRUD exerciții (ADMIN, TRAINER)
- [x] Componentă `ExercisesTable` + Sheet formular cu grup muscular
- [x] Pagină `/admin/workouts` — listă antrenamente
- [x] Componentă `WorkoutBuilder` — adăugare exerciții + seturi/reps/greutate (integrat în WorkoutsTable)
- [x] Pagina profil membru — secțiune "Istoric antrenamente" (`/member/workouts`)
- [x] Servicii `src/services/exercises.ts`, `src/services/workouts.ts`

### Clase de grup
- [x] Pagină `/admin/classes` — CRUD clase (ADMIN, TRAINER)
- [x] Componentă `GroupClassesTable` cu status, instructor, dată, participanți
- [x] Modal creare/editare clasă: tip, instructor, locație, capacitate, dată/oră (integrat în GroupClassesTable)
- [x] Pagina `/admin/classes/:id/bookings` — lista participanților înscriși
- [x] Calendar săptămânal al claselor (vizualizare grilă — Schedule-X, `/member/calendar`)
- [x] Serviciu `src/services/classes.ts` (`group-classes.ts`)

### Rezervări clase (Member-facing)
- [x] Pagina publică `/classes` — calendar clase disponibile
- [x] Buton "Rezervă" per clasă cu validare abonament
- [x] Pagina `/member/my-classes` — rezervările mele active + istorice
- [x] Buton anulare rezervare
- [x] Serviciu `src/services/bookings.ts` (integrat în group-classes.ts)

### Dashboard Trainer
- [x] Pagina `/admin/trainer-dashboard` (vizibilă pentru TRAINER)
- [x] Secțiuni: clasele de azi, clase viitoare, antrenamente recente
- [x] Calendar personal trainer (Schedule-X, `/admin/trainer-calendar`)

### Program locație
- [x] Tab "Program" în pagina de detaliu a locației
- [x] Grid editabil pentru fiecare zi a săptămânii (oră deschis / oră închis / închis)
- [x] Butoane marcare sărbători / zile închise

### Progres fitness (Member)
- [x] Pagină `/admin/progress` — tabel înregistrări cu formular adăugare
- [x] Pagina `/member/progress` — vizualizare personală progres
- [x] Grafice evoluție: greutate în timp, grăsime corporală (recharts)
- [x] Serviciu `src/services/progress.ts` (`fitness-progress.ts`)

---

## � Prioritate scăzută / Opțional

### Îmbunătățiri tehnice
- [x] Paginare server-side pentru toate tabelele mari (membri, plăți, check-in-uri etc.)
- [x] Filtrare + căutare server-side în tabele (debounced search)
- [x] Sortare coloane server-side în tabele (SortableHeader + useServerTable)
- [ ] Lazy loading pagini (route-based code splitting)
- [x] Gestionare token refresh automat în `src/services/api.ts` (interceptor axios)
- [x] Stare globală user în zustand (sync cu cookie)
- [ ] Pagini de eroare personalizate (404, 500) — design consistent cu aplicația
- [ ] Loading skeleton global pentru navigare între pagini
- [ ] Teste unitare componente critice (useServerTable, auth flow)
- [ ] Teste E2E cu Playwright (login → CRUD → logout)

### Responsive & Mobile
- [ ] Layout admin responsive complet — sidebar colapsabil pe mobile (hamburger menu)
- [ ] Tabele responsive — card view pe mobile (stacked layout sub 768px)
- [ ] Touch-friendly: butoane mai mari, spacing generos pe mobile
- [ ] Bottom navigation bar pe mobile pentru admin (Dashboard, Members, Check-in, More)

### Teme & Branding
- [ ] Customizare temă per sală (logo, culori primare/secundare) — settings admin
- [ ] Pagina publică landing (`/`) cu informații sală, program, locații, prețuri
- [ ] Pagina publică prețuri (`/pricing`) — planuri abonament cu design card
- [ ] Upload logo sală + afișare în sidebar și pagini publice

### Animații & Micro-interacțiuni
- [ ] Tranziții pagini (fade/slide între rute admin)
- [ ] Animații tabele: fade-in pe rânduri noi, slide-out pe ștergere
- [ ] Toast notificări cu animație (deja parțial cu react-hot-toast)
- [ ] Skeleton shimmer îmbunătățit pe toate tabelele (deja parțial)
- [ ] Confirmare ștergere cu animație (AlertDialog cu tranziție)

### Dashboard Îmbunătățit
- [ ] Grafic check-in-uri pe zi (bar chart ultimele 30 zile)
- [ ] Grafic venituri pe lună (line chart ultimele 12 luni)
- [ ] Grafic distribuție abonamente active per plan (pie/donut chart)
- [ ] Widget „membri noi luna aceasta" cu trend vs luna trecută
- [ ] Card „locații overview" — check-in-uri acum per locație (live)

### UX Tabele
- [ ] Selecție multiplă rânduri (checkbox) + acțiuni în bulk (ștergere, export)
- [ ] Column visibility toggle (ascunde/afișează coloane)
- [ ] Filtre avansate per coloană (dropdown status, range dată, range sumă)
- [ ] Sticky header tabel la scroll
- [ ] Row detail expansion (click pe rând → detalii complete)
- [ ] Keyboard navigation în tabele (↑↓ pentru navigare, Enter pentru acțiune)

---

## 🚀 Feature-uri noi recomandate (Gym Management Complet)

### Portal Membru (Member App)
- [ ] Pagina `/member/dashboard` — rezumat personal:
  - Abonament activ + zile/intrări rămase cu progress bar
  - Check-in-uri luna aceasta (calendar heatmap)
  - Următorul antrenament programat
  - Clase rezervate viitoare
  - Notificări recente
- [ ] Pagina `/member/profile` — editare date personale, foto, parolă
- [x] Pagina `/member/my-classes` — rezervările mele (active + istoric) cu anulare
- [x] Pagina `/member/progress` — vizualizare personală progres cu grafice
- [x] Pagina `/member/workouts` — istoric antrenamente personale
- [ ] Pagina `/member/card` — QR card digital (foto, nume, status abonament, QR code)

### QR Check-in System
- [ ] Pagina `/checkin` (publică, tabletă recepție) — scanner QR cameră
- [ ] Integrare `@zxing/browser` sau `html5-qrcode`
- [ ] Ecran rezultat: Membru acceptat (verde, animație ✓) / Expirat (roșu) / Necunoscut (gri)
- [ ] Pagina `/member/qr-card` — generare QR cu `qrcode.react`
- [ ] Mode kiosk (fullscreen, timp limitat afișare rezultat)

### Challenge System / Gamification
- [ ] Pagina `/admin/challenges` — CRUD challenge-uri (obiective check-in, antrenamente, greutate)
- [ ] Componentă `ChallengeCard` cu bară progres și clasament
- [ ] Pagina `/member/challenges` — challenge-uri disponibile + buton join
- [ ] Leaderboard per challenge cu avatar + scor
- [ ] Badge-uri / achievement-uri (100 check-in-uri, 1 an membru, etc.)
- [ ] Serviciu `src/services/challenges.ts`

### Notificări
- [ ] Componentă `NotificationBell` în header cu badge număr necitite
- [ ] Dropdown notificări: tip, mesaj, timestamp, link acțiune
- [ ] Notificări: expirare abonament (3 zile înainte), confirmare rezervare, mesaj nou
- [ ] Push notifications (optional, Service Worker)
- [ ] Serviciu `src/services/notifications.ts`

### Rapoarte Avansate
- [ ] Pagina `/admin/reports` îmbunătățită — filtrare perioadă + locație + comparație
- [ ] Raport: Venituri (pe lună, pe plan, pe metodă plată)
- [ ] Raport: Retenție membri (rata de reînnoire abonament)
- [ ] Raport: Ore de vârf (check-in-uri pe oră din zi — heatmap)
- [ ] Raport: Ocupare clase (rata rezervare vs capacitate)
- [ ] Export PDF rapoarte cu branding sală
- [ ] Export CSV pe TOATE tabelele (nu doar check-in-uri)

### Discounturi & Promoții
- [ ] Pagina `/admin/promo` — CRUD coduri promoționale
- [ ] Model: cod, discount %, discount fix, valabil până la, limită utilizări
- [ ] Input cod promo în formularul de plată cu validare live
- [ ] Promoții automate: „first month free", „referral discount"
- [ ] Serviciu `src/services/promo.ts`

### Echipamente
- [ ] Pagina `/admin/equipment` — CRUD echipamente per locație
- [ ] Badge status: FUNCTIONAL (verde), MAINTENANCE (galben), BROKEN (roșu)
- [ ] Programare mentenanță (dată următoare verificare)
- [ ] Istoric mentenanță per echipament
- [ ] Serviciu `src/services/equipment.ts`

### Mesagerie
- [ ] Pagina `/admin/messages` — inbox cu conversații
- [ ] Chat panel Trainer ↔ Membru
- [ ] Notificare mesaj nou (badge + push)
- [ ] Atașamente (imagini, PDF-uri plan antrenament)
- [ ] Serviciu `src/services/messages.ts`

### Contracte & Documente
- [ ] Secțiune "Contract" în profilul membrului
- [ ] Upload document (PDF) + status semnat/nesemnat
- [ ] Semnătură digitală (canvas draw)
- [ ] Template contracte editabile per sală
- [ ] Serviciu `src/services/contracts.ts`

### Programări Antrenamente
- [ ] Calendar programări antrenament 1-on-1 (Trainer + Membru)
- [ ] Slots disponibile per trainer (orar configurabil)
- [ ] Confirmare / anulare programare de ambele părți
- [ ] Reminder automat (notificare cu o oră înainte)

### Automatizări
- [ ] Email automat la expirare abonament (3 zile, 1 zi, expirat)
- [ ] Email bun venit membru nou cu instrucțiuni prima vizită
- [ ] Email confirmare reservare clasă
- [ ] Raport zilnic/săptămânal automat pe email (ADMIN)
- [ ] Cron job cleanup: check-out automat la miezul nopții pentru check-in-uri fără check-out

