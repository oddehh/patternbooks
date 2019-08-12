// cached variables
const manySwitch = document.querySelector('#addManySwitch')

// Book Class: represents a book
class Book {
  constructor(title, brand, isLend = false, timesLend = 0) {
    this.brand = brand
    this.dateCreated = new Date()
    this.id = (title + brand).replace(/\s+/g, '').toLowerCase()
    this.title = title
    this.isLend = isLend
    this.timesLend = timesLend
    this.history = []
  }

  static lendToggle(bookId) {
    // get books
    const books = Store.getBooks()
    // find the book
    const filteredBook = books.find(book => book.id === bookId)

    if (!filteredBook.isLend) {
      // get selectors
      const clientName = document.querySelector('#fullname')
      const clientAgency = document.querySelector('#agency')
      const clientPhone = document.querySelector('#phone')
      const clientDeposit = document.querySelector('#deposit')

      if (!clientName.value) {
        UI.showAlert(`Wpisz kto wypożycza`, 'alert-danger')
        return false

      } else {

      const client = new Client(clientName.value, clientAgency.value, clientPhone.value, clientDeposit.value)

      filteredBook.history.push(client)
      filteredBook.timesLend = filteredBook.timesLend + 1
      }

    } else {
      filteredBook.history[filteredBook.history.length - 1].dateReturned = new Date()
    }

    // toggle isLend
    filteredBook.isLend = !filteredBook.isLend
    // save books
    localStorage.setItem('books', JSON.stringify(books))

    return true
  }
}

class Client {
  constructor(name, agency, phone, deposit) {

  this.name = name
  this.agency = agency
  this.phone = phone
  this.deposit = deposit
  this.dateLend = new Date()
  this.dateReturned = undefined
  }
}

// UI Class: handle UI tasks
class UI {
  static displayBooks() {
    const books = Store.getBooks()

    books.forEach(book => UI.addBookToList(book))
  }

  static addBookToList(book) {
    const list = document.querySelector('#book-list')
    const row = document.createElement('tr')

    row.classList.add('book-row')
    row.dataset.bookid = book.id

    const bookLastHistoryEntry = book.history.length > 0 ? book.history[book.history.length - 1] : ''

    row.innerHTML = `
      <td>
        <h4>${book.title}</h4>
        <p>${book.brand}</p>
      </td>
      <td>
        <p class="mb-0">${ book.isLend ? UI.daysAgo(UI.dateDiff(book)) + ' (' + UI.dateHuman(new Date(bookLastHistoryEntry.dateLend)) +')': ''}</p>
        <p class="font-deposit-info">${book.isLend && !!bookLastHistoryEntry.deposit ? bookLastHistoryEntry.deposit : ''}</p>
      </td>
      <td>
        <p class="mb-0">${book.isLend ? bookLastHistoryEntry.name : ''}</p>
        <p class="font-deposit-info">${book.isLend && !!bookLastHistoryEntry.phone ? bookLastHistoryEntry.phone : ''}</p>
      </td>
      <td></td>
      <td>
        <button type="button" class="btn ${book.isLend ? 'btn-success' : 'btn-primary'} lend-btn btn-block" data-bookid="${book.id}">${book.isLend ? 'Oddaj' : 'Wypożycz'}
        </button>
      </td>
      <td>
        <a class="edit-btn small text-primary" href="#" data-toggle="modal" data-target="#edit-modal" data-bookid="${book.id}">Edytuj</a>
        <a class="delete small text-danger" href="#" data-bookid="${book.id}">Usuń</a>
      </td>
    `

    list.appendChild(row)
  }

  static deleteBook(el) {
    if (el.classList.contains('delete')) {
      const bookId = el.dataset.bookid
      document.querySelector(`.book-row[data-bookid="${bookId}"]`).remove()
    }
  }

  static showAlert(message, className) {
    const div = document.createElement('div')
    div.className = `alert ${className}`
    div.appendChild(document.createTextNode(message))
    // get parent
    const container = document.querySelector('.container')
    const childNode = document.querySelector('.main')
    // insert alert
    container.insertBefore(div, childNode)

    setTimeout(() => document.querySelector('.alert').remove(), 3000)
  }

  static clearFields(...args) {

    args.map(input => (input.value = ''))
  }

  static filterToScanned(scanValue) {
    // get books
    const books = Store.getBooks()

    // filter books with by id
    const filteredBooks = books.filter(book =>
      book.id.includes(scanValue.replace(/\s+/gi, '').toLowerCase())
    )
    // clear list
    UI.clearList()
    // display filtered books
    filteredBooks.forEach(book => {
      UI.addBookToList(book)
    })
  }

  static dateHuman(date) {
    // let humanDate = date.toJSON().slice(0, 10).replace(/-/g, '/')
    let humanDate = date.toLocaleDateString('pl-PL', {
      month: 'numeric',
      day: 'numeric',
    })
    return humanDate
  }

  static dateDiff(book) {
    // date conversions from JSON.stringify
    const dateNow = new Date()
    const dateLend = new Date(book.history[book.history.length -1].dateLend)

    const diffTime = Math.abs(dateLend.getTime() - dateNow.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  static clearList() {
    const form = document.querySelector('#book-list')
    while (form.firstChild) {
      form.removeChild(form.firstChild)
    }
  }

  static daysAgo(num) {
    switch (num) {
      case 0:
        return 'Dzisiaj'
        break
      case 1:
        return 'Wczoraj'
        break
      default:
        return `${num} dni temu`
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

    books.forEach(book => {
      const ui = new UI()
      ui.addBookToList(book)
    })
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

  static updateBook(editedBook) {

  }
}

// Event: Display Books
document.addEventListener('DOMContentLoaded', UI.displayBooks)

// Event: Add a Book
document.querySelector('#book-form').addEventListener('submit', e => {
  e.preventDefault()

  const title = document.querySelector('#title')
  const brand = document.querySelector('#brand')
  const data = document.querySelector('#addManyInput')

  // Validate
  if ((!data.value && (!title.value || !brand.value)) || (!data.value && !title.value & !brand.value)) {
    UI.showAlert('Uzupełnij tytuł i markę LUB dodaj wiele', 'alert-danger')
  } else if (manySwitch.checked && !!title.value && !!brand.value && !data.value) {
    // instatiate book
    const book = new Book(title.value, brand.value)

    // add book to UI
    UI.addBookToList(book)

    // add to Local Storage
    Store.addBook(book)

    // show success alert
    UI.showAlert('Wzornik został dodany', 'alert-success')

    UI.clearFields(
      document.querySelector('#title'),
      document.querySelector('#brand')
    )
  } else if (manySwitch.checked && !!data.value && !title.value && !brand.value) {
    // adding many books from list
    // get array of book objects from data

    // replace for different new lines (OS, win, linux)
    const lines = data.value.trim().replace(/(?:\r\n|\r|\n)/g, '|').split('|')

    // two dimensional array
    const array = lines.map(line => line.trim().split('\t'))

    array.forEach(item => {
      // title and brand is being converted to object by instanciation
      const book = new Book(item[1], item[0])

      Store.addBook(book)
      UI.addBookToList(book)
      UI.clearFields(document.querySelector('#addManyInput'))
      UI.showAlert('Wzorniki zostały dodane', 'alert-success')
    })
  } else {
    UI.showAlert(
      'Możesz dodać tylko jeden wzornik LUB tylko wiele',
      'alert-danger'
    )
  }
})

document.querySelector('#book-list').addEventListener('click', (e) => {
  e.preventDefault()

  // Event REMOVE a book
  if (e.target.classList.contains('delete')) {
    // remove book from UI
    UI.deleteBook(e.target)
    // remove book from LS
    Store.removeBook(e.target.dataset.bookid)

    UI.showAlert('wzornik uzunięty z bazy', 'alert-success')
  }

  //  Event EDIT book
  if (e.target.classList.contains('edit-btn')) {

    const bookId = e.target.dataset.bookid

    // get book
    const books = Store.getBooks()
    const book = books.find(book => book.id === bookId)

    const lastEntry = book.history[book.history.length -1]

    // get selectors
    const editId = document.querySelector('#edit-id')
    const editTitle = document.querySelector('#edit-title')
    const editBrand = document.querySelector('#edit-brand')
    const editName = document.querySelector('#edit-name')
    const editAgency = document.querySelector('#edit-agency')
    const editPhone = document.querySelector('#edit-phone')
    const editDeposit = document.querySelector('#edit-deposit')

    editId.value = book.id

    // populate inputs with data from book object
    editTitle.value = book.title
    editBrand.value = book.brand

    // setting values for inputs based on history
    if (book.isLend === false || book.history.length === 0) {
      editName.value = ''
      editAgency.value = ''
      editPhone.value = ''
      editDeposit.value =''

    } else if (book.history.length > 0) {
      editName.value = lastEntry.name
      editAgency.value = lastEntry.agency
      editPhone.value = lastEntry.phone
      editDeposit.value = lastEntry.deposit
    }

    // enabling edit based on lend
    if (!book.isLend) {
      editName.disabled = true
      editAgency.disabled = true
      editPhone.disabled = true
      editDeposit.disabled = true
    } else {
      editName.disabled = false
      editAgency.disabled = false
      editPhone.disabled = false
      editDeposit.disabled = false
    }

  }

})

// save new data from modal edit
document.querySelector('#edit-save').addEventListener('click', (e) => {

  // get book

  // get values to change

  // update values in book
  // clear fileds
  // close modal

  // const editedBook = {
  //   id: book.id,
  //   title: editTitle.value,
  //   brand: editBrand.value,
  //   name: editName.value,
  //   agency: editAgency.value,
  //   phone: editPhone.value,
  //   deposit: editDeposit.value
  // }

  // Store.updateBook(editedBook)

  console.log()

  e.preventDefault()
  // close window
})




// Event scaned a book
document.querySelector('#id-scan').addEventListener('input', (e) => {
  // gonna need debounce link in underscorejs
  const scanValue = e.target.value
  if (scanValue) {
    UI.filterToScanned(scanValue)
  } else {
    UI.clearList()
    UI.displayBooks()
  }
})

// lend a book
document.querySelector('#book-list').addEventListener('click', (e) => {
  e.preventDefault()

  if (e.target.classList.contains('lend-btn')) {

    // toggle lend
    const isBookToggled = Book.lendToggle(e.target.dataset.bookid)

    // display filtered books
    const scan = document.querySelector('#id-scan')
    UI.filterToScanned(scan.value)

    if (isBookToggled) {
      UI.showAlert('Wzornik został wypożyczony / oddany', 'alert-success')
    }

  }
})

// clear button for form
document.querySelector('#book-form .link-clear').addEventListener('click', (e) => {
    e.preventDefault()

    Array.from(
      document.querySelectorAll('input, textarea'),
      field => (field.value = '')
    )
    UI.clearList()
    UI.displayBooks()
  })

