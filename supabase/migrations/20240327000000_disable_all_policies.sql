-- Migration: Disable all existing RLS policies
-- Description: Drops all policies from flashcards, generations, and generation_error_logs tables
-- Author: System
-- Date: 2024-03-27

-- Drop policies from flashcards table
drop policy if exists "Users can view their own flashcards" on flashcards;
drop policy if exists "Users can insert their own flashcards" on flashcards;
drop policy if exists "Users can update their own flashcards" on flashcards;
drop policy if exists "Users can delete their own flashcards" on flashcards;

-- Drop policies from generations table
drop policy if exists "Users can view their own generations" on generations;
drop policy if exists "Users can insert their own generations" on generations;
drop policy if exists "Users can update their own generations" on generations;
drop policy if exists "Users can delete their own generations" on generations;

-- Drop policies from generation_error_logs table
drop policy if exists "Users can view their own error logs" on generation_error_logs;
drop policy if exists "Users can insert their own error logs" on generation_error_logs; 