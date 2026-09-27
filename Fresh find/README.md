# FreshFind - Local Farmers Markets & Seasonal Produce Companion

> **Techwiz 7 Global Competition**  
> **Theme:** eGreen Basket  
> **Category:** Web Innovation Unleashed  
> **Stack:** React.js (Vite), Pure CSS3, JSON Data Store, Client-side Storage

---

## 📌 How to Open and Run in VS Code

### Step 1: Open in VS Code
1. Open **Visual Studio Code**.
2. Click **File** > **Open Folder...** (or press `Ctrl + K, Ctrl + O`).
3. Select this folder:  
   `C:\Users\ESHOP\OneDrive\Desktop\Fresh find`

### Step 2: Open Terminal & Run
1. Press `` Ctrl + ` `` (backtick) or go to **Terminal** > **New Terminal** in VS Code.
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Click the local link displayed in terminal (e.g. `http://localhost:5173`) to view the application in your browser.

---

## 🌿 Project Structure

- `public/data/` & `src/data/`
  - `markets.json` - Comprehensive database of 8 local farmers markets with hours, coordinates, amenities, and photos.
  - `produce.json` - 18 seasonal fruits, vegetables, herbs, and dairy items with health facts and kitchen storage tips.
  - `chatbot.json` - Offline pre-scripted FAQ dataset and rule-based keyword triggers.
- `src/components/`
  - `Navbar.jsx` - Header with bookmarks badge, navigation, and mobile drawer.
  - `LiveStatusBar.jsx` - Real-time live clock, odometer visitor counter, and GPS locator.
  - `Hero.jsx` - Quick Find search bar (filter by area, day of week, or produce category).
  - `MarketHighlights.jsx` - Featured and currently open markets showcase.
  - `MarketDirectory.jsx` - Search, multiple filters, "Open Right Now" toggle, and sorting algorithms.
  - `MarketDetail.jsx` - Weekly schedule table, embedded Google map, produce grid, and visitor notes.
  - `ProduceGuide.jsx` - Browsable harvest catalogue with direct links to carrying markets.
  - `SeasonalRecommendations.jsx` - Dynamic season detector and eGreen Basket eco tips.
  - `Chatbot.jsx` - Floating assistant with offline keyword matching and deep links.
  - `BookmarksModal.jsx` - Save favorites, write personal shopping notes, export `.txt`, and share.
  - `AuthModal.jsx` - Dummy login/signup modal for SRS design continuity.
  - `ContactUs.jsx` - Interactive message form, headquarters info, and live geolocation.
  - `AboutUs.jsx` - Techwiz 7 team cards, project background, and SDG goals alignment.
  - `Footer.jsx` - Newsletter digest form and competition credits.
- `src/context/BookmarkContext.jsx` - Global state for bookmarks, notes, and file export.
- `src/utils/timeHelpers.js` - Real-time open/closed math, next open day detection, and Haversine distance.
- `PROJECT_DOCUMENTATION_AND_VIVA_GUIDE.md` - Complete examiner viva Q&A and architecture explanations.

---

## 💡 Key Highlights for Judges

1. **Zero Backend Dependency (SRS Section 1.5):** Strictly runs in the browser using pre-populated JSON data files.
2. **Offline Rule-Based AI Chatbot:** Matches user questions against pre-scripted intents without requiring external API keys.
3. **Real-Time Clock & Dynamic "Open Now" Status:** Matches the current system day and time against each market's schedule.
4. **Retro Odometer Visitor Counter:** Simulates community visitors using `localStorage` increments.
5. **Content Bookmarking & Note Export:** Allows users to save markets, write personal visit notes, and download a formatted shopping `.txt` file.
