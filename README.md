# 10x-cards

## Project Description

10x-cards is a web application designed for creating and managing flashcards using the spaced repetition learning technique. The application offers two methods for flashcard creation: manual entry and AI-driven generation. Users can manually create flashcards or generate candidates automatically through an integrated Language Model API. The system also supports an interactive learning session based on spaced repetition, ensuring an efficient and personalized learning experience.

## Tech Stack

- **Frontend:**
  - Astro 5
  - React 19 (for interactive components)
  - TypeScript 5
  - Tailwind CSS 4
  - Shadcn/ui (pre-built React components)
- **Backend:**
  - Supabase (PostgreSQL, authentication, and backend-as-a-service)
- **AI Integration:**
  - Openrouter.ai (access to multiple language models such as OpenAI, Anthropic, and Google)
- **CI/CD & Hosting:**
  - GitHub Actions
  - DigitalOcean (Docker-based deployment)

## Getting Started Locally

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/rsandak/10x-cards.git
   cd 10x-cards
   ```
2. **Install the Correct Node Version:**
   The project uses the Node version specified in the `.nvmrc` file.
   ```bash
   nvm use
   ```
3. **Install Dependencies:**
   ```bash
   npm install
   ```
4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
5. **Open the Application:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## Available Scripts

- **`npm run dev`**: Starts the development server.
- **`npm run build`**: Builds the application for production.
- **`npm run preview`**: Previews the production build.
- **`npm run astro`**: Executes Astro CLI commands.
- **`npm run lint`**: Runs ESLint to check for code issues.
- **`npm run lint:fix`**: Runs ESLint and automatically fixes issues.
- **`npm run format`**: Formats the code using Prettier.

## Project Scope

The primary features of the project include:

- **Flashcard Generation:**
  - **Manual Creation:** Users can create flashcards by entering the content manually with character limits (front: 200, back: 500).
  - **AI Generation:** Users can input text (between 1000 and 10000 characters) to have the system generate flashcard suggestions via a Language Model API.

- **Flashcard Management:**
  - Viewing, editing, and deleting saved flashcards.
  - An intuitive interface for managing and searching flashcards.

- **User Accounts:**
  - Secure registration and login mechanisms.
  - Access restricted to registered users for creating and managing flashcards.

- **Learning Sessions:**
  - Interactive learning sessions driven by a spaced repetition algorithm, where users can review flashcards, reveal answers, and rate their understanding.

- **Error Handling & Logging:**
  - Clear error messages for issues such as API failures or unsuccessful operations.
  - Logging of user actions to help analyze feature effectiveness and system performance.

## Project Status

The project is currently in the MVP stahe and under active development.

## License

This project is licensed under the MIT License. 