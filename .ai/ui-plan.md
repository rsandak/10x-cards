# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

System interfejsu użytkownika został zaprojektowany jako centralny dashboard, który integruje funkcje generowania fiszek, ręcznego tworzenia fiszek oraz zarządzania istniejącymi fiszkami. Główne widoki dostępne są poprzez responsywne menu (topbar) oraz panel użytkownika, co umożliwia płynne i intuicyjne przechodzenie między poszczymi funkcjonalnościami. Całość korzysta z responsywnego designu opartego na Tailwind oraz gotowych komponentach bufowanych z użyciem Shadcn/ui oraz React.

## 2. Lista widoków

### 2.1 Ekran autoryzacji (logowania/rejestracji)

- Ścieżka widoku: `/login` (oraz `/register`)
- Główny cel: Umożliwienie użytkownikowi uwierzytelnienia oraz stworzenia konta.
- Kluczowe informacje: Formularze zbierające email, hasło (oraz potwierdzenie hasła dla rejestracji), komunikaty walidacyjne błędów.
- Kluczowe komponenty widoku: Formularz logowania/rejestracji, pola input, przyciski submit, mechanizm wyświetlania błędów.
- UX, dostępność i bezpieczeństwo:
  - Responsywny układ formularza.
  - Wsparcie dla klawiatury oraz czytników ekranu.
  - Weryfikacja danych przed wysłaniem.
  - Zabezpieczenia JWT

### 2.2 Widok generowania fiszek

- Ścieżka widoku: `/generate`
- Główny cel: Umożliwienie użytkownikowi automatycznego generowania fiszek przez AI i ich rewizji (zaakceptuj, edytuj, odrzuć).
- Kluczowe informacje: Formularz do wprowadzania tekstu o długości 1000-10000 znaków, dynamiczna walidacja, blokada przycisku podczas przetwarzania, komunikaty błędów, oraz przyciski akcpetacji, edycji lub odrzucenia dla kadej fiszki.
- Kluczowe komponenty widoku: Formularz generowania fiszek, pole tekstowe, przycisk wywołujący API (Generuj fiszki), lista fiszek, przyciski akcji (Zapisz wszystkie, zapisz zaakcpetowane), wskaźnik ładowania (skeleton).
- UX, dostępność i bezpieczeństwo:
  - Responsywny układ z dynamiczną walidacją i jasnymi komunikatami inline o błędach.
  - Bezpieczna komunikacja z API oraz ochrona danych użytkownika.
  - Wsparcie dla klawiatury oraz czytników ekranu.

### 2.3 Widok listy fiszek (Moje fiszki)

- Ścieżka widoku: `/flashcards`
- Główny cel: Zarządzanie istniejącymi fiszkami oraz możliwość ręcznego dodawania nowych fiszek.
- Kluczowe informacje: Lista fiszek wyświetlająca "przód" i "tył" fiszki z możliwością edycji lub usunięcia fiszki.
- Kluczowe komponenty widoku: Lista fiszek, komponent modal edycji, komponent modal dodawania, przyciski akcji, inline komunikaty błędów, potwierdzenie operacji.
- UX, dostępność i bezpieczeństwo:
  - Intuicyjny interfejs umożliwiający szybkie dodawanie i przeglądanie fiszek.
  - Inline walidacja pól i bezpieczna obsługa operacji CRUD.
  - Wsparcie dla klawiatury oraz czytników ekranu.
  - Potwierdzenie usunięcia

### 2.4 Modal dodawania fiszek

- Ścieżka widoku: Otwierany z widoku listy fiszek (overlay) po kliknięciu przycisku "Dodaj fiszkę"
- Główny cel: Umożliwienie użytkownikowi dodania nowej fiszki poprzez formularz w modalu.
- Kluczowe informacje: Formularz umożliwiający wprowadzenie treści nowej fiszki, z ograniczeniami (przód: max 200 znaków, tył: max 500 znaków), inline walidacja oraz przyciski akcji (zapisz, anuluj).
- Kluczowe komponenty widoku: Modal okno, formularz dodawania fiszek, przyciski zapisu i anulowania, inline komunikaty błędów.
- UX, dostępność i bezpieczeństwo:
  - Łatwe zamykanie modala (przy użyciu przycisku lub skrótu klawiaturowego).
  - Wsparcie dla klawiatury oraz czytników ekranu.
  - Natychmiastowa walidacja danych przed zapisem.

### 2.5 Modal do edycji fiszek

- Ścieżka widoku: Otwierany w widoku listy fiszek (overlay)
- Główny cel: Umożliwienie użytkownikowi edycji treści fiszek po wybraniu opcji "edytuj".
- Kluczowe informacje: Pola do edycji treści fiszki – "przód" (max 200 znaków) oraz "tył" (max 500 znaków).
- Kluczowe komponenty widoku: Modal okno, formularz edycji, mechanizm inline walidacji, przyciski zapisu i anulowania.
- UX, dostępność i bezpieczeństwo:
  - Łatwe zamykanie modala (przy użyciu przycisku lub klawiatury).
  - Natychmiastowa walidacja danych i potwierdzenie zmian przed zapisem.
  - Wsparcie dla klawiatury oraz czytników ekranu.

## 3. Mapa podróży użytkownika

- Użytkownik rozpoczyna przygodę na ekranie autoryzacji, gdzie wprowadza swoje dane w celu logowania lub rejestracji. Po poprawnym uwierzytelnieniu następuje przekierowanie do widoku generowania fiszek.
- W widoku generowania fiszek użytkownik:
  - Wprowadza tekst do formularza z dynamiczną walidacją (1000-10000 znaków).
  - Inicjuje proces generacji poprzez kliknięcie przycisku (blokowany podczas przetwarzania),
  - Otrzymuje listę kandydatów na fiszki
  - Przeprowadza rwizję kandydatów na fiszki poprzez zaakceptowanie lub odrzucenie, ewentualnie wyedytowanie kandydata,
  - Zatwierdza wybrane lub wszystkie fiszki i dokonuje zbiorczego zapisu przez interakcję z API.
- Następnie użytkownik przechodzi do widoku listy fiszek (Moje fiszki), gdzie:
  - Przegląda wszystkie fiszki, zarówno wygenerowane, jak i dodane ręcznie.
  - Ma możliwość ręcznego dodania nowej fiszki poprzez otwarcie modala dodawania.
- Z poziomu widoku listy, użytkownik może otworzyć modal do edycji, aby zmodyfikować wybraną fiszkę.

## 4. Układ i struktura nawigacji

- Główny element nawigacji to responsywny topbar, który zawiera linki do:
  - Widoku generowania fiszek (`/generate`)
  - Widoku listy fiszek (Moje fiszki) (`/flashcards`)
- Topbar powinien również zawierać opcję wylogowania – może to być przycisk umieszczony bezpośrednio w topbarze lub w uproszczonym panelu użytkownika.
- Menu nawigacyjne jest zoptymalizowane zarówno dla urządzeń mobilnych, jak i desktopowych, zapewniając intuicyjne przejścia między widokami.

## 5. Kluczowe komponenty

- Formularz uwierzytelniania
  - komponenty logowania i rejestracji z obsługą walidacji.
- Formularz generowania fiszek:
  - Umożliwia wprowadzanie tekstu z dynamiczną walidacją (1000-10000 znaków),
  - Blokuje przycisk podczas przetwarzania,
  - Prezentuje wyniki generacji z opcją rewizji (zaakceptuj, edytuj, odrzuć).
- Lista fiszek (Moje fiszki):
  - Wyświetla fiszki wraz z opcjami: edycji, usunięcia oraz rewizji.
- Modal dodawania fiszek:
  - Zawiera formularz umożliwiający stworzenie nowej fiszki z ograniczeniami (przód: max 200 znaków, tył: max 500 znaków),
  - Posiada inline walidację oraz przyciski zapisu i anulowania.
- Modal do edycji fiszek:
  - Umożliwia modyfikację istniejących fiszek z natychmiastową walidacją (przód: max 200 znaków, tył: max 500 znaków).
- Toast notifications:
  - Informują użytkownika o powodzeniu operacji lub wystąpieniu błędów.
- Sidebar/nawigacja
  - Elementu nawigacyjne ułatwiające przemieszczanie się pomiędzy widokami
