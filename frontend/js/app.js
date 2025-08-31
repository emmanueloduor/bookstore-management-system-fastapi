// Configuration
const API_BASE_URL = 'http://127.0.0.1:8000';

// Global state
let allBooks = [];
let filteredBooks = [];
let currentEditId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadBooks();
    setupEventListeners();
    createFloatingAnimation();
});

function setupEventListeners() {
    // Add book form
    document.getElementById('addBookForm').addEventListener('submit', handleAddBook);
    
    // Edit book form
    document.getElementById('editBookForm').addEventListener('submit', handleEditBook);
    
    // Modal close events
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('editModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });

    // Search input with debounce
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(searchBooks, 300);
    });

    // Enter key search
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBooks();
        }
    });
}

function sortBooks() {
    const sortBy = document.getElementById('sortSelect').value;
    filteredBooks.sort((a, b) => {
        if (sortBy === 'price') {
            return (a.price ?? 0) - (b.price ?? 0);
        }
        return (a[sortBy] ?? '').toString().localeCompare((b[sortBy] ?? '').toString(), undefined, { sensitivity: 'base' });
    });
    renderBooks(filteredBooks);
}
function createFloatingAnimation() {
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        const randomDelay = Math.random() * 10;
        const randomDuration = 15 + Math.random() * 10;
        shape.style.animationDelay = `-${randomDelay}s`;
        shape.style.animationDuration = `${randomDuration}s`;
    });
}

async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(errorData.detail || `HTTP ${response.status}`);
        }

        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Unable to connect to the API server. Please ensure the FastAPI server is running on ' + API_BASE_URL);
        }
        throw error;
    }
}

async function loadBooks() {
    showLoading();
    try {
        allBooks = await apiRequest('/books');
        filteredBooks = [...allBooks];
        renderBooks(filteredBooks);
        updateStats();
        showStatus('Books loaded successfully!', 'success');
    } catch (error) {
        showStatus(`Error loading books: ${error.message}`, 'error');
        renderBooks([]);
    }
}

async function handleAddBook(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const bookData = {
        title: formData.get('title').trim(),
        author: formData.get('author').trim()
    };

    if (!bookData.title || !bookData.author) {
        showStatus('Please fill in all fields', 'error');
        return;
    }

    try {
        const newBook = await apiRequest('/books', {
            method: 'POST',
            body: JSON.stringify(bookData)
        });

        allBooks.push(newBook);
        filteredBooks = [...allBooks];
        renderBooks(filteredBooks);
        updateStats();
        showStatus(`"${newBook.title}" added successfully!`, 'success');
        event.target.reset();
        
        // Highlight new book
        setTimeout(() => {
            const newBookCard = document.querySelector(`.book-card:last-child`);
            if (newBookCard) {
                newBookCard.style.animation = 'none';
                newBookCard.style.background = 'rgba(46, 204, 113, 0.2)';
                setTimeout(() => {
                    newBookCard.style.background = 'rgba(255, 255, 255, 0.1)';
                }, 2000);
            }
        }, 100);
        
    } catch (error) {
        showStatus(`Error adding book: ${error.message}`, 'error');
    }
}

async function handleEditBook(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const bookData = {
        title: formData.get('title').trim(),
        author: formData.get('author').trim(),
        price: parseFloat(formData.get('price')),
        genre: formData.get('genre').trim()
    };
    if (!bookData.title || !bookData.author || isNaN(bookData.price) || !bookData.genre) {
        showStatus('Please fill in all fields', 'error');
        return;
    }
    try {
        const updatedBook = await apiRequest(`/books/${currentEditId}`, {
            method: 'PUT',
            body: JSON.stringify(bookData)
        });
        const index = allBooks.findIndex(book => book.id === currentEditId);
        if (index !== -1) {
            allBooks[index] = updatedBook;
            filteredBooks = [...allBooks];
            renderBooks(filteredBooks);
            updateStats();
        }
        closeModal();
        showStatus(`"${updatedBook.title}" updated successfully!`, 'success');
    } catch (error) {
        showStatus(`Error updating book: ${error.message}`, 'error');
    }
}

async function deleteBook(id) {
    const book = allBooks.find(b => b.id === id);
    const confirmMessage = book ? 
        `Are you sure you want to delete "${book.title}" by ${book.author}?` : 
        'Are you sure you want to delete this book?';
        
    if (!confirm(confirmMessage)) {
        return;
    }

    try {
        await apiRequest(`/books/${id}`, { method: 'DELETE' });
        
        allBooks = allBooks.filter(book => book.id !== id);
        filteredBooks = filteredBooks.filter(book => book.id !== id);
        renderBooks(filteredBooks);
        updateStats();
        showStatus('Book deleted successfully!', 'success');
    } catch (error) {
        showStatus(`Error deleting book: ${error.message}`, 'error');
    }
}

async function getRandomBook() {
    showLoading();
    try {
        const randomBook = await apiRequest('/books/random');
        filteredBooks = [randomBook];
        renderBooks(filteredBooks);
        showStatus('Here\'s a random book from your collection!', 'success');
    } catch (error) {
        showStatus(`Error getting random book: ${error.message}`, 'error');
    }
}

function searchBooks() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!query) {
        filteredBooks = [...allBooks];
    } else {
        filteredBooks = allBooks.filter(book => 
            book.title.toLowerCase().includes(query) || 
            book.author.toLowerCase().includes(query)
        );
    }
    
    renderBooks(filteredBooks);
    
    if (query && filteredBooks.length === 0) {
        showStatus('No books found matching your search.', 'error');
    } else if (query) {
        showStatus(`Found ${filteredBooks.length} book(s) matching "${query}"`, 'success');
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    filteredBooks = [...allBooks];
    renderBooks(filteredBooks);
    showStatus('Filter cleared. Showing all books.', 'success');
}

function openEditModal(book) {
    currentEditId = book.id;
    document.getElementById('editTitle').value = book.title;
    document.getElementById('editAuthor').value = book.author;
    document.getElementById('editPrice').value = book.price;
    document.getElementById('editGenre').value = book.genre;
    document.getElementById('editModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditId = null;
}

function renderBooks(books) {
    const container = document.getElementById('booksContainer');
    
    if (books.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <h3>No Books Found</h3>
                <p>Your library is empty or no books match your search criteria.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = books.map(book => `
        <div class="book-card" style="animation: slideIn 0.5s ease ${Math.random() * 0.3}s both">
            <div class="book-id">#${book.id}</div>
            <h4>${escapeHtml(book.title)}</h4>
            <p><strong>Author:</strong> ${escapeHtml(book.author)}</p>
            <p><strong>Price:</strong> $${book.price?.toFixed(2) ?? '--'}</p>
            <p><strong>Genre:</strong> ${book.genre ?? '--'}</p>
            <div class="book-actions">
                <button class="btn btn-secondary" onclick="openEditModal(${JSON.stringify(book).replace(/"/g, '&quot;')})">
                    ✏️ Edit
                </button>
                <button class="btn btn-danger" onclick="deleteBook(${book.id})">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    const totalBooks = allBooks.length;
    const authors = new Set(allBooks.map(book => book.author));
    const totalAuthors = authors.size;
    const lastBook = allBooks.length > 0 ? allBooks[allBooks.length - 1] : null;

    document.getElementById('totalBooks').textContent = totalBooks;
    document.getElementById('totalAuthors').textContent = totalAuthors;
    document.getElementById('lastAdded').textContent = lastBook ? 
        `#${lastBook.id}` : '--';
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.innerHTML = `<div class="status-message status-${type}">${message}</div>`;
    
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 3000);
    }
}

function showLoading() {
    document.getElementById('booksContainer').innerHTML = `
        <div class="empty-state">
            <div class="loading"></div>
            <h3 style="margin-top: 20px;">Loading books...</h3>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function exportBooks() {
    if (allBooks.length === 0) {
        showStatus('No books to export!', 'error');
        return;
    }
    
    const dataStr = JSON.stringify(allBooks, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookstore_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showStatus('📥 Books exported successfully!', 'success');
}

// Interactive effects
document.addEventListener('mousemove', function(e) {
    const shapes = document.querySelectorAll('.shape');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.5;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        shape.style.transform += ` translate(${x}px, ${y}px)`;
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'k':
                e.preventDefault();
                document.getElementById('searchInput').focus();
                break;
            case 'n':
                e.preventDefault();
                document.getElementById('title').focus();
                break;
            case 'r':
                e.preventDefault();
                getRandomBook();
                break;
        }
    }
    
    if (e.key === 'Escape' && document.getElementById('editModal').style.display === 'block') {
        closeModal();
    }
});

// Form interaction effects
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Connection status check
function checkApiConnection() {
    fetch(API_BASE_URL + '/')
        .then(response => {
            if (response.ok) {
                document.body.style.borderTop = '3px solid #2ecc71';
            } else {
                document.body.style.borderTop = '3px solid #e74c3c';
            }
        })
        .catch(() => {
            document.body.style.borderTop = '3px solid #e74c3c';
            showStatus('⚠️ API server not reachable. Please start your FastAPI server.', 'error');
        });
}

// Initialize features
setTimeout(() => {
    // Add export button
    const filterSection = document.querySelector('.filter-section');
    if (filterSection) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-secondary';
        exportBtn.innerHTML = '📥 Export';
        exportBtn.onclick = exportBooks;
        filterSection.appendChild(exportBtn);
    }
    
    // Show help
    showStatus('💡 Tips: Use Ctrl+K to search, Ctrl+N for new book, Ctrl+R for random book', 'success');
}, 1000);

// Check connection periodically
setInterval(checkApiConnection, 30000);
checkApiConnection();

// Smooth scroll
document.documentElement.style.scrollBehavior = 'smooth';