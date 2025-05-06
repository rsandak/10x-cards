# Dokument wymagań produktu (PRD) - 10x-cards

## 1. Przegląd produktu

10x-cards to aplikacja webowa służąca do tworzenia i zarządzania fiszkami, wykorzystywana w metodzie spaced repetition. Aplikacja umożliwia dwie metody tworzenia fiszek – manualne oraz generowane przez AI. Aplikacja wykorzystuje modele LLM (poprzez API) do generowania sugestii fiszek na podstawie dostarczonego tekstu.

## 2. Problem użytkownika

Ręczne tworzenie wysokiej jakości fiszek edukacyjnych jest czasochłonne, co zniechęca użytkowników do korzystania z efektywnej metody nauki, jaką jest spaced repetition. Użytkownicy oczekują szybkiego i wygodnego sposobu na generowanie fiszek, który pozwoli im skupić się na nauce, a nie na długotrwałym procesie tworzenia materiałów edukacyjnych.

## 3. Wymagania funkcjonalne

1. Automatyczne generowanie fiszek:
   - Użytkownik wprowadza tekst o długości od 1000 do 10000 znaków.
   - Aplikacja wysyła tekst do modelu LLM za pośrednictwem API.
   - Model LLM proponuje zestaw fiszek (pytania i odpowiedzi).
   - Wyniki generowania są prezentowane w formie listy umieszczonej poniżej formularza.
   - Dla każdej wygenerowanej fiszki użytkownik może wybrać jedną z opcji: „zaakceptuj”, „edytuj” lub „odrzuć”.

2. Ręczne tworzenie fiszek:
   - Użytkownik może tworzyć fiszki ręcznie, wprowadzając treść do dwóch pól: „przód” (maksymalnie 200 znaków) oraz „tył” (maksymalnie 500 znaków).

3. Zarządzanie fiszkami:
   - Użytkownik ma możliwość przeglądania, wyszukiwania, edycji oraz usuwania zapisanych fiszek za pomocą prostego interfejsu listy.

4. System kont użytkowników:
   - Użytkownik musi się zarejestrować i zalogować, aby uzyskać dostęp do funkcji tworzenia i zarządzania fiszkami.
   - Dostęp do poszczególnych funkcjonalności jest ograniczony tylko do zalogowanych użytkowników.
   - Możliwość usunięcia konta i powiązanych fiszek na życzenie.

5. Integracja z algorytmem powtórek:
   - Fiszki są integrowane z już istniejącym algorytmem powtórek, który obsługuje cykle nauki spaced repetition.

6. Logowanie akcji użytkownika:
   - System rejestruje metryki dotyczące liczby wygenerowanych, zaakceptowanych, edytowanych oraz odrzuconych fiszek w celu analizy efektywności.

7. Wymagania prawne i ograniczenia:
   - Dane osobowe użytkowników i fiszek przechowywane zgodnie z RODO.
   - Prawo do wglądu i usunięcia danych (konto wraz z fiszkami) na wniosek użytkownika.

## 4. Granice produktu

Funkcjonalności, które NIE wchodzą w zakres MVP:

- Własny, zaawansowany algorytm powtórek inspirowany systemami takimi jak SuperMemo czy Anki.
- Import danych z wielu formatów, np. PDF, DOCX.
- Współdzielenie zestawów fiszek między użytkownikami.
- Integracja z innymi platformami edukacyjnymi.
- Aplikacje mobilne – na początek wdrażamy tylko wersję webową.
- Mechanizmy gamifikacji.
- Zaawansowane wyszukiwanie fiszek po słowach kluczowych.

## 5. Historyjki użytkowników

### US-001

- ID: US-001
- Tytuł: Ręczne tworzenie fiszek
- Opis: Jako zalogowany użytkownik chcę móc tworzyć fiszki ręcznie, wpisując treść do pól „przód” (do 200 znaków) oraz „tył” (do 500 znaków), aby móc precyzyjnie dopasować treść do moich potrzeb.
- Kryteria akceptacji:
  - Widok dodawania nowej fiszki jest dostępny poprzez kliknięcie przycisku "Dodaj fiszkę" na stronie "Moje fiszki"
  - Formularz umożliwia wpisanie treści do pola „przód” ograniczonego do 200 znaków.
  - Formularz umożliwia wpisanie treści do pola „tył” ograniczonego do 500 znaków.
  - Po zatwierdzeniu, fiszka jest zapisywana i wyświetlana w liście fiszek.
  - W przypadku błędu podczas zapisywania fiszki, użytkownik otrzyma komunikat o błędzie i możliwość ponownej próby.

### US-002

- ID: US-002
- Tytuł: Generowanie fiszek przez AI
- Opis: Jako zalogowany użytkownik chcę wprowadzić tekst o długości od 1000 do 10000 znaków, aby system mógł automatycznie wygenerować kandydatury na fiszki, oszczędzając mój czas.
- Kryteria akceptacji:
  - Widok generowania fiszek jest dostępny poprzez kliknięcie przycisku 'Generuj fiszki' na stronie 'Generowanie fiszek'.
  - W widoku generowania fiszek znajduje się pole tekstowe, w którym użytkownik może wkleić swój tekst.
  - Pole wprowadzenia tekstu posiada walidację długości (min. 1000 znaków, max. 10000 znaków).
  - Po kliknięciu przycisku generowania aplikacja komunikuje się z API modelu LLM, generuje i wyświetla listę kandydatów na fiszki.
  - W przypadku problemów z API lub braku odpowiedzi modelu, użytkownik zobaczy stosowny komunikat o błędzie.

### US-003

- ID: US-003
- Tytuł: Recenzja kandydatów na fiszki generowanych przez AI
- Opis: Jako zalogowany użytkownik chcę mieć możliwość recenzji wygenerowanych przez AI fiszek, tak aby móc je zaakceptować, ewentualnie edytować lub odrzucić przed zapisem.
- Kryteria akceptacji:
  - Lista kandydatów jest wyświetlana poniżej formularza generowania.
  - Każdy kandydat posiada opcje: „zaakceptuj”, „edytuj” lub „odrzuć”.
  - Po zebraniu decyzji, tylko fiszki zaakceptowane trafiają do bazy danych, a pozostałe są rejestrowane w logach.
  - Po zatwierdzeniu wybranych fiszek użytkownik może kliknąć przycisk zapisu i dodać je do bazy danych.

### US-004

- ID: US-004
- Tytuł: Zarządzanie zapisanymi fiszkami
- Opis: Jako zalogowany użytkownik chcę przeglądać, wyszukiwać, edytować oraz usuwać zapisane fiszki, aby móc utrzymywać aktualność i porządek w mojej bazie wiedzy.
- Kryteria akceptacji:
  - Widok zarządzania fiszkami jest dostępny poprzez kliknięcie zakładki 'Moje fiszki' w menu głównym.
  - Lista zapisanych fiszek wyświetla wszystkie dostępne fiszki.
  - Użytkownik może edytować wybrany rekord z zachowaniem ograniczeń znaków (przód: 200, tył: 500).
  - Użytkownik może usuwać fiszki, a zmiany są aktualizowane w bazie danych.
  - Po wybraniu usuwania użytkownik musi potwierdzić operację, zanim fiszka zostanie trwale usunięta.
  - Funkcja wyszukiwania umożliwia filtrację listy według słów kluczowych lub fragmentów treści.
  - W przypadku błędu podczas edycji, zapisywania lub usuwania fiszki, użytkownik otrzyma odpowiedni komunikat o błędzie.

### US-005

- ID: US-005
- Tytuł: Rejestracja użytkownika
- Opis: Jako użytkownik chcę mieć możliwość rejestracji, aby utworzyć konto i uzyskać dostęp do aplikacji.
- Kryteria akceptacji:
  - Widok rejestracji jest dostępny poprzez kliknięcie przycisku 'Zarejestruj się' na stronie głównej.
  - Formularz rejestracji zbiera niezbędne dane (np. email, hasło) i jest walidowany.
  - Po poprawnym wypełnieniu formularza i weryfikacji danych, konto użytkownika jest aktywowane.
  - W przypadku nieudanej rejestracji, użytkownik zobaczy komunikat o błędzie z instrukcjami.

### US-006

- ID: US-006
- Tytuł: Logowanie użytkownika
- Opis: Jako użytkownik chcę mieć możliwość logowania, aby uzyskać dostęp do moich fiszek i funkcji aplikacji.
- Kryteria akceptacji:
  - Widok logowania jest dostępny poprzez kliknięcie przycisku 'Zaloguj się' na stronie głównej.
  - Formularz logowania zbiera dane (np. email, hasło) i jest walidowany.
  - Mechanizm logowania weryfikuje dane i zapewnia bezpieczny dostęp.
  - W przypadku nieudanego logowania, użytkownik zobaczy komunikat o błędzie z instrukcjami.
  - Odzyskiwanie hasła jest możliwe.

### US-007

- ID: US-007
- Tytuł: Logowanie akcji systemowych
- Opis: Jako administrator chcę, aby system logował wszystkie działania użytkowników (generowanie, akceptacja, edycja, odrzucenie fiszek), aby móc analizować efektywność oraz monitorować wykorzystanie funkcjonalności.
- Kryteria akceptacji:
  - Każda akcja związana z generowaniem, edycją, zatwierdzaniem lub odrzucaniem fiszek jest logowana.
  - Logi zawierają informacje o czasie akcji, typie operacji oraz identyfikatorze użytkownika.
  - Istnieje możliwość zbiorczego zapisu decyzji z procesu recenzji wygenerowanych fiszek.
  - W przypadku wystąpienia problemów z logowaniem akcji systemowych, administrator otrzyma stosowny komunikat o błędzie.

### US-008

- ID: US-008
- Tytuł: Sesja nauki z algorytmem powtórek
- Opis: Jako zalogowany użytkownik chcę rozpocząć sesję nauki z algorytmem powtórek, aby efektywnie korzystać z metody spaced repetition.
- Kryteria akceptacji:
  - Widok sesji nauki jest dostępny poprzez kliknięcie przycisku 'Rozpocznij sesję nauki' na stronie głównej lub w menu.
  - Po uruchomieniu sesji, system inicjalizuje algorytm powtórek i ładuje fiszki do nauki.
  - Na start wyświetlany jest przód fiszki, poprzez interakcję użytkownik wyświetla jej tył
  - Użytkownik ocenia zgodnie z oczekiwaniami algorytmu na ile przyswoił fiszkę
  - Następnie algorytm pokazuje kolejną fiszkę w ramach sesji nauki

## 6. Metryki sukcesu

- Minimum 75% fiszek wygenerowanych przez AI jest akceptowane przez użytkowników.
- Użytkownicy tworzą co najmniej 75% fiszek przy użyciu funkcji generowania przez AI.
