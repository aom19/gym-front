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

---

## 🔴 Prioritate înaltă (MVP real)

### Check-in System
- [x] Pagină `/admin/checkins` — tabel check-in-uri de azi cu filtrare per locație
- [x] Componentă `CheckInTable` — coloane: membru, locație, oră intrare, oră ieșire, cine a făcut check-in
- [x] Modal check-in manual — căutare membru după nume/email + buton check-in
- [x] Buton check-out per înregistrare
- [ ] Pagină `/admin/checkins/history` — istoric complet cu filtrare dată + locație + export

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
- [ ] Secțiune abonament în pagina de detaliu a unui membru
- [ ] Modal activare abonament nou — selectare plan + dată start + legare plată
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
- [ ] Componentă `WorkoutBuilder` — adăugare exerciții + seturi/reps/greutate
- [ ] Pagina profil membru — secțiune "Istoric antrenamente"
- [x] Servicii `src/services/exercises.ts`, `src/services/workouts.ts`

### Clase de grup
- [x] Pagină `/admin/classes` — CRUD clase (ADMIN, TRAINER)
- [x] Componentă `GroupClassesTable` cu status, instructor, dată, participanți
- [ ] Modal creare/editare clasă: tip, instructor, locație, capacitate, dată/oră
- [ ] Pagina `/admin/classes/:id/bookings` — lista participanților înscriși
- [ ] Calendar săptămânal al claselor (vizualizare grilă)
- [x] Serviciu `src/services/classes.ts` (`group-classes.ts`)

### Rezervări clase (Member-facing)
- [x] Pagina publică `/classes` — calendar clase disponibile
- [ ] Buton "Rezervă" per clasă cu validare abonament
- [ ] Pagina `/member/my-classes` — rezervările mele active + istorice
- [ ] Buton anulare rezervare
- [ ] Serviciu `src/services/bookings.ts`

### Dashboard Trainer
- [ ] Pagina `/admin/trainer-dashboard` (vizibilă pentru TRAINER)
- [ ] Secțiuni: membri asignați, clasele de azi, antrenamente planificate
- [ ] Calendar personal trainer

### Program locație
- [x] Tab "Program" în pagina de detaliu a locației
- [x] Grid editabil pentru fiecare zi a săptămânii (oră deschis / oră închis / închis)
- [x] Butoane marcare sărbători / zile închise

### Progres fitness (Member)
- [x] Pagină `/admin/progress` — tabel înregistrări cu formular adăugare
- [ ] Pagina `/member/progress` — vizualizare personală progres
- [ ] Grafice evoluție: greutate în timp, progres măsurători (chart.js sau recharts)
- [x] Serviciu `src/services/progress.ts` (`fitness-progress.ts`)

---

## 🟢 Prioritate scăzută / Opțional

### Dashboard Membru
- [ ] Pagina `/member/dashboard` — rezumat:
  - abonament activ + zile rămase
  - check-in-uri luna aceasta
  - următorul antrenament
  - progres challenge activ
  - ultimele notificări

### Challenge System
- [ ] Pagina `/admin/challenges` — CRUD challenge-uri
- [ ] Componentă `ChallengeCard` cu bară progres și clasament
- [ ] Pagina `/member/challenges` — challenge-uri disponibile + buton join
- [ ] Leaderboard per challenge
- [ ] Serviciu `src/services/challenges.ts`

### Notificări
- [ ] Componentă `NotificationBell` în header cu badge număr necitite
- [ ] Dropdown notificări: listă cu tip, mesaj, timestamp
- [ ] Marcare toate citite
- [ ] Serviciu `src/services/notifications.ts`

### Export Rapoarte
- [ ] Butoane "Export CSV" în tabelele de membri, plăți, check-in-uri
- [ ] Pagina `/admin/reports` — rapoarte predefinite cu filtrare perioadă + locație
- [ ] Grafice: venit lunar, check-in-uri pe zi, abonamente active vs expirate

### Discounturi & Promoții
- [ ] Pagina `/admin/promo` — CRUD coduri promoționale
- [ ] Input cod promo în formularul de plată cu validare live
- [ ] Serviciu `src/services/promo.ts`

### Echipamente
- [ ] Pagina `/admin/equipment` — CRUD echipamente per locație
- [ ] Badge status cu culori: FUNCTIONAL (verde), MAINTENANCE (galben), BROKEN (roșu)
- [ ] Serviciu `src/services/equipment.ts`

### Mesagerie Trainer–Membru
- [ ] Pagina `/admin/messages` — inbox simplu
- [ ] Componentă `ChatPanel` — conversație cu un utilizator
- [ ] Notificare mesaj nou (badge)
- [ ] Serviciu `src/services/messages.ts`

### Contracte membre
- [ ] Secțiune "Contract" în profilul membrului
- [ ] Upload link document + status semnat/nesemnat
- [ ] Serviciu `src/services/contracts.ts`

### QR Membership Card
- [ ] Pagina `/member/card` — afișare card digital với:
  - Foto/avatar
  - Nume complet
  - Status abonament
  - QR code (JWT scurt sau UUID membership)
- [ ] Generare QR cu `qrcode` sau `qrcode.react`

---

## 🔧 Îmbunătățiri tehnice

- [ ] Paginare pentru toate tabelele mari (membri, plăți, check-in-uri)
- [ ] Filtrare + căutare în tabele
- [ ] Sortare coloane tabele
- [ ] Lazy loading pagini (route-based code splitting)
- [ ] Gestionare token refresh automat în `src/services/api.ts` (interceptor axios)
- [ ] Stare globală user în zustand (sync cu cookie)
- [ ] Pagini de eroare personalizate (404, 500)
- [ ] PWA manifest pentru instalare pe tabletă (recepție)
