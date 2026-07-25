# Document 05 — Backend Schema & Data Model

## Offline Data Architecture

Since **AstroDSJK** operates as an **Offline-First Application**, the backend schema is represented via in-memory JavaScript data models, local Ephemeris structures, and browser `localStorage`.

---

## Core In-Memory Data Schemas

### 1. `BirthDetails` Object
```typescript
interface BirthDetails {
  fullName: string;
  dob: string;          // YYYY-MM-DD
  tob: string;          // HH:mm
  cityName: string;
  latitude: number;
  longitude: number;
  timezone: number;     // e.g. 5.5 for IST
  gender: 'male' | 'female' | 'other';
  language: string;
}
```

### 2. `PlanetaryPositions` Object
```typescript
interface PlanetPosition {
  planetName: string;   // Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
  totalDegree: number;  // 0 to 360
  rashiIndex: number;   // 1 to 12
  rashiName: string;    // Aries, Taurus, etc.
  rashiDeg: string;     // e.g. 15° 24'
  nakshatraName: string;// Ashwini, Rohini, etc.
  nakshatraLord: string;
  pada: number;         // 1 to 4
  isExalted: boolean;
  isDebilitated: boolean;
}
```

### 3. `ShodashaVargas` Object
```typescript
interface ShodashaVargas {
  D1: Record<string, number>;   // Rashi Chart (Planet -> House/Rashi 1-12)
  D2: Record<string, number>;   // Hora Chart
  D3: Record<string, number>;   // Drekkana Chart
  D7: Record<string, number>;   // Saptamsha Chart
  D9: Record<string, number>;   // Navamsha Chart
  D10: Record<string, number>;  // Dashamsha Chart
}
```

### 4. `PanchangData` Object
```typescript
interface PanchangData {
  tithiName: string;
  nakshatraName: string;
  yogaName: string;
  karanaName: string;
  varaName: string;
  ayanamsa: number;
}
```

### 5. `LocalPreferences` (`localStorage`)
```json
{
  "astro-theme": "dark | light",
  "astro-design-mode": "editorial | classic",
  "saved-charts": []
}
```
