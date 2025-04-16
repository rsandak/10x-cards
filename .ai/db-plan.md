# Plan schematu bazy danych

## 1. Tabele

### 1.0. Tabela: users (Supabase Auth)

Tabela `users` jest zarządzana przez Supabase Auth i znajduje się w schemacie `auth`. Wszystkie operacje związane z autoryzacją oraz danymi użytkownika odbywają się przy użyciu tej tabeli.

### 1.1. Tabela: generations

```sql
CREATE TABLE generations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    model VARCHAR(255) NOT NULL,
    generated_count INTEGER NOT NULL,
    accepted_unedited_count INTEGER,
    accepted_edited_count INTEGER,
    unaccepted_count INTEGER,
    source_text_hash VARCHAR NOT NULL,
    source_text_length INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000),
    generation_duration INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user
      FOREIGN KEY (user_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE
);

CREATE INDEX idx_generations_user_id ON generations(user_id);

#### Wyzwalacz aktualizacji kolumny `updated_at` w tabeli generations

```sql
CREATE OR REPLACE FUNCTION update_updated_at_generations()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_generations_updated_at
BEFORE UPDATE ON generations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_generations();
```

### 1.2. Tabela: flashcards

```sql
-- Tworzenie typu ENUM dla źródła fiszki
CREATE TYPE flashcard_source AS ENUM ('AI-full', 'Manual', 'AI-edited');

CREATE TABLE flashcards (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    generation_id BIGINT,
    front VARCHAR(200) NOT NULL,
    back VARCHAR(500) NOT NULL,
    source flashcard_source NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user
      FOREIGN KEY (user_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE,
    CONSTRAINT fk_generation
      FOREIGN KEY (generation_id)
      REFERENCES generations(id)
      ON DELETE CASCADE
);

CREATE INDEX idx_flashcards_generation_id ON flashcards(generation_id);
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
```

#### Wyzwalacz aktualizacji kolumny `updated_at` w tabeli flashcards

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_updated_at
BEFORE UPDATE ON flashcards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### 1.3. Tabela: generation_error_logs

```sql
CREATE TABLE generation_error_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    error_message TEXT NOT NULL,
    error_code VARCHAR(100),
    model VARCHAR(255) NOT NULL,
    source_text_hash TEXT,
    source_text_length INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_error
      FOREIGN KEY (user_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE
);

CREATE INDEX idx_error_logs_user_id ON generation_error_logs(user_id);
```

## 2. Relacje i kardynalności

- Tabela `users` (Supabase Auth) ma relację 1:N z tabelą `generations` – jeden użytkownik może mieć wiele rekordów generacji.
- Tabela `users` (Supabase Auth) ma relację 1:N z tabelą `flashcards` – jeden użytkownik może mieć wiele fiszek.
- Tabela `generations` ma relację 1:N z tabelą `flashcards` – jedna generacja może zawierać wiele fiszek (relacja opcjonalna, fiszka może nie mieć przypisanej generacji).
- Tabela `users` ma relację 1:N z tabelą `generation_error_logs` – jeden użytkownik może mieć wiele logów błędów.

## 3. Indeksy

- `idx_generations_user_id` na tabeli `generations` (kolumna `user_id`).
- `idx_flashcards_generation_id` na tabeli `flashcards` (kolumna `generation_id`).
- `idx_flashcards_user_id` na tabeli `flashcards` (kolumna `user_id`).
- `idx_error_logs_user_id` na tabeli `generation_error_logs` (kolumna `user_id`).

## 4. Zasady PostgreSQL

```sql
-- Włączanie RLS dla tabel z kolumną user_id
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_error_logs ENABLE ROW LEVEL SECURITY;

-- Polityki RLS dla tabel
CREATE POLICY "Users can view their own generations"
    ON generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generations"
    ON generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations"
    ON generations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations"
    ON generations FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own flashcards"
    ON flashcards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcards"
    ON flashcards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcards"
    ON flashcards FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcards"
    ON flashcards FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own error logs"
    ON generation_error_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own error logs"
    ON generation_error_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

## 5. Pozostałe uwagi