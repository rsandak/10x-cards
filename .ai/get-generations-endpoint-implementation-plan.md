# API Endpoint Implementation Plan: GET /generations

## 1. Przegląd punktu końcowego
Endpoint służy do pobierania wszystkich rekordów generacji dla zalogowanego użytkownika. Obsługuje paginację oraz opcjonalne filtrowanie (np. po modelu).

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: /generations
- Parametry:
  - Wymagane: brak
  - Opcjonalne:
    - limit (number) – parametr paginacji
    - offset (number) – parametr paginacji
    - filtr (np. model) – opcjonalne kryteria filtrowania

## 3. Wykorzystywane typy
- `PaginationParams: { limit: number; offset: number }` – parametry paginacji.
- `PaginatedResponse<GenerationDTO>: { data: GenerationDTO[]; meta: { limit: number; offset: number; total: number } }` – paginowana odpowiedź z danymi generacji.
- `GenerationDTO: Generation` – reprezentacja danych generacji.

## 4. Szczegóły odpowiedzi
- Sukces (200 OK):
  ```json
  {
    "data": [ /* tablica GenerationDTO */ ],
    "meta": {
      "limit": 10,
      "offset": 0,
      "total": 50
    }
  }
  ```
- Potencjalne błędy:
  - 401 Unauthorized: brak ważnego tokena
  - 500 Internal Server Error: błąd podczas pobierania danych

## 5. Przepływ danych
1. Odczytanie parametrów paginacji i ewentualnych filtrów z żądania.
2. Weryfikacja autoryzacji użytkownika (Supabase Auth, RLS).
3. Wykonanie zapytania do bazy z uwzględnieniem parametrów.
4. Zwrócenie wyników w formie paginowanej odpowiedzi.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: Endpoint wymaga ważnego tokena autoryzacyjnego (Supabase Auth).
- Autoryzacja: Stosowane są polityki RLS, które zapewniają, że użytkownik ma dostęp tylko do swoich danych.

## 7. Obsługa błędów
- 401 Unauthorized dla nieautoryzowanych żądań.
- 500 Internal Server Error przy problemach z bazą.

## 8. Rozważania dotyczące wydajności
- Użycie indeksów na kolumnie user_id.
- Efektywna paginacja ograniczająca zwracane rekordy.

## 9. Etapy wdrożenia
1. Implementacja logiki pobierania danych z bazy z uwzględnieniem parametrów paginacji.
2. Integracja logiki z endpointem w Astro.