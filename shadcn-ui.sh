#!/bin/bash

# Install shadcn/ui core dependencies
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge lucide-react

# Install required Radix UI components
npm install @radix-ui/react-label @radix-ui/react-slot

# Initialize shadcn/ui
npx shadcn-ui@latest init

# Add required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label 