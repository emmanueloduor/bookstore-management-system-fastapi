# Bookstore Management System (FastAPI)

This is a simple Bookstore Management System built with FastAPI (Python) for the backend and a static HTML/CSS/JS frontend. It allows you to manage a collection of books, view statistics, and interact with a RESTful API.

## Features

- List, add, update, and delete books
- Get random books
- View collection statistics
- Interactive API documentation (Swagger UI)
- Simple static frontend for demonstration

## Technology Stack

- Python 3.11+
- FastAPI
- Uvicorn
- HTML, CSS, JavaScript (vanilla)

---

## Project Structure

```
requirements.txt
backend/
    main.py
    database.py
    models.py
    utils.py
    api/
        routes.py
        __init__.py
    data/
        books.json
frontend/
    index.html
    assets/
        css/
            styles.css
        js/
            app.js
data/
    books.json
```

## Backend

- Built with [FastAPI](https://fastapi.tiangolo.com/).
- API routes are defined in `backend/api/routes.py`.
- Data is stored in `backend/data/books.json`.
- Utility functions and database logic are in their respective files.

## Frontend

- Static HTML, CSS, and JavaScript files in the `frontend` folder
- `index.html` is the main entry point

---

## API Endpoints

**General**

- `GET /` — Welcome endpoint with API information

**Books**

- `GET /books` — List all books
- `GET /books/random` — Get a random book
- `GET /books/{book_id}` — Get book by ID
- `POST /books` — Add a new book
- `PUT /books/{book_id}` — Update book info
- `DELETE /books/{book_id}` — Delete book by ID

**Statistics**

- `GET /stats` — Get book collection statistics

**Docs**

- `/docs` — Interactive API documentation (Swagger UI)

---

## Setup Instructions

1. **Clone the repository**

   ```powershell
   git clone <repo-url>
   cd bookstore-management-system-fastapi
   ```

2. **Install dependencies**

   ```powershell
   pip install -r requirements.txt
   ```

3. **Run the backend server**

   ```powershell
   cd backend
   uvicorn main:app --reload
   ```

4. **Open the frontend**
   - Open `frontend/index.html` in your browser

---

## Example Usage

**Add a Book**

```http
POST /books
{
    "title": "The Pragmatic Programmer",
    "author": "Andrew Hunt"
}
```

**Get All Books**

```http
GET /books
```

**Update a Book**

```http
PUT /books/1
{
    "title": "The Pragmatic Programmer (Updated)"
}
```

**Delete a Book**

```http
DELETE /books/1
```

---

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

---

## License

MIT License
