# API Endpoint Implementation Plan: GET /flashcards

## 1. Przegląd punktu końcowego
Endpoint służy do pobierania wszystkich fiszek należących do zalogowanego użytkownika, z opcjonalnym filtrowaniem, sortowaniem i paginacją.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: /flashcards
- Parametry:
  - Wymagane: brak
  - Opcjonalne:
    - limit, offset (parametry paginacji)
    - search (fraza wyszukiwania w polach front/back)
    - sort (np. created_at)

## 3. Wykorzystywane typy
- `PaginationParams: { limit: number; offset: number }`
- `PaginatedResponse<FlashcardDTO>: { data: FlashcardDTO[]; meta: { limit: number; offset: number; total: number } }`
- `FlashcardDTO: Flashcard` – reprezentacja fiszki z bazy.

## 4. Szczegóły odpowiedzi
- Sukces (200 OK):
  ```json
  {
    "data": [ /* tablica FlashcardDTO */ ],
    "meta": { "limit": 10, "offset": 0, "total": 100 }
  }
  ```
- Potencjalne błędy:
  - 401 Unauthorized
  - 500 Internal Server Error

## 5. Przepływ danych
1. Pobranie parametrów paginacji i filtrów z żądania.
2. Weryfikacja autoryzacji użytkownika.
3. Wykonanie zapytania do bazy z uwzględnieniem filtrów.
4. Zwrócenie wyników w formie paginowanej odpowiedzi.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: Endpoint wymaga ważnego tokena autoryzacyjnego (Supabase Auth).
- Autoryzacja: Stosowane są polityki RLS, które zapewniają, że użytkownik ma dostęp tylko do swoich danych.

## 7. Obsługa błędów
- 401 Unauthorized dla nieautoryzowanych żądań.
- 500 Internal Server Error przy błędach operacyjnych.

## 8. Rozważania dotyczące wydajności
- Użycie indeksów na kolumnach wyszukiwania (m.in. user_id, created_at).
- Efektywna paginacja.

## 9. Etapy wdrożenia
1. Implementacja logiki pobierania fiszek z paginacją i filtrowaniem.
2. Integracja endpointu w Astro z middleware autoryzacyjnym.