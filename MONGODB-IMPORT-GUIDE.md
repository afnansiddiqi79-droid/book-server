# MongoDB Import Guide — BookNook

The BookNook backend expects book data in the `books` MongoDB collection.

A valid seed file is provided at `seed-books.json`.

## Step-by-step import in MongoDB Compass

1. Open MongoDB Compass and connect to your local or Atlas cluster.

2. Select the database used by the backend:
   - Local: `booknook`
   - Atlas: the database name from your `DB_NAME` environment variable.

3. Inside that database, select the `books` collection.

4. In the collection view, click **Import Data**.

5. Choose **Add Data → Import JSON**.

6. Upload the `seed-books.json` file.

7. Set the format to **JSON** (file extension `.json`).

8. Run the import and wait for it to complete.

9. Verify the imported records in the Compass UI.

## Field reference

Each book document uses these fields:

- `title` (string)
- `author` (string)
- `category` (string: Fiction, Science, History, Kids, Others)
- `image` (string, cover image URL)
- `description` (string)
- `totalCopies` (number)
- `availableCopies` (number, must never exceed `totalCopies`)
- `addedBy` (string, owner identifier)
- `addedByName` (string, owner display name)
- `createdAt` (date)
- `updatedAt` (date)

## Notes

- The seed file intentionally contains no `_id` fields; MongoDB generates them on import.
- The file contains plain JSON only — no comments or trailing commas.
- Do not run any automatic seeding script; the assignment requires manual import via MongoDB Compass.
