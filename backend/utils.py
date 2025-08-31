from fastapi import HTTPException, status

def validate_book_data(title: str = None, author: str = None):
    """Validate book data and raise HTTPException if invalid."""
    if title is not None:
        if not title.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Book title cannot be empty."
            )
        if len(title.strip()) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title must be at least 2 characters long."
            )
        if len(title.strip()) > 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title must be less than 200 characters."
            )
    
    if author is not None:
        if not author.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Author name cannot be empty."
            )
        if len(author.strip()) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Author name must be at least 2 characters long."
            )
        if len(author.strip()) > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Author name must be less than 100 characters."
            )