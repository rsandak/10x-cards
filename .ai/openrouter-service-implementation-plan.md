# Przewodnik implementacji usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter to integracja umożliwiająca komunikację z API OpenRouter w celu uzupełnienia czatów opartych na LLM. Główne cele usługi to:

1. Przekazywanie odpowiednich komunikatów systemowych i użytkownika do modelu LLM, aby generować odpowiedzi dostosowane do kontekstu.
2. Umożliwienie ustrukturyzowanej kontroli odpowiedzi dzięki zastosowaniu schematu `response_format` umożliwiającego walidację danych.
3. Konfiguracja i dynamiczna zmiana nazwy modelu oraz parametrów modelu (np. temperature, max_tokens, frequency_penalty, presence_penalty) w celu dostosowania do różnych scenariuszy.

## 2. Opis konstruktora

Konstruktor usługi powinien inicjalizować:

1. Konfigurację API (adres URL, klucz API, domyślne parametry modelu).
2. Domyślny komunikat systemowy, przykładowo: "You are a helpful assistant.".
3. Parametry odpowiedzi w formacie JSON według schematu:

   ```json
   { "type": "json_schema", "json_schema": { "name": "YourResponseSchema", "strict": true, "schema": { /* model-specific properties */ } } }
   ```

4. Zależności, takie jak klient HTTP z obsługą timeoutów, retry, oraz walidacji odpowiedzi.

## 3. Publiczne metody i pola

### Publiczne metody

1. **sendMessage(userMessage: string): Promise<Response>**
   - Łączy komunikat systemowy z komunikatem użytkownika.
   - Formatuje żądanie z użyciem `response_format` i parametrami modelu.
   - Wysyła zapytanie do API i zwraca przetworzoną odpowiedź.

2. **updateConfiguration(newConfig: Configuration): void**
   - Aktualizuje konfigurację usługi, w tym ustawienia API, modelu oraz komunikatów.

### Publiczne pola

1. **config: Configuration** – Obiekt przechowujący bieżące ustawienia integracji, m.in. adres API, klucz, domyślne parametry modelu.

## 4. Prywatne metody i pola

### Prywatne metody

1. **_initializeApiClient(): void**
   - Inicjalizuje klienta HTTP z odpowiednimi timeoutami i mechanizmami retry.

2. **_formatRequest(message: string): FormattedRequest**
   - Łączy domyślny komunikat systemowy z dynamicznym komunikatem użytkownika.
   - Dołącza strukturę `response_format`, przykładowo:

     ```json
     { "type": "json_schema", "json_schema": { "name": "YourResponseSchema", "strict": true, "schema": { /* define schema properties */ } } }
     ```

3. **_parseResponse(apiResponse: any): ParsedResponse**
   - Weryfikuje, czy odpowiedź z API zgadza się ze zdefiniowanym schematem JSON.
   - Przetwarza dane tak, aby były spójne z logiką aplikacji.

4. **_handleErrors(error: any): void**
   - Centralizuje obsługę błędów: rozróżnia błędy połączenia, walidacji, autoryzacji oraz wewnętrzne błędy serwera.
   - Loguje błędy i stosuje mechanizmy retry tam, gdzie to konieczne.

### Prywatne pola

1. **_apiClient** – Instancja klienta HTTP skonfigurowana do komunikacji z API OpenRouter.
2. **_systemMessage: string** – Domyślny komunikat systemowy, dołączany do każdego żądania (np. "You are a helpful assistant.").
3. **_responseFormat** – Obiekt definiujący strukturę odpowiedzi, zgodnie z wzorem:

   ```json
   { "type": "json_schema", "json_schema": { "name": "YourResponseSchema", "strict": true, "schema": { /* model schema */ } } }
   ```

## 5. Obsługa błędów

Potencjalne scenariusze błędów i ich obsługa:

1. **Błąd połączenia (timeout, brak dostępu do API)**
   - Mechanizm retry z eksponential backoff.
   - Logowanie błędów i powiadomienia o problemach z łącznością.

2. **Błąd walidacji odpowiedzi (niezgodność schematu JSON)**
   - Walidacja odpowiedzi przy użyciu dedykowanych bibliotek.
   - Zwrot jednolitej wiadomości o błędzie bez ujawniania wewnętrznych szczegółów.

3. **Błąd autoryzacji (niepoprawny klucz API)**
   - Natychmiastowe przerwanie działania i powiadomienie o krytycznym błędzie autoryzacji.

4. **Błąd wewnętrzny serwera (500)**
   - Logowanie błędów oraz zwrócenie komunikatu ogólnego, nieujawniającego szczegółów implementacyjnych.

## 6. Kwestie bezpieczeństwa

1. Przechowywanie klucza API w bezpieczny sposób przy użyciu zmiennych środowiskowych.
2. Wymuszanie komunikacji przez HTTPS przy wysyłaniu danych do API.
3. Walidacja i sanitacja komunikatów przychodzących, aby zapobiec atakom typu injection.
4. Ograniczenie rozmiaru żądań oraz odpowiedzi, by zabezpieczyć system przed atakami typu denial-of-service.

## 7. Plan wdrożenia krok po kroku

1. **Konfiguracja środowiska i zależności**
   - Utworzyć plik konfiguracyjny (np. `config.ts`) zawierający ustawienia API, domyślne parametry modelu, komunikaty systemowe i strukturę `response_format`.
   - Upewnić się, że klucze API oraz inne poufne dane są przechowywane w zmiennych środowiskowych.

2. **Implementacja klienta API**
   - Zaimplementować metodę `_initializeApiClient`, wykorzystującą bibliotekę HTTP (np. Axios lub fetch) skonfigurowaną z mechanizmami timeout i retry.

3. **Implementacja formatowania żądań**
   - Utworzyć metodę `_formatRequest`, która łączy komunikat systemowy z komunikatem użytkownika.
   - Dołączyć strukturę `response_format` do każdego żądania, przykładowo:
     - System message: "You are a helpful assistant."
     - User message: dynamiczna treść przekazywana przez użytkownika.
     - Response format:

       ```json
       { "type": "json_schema", "json_schema": { "name": "YourResponseSchema", "strict": true, "schema": { /* define schema properties */ } } }
       ```

     - Model name: definiowany w konfiguracji (np. "openrouter-model-001").
     - Model parameters: przykładowo { temperature: 0.7, max_tokens: 512, frequency_penalty: 0, presence_penalty: 0 }.

4. **Implementacja wysyłania wiadomości**
   - Utworzyć metodę `sendMessage`, która korzysta z `_initializeApiClient` i `_formatRequest` w celu wysłania żądania do API OpenRouter.
   - Zaimplementować metodę `_parseResponse`, która weryfikuje i przetwarza odpowiedź zgodnie z ustalonym schematem.

5. **Obsługa błędów i logowanie**
   - Zaimplementować metodę `_handleErrors` do centralnej obsługi błędów:
     - Retry przy błędach połączenia.
     - Walidacja odpowiedzi i zgłaszanie błędów schematu.
     - Natychmiastowe przerwanie przy błędach autoryzacji.
   - Dodać mechanizmy logowania do monitorowania zdarzeń i błędów.
