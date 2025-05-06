# API Endpoint Implementation Plan: GET /generations/{id}

## 1. Przegląd punktu końcowego

Endpoint służy do pobierania szczegółów konkretnej generacji na podstawie jej identyfikatora.

## 2. Szczegóły żądania

- Metoda HTTP: GET
- Struktura URL: /generations/{id}
- Parametry:
  - Wymagane: id (identyfikator generacji)

## 3. Wykorzystywane typy

- `GenerationDTO: Generation` – szczegółowe dane generacji.

## 4. Szczegóły odpowiedzi

- Sukces (200 OK):

  ```json
  { "id": 123, "user_id": "uuid", "model": "gpt-4", ... }
  ```

- Potencjalne błędy:
  - 401 Unauthorized
  - 404 Not Found: jeśli generacja nie istnieje
  - 500 Internal Server Error

## 5. Przepływ danych

1. Odczytanie identyfikatora generacji z URL.
2. Weryfikacja autoryzacji użytkownika.
3. Wykonanie zapytania do bazy na podstawie id.
4. Zwrócenie danych generacji lub odpowiedni status, jeśli rekord nie istnieje.

## 6. Względy bezpieczeństwa

- Uwierzytelnianie: Endpoint wymaga ważnego tokena autoryzacyjnego (Supabase Auth).
- Autoryzacja: Stosowane są polityki RLS, które zapewniają, że użytkownik ma dostęp tylko do swoich danych.

## 7. Obsługa błędów

- 401 Unauthorized dla nieautoryzowanych żądań.
- 404 Not Found, jeśli rekord nie istnieje.
- 500 Internal Server Error przy problemach z bazą.

## 8. Rozważania dotyczące wydajności

- Efektywne zapytania dzięki indeksom.

## 9. Etapy wdrożenia

1. Implementacja logiki pobierania konkretnej generacji.
2. Integracja z endpointem w Astro.
