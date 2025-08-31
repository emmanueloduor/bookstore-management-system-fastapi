from fastapi import APIRouter, HTTPException, status
from typing import List
import random

from models import Book, BookCreate, BookUpdate
from database import db
from utils import validate_book_data

router = APIRouter()

@router.get("/", tags=["General"])
async def home():
    """Welcome endpoint with API information."""
    return {
        "message": "Welcome to the BookVault API!",
        "version": "1.0.0",
        "total_books": len(db.books),
        "endpoints": {
            "books": "/books",
            "random_book": "/books/random",
            "specific_book": "/books/{id}",
            "docs": "/docs"
        }
    }

@router.get("/books", response_model=List[Book], tags=["Books"])
async def list_books():
    """List all books in the database."""
    return db.get_all_books()

@router.get("/books/random", response_model=Book, tags=["Books"])
async def get_random_book():
    """Get a single random book from the collection."""
    if not db.books:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Book database is empty. Please add some books first."
        )
    
    random_id = random.choice(list(db.books.keys()))
    return db.books[random_id]

@router.get("/books/{book_id}", response_model=Book, tags=["Books"])
async def get_book_by_id(book_id: int):
    """Get a single book by its ID."""
    if book_id < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book ID must be a positive integer."
        )
    
    book = db.get_book_by_id(book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Book with ID {book_id} not found."
        )
    return book

@router.post("/books", response_model=Book, status_code=status.HTTP_201_CREATED, tags=["Books"])
async def add_book(book_to_create: BookCreate):
    """Add a new book to the database."""
    # Validation
    validate_book_data(book_to_create.title, book_to_create.author)
    
    # Check for duplicates
    if db.book_exists(book_to_create.title, book_to_create.author):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Book '{book_to_create.title}' by {book_to_create.author} already exists."
        )
    
    new_id = db.get_next_id()
    new_book = Book(
        id=new_id, 
        title=book_to_create.title.strip(), 
        author=book_to_create.author.strip()
    )
    
    return db.add_book(new_book)

@router.put("/books/{book_id}", response_model=Book, tags=["Books"])
async def update_book(book_id: int, updated_info: BookUpdate):
    """Update an existing book's information."""
    if book_id < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book ID must be a positive integer."
        )
    
    book = db.get_book_by_id(book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Book with ID {book_id} not found."
        )
    
    # Validate update data
    update_data = updated_info.model_dump(exclude_unset=True)
    
    if 'title' in update_data:
        validate_book_data(update_data['title'], None)
        update_data['title'] = update_data['title'].strip()
    
    if 'author' in update_data:
        validate_book_data(None, update_data['author'])
        update_data['author'] = update_data['author'].strip()
    
    # Check for duplicates (excluding current book)
    new_title = update_data.get('title', book.title)
    new_author = update_data.get('author', book.author)
    
    if db.book_exists(new_title, new_author, exclude_id=book_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Book '{new_title}' by {new_author} already exists."
        )
    
    # Create updated book
    updated_book = book.model_copy(update=update_data)
    return db.update_book(book_id, updated_book)

@router.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Books"])
async def delete_book(book_id: int):
    """Delete a book from the database by its ID."""
    if book_id < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book ID must be a positive integer."
        )
    
    if not db.delete_book(book_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Book with ID {book_id} not found."
        )
    
    return None

@router.get("/stats", tags=["Statistics"])
async def get_statistics():
    """Get statistics about the book collection."""
    if not db.books:
        return {
            "total_books": 0,
            "total_authors": 0,
            "authors": []
        }
    
    authors = list(set(book.author for book in db.books.values()))
    return {
        "total_books": len(db.books),
        "total_authors": len(authors),
        "authors": sorted(authors)
    }