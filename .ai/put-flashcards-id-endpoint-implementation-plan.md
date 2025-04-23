# API Endpoint Implementation Plan: PUT /flashcards/{id}

## 1. Przegląd punktu końcowego
Endpoint umożliwia aktualizację istniejącej fiszki. Pozwala na modyfikację pól `front` oraz/lub `back`.

## 2. Szczegóły żądania
- Metoda HTTP: PUT
- Struktura URL: /flashcards/{id}
- Request Body (przykład):
  ```json
  {
    "front": "Updated front text",
    "back": "Updated back text"
  }
  ```
- Walidacje:
  - Co najmniej jedno pole (`front` lub `back`) musi zostać podane.
  - `front`: 1-200 znaków.
  - `back`: 1-500 znaków.

## 3. Wykorzystywane typy
- `UpdateFlashcardCommand: { front?: string; back?: string }`

## 4. Szczegóły odpowiedzi
- Sukces (200 OK):
  ```json
  {
    "id": 1,
    "front": "Updated front text",
    "back": "Updated back text",
    "source": "Manual"
  }
  ```
- Potencjalne błędy:
  - 400 Bad Request: jeśli dane są nieprawidłowe lub brak wymaganych pól.
  - 401 Unauthorized.
  - 404 Not Found: fiszka nie istnieje.
  - 500 Internal Server Error.

## 5. Przepływ danych
1. Odczytanie identyfikatora fiszki oraz danych z request body.
2. Walidacja przekazanych danych.
3. Aktualizacja rekordu fiszki w bazie.
4. Zwrócenie zaktualizowanego rekordu.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: Endpoint wymaga ważnego tokena autoryzacyjnego (Supabase Auth).
- Autoryzacja: Stosowane są polityki RLS, które zapewniają, że użytkownik ma dostęp tylko do swoich danych.

## 7. Obsługa błędów
- 400 Bad Request dla nieprawidłowych danych.
- 401 Unauthorized przy braku autoryzacji.
- 404 Not Found, jeśli rekord nie istnieje.
- 500 Internal Server Error przy problemach z bazą.

## 8. Rozważania dotyczące wydajności

## 9. Etapy wdrożenia
1. Stworzenie walidatora danych wejściowych przy użyciu zod w warstwie endpointu.
2. Implementacja logiki aktualizacji w warstwie service.
3. Integracja endpointu z middleware autoryzacyjnym.
4. Dodanie szczegółowego logowania akcji i błędów.