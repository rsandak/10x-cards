-- Migration: Create flashcards table and related objects
-- Description: Sets up the flashcards table and its enum type
-- Author: System
-- Date: 2024-03-21

-- Create enum type for flashcard source
create type flashcard_source as enum ('AI-full', 'Manual', 'AI-edited');

-- Create the flashcards table
create table flashcards (
    id bigserial primary key,
    user_id uuid not null,
    generation_id bigint,
    front varchar(200) not null,
    back varchar(500) not null,
    source flashcard_source not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint fk_user
        foreign key (user_id)
        references auth.users(id)
        on delete cascade,
    constraint fk_generation
        foreign key (generation_id)
        references generations(id)
        on delete cascade
);

-- Create indices for faster queries
create index idx_flashcards_generation_id on flashcards(generation_id);
create index idx_flashcards_user_id on flashcards(user_id);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for automatic updated_at updates
create trigger trg_update_updated_at
    before update on flashcards
    for each row
    execute function update_updated_at_column();

-- Enable Row Level Security
alter table flashcards enable row level security;

-- Create RLS policies for authenticated users
create policy "Users can view their own flashcards"
    on flashcards for select
    using (auth.uid() = user_id);

create policy "Users can insert their own flashcards"
    on flashcards for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own flashcards"
    on flashcards for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own flashcards"
    on flashcards for delete
    using (auth.uid() = user_id);

comment on table flashcards is 'Stores flashcards created by users';
comment on column flashcards.front is 'The question or prompt side of the flashcard';
comment on column flashcards.back is 'The answer or explanation side of the flashcard';
comment on column flashcards.source is 'Indicates how the flashcard was created: AI-generated, manually created, or AI-generated and then edited'; 