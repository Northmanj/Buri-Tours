# Buri Tours & Travels Consultants (Nairobi, Kenya)

Luxury safari-style travel website + booking system + admin dashboard.

## What's included

- **`index.html`**: Premium landing page (Airbnb-style) with packages, booking form, destinations, FAQ, contact + Google Map.
- **`admin.html`**: Admin dashboard (login + bookings table + search + delete + stats).
- **Booking system**
  - Saves bookings to **`localStorage`**
  - Also sends booking by email via **FormSubmit**
- **Animations**: Smooth reveal on scroll + optional hero parallax (disabled for reduced-motion users).
- **SEO**: Kenya-focused title/description/keywords, structured data (TravelAgency + FAQ), plus `robots.txt` and `sitemap.xml`.

## File structure

```
.
├── index.html
├── admin.html
├── styles.css
├── main.js
├── admin.css
├── admin.js
├── robots.txt
├── sitemap.xml
└── images/
   ├── logo.png
   ├── hero.jpg
   ├── mara.jpg
   ├── diani.jpg
   └── nairobi.jpg
```

## How to run (recommended)

Run a tiny local web server (needed so fetch/FormSubmit behaves normally and assets load reliably).

### Option A: Python (most common)

```bash
cd /home/northman/grego/buritour
python3 -m http.server 8000
```

Open:
- `http://localhost:8000/index.html`
- `http://localhost:8000/admin.html`

### Option B: Node (if installed)

```bash
cd /home/northman/grego/buritour
npx serve .
```

## Admin login

- **Email**: `admin@gmail.com`
- **Password**: `1234`

## Important setup steps (before going live)

### 1) Set your FormSubmit email

In `index.html`, update:

- `action="https://formsubmit.co/YOUR-EMAIL@gmail.com"`

Replace `YOUR-EMAIL@gmail.com` with the real email address that should receive booking notifications.

### 2) Update your live domain (SEO + sitemap)

In these files, replace `https://example.com/` with your real domain:

- `index.html` (canonical + schema.org URL)
- `robots.txt`
- `sitemap.xml`

## Notes

- The admin dashboard reads from **the same browser’s localStorage** as the booking form.  
  For multi-device admin access, you’ll want a backend + database (I can add this later if you want).

