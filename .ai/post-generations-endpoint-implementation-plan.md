# API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego

Endpoint POST /generations służy do generowania propozycji fiszek na podstawie dostarczonego tekstu wejściowego (source_text). Endpoint:

- waliduje długość tekstu,
- wywołuje zewnętrzny serwis LLM w celu wygenerowania kandydatów fiszek
- zapisuje metadane procesu generacji
- zwraca kandydatów na fiszki i liczbę wygenerowanych pozycji
- w przypadku błędów, loguje je do tabeli generation_error_logs.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Struktura URL: /generations
- Parametry:
  - Wymagane:
    - source_text (string, długość 1000 – 10000 znaków)
  - Opcjonalne: brak
- Request Body (przykład):

  ```json
  {
    "source_text": "Example input text with required length..."
  }
  ```

## 3. Wykorzystywane typy

- `GenerateFlashcardsCommand`: reprezentuje dane wejściowe z polem source_text.
- `GenerateFlashcardsResponseDTO`: model odpowiedzi zawierający:
  - `generationId`: number
  - `totalGenerated`: number
  - `flashcardCandidates`: FlashcardCandidateDTO[]
- `FlashcardCandidateDTO`: pojedynczy kandydat fiszki z polami:
  - `front`: string
  - `back`: string
  - `source`: wartość stała "AI-full"

## 4. Szczegóły odpowiedzi

- Sukces (201 Created):

  ```json
  {
    "generationId": 123,
    "totalGenerated": 5,
    "flashcardCandidates": [
      {
        "front": "Front text",
        "back": "Back text",
        "source": "AI-full"
      }
    ]
  }
  ```

- Potencjalne błędy:
  - 400 Bad Request: nieprawidłowe dane wejściowe (np. source_text nie spełnia wymagań długościowych)
  - 401 Unauthorized: brak ważnego tokena autoryzacyjnego
  - 500 Internal Server Error: błąd wewnętrzny, np. niepowodzenie wywołania LLM lub problem z zapisem do bazy

## 5. Przepływ danych

1. Odbiór żądania POST zawierającego w body `source_text`.
2. Walidacja danych wejściowych (sprawdzenie długości 1000 – 10000 znaków) przy użyciu narzędzia walidacyjnego (np. zod).
3. Przekazanie `source_text` do warstwy service (`generation.service`), która wywołuje zewnętrzne API LLM.
4. Odebrane dane generacji są zapisywane w tabeli `generations` przy użyciu Supabase (context.locals).
5. Utworzenie listy obiektów `FlashcardCandidateDTO` na podstawie odpowiedzi LLM.
6. Zwrócenie odpowiedzi z identyfikatorem generacji, liczbą wygenerowanych fiszek i listą kandydatów.
7. W przypadku błędu, zapis logu błędu w tabeli `generation_error_logs`.

## 6. Względy bezpieczeństwa

- Uwierzytelnianie: Endpoint wymaga ważnego tokena autoryzacyjnego (Supabase Auth).
- Autoryzacja: Stosowane są polityki RLS, które zapewniają, że użytkownik ma dostęp tylko do swoich danych.
- Walidacja: Stała walidacja danych wejściowych przy użyciu zod, aby zapobiec przetwarzaniu nieprawidłowych danych.
- Ochrona przed atakami: Korzystanie z przygotowanych zapytań oraz bezpiecznych metod interakcji z bazą, aby zapobiec SQL Injection.
- Ograniczona ekspozycja błędów: Szczegóły błędów nie powinny byc zwracane utytkownikowi. Niepełne informacje o błędach powinny być logowane wewnętrznie.

## 7. Obsługa błędów

- Walidacja danych wejściowych: Zwrócenie 400 Bad Request, jeśli `source_text` nie spełnia kryteriów.
- Problemy z autoryzacją: Zwrócenie 401 Unauthorized przy braku lub niewłaściwym tokenie.
- Błędy operacyjne:
  - W przypadku niepowodzenia wywołania LLM API, logowanie błędu do tabeli `generation_error_logs` i zwrócenie 500 Internal Server Error.
  - Błędy podczas zapisu danych do bazy skutkują odpowiedzią 500 Internal Server Error.

## 8. Rozważania dotyczące wydajności

- Optymalizacja zapytań dzięki użyciu indeksów (m.in. na kolumnie user_id).
- Ustalenie limitu czasu (60 sekund) oczekiwania na odpowiedź z serwisu AI, aby nie blokować zasobów aplikacji.
- Monitorowanie wydajności wywołań do LLM API oraz implementacja mechanizmu retry w razie niepowodzeń.
- Asynchroniczne wywołania do zewnętrznego API tam, gdzie to możliwe, aby nie blokować głównego przetwarzania.

## 9. Etapy wdrożenia

1. Stworzenie walidatora danych wejściowych przy użyciu zod w warstwie endpointu.
2. Implementacja warstwy service (`generation.service`), która obejmuje:
   - Walidację danych wejściowych.
   - Wywołanie zewnętrznego API LLM z ustalonym limitem czasu (60 sekund) w celu uniknięcia blokowania zasobów.
   - Przetwarzanie odpowiedzi API poprzez mapowanie jej do listy obiektów `FlashcardCandidateDTO`.
   - Zapisanie danych generacji w tabeli `generations` przy użyciu Supabase (context.locals).
   - Logowanie błędów do tabeli `generation_error_logs` w przypadku niepowodzeń, z ograniczoną ekspozycją szczegółów błędów na zewnątrz.
3. Integracja logiki endpointu w Astro route z wykorzystaniem:
   - Middleware do obsługi autoryzacji (Supabase Auth oraz RLS).
   - Wywołania warstwy service.
4. Dodanie szczegółowego logowania akcji i błędów.
