-- Migration: Create generations table and related objects
-- Description: Sets up the generations table for tracking AI-generated flashcard batches
-- Author: System
-- Date: 2024-03-21

-- Create the generations table
create table generations (
    id bigserial primary key,
    user_id uuid not null,
    model varchar(255) not null,
    generated_count integer not null,
    accepted_unedited_count integer,
    accepted_edited_count integer,
    unaccepted_count integer,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint fk_user
        foreign key (user_id)
        references auth.users(id)
        on delete cascade
);

-- Create index for faster user-based queries
create index idx_generations_user_id on generations(user_id);

-- Create updated_at trigger function
create or replace function update_updated_at_generations()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for automatic updated_at updates
create trigger trg_update_generations_updated_at
    before update on generations
    for each row
    execute function update_updated_at_generations();

-- Enable Row Level Security
alter table generations enable row level security;

-- Create RLS policies for authenticated users
create policy "Users can view their own generations"
    on generations for select
    using (auth.uid() = user_id);

create policy "Users can insert their own generations"
    on generations for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own generations"
    on generations for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own generations"
    on generations for delete
    using (auth.uid() = user_id);

comment on table generations is 'Stores information about flashcard generation sessions';
comment on column generations.model is 'The AI model used for generation';
comment on column generations.generated_count is 'Total number of flashcards generated in this session';
comment on column generations.source_text_hash is 'Hash of the source text used for generation';
comment on column generations.source_text_length is 'Length of the source text in characters';
comment on column generations.generation_duration is 'Duration of generation process in milliseconds'; 