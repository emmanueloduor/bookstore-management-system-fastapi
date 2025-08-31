from pydantic import BaseModel
from typing import Optional


class Book(BaseModel):
    """Base model for a Book, includes all fields."""
    id: int
    title: str
    author: str
    price: float
    genre: str


class BookCreate(BaseModel):
    """Model for creating a new book (id is not required from the user)."""
    title: str
    author: str
    price: float
    genre: str


class BookUpdate(BaseModel):
    """Model for updating a book. All fields are optional."""
    title: Optional[str] = None
    author: Optional[str] = None
    price: Optional[float] = None
    genre: Optional[str] = None