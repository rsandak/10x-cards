# REST API Plan

## 1. Resources

- **Users** (Supabase Auth): Managed by Supabase authentication.

- **Generations** (Table: generations):
  - Stores metadata for AI generation processes.
  - Key fields include: id, user_id, model, generated_count, accepted_unedited_count, accepted_edited_count, unaccepted_count, source_text_hash, source_text_length (validated to be between 1000 and 10000), generation_duration, created_at, updated_at.

- **Flashcards** (Table: flashcards):
  - Represents both manually created and AI-generated flashcards.
  - Key fields include: id, user_id, generation_id (optional, linking to a generation record), front (max 200 characters), back (max 500 characters), source (enum: 'AI-full', 'Manual', 'AI-edited'), created_at, updated_at.

- **Generation Error Logs** (Table: generation_error_logs):
  - Logs errors during the AI flashcard generation process.
  - Key fields: id, user_id, error_message, error_code, model, source_text_hash, source_text_length, created_at.

## 2. Endpoints

For each resource, endpoints follow RESTful conventions with authentication enforced via Supabase Auth.

### A. Generations

- **GET /generations**
  - Description: List all generation records for the authenticated user.
  - Query Parameters:
    - pagination (limit, offset)
    - filtering (e.g. by model)
  - Response: Array of generation objects.
  - Success Codes: 200 OK
  - Error Codes: 401 Unauthorized

- **POST /generations**
  - Description: Generate candidate flashcards using an external LLM. The endpoint accepts input text and returns a list of generated flashcard candidates.
  - Request Body (JSON):

    ```json
    {
      "source_text": "string (between 1000 and 10000 characters)"
    }
    ```

  - Business Logic:
    1. Validate input text length (1000-10000 characters)
    2. Send text to LLM API for flashcard generation
    3. Store the generation metadata and return flashcard candidates to the user.
  - Response:

    ```json
    {
      "generationId": number,
      "totalGenerated": number,
      "flashcardCandidates": [
        {
          "front": "string",
          "back": "string",
          "source": "string (AI-full)"
        },
        ...
      ]
    }
    ```

  - Success Codes: 200 OK
  - Error Codes:
    - 400 Bad Request (if text length is invalid or model is not supported)
    - 401 Unauthorized
    - 500 Internal Server Error (automatically logged to generation_error_logs)

*Note*: Once flashcards are generated, the client can review them and decide to create a flashcard via the **POST /flashcards** endpoint.

- **GET /generations/{id}**
  - Description: Retrieve a specific generation record belonging to the authenticated user.
  - Response: Generation object.
  - Success Codes: 200 OK
  - Error Codes: 401 Unauthorized, 404 Not Found

### B. Flashcards

- **GET /flashcards**
  - Description: List all flashcards for the authenticated user.
  - Query Parameters:
    - Pagination (limit, offset)
    - Filtering (e.g. keyword search in front/back)
    - Sorting (e.g. created_at)
  - Response: Array of flashcard objects.
  - Success Codes: 200 OK
  - Error Codes: 401 Unauthorized

- **POST /flashcards**
  - Description: Create one or more new flashcards (manual entry or accepted AI suggestion). Supports batch creation.
  - Request Body (JSON):

    ```json
    {
      "flashcards": [
        {
          "front": "string (max 200 characters)",
          "back": "string (max 500 characters)",
          "source": "Manual" | "AI-full" | "AI-edited",
          "generationId": number   // optional, if flashcard is generated
        }
      ]
    }
    ```

  - Validations:
    - Array must contain at least 1 flashcard
    - Front text length: 1-200 characters
    - Back text length: 1-500 characters
    - Source must be one of the allowed values
    - If source is "AI-full" or "AI-edited", generationId must be provided and valid
  - Response: An array of the created flashcard objects.
  - Success Codes: 201 Created
  - Error Codes:
    - 400 Bad Request (validation errors)
    - 401 Unauthorized
    - 422 Unprocessable Entity (invalid generationId reference)

- **GET /flashcards/{id}**
  - Description: Retrieve details for a specific flashcard.
  - Response: Flashcard object.
  - Success Codes: 200 OK
  - Error Codes: 401 Unauthorized, 404 Not Found

- **PUT /flashcards/{id}**
  - Description: Update a flashcard (e.g. edit AI-generated suggestion or manual correction).
  - Request Body (JSON): Fields to update (front and/or back)
  - Validations:
    - Front text length (if provided): 1-200 characters
    - Back text length (if provided): 1-500 characters
    - At least one field must be provided
  - Success Codes: 200 OK
  - Error Codes:
    - 400 Bad Request (validation errors)
    - 401 Unauthorized
    - 404 Not Found
    - 422 Unprocessable Entity (invalid field format)

- **DELETE /flashcards/{id}**
  - Description: Remove a flashcard.
  - Success Codes: 204 No Content
  - Error Codes: 401 Unauthorized, 404 Not Found

### C. Generation Error Logs

- **GET /generation-error-logs**
  - Description: List all error logs for AI fleshcards generation for the authenticated user or admin.
  - Response: Array of error log objects.
  - Success Codes: 200 OK
  - Error Codes: 401 Unauthorized, 403 Forbidden if access is restricted to admin user

## 3. Authentication and Authorization

- The API uses Supabase Auth. All endpoints (except public ones such as AI generation if made public) require an `Authorization` header with a valid Bearer token.
- Row Level Security (RLS) policies are enforced on the generations, flashcards, and error logs tables to ensure that users can only access and modify their own data.
- Endpoints should verify token integrity and user identity before processing requests.

## 4. Validation and Business Logic

- **Input Validation**
  - **Flashcards**: "front" field is limited to 200 characters; "back" field is limited to 500 characters; "source" field must be one of: "manual", "AI-full", "AI-edited".
  - **Generations**: "source_text" must be between 1000 and 10000 characters, "source_text_hash" computed for duplicate detection.

- **Business Logic**
  - **AI Generation**
    - Validate input data before initiating flashcard generation.
    - Invoke an external LLM to generate candidate flashcards.
    - Record generation metadata (model, generated_count, generation_duration) and return the generated candidate flashcards for user review.
    - Log any errors encountered during the flashcard generation process, including error messages, error codes, and timestamps, to support effective troubleshooting and analytics.

- **Performance and Security**
  - Endpoints implementing list operations support pagination, filtering, and sorting to efficiently handle large datasets.
  - Database indexes (e.g. on user_id) are leveraged to improve query performance.
  - Rate limiting and input sanitization are recommended to prevent abuse and ensure API stability.
  - Robust error handling mechanisms are integrated to capture exceptions, log incidents, and return safe, descriptive error responses without exposing sensitive details.
