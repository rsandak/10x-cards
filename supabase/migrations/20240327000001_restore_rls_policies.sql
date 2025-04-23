-- Migration: Restore RLS policies
-- Description: Restores RLS and recreates policies for flashcards, generations, and generation_error_logs tables
-- Author: System
-- Date: 2024-03-27

-- Enable RLS on all tables
alter table flashcards enable row level security;
alter table generations enable row level security;
alter table generation_error_logs enable row level security;

-- Recreate policies for flashcards
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

-- Recreate policies for generations
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

-- Recreate policies for generation_error_logs
create policy "Users can view their own error logs"
    on generation_error_logs for select
    using (auth.uid() = user_id);

create policy "Users can insert their own error logs"
    on generation_error_logs for insert
    with check (auth.uid() = user_id); 