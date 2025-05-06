# Plan implementacji widoku Generowanie fiszek

## 1. Przegląd

Widok generowania fiszek umożliwia użytkownikowi wprowadzenie tekstu (od 1000 do 10000 znaków) w celu wygenerowania kandydatów na fiszki przy użyciu AI. Po otrzymaniu wyników, użytkownik może recenzować fiszki – zaakceptować, edytować lub odrzucić poszczególne propozycje. Na koniec może zapisać do bazy danych wszystkie bądź tylko zaakcpetowane fiszki.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką `/generate`.

## 3. Struktura komponentów

- **FlashcardGenerationView** – główny kontener widoku, odpowiedzialny za renderowanie formularza, obsługę API oraz wyświetlanie listy kandydatów.
- **GenerationForm** – komponent zawierający pole tekstowe do wprowadzenia treści, przycisk "Generuj fiszki", walidację długości tekstu oraz komunikaty o błędach.
- **FlashcardCandidatesList** – komponent odpowiedzialny za wyświetlenie listy wygenerowanych kandydatów na fiszki.
- **FlashcardCandidateItem** – pojedyncza karta wyświetlająca propozycję fiszki oraz przyciski do akcji: zaakceptuj, edytuj, odrzuć.
- **LoadingIndicator** – komponent wyświetlający skeleton lub animację podczas oczekiwania na odpowiedź API.
- **BulkSaveButton** - przycisk do zapisu wszystkich fiszek lub tylko zaakcpetowanych.
- **ErrorNotification** - komponent do wyświetlania komunikatów o błędach.

## 4. Szczegóły komponentów

### FlashcardGenerationView

- **Opis**: Główny komponent widoku łączący formularz generowania oraz listę kandydatów. Odpowiada za komunikację z API, zarządzanie stanem i obsługę błędów.
- **Główne elementy**:
  - GenerationForm
  - LoadingIndicator (pokazywany przy wywołaniu API)
  - FlashcardCandidatesList (po otrzymaniu wyników)
  - BulkSaveButton
  - ErrorNotification (w przypadku wystąpienia błędu)
- **Obsługiwane interakcje**:
  - Wysyłanie formularza
  - Aktualizacja stanu po odpowiedzi API
  - Przekazywanie akcji (zaakceptuj, edytuj, odrzuć) do elementów listy
  - Zapisanie fiszek w bazie poprzez kliknięcie przycisku zapisu
- **Walidacja**: Sprawdzenie, czy długość tekstu mieści się w przedziale 1000-10000 znaków
- **Typy**: Używa DTO GenerateFlashcardsCommand oraz GenerateFlashcardsResponseDTO
- **Propsy**: Brak – stan zarządzany lokalnie

### GenerationForm

- **Opis**: Formularz umożliwiający wprowadzenie tekstu oraz inicjowanie generacji fiszek.
- **Główne elementy**:
  - Pole tekstowe (textarea) z dynamiczną walidacją
  - Przycisk "Generuj fiszki" z blokadą podczas przetwarzania
  - Miejsce na komunikaty walidacyjne
- **Obsługiwane interakcje**:
  - onChange w polu tekstowym (aktualizacja stanu i walidacja)
  - onSubmit formularza
- **Walidacja**:
  - Tekst musi mieć minimum 1000 i maksymalnie 10000 znaków
- **Typy**: GenerateFlashcardsCommand { source_text: string }
- **Propsy**: Callback do wysłania danych do rodzica

### FlashcardCandidatesList

- **Opis**: Lista wyświetlająca wszystkie kandydatury wygenerowanych fiszek.
- **Główne elementy**:
  - Iteracja po FlashcardCandidateItem
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji – delegowane do poszczególnych elementów listy
- **Typy**: Tablica FlashcardCandidateViewModel
- **Propsy**: Lista kandydatów, funkcje do obsługi akcji na pojedynczych fiszkach

### FlashcardCandidateItem

- **Opis**: Pojedynczy element listy prezentujący wygenerowaną fiszkę.
- **Główne elementy**:
  - Wyświetlenie tekstu na przodzie i tyle fiszki
  - Przycisk "Zaakceptuj" – zmiana statusu na zaakceptowany
  - Przycisk "Edytuj" – umożliwia modyfikację treści
  - Przycisk "Odrzuć" – oznaczenie jako odrzucony
- **Obsługiwane interakcje**:
  - onClick dla każdego przycisku
- **Walidacja**:
  - W przypadku edycji, potwierdzenie że tekst przodu nie przekracza 200 znaków, a tyłu 500 znaków
- **Typy**: FlashcardCandidateViewModel
- **Propsy**: Obiekt fiszki oraz callbacki do akcji

### LoadingIndicator

- **Opis**: Wizualna reprezentacja ładowania podczas oczekiwania na wynik z API.
- **Główne elementy**: Skeleton loader lub animacja spinnera
- **Obsługiwane interakcje**: Brak
- **Propsy**: Brak

### BulkSaveButton

- **Opis**: Przycisk umożliwiający zapisanie wszystkich wygenerowanych fiszek lub tylko tych, które zostały zaakceptowane przez użytkownika w jednym żądaniu.
- **Główne elementy**: Dwa przyciski "Zapisz wszystkie" oraz "Zapisz zaakceptowane"
- **Obsługiwane interakcje**: onClick wywołujący funkcję zapisu, która filtruje kandydatów według statusu i wysyła dane do API.
- **Walidacja**: Przycisk aktywny tylko, gdy lista fiszek zawiera przynajmniej jeden element do zapisu.
- **Typy**: Wykorzystuje typy zdefiniowane w `types.ts`, w tym interfejs `CreateFlashcardsCommand` (bazujący na `CreateFlashcardDTO`)
- **Propsy**: `candidates` oraz `onSave`

### ErrorNotification

- **Opis**: Komponent służący do wyświetlania komunikatów o błędach.
- **Główne elementy**: Wyświetlany alert z tekstem komunikatu oraz opcjonalnym przyciskiem zamknięcia.
- **Obsługiwane interakcje**: onClose umożliwiający zamknięcie komunikatu przez użytkownika.
- **Walidacja**: Komponent sprawdza, czy przekazany komunikat nie jest pusty i formatowuje go stosownie do typu błędu.
- **Typy**: string (wiadomość błędu)
- **Propsy**: `message`, `type` oraz opcjonalny `onClose`

## 5. Typy

- **GenerateFlashcardsCommand** (wysyłany do endpoint `/generations`):

  ```typescript
  type GenerateFlashcardsCommand = {
    source_text: string;
  };
  ```

- **GenerateFlashcardsResponseDTO** (struktura odpowiedzi z API):

  ```typescript
  type GenerateFlashcardsResponseDTO = {
    generationId: number;
    totalGenerated: number;
    flashcardCandidates: FlashcardCandidateDTO[];
  };
  ```

- **FlashcardCandidateDTO** (pojedyncza propozycja fiszki):

  ```typescript
  type FlashcardCandidateDTO = {
    front: string;
    back: string;
    source: 'AI-full' | 'AI-edited';
  };
  ```

- **FlashcardCandidateViewModel** (dla wewnętrznego stanu, umożliwia dynamiczne ustawienie pola source podczas wysyłania danych do endpointu `/flashcards`):

  ```typescript
  type FlashcardCandidateViewModel = FlashcardCandidateDTO & {
    status: 'pending' | 'accepted' | 'edited' | 'rejected';
  };
  ```

- **CreateFlashcardsCommand** (wysyłany do edpointa `/flashcards`):

  ```typescript
  type CreateFlashcardsCommand = {
    flashcards: CreateFlashcardDTO[];
    generationId?: number; // opcjonalny ID generacji dla wszystkich fiszek w batch
  }
  ```

## 6. Zarządzanie stanem

- Użycie hooków React (useState, useEffect):
  - `inputText` – przechowuje wartość tekstu wprowadzanego przez użytkownika
  - `isLoading` – flaga informująca o pobieraniu wyników z API
  - `errorMessage` – komunikat o błędzie, jeśli wystąpi
  - `candidates` – lista kandydatów rozszerzonych o status
- Możliwe stworzenie custom hooka (`useFlashcardGeneration`) do obsługi logiki generowania i walidacji

## 7. Integracja API

- Wywołanie endpointu **POST /generations**:
  - Żądanie: przesłanie obiektu `GenerateFlashcardsCommand` { source_text: string }
  - Odpowiedź: obiekt `GenerateFlashcardsResponseDTO` z listą kandydatów
- Po udanym wywołaniu, dane są zapisywane w stanie, a lista kandydatów jest przekazywana do komponentu `FlashcardCandidatesList`.
- W razie błędu, wyświetlany jest komunikat o błędzie w interfejsie.
- Wywołanie endpointu **POST /flashcards** - po zatwierdzeniu zapisu poprzez kliknięcie BulkSaveButton:
  - Żądanie wykorzystuje obiekt typu `CreateFlashcardsCommand`
  - Dla każdej zaakceptowanej fiszki tworzy obiekt `CreateFlashcardDTO` z odpowiednim źródłem:
    - "AI-full" dla niezmodyfikowanych fiszek
    - "AI-edited" dla fiszek po edycji
  - Dołącza `generationId` otrzymane z poprzedniego kroku
  - W przypadku sukcesu, użytkownik jest przekierowany do widoku wszystkich fiszek
  - W przypadku błędu, wyświetlany jest komunikat z możliwością ponowienia operacji

## 8. Interakcje użytkownika

- Użytkownik wpisuje tekst do formularza i otrzymuje dynamiczne informacje o poprawności długości tekstu.
- Po kliknięciu przycisku "Generuj fiszki":
  - Przycisk zostaje zablokowany, a wyświetlany jest wskaźnik ładowania.
  - Po otrzymaniu odpowiedzi, lista kandydatów jest wyświetlana.
- Użytkownik może:
  - Kliknąć "Zaakceptuj", aby oznaczyć fiszkę do zapisu
  - Kliknąć "Edytuj", aby wprowadzić modyfikacje (potwierdzając ograniczenie długości pól)
  - Kliknąć "Odrzuć", aby pominąć daną propozycję
- Finalnie, użytkownik ma opcję zapisania wybranych fiszek do bazy danych poprzez komponent `BulkSaveButton`.

## 9. Warunki i walidacja

- Tekst wejściowy musi mieć od 1000 do 10000 znaków.
- Dynamiczna walidacja w czasie rzeczywistym przy zmianie wartości pola tekstowego.
- Podczas edycji fiszek: sprawdzenie, czy długość tekstu przodu nie przekracza 200 znaków, a tyłu 500 znaków.
- Przycisk "Generuj fiszki" jest dezaktywowany, dopóki walidacja nie przejdzie oraz podczas przetwarzania żądania.

## 10. Obsługa błędów

- W przypadku niepowodzenia wywołania API, wyświetlenie czytelnego komunikatu błędu.
- Walidacja pól wejściowych – komunikaty inline informujące o niepoprawnej długości tekstu.
- Obsługa błędów podczas zapisu fiszek (np. problem z endpointem POST /flashcards) z możliwością ponowienia operacji.

## 11. Kroki implementacji

1. Utworzyć nową stronę Astro pod ścieżką `/generate` w katalogu `src/pages` i zaimportować główny komponent widoku.
2. Zaimplementować komponent `FlashcardGenerationView`, który będzie zarządzał stanem widoku oraz komunikacją z API.
3. Stworzyć komponent `GenerationForm` z polem tekstowym, dynamiczną walidacją i przyciskiem "Generuj fiszki".
4. Dodać funkcjonalność wywoływania endpointu **POST /generations** po wysłaniu formularza; obsłużyć stany ładowania i błędu.
5. Po otrzymaniu odpowiedzi, zaktualizować stan z listą kandydatów i przekazać je do komponentu `FlashcardCandidatesList`.
6. Zaimplementować komponent `FlashcardCandidateItem`, umożliwiający akcje: zaakceptuj, edytuj oraz odrzuć, wraz z odpowiednią walidacją podczas edycji.
7. Opcjonalnie stworzyć modal lub inline edycję dla funkcji edycji fiszek.
8. Zaimplementwać komponent `BulkSaveButton` umożliwiający zapisanie zaakceptowanych fiszek (wywołanie endpointu **POST /flashcards**).
9. Zadbaj o responsywność i dostępność interfejsu (wsparcie dla klawiatury, czytników ekranu).
