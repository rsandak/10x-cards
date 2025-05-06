<authentication_analysis>
Analiza przepływów autentykacji:
1. Rejestracja: Użytkownik przesyła dane rejestracyjne poprzez formularz, które trafiają do Astro API i są przetwarzane przez Supabase Auth. Następnie Middleware weryfikuje sesję i przekierowuje użytkownika do panelu.
2. Logowanie: Użytkownik wysyła dane logowania do Astro API, który przekazuje je do Supabase Auth. Po pomyślnej weryfikacji, sesja zostaje potwierdzona przez Middleware, umożliwiając dostęp do chronionych zasobów.
3. Resetowanie hasła: Użytkownik inicjuje proces resetowania hasła, wysyłając odpowiednie żądanie, które jest przekazywane przez Astro API do Supabase Auth, a następnie użytkownik otrzymuje instrukcje resetowania.
4. Wylogowanie: Użytkownik żąda wylogowania, a żądanie przechodzi przez Astro API do Supabase Auth, a Middleware unieważnia bieżącą sesję i przekierowuje użytkownika do strony logowania.
5. Odświeżanie tokenu: W przypadku wygaśnięcia tokenu, Przeglądarka zgłasza żądanie, Astro API weryfikuje token z Supabase Auth, uzyskuje nowy token i przekazuje zaktualizowany stan sesji do użytkownika.
Główni aktorzy:
- Przeglądarka – interfejs użytkownika
- Astro API – backendowe endpointy autentykacji
- Supabase Auth – usługa autentykacji i zarządzania sesjami
- Middleware – mechanizm weryfikacji sesji i ochrony zasobów
</authentication_analysis>

<mermaid_diagram>
```mermaid
sequenceDiagram
autonumber
participant P as Przeglądarka
participant M as Middleware
participant A as Astro API
participant S as Supabase Auth

%% Flow for user registration
activate P
P->>A: Submit registration data
activate A
A->>S: Register new user
activate S
S-->>A: Return account details
deactivate S
A-->>M: Send session token
activate M
M-->>P: Redirect to user dashboard
deactivate M
deactivate A
deactivate P

%% Flow for user login (successful)
activate P
P->>A: Send login credentials
activate A
A->>S: Authenticate user
activate S
S-->>A: Return session token
deactivate S
A-->>M: Forward session state
activate M
M-->>P: Grant access to protected resource
deactivate M
deactivate A
deactivate P

%% Flow for login error
activate P
P->>A: Send invalid login credentials
activate A
A->>S: Authenticate user
activate S
S-->>A: Return error response
deactivate S
A-->>P: Display error message
deactivate A
deactivate P

%% Flow for token refresh
activate P
P->>A: Request resource with expired token
activate A
A->>S: Validate token, detect expiration
activate S
S-->>A: Issue new token
deactivate S
A-->>P: Provide updated session token
deactivate A
deactivate P

%% Flow for password reset
activate P
P->>A: Request password reset
activate A
A->>S: Initiate password reset process
activate S
S-->>A: Confirm reset initiation
deactivate S
A-->>P: Inform user to check email
deactivate A
deactivate P

%% Flow for user logout
activate P
P->>A: Request logout
activate A
A->>S: Sign out user
activate S
S-->>A: Confirm logout
deactivate S
A-->>M: Invalidate session
deactivate A
M-->>P: Redirect to login page
deactivate P
```
</mermaid_diagram> 