// Book Class: represents a book
class Book {
  constructor(title, brand, isLend = false, timesLend = 0, dateLend = '', whoLend = '') {
    this.brand = brand
    this.dateCreated = UI.dateNow()
    this.id = (title + brand).replace(/\s+/g, '').toLowerCase()
    this.title = title
    this.isLend = isLend
    this.timesLend = timesLend
    this.dateLend = dateLend
    this.whoLend = whoLend
  }
}

// UI Class: handle UI tasks
class UI {
  static displayBooks() {
    const books = Store.getBooks()

    books.forEach((book) => UI.addBookToList(book))
  }

  static addBookToList(book) {
    const list = document.querySelector('#book-list')

    const row = document.createElement('tr')
    row.classList.add('book-row')
    row.dataset.bookid = book.id

      row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.brand}</td>
      <td>x dni temu (${book.dateCreated})</td>
      <td>${book.deposit}</td>
      <td><a class="delete small text-danger" href="#" data-bookId="${book.id}">Usuń</a></td>
    `
    list.appendChild(row)
  }

  static deleteBook(el) {
    if(el.classList.contains('delete')) {
      const bookId = el.dataset.bookid
      document.querySelector(`.book-row[data-bookId="${bookId}"]`)
        .remove()
    }
  }

  static showAlert(message, className) {
    const div = document.createElement('div')
    div.className = `alert ${className}`
    div.appendChild(document.createTextNode(message))
    // get parent
    const container = document.querySelector('.container')
    const form = document.getElementById('book-form')
    // insert alert
    container.insertBefore(div, form)

    setTimeout(() => document.querySelector('.alert').remove(), 3000)
  }

  static clearFields() {
    if (!document.querySelector('#addManySwitch').checked) {
      document.getElementById('title').value = ''
      document.getElementById('brand').value = ''
    } else {
      document.getElementById('addManyInput').value = ''
    }
  }

  static filterToScanned(scanValue) {
    // get books
    const books = Store.getBooks()

    // filter books with by id
    const filteredBooks = books.filter((book) => book.id.includes(scanValue.replace(/\s+/g, '').toLowerCase()))

    // clear list
    UI.clearList()
    // display filtered books
    filteredBooks.forEach( (book) => {
      UI.addBookToList(book)
    })
  }

  static dateNow() {
    let utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/')
    return utc
  }

  static clearList() {
    const form = document.querySelector('#book-list')
    while (form.firstChild) {
      form.removeChild(form.firstChild)
    }
  }
}


// Store Class: Handles Local Storage
class Store {
  static getBooks() {
    let books
    if (localStorage.getItem('books') === null) {
      books = []
    } else {
      books = JSON.parse(localStorage.getItem('books'))
    }
    return books
  }

  static displayBooks() {
    const books = Store.getBooks()

    books.forEach((book) => {
      const ui = new UI
      ui.addBookToList(book)
    });
  }

  static addBook(book) {
    const books = Store.getBooks()
    books.push(book)
    localStorage.setItem('books', JSON.stringify(books))
  }

  static removeBook(titleBrand) {
    const books = Store.getBooks()

    books.forEach((book, index) => {
      if (book.id === titleBrand) {
        books.splice(index, 1)
      }
    })
    localStorage.setItem('books', JSON.stringify(books))
  }
}

// Event: Display Books
document.addEventListener('DOMContentLoaded', UI.displayBooks)


// Event: Add a Book
document.querySelector('#book-form').addEventListener('submit', (e) => {
  e.preventDefault()

  // if one only:
  const manySwitch = document.querySelector('#addManySwitch')
  if (!manySwitch.checked) {

    const title = document.querySelector('#title').value;
    const brand = document.querySelector('#brand').value;
    const deposit = document.querySelector('#deposit').value;

    // Validate
    if(title === '' || brand === '') {
      UI.showAlert('Uzupełnij tytuł i markę', 'alert-danger')
    } else {
      // instatiate book
      const book = new Book (title, brand)

      // add book to UI
      UI.addBookToList(book)

      // add to Local Storage
      Store.addBook(book)

      // show success alert
      UI.showAlert('Wzornik został dodany', 'alert-success')

      UI.clearFields()

    }
  }

  // adding many books from list
  const data = document.querySelector('#addManyInput').value

  if (manySwitch.checked && data) {

    // get array of book objects from data

    // replace for different new lines (OS, win, linux)
    const lines = data.replace(/(?:\r\n|\r|\n)/g, '|').split('|')

    // two dimensional array
    const array = lines.map( line => line.split('\t') )

    array.forEach((item) => {
    // title and brand is being converted to object by instanciation
      const book = new Book(item[1], item[0])

      Store.addBook(book)
      UI.addBookToList(book)
      UI.clearFields()
      UI.showAlert('Wzorniki zostały dodane', 'alert-success')
    })
  }
})

// Event remove a book
document.querySelector('#book-list').addEventListener('click', (e) => {
  e.preventDefault()
  // remove book from UI
  UI.deleteBook(e.target)

  if (e.target.classList.contains('delete')) {
  // remove book from LS
  Store.removeBook(e.target.dataset.bookid)

  UI.showAlert('wzornik uzunięty z bazy', 'alert-success')
  }
})


// Event scaned a book
document.querySelector('#id-scan').addEventListener('keyup', (e) => {
  // gonna need debounce link in underscorejs
  const scanValue = e.target.value
  if (scanValue) {
    UI.filterToScanned(scanValue)
  } else {
    UI.clearList()
    UI.displayBooks()
  }
})
