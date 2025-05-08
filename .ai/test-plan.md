# Plan testów

## 1. Wprowadzenie

### 1.1 Cel planu testów

Celem niniejszego planu testów jest zapewnienie wysokiej jakości oraz niezawodności aplikacji opartej na Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui oraz Supabase. Plan określa zakres, strategie, środowisko, przypadki testowe, harmonogram, raportowanie, kryteria akceptacji oraz zarządzanie ryzykami.

### 1.2 Zakres testów

Testy obejmują:

- Warstwę frontend: komponenty React oraz strony Astro
- Warstwę backend: API endpoints w `src/pages/api`
- Integrację z bazą danych Supabase
- Integrację z usługą Openrouter.ai
- Walidację danych oraz autentykację użytkownika
- UI i UX głównych funkcjonalności, w tym generowanie fiszek

## 2. Strategia testowania

### 2.1 Typy testów do przeprowadzenia

- Testy jednostkowe (unit tests) — logika biznesowa, funkcje pomocnicze, walidatory.
- Testy komponentów (component tests) — testowanie komponentów React z wykorzystaniem Testing Library.
- Testy integracyjne (integration tests) — weryfikacja współpracy z Supabase i API endpoints.
- Testy end-to-end (E2E) — symulacja scenariuszy użytkownika (Playwright).
- Testy bezpieczeństwa — sprawdzenie autoryzacji, uwierzytelniania, XSS, CSRF.
- Testy wydajności — podstawowa analiza czasu ładowania stron (Lighthouse).
- Testy dostępności (a11y) — walidacja przy pomocy axe lub Lighthouse.
- Testy wizualne — detekcja regresji wizualnych w komponentach UI.

### 2.2 Priorytety testowania

1. Krytyczne ścieżki (autentykacja, generowanie fiszek, zapisywanie do bazy).
2. Walidacja danych i obsługa błędów.
3. Komponenty UI odpowiadające za interakcje użytkownika.
4. Integracja z zewnętrznymi usługami (Supabase, Openrouter.ai).
5. Wydajność i dostępność.

## 3. Środowisko testowe

### 3.1 Wymagania sprzętowe i programowe

- System operacyjny: macOS / Linux / Windows
- Node.js ≥ 18.x
- Docker (opcjonalnie, do lokalnego hostowania Supabase)
- Przeglądarka Chromium dla testów E2E

### 3.2 Konfiguracja środowiska

- Instalacja zależności: `npm ci`
- Uruchomienie Supabase lokalnie lub ustawienie zmiennych środowiskowych dla zdalnego klienta.
- Plik `.env` z kluczami do Supabase i Openrouter.ai
- Skrypty testowe w `package.json`:
  - `npm run test:unit`
  - `npm run test:component`
  - `npm run test:integration`
  - `npm run test:e2e`
  - `npm run test:visual`

### 3.3 Środowiska testowe

- Development (DEV): lokalne środowisko deweloperskie z mockami Supabase i Openrouter.ai, baza danych testowa, debugowanie i hot-reload.
- Test (QA): środowisko integracyjne z zdalnymi instancjami Supabase i Openrouter.ai, odświeżana baza danych QA oraz izolowane dane testowe.
- UAT (User Acceptance Testing): stagingowe środowisko z pełną konfiguracją produkcyjną, osobna baza danych UAT, dostępne dla interesariuszy do weryfikacji.
- Production (PROD): środowisko produkcyjne z realną bazą danych Supabase, monitoringiem, alertami oraz kontrolowanym dostępem.

### 3.4 Narzędzia testowania

- Testy jednostkowe: Vitest z Testing Library i MSW
- Testy komponentów: React Testing Library, Storybook, Chromatic dla testów wizualnych
- Testy integracyjne/API: MSW (Mock Service Worker)
- Testy end-to-end: Playwright (v1.x)
- Testy dostępności (a11y): axe-core, Lighthouse CI
- Testy wydajności: Lighthouse CLI, WebPageTest
- Testy bezpieczeństwa: OWASP ZAP, Snyk
- Walidacja typów i danych: Zod + TypeScript
- Analiza pokrycia kodu: Vitest coverage/Instanbul, Codecov
- Code quality: ESLint, Prettier, SonarQube (lub SonarCloud)
- Zarządzanie zależnościami: Renovate/Dependabot
- CI/CD: GitHub Actions, Docker
- Testowanie stanu aplikacji: TanStack Query Test Utils (dla TanStack Query)

## 4. Przypadki testowe

### 4.1 Autentykacja

**Opis**: Rejestracja, logowanie, wylogowanie, reset hasła.  

- 4.1.1 Rejestracja nowego użytkownika  
  - Dane: poprawny email, silne hasło  
  - Oczekiwany rezultat: użytkownik utworzony, token otrzymany  
- 4.1.2 Rejestracja z istniejącym email  
  - Dane: email już zarejestrowany  
  - Oczekiwany rezultat: komunikat błędu „Email już użyty"  
- 4.1.3 Logowanie poprawne  
  - Dane: poprawne dane uwierzytelniające  
  - Oczekiwany rezultat: token sesji, przekierowanie do dashboard  
- 4.1.4 Logowanie niepoprawne hasło  
  - Dane: błędne hasło  
  - Oczekiwany rezultat: komunikat „Niepoprawne dane logowania"  
- 4.1.5 Reset hasła  
  - Dane: istniejący email  
  - Oczekiwany rezultat: wysłanie linku resetującego  

### 4.2 Generowanie fiszek

**Opis**: Interfejs generowania fiszek przez Openrouter.ai.

- 4.2.1 Poprawne dane wejściowe  
  - Dane: krótki fragment tekstu  
  - Oczekiwany rezultat: lista propozycji fiszek  
- 4.2.2 Pusty prompt  
  - Dane: brak tekstu  
  - Oczekiwany rezultat: walidacja „Pole wymagane"  
- 4.2.3 Błędne dane (np. zbyt długi tekst)  
  - Dane: tekst > 5000 znaków  
  - Oczekiwany rezultat: ograniczenie wejścia lub komunikat  
- 4.2.4 Błąd sieci lub usługi  
  - Symulacja: serwer Openrouter niedostępny  
  - Oczekiwany rezultat: komunikat „Błąd generowania, spróbuj ponownie"  

### 4.3 Komponenty UI

**Opis**: Testy renderingowe i interakcje podstawowych komponentów Shadcn/ui.  

- 4.3.1 `Button`  
  - Renders default, disabled state, click handler invocation  
- 4.3.2 `Input` / `Textarea`  
  - Zmiana wartości, focus/blur, walidacja błędów  
- 4.3.3 `Card` / `Badge`  
  - Poprawne wyświetlanie treści i slotów  
- 4.3.4 Testy wizualne komponentów
  - Weryfikacja wyglądu w różnych stanach i breakpointach

### 4.4 API Endpoints

**Opis**: Testy integracyjne z `src/pages/api`.  

- 4.4.1 GET `/api/flashcards`  
  - Autoryzowany, zwraca listę fiszek  
- 4.4.2 POST `/api/generations`  
  - Poprawne body, zwraca ID generacji  
- 4.4.3 Błędne żądanie (400)  
- 4.4.4 Nieautoryzowane (401)  
- 4.4.5 Błąd serwera (500)  

## 5. Harmonogram testów

| Faza                  | Typ testów            | Szacowany czas |
|-----------------------|-----------------------|----------------|
| Przygotowanie         | Konfiguracja          | 1 dzień        |
| Testy jednostkowe     | Unit tests            | 2 dni          |
| Testy komponentów     | Component tests       | 2 dni          |
| Testy wizualne        | Visual tests          | 1 dzień        |
| Testy integracyjne    | Integration tests     | 3 dni          |
| Testy E2E             | End-to-end            | 4 dni          |
| Testy bezpieczeństwa  | Security tests        | 1 dzień        |
| Testy wydajności      | Performance tests     | 1 dzień        |

## 6. Raportowanie i śledzenie błędów

- Użycie GitHub Issues z etykietami: `critical`, `major`, `minor`, `trivial`  
- Szablon zgłoszenia: opis, kroki, oczekiwany / rzeczywisty rezultat, załączniki  
- Narzędzia: GitHub, możliwe integracje z Jira
- Automatyczne raporty pokrycia kodu w Codecov po każdym push/PR

## 7. Kryteria akceptacji

- Wszystkie przypadki testowe wykonane i zaliczone  
- Pokrycie testami jednostkowymi ≥ 80% linii kodu  
- Brak otwartych krytycznych (P0) defektów  
- Pozytywne wyniki testów bezpieczeństwa
- Brak regresji wizualnych w komponentach UI

## 8. Ryzyka i plan łagodzenia ryzyk

- Ryzyko: Awaria Supabase → migracja testów na mock Supabase z MSW
- Ryzyko: Niedostępność Openrouter.ai → mock odpowiedzi z MSW, fallback UI  
- Ryzyko: Błędy SSR/Hydration → testy w środowisku produkcyjnym  
- Ryzyko: Niezgodność przeglądarek → testy cross-browser w Playwright
- Ryzyko: Zmiany w zależnościach → automatyczna aktualizacja z Renovate/Dependabot
- Plan: Regularne przeglądy testów, integracja CI w GitHub Actions
