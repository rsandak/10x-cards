-- Migration: Create generation error logs table
-- Description: Sets up the table for tracking errors during flashcard generation
-- Author: System
-- Date: 2024-03-21

-- Create the generation error logs table
create table generation_error_logs (
    id bigserial primary key,
    user_id uuid not null,
    error_message text not null,
    error_code varchar(100),
    model varchar(255) not null,
    source_text_hash text,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    created_at timestamptz not null default now(),
    constraint fk_user_error
        foreign key (user_id)
        references auth.users(id)
        on delete cascade
);

-- Create index for faster user-based queries
create index idx_error_logs_user_id on generation_error_logs(user_id);

-- Enable Row Level Security
alter table generation_error_logs enable row level security;

-- Create RLS policies for authenticated users
create policy "Users can view their own error logs"
    on generation_error_logs for select
    using (auth.uid() = user_id);

create policy "Users can insert their own error logs"
    on generation_error_logs for insert
    with check (auth.uid() = user_id);

-- Note: Update and Delete policies are intentionally omitted as error logs should be immutable

comment on table generation_error_logs is 'Stores error logs from flashcard generation attempts';
comment on column generation_error_logs.error_message is 'Detailed error message from the generation attempt';
comment on column generation_error_logs.error_code is 'Optional error code for categorizing errors';
comment on column generation_error_logs.model is 'The AI model that was being used when the error occurred';
comment on column generation_error_logs.source_text_hash is 'Hash of the source text that caused the error';
comment on column generation_error_logs.source_text_length is 'Length of the source text in characters'; 