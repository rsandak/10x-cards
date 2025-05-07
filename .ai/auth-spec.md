# Specyfikacja modułu autentykacji i zarządzania użytkownikami

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### Zmiany w warstwie frontendu

- Utworzenie dedykowanych stron: `/pages/auth/register`, `/pages/auth/login`, `/pages/auth/forgot-password`.
- Rozszerzenie istniejących layoutów:
  - Nowy layout `AuthLayout.astro` dedykowany stronom autentykacji, zawierający uproszczony header oraz wspólny styl formularzy.
  - Wykorzystanie istniejącego `Layout.astro` dla stron przeznaczonych dla użytkowników zalogowanych.
  - Dodanie przycisku wyloguj
- Implementacja komponentów formularzy rejestracji, logowania i odzyskiwania hasła jako dynamicznych komponentów React umieszczonych w katalogu `src/components/ui`.
- Dodanie linków do stron rejestracji, logowania oraz odzyskiwania hasła w głównym menu lub na stronie głównej, aby użytkownicy nieautoryzowani mieli łatwy dostęp do autentykacji.

### Rozdzielenie odpowiedzialności

- Strony Astro pełnią rolę kontenera, odpowiedzialnego za routing, renderowanie layoutu oraz nawigację.
- Komponenty React (formularze) odpowiadają za walidację pól, obsługę stanów formularza oraz interakcję z backendem poprzez fetch/axios do wywołań API.
- Integracja z backendem autentykacji realizowana jest poprzez wysyłanie zapytań do endpointów API umieszczonych w `src/pages/api/auth`.

### Walidacja i komunikaty błędów

- Walidacja danych wejściowych odbywa się na dwóch poziomach:
  - Klient-side: sprawdzenie obecności wymaganych pól, poprawności formatu email, minimalnych wymagań dla hasła itp. (np. przy użyciu walidacji z poziomu React).
  - Server-side: dodatkowa walidacja danych przy użyciu bibliotek (np. Zod lub Yup) oraz ręczna walidacja w kodzie API.
- Błędy walidacji prezentowane są użytkownikowi zarówno bezpośrednio w formularzu (pod konkretnymi polami) jak również w formie globalnych powiadomień (toast messages).
- Kluczowe scenariusze:
  - Puste pola lub niepoprawny format danych (email, hasło).
  - Błędy po stronie serwera (np. duplikacja konta, błąd wewnętrzny).
  - Sukces lub niepowodzenie operacji (rejestracja, logowanie, odzyskiwanie hasła).

## 2. LOGIKA BACKENDOWA

### Struktura endpointów API i modele danych

- Utworzenie dedykowanych endpointów API w katalogu `src/pages/api/auth`:
  - `register.ts` – endpoint do rejestracji nowego użytkownika.
  - `login.ts` – endpoint do logowania użytkownika.
  - `logout.ts` – endpoint do wylogowywania użytkownika.
  - `forgot-password.ts` – endpoint do inicjowania procesu odzyskiwania hasła.
- Definicje modeli danych w TypeScript (np. `UserDTO`, `AuthResponse`) umieszczone w `src/types.ts` lub w dedykowanym module.

### Mechanizmy walidacji i obsługa wyjątków

- Implementacja walidacji danych wejściowych przy użyciu bibliotek (np. Zod lub Yup) lub za pomocą ręcznej walidacji:
  - Sprawdzanie poprawności formatu email, długości hasła oraz innych kryteriów.
  - Wczesne zwracanie błędów przy niepoprawnych danych wejściowych.
- Obsługa wyjątków:
  - Przechwytywanie błędów po stronie Supabase Auth i zwracanie przyjaznych komunikatów błędów wraz z odpowiednimi kodami HTTP.
  - Rejestrowanie błędów w systemowych logach.

### Renderowanie stron server-side

- Adaptacja renderowania stron Astro z wykorzystaniem middleware (np. `src/middleware/index.ts`) do weryfikacji sesji użytkownika przed renderowaniem stron chronionych.
- Aktualizacja konfiguracji w `@astro/config.mjs` w celu uwzględnienia nowych endpointów API oraz integracji z middleware autoryzacyjnym.

## 3. SYSTEM AUTENTYKACJI

### Integracja z Supabase Auth

- Wykorzystanie Supabase Auth do obsługi rejestracji, logowania, wylogowywania oraz odzyskiwania hasła:
  - Rejestracja: Wywołanie metody `supabase.auth.signUp` z odpowiednimi danymi (email, hasło).
  - Logowanie: Użycie `supabase.auth.signIn` w celu zalogowania użytkownika.
  - Wylogowywanie: Implementacja funkcji wylogowania poprzez `supabase.auth.signOut`.
  - Odzyskiwanie hasła: Inicjowanie procesu resetowania hasła przy użyciu `supabase.auth.api.resetPasswordForEmail`.
- Uwaga: Konfiguracja procesu rejestracji powinna umożliwiać natychmiastową aktywację konta zgodnie z wymaganiami US-005. W razie potrzeby, mechanizm weryfikacji e-mail może zostać włączony przez odpowiednią konfigurację Supabase.

### Integracja z Astro

- Przekazywanie stanu sesji z Supabase do stron renderowanych przez Astro, co umożliwia renderowanie treści dostosowanej do autoryzacji użytkownika.
- Dynamiczne zarządzanie routingiem i widokami w zależności od stanu sesji (auth / non-auth).

## Podsumowanie

Specyfikacja przedstawia kompleksowe podejście do wdrożenia modułu autentykacji w oparciu o Supabase Auth. Została zapewniona wyraźna separacja logiki frontendowej (strony Astro, komponenty React) oraz backendowej (endpointy API, walidacja wejść, obsługa wyjątków).

Kluczowe komponenty i moduły:

- Interfejs użytkownika:
  - Strony: `/pages/auth/register`, `/pages/auth/login`, `/pages/auth/forgot-password`
  - Layouty: `AuthLayout.astro` i `Layout.astro`
  - Komponenty formularzy w `src/components/ui`
- Backend:
  - Endpointy API w `src/pages/api/auth/*`
  - Modele danych i typy w `src/authtypes.ts`
- System autentykacji:
  - Integracja z Supabase Auth (metody signUp, signIn, signOut, resetPasswordForEmail)
  - Middleware do weryfikacji sesji
  - Mechanizmy bezpieczeństwa (przechowywanie tokenów w ciasteczkach httpOnly)

To rozwiązanie zapewni bezpieczną i przejrzystą obsługę procesu rejestracji, logowania, wylogowania oraz odzyskiwania hasła, a także płynne zarządzanie stanem sesji użytkownika zgodnie z wymaganiami produktu i stosowanym stackiem technologicznym.
