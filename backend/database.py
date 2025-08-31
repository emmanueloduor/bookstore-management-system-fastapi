import json
import os
from typing import Dict
from models import Book

class BookDatabase:
    def __init__(self, data_file: str = "../data/books.json"):
        self.data_file = data_file
        self.books: Dict[int, Book] = {}
        self.load_books()
    
    def load_books(self):
        """Load books from JSON file if it exists."""
        # Create data directory if it doesn't exist
        os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
        
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, "r", encoding="utf-8") as file:
                    books_data = json.load(file)
                    self.books = {book['id']: Book(**book) for book in books_data}
                    print(f"Loaded {len(self.books)} books from {self.data_file}")
            except (json.JSONDecodeError, KeyError) as e:
                print(f"Error loading books from file: {e}")
                print("Using default book data...")
                self._load_default_books()
        else:
            self._load_default_books()
    
    def _load_default_books(self):
        """Load default sample books."""
        self.books = {
            1: Book(id=1, title="1984", author="George Orwell"),
            2: Book(id=2, title="To Kill a Mockingbird", author="Harper Lee"),
            3: Book(id=3, title="The Great Gatsby", author="F. Scott Fitzgerald")
        }
    
    def save_books(self):
        """Save current books to JSON file."""
        try:
            # Ensure data directory exists
            os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
            
            with open(self.data_file, "w", encoding="utf-8") as file:
                json.dump([book.model_dump() for book in self.books.values()], 
                         file, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving books to file: {e}")
    
    def get_next_id(self) -> int:
        """Get the next available book ID."""
        return max(self.books.keys()) + 1 if self.books else 1
    
    def get_all_books(self) -> list[Book]:
        """Get all books as a list."""
        return list(self.books.values())
    
    def get_book_by_id(self, book_id: int) -> Book | None:
        """Get a book by its ID."""
        return self.books.get(book_id)
    
    def add_book(self, book: Book) -> Book:
        """Add a book to the database."""
        self.books[book.id] = book
        self.save_books()
        return book
    
    def update_book(self, book_id: int, book: Book) -> Book:
        """Update a book in the database."""
        self.books[book_id] = book
        self.save_books()
        return book
    
    def delete_book(self, book_id: int) -> bool:
        """Delete a book from the database."""
        if book_id in self.books:
            del self.books[book_id]
            self.save_books()
            return True
        return False
    
    def book_exists(self, title: str, author: str, exclude_id: int = None) -> bool:
        """Check if a book with the same title and author already exists."""
        for book_id, book in self.books.items():
            if (exclude_id and book_id == exclude_id):
                continue
            if (book.title.lower().strip() == title.lower().strip() and 
                book.author.lower().strip() == author.lower().strip()):
                return True
        return False

# Global database instance
db = BookDatabase()