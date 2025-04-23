# API Endpoint Implementation Plan: POST /flashcards

## 1. Przegląd punktu końcowego
Endpoint umożliwia tworzenie nowych fiszek – pojedynczo lub zbiorczo. Obsługuje zarówno fiszki ręczne, jak i generowane przez AI.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: /flashcards
- Request Body (przykład):
  ```json
  {
    "flashcards": [
      {
        "front": "Front text",
        "back": "Back text",
        "source": "Manual",
        "generationId": 123  // opcjonalnie, jeśli fiszka pochodzi z generacji AI
      }
    ]
  }
  ```
- Walidacje:
  - front: 1-200 znaków
  - back: 1-500 znaków
  - source: wartość 'Manual', 'AI-full' lub 'AI-edited'
  - Jeśli source to 'AI-full' lub 'AI-edited', generationId jest wymagany

## 3. Wykorzystywane typy
- `CreateFlashcardDTO: { front: string; back: string; source: "Manual" | "AI-full" | "AI-edited"; generationId?: number }`
- `CreateFlashcardsCommand: { flashcards: CreateFlashcardDTO[] }`

## 4. Szczegóły odpowiedzi
- Sukces (201 Created):
  ```json
  [
    {
      "id": 1,
      "front": "Front text",
      "back": "Back text",
      "source": "Manual"
    }
  ]
  ```
- Potencjalne błędy:
  - 400 Bad Request: błędne dane wejściowe
  - 401 Unauthorized
  - 422 Unprocessable Entity: nieprawidłowy identyfikator generationId

## 5. Przepływ danych
1. Odczytanie i walidacja danych wejściowych z żądania.
2. Weryfikacja autoryzacji użytkownika.
3. Wstawienie danych do tabeli `flashcards` przy użyciu Supabase.
4. Zaktualizowanie generacji o statystuki związane z liczbą zaakceptowanych kandydatów na fiszki itp. 
5. Zwrócenie utworzonych rekordów.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: Endpoint wymaga ważnego tokena autoryzacyjnego (Supabase Auth).
- Autoryzacja: Stosowane są polityki RLS, które zapewniają, że użytkownik ma dostęp tylko do swoich danych.

## 7. Obsługa błędów
- 400 Bad Request przy nieprawidłowych danych.
- 401 Unauthorized.
- 422 Unprocessable Entity, jeśli generationId jest nieprawidłowe.

## 8. Rozważania dotyczące wydajności
- Efektywność insercji wielu rekordów (batch insert) oraz użycie transakcji.

## 9. Etapy wdrożenia
1. Implementacja walidatora wejścia przy użyciu zod.
2. Implementacja warstwy service (`flashcard.service`), która obejmuje:
 - Wstawienie danych do tabeli `flashcards` za pomocą Supabase.
 - Zaktualizowanie danych generacji w tabeli `generations` przy użyciu Supabase (context.locals), z wykorzystaniem serwisu `generation.service`.
3. Integracja logiki endpointu w Astro route z wykorzystaniem:
  - Middleware do obsługi autoryzacji (Supabase Auth oraz RLS).
  - Wywołania warstwy service.
4. Dodanie szczegółowego logowania akcji i błędów.