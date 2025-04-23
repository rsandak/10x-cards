# API Endpoint Implementation Plan: GET /flashcards/{id}

## 1. Przegląd punktu końcowego
Endpoint umożliwia pobranie szczegółów konkretnej fiszki na podstawie jej identyfikatora.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: /flashcards/{id}
- Parametry:
  - Wymagane: id (identyfikator fiszki)

## 3. Wykorzystywane typy
- `FlashcardDTO: Flashcard` – reprezentacja fiszki.

## 4. Szczegóły odpowiedzi
- Sukces (200 OK):
  ```json
  {
    "id": 1,
    "front": "Front text",
    "back": "Back text",
    "source": "Manual"
  }
  ```
- Potencjalne błędy:
  - 401 Unauthorized
  - 404 Not Found
  - 500 Internal Server Error

## 5. Przepływ danych
1. Odczytanie identyfikatora fiszki z URL.
2. Weryfikacja autoryzacji użytkownika.
3. Pobranie danych fiszki z bazy.
4. Zwrócenie szczegółów fiszki.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: Endpoint wymaga ważnego tokena autoryzacyjnego (Supabase Auth).
- Autoryzacja: Stosowane są polityki RLS, które zapewniają, że użytkownik ma dostęp tylko do swoich danych.

## 7. Obsługa błędów
- 401 Unauthorized dla nieautoryzowanych żądań.
- 404 Not Found, jeśli fiszka nie istnieje.
- 500 Internal Server Error przy problemach operacyjnych.

## 8. Rozważania dotyczące wydajności
- Użycie indeksów na kolumnach id i user_id.

## 9. Etapy wdrożenia
1. Implementacja logiki pobierania fiszki.
2. Integracja endpointu w Astro z middleware autoryzacyjnym.