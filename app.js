class Book {
  constructor(title, brand, isLend = false, timesLend = 0) {
    this.brand = brand
    this.dateCreated = UI.dateNow()
    this.id = (title + brand).replace(/\s+/g, '')
    this.title = title
    this.isLend = isLend
    this.timesLend = timesLend
    this.dateLend = UI.dateNow()
  }

}

class UI {
  addBookToList(book) {
    const list = document.getElementById('book-list')
    // create tr element
    const row = document.createElement('tr')
    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.brand}</td>
      <td>${book.dateCreated}</td>
      <td><a class="delete" href="#">X</a></td>
    `
    list.appendChild(row)
  }

  showAlert(message, className) {
    const div = document.createElement('div')
    div.className = `alert ${className}`
    div.appendChild(document.createTextNode(message))
    // get parent
    const container = document.querySelector('.container')
    const form = document.getElementById('book-form')
    // insert alert
    container.insertBefore(div, form)

    setTimeout(function () {
      document.querySelector('.alert')
        .remove()
    }, 3000)
  }

  deleteBook(target) {
      target.parentElement.parentElement.remove()
  }

  clearFields() {
    document.getElementById('title').value = ''
    document.getElementById('brand').value = ''
  }

  static dateNow() {
    let utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/')
    return utc
  }
}


class Store {
  static getBooks() {
    let books
    if(localStorage.getItem('books') === null) {
      books = []
    } else {
      books = JSON.parse(localStorage.getItem('books'))
    }
    return books
  }

  static displayBooks() {
    const books = Store.getBooks()

    books.forEach( (book) => {
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
      if(book.id === titleBrand){
        books.splice(index, 1)
      }
    })

    localStorage.setItem('books', JSON.stringify(books))
  }

}


// DOM load event
document.addEventListener('DOMContentLoaded', Store.displayBooks)

// event listeners
document.getElementById('book-form')
  .addEventListener('submit', function (e) {
    // get form values
    let title = document.getElementById('title').value
    let brand = document.getElementById('brand').value

    // instantiate book
    const book = new Book(title, brand)

    // instantiate UI
    const ui = new UI()

    // validate
    if (book.title === '' || book.brand === '') {
      ui.showAlert('Uzupełnij pola z tytułem i marką', 'alert-danger')
    } else {
      // add book to list
      ui.addBookToList(book)

      // add to LS
      Store.addBook(book)

      // show alert
      ui.showAlert('Wzornik dodany', 'alert-success')
      // clear fields
      ui.clearFields()

    }

    e.preventDefault()
  })

// event listener for delete

document.getElementById('book-list').addEventListener('click', function (e) {

  const ui = new UI()

  if (e.target.className === 'delete') {
    ui.deleteBook(e.target)
    ui.showAlert('Wzornik usunięty', 'alert-success')
    let targetId = (e.target.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.textContent + e.target.parentElement.previousElementSibling.previousElementSibling.textContent).replace(/\s+/g, '')
    Store.removeBook(targetId)
  }
  e.preventDefault
})