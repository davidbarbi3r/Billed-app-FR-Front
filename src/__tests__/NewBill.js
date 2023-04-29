/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js"
import userEvent from '@testing-library/user-event';


// Initialisation
// On charge le dom avec le contenu du LocalStorage
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
// On ajoute un utilisateur de type employee
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))
// On défini une constante de navigation
const onNavigate = jest.fn()
window.alert = jest.fn()


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the NewBill Page should be rendered", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const title = screen.getAllByText('Envoyer une note de frais')
      const btnSend = screen.getAllByText('Envoyer')
      const form = document.querySelector('form')
      expect(title).toBeTruthy()
      expect(btnSend).toBeTruthy()
      expect(form.length).toEqual(9)
    })
    describe("When I upload an image file", () => {
      beforeEach(() => {
        // initialize the DOM
        document.body.innerHTML = NewBillUI()
      })
      test("Then the file handler should display a file", () => {
        const newBillInstance = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage
        })
        const handleFileChange = jest.fn(newBillInstance.handleChangeFile)
        const file = screen.getByTestId('file')
        file.addEventListener('change', handleFileChange)
        // user upload file
        userEvent.upload(file, new File(['test'], 'test.png', { type: 'image/png' }))
        
        expect(handleFileChange).toHaveBeenCalled()
        expect(file.files[0].name).toBe('test.png')
        expect(file.files).toHaveLength(1)
      })
      test("It should trigger an alert if the file is not [png, jpg, jpeg]", () => {
        const newBillInstance = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage
        })
        const handleFileChange = jest.fn(newBillInstance.handleChangeFile)
        const file = screen.getByTestId('file')
        file.addEventListener('change', handleFileChange)
        
        // user upload file
        userEvent.upload(file, new File(['test'], 'test.txt', { type: 'text/plain' }))
      
        // check if alert is displayed
        expect(window.alert).toHaveBeenCalled()
        expect(handleFileChange).toHaveBeenCalled()
        expect(file.files[0].name).toBe('test.txt')
        expect(file.value).toBe('')
      })
    })
  })
})

// test intégration POST
describe("When I submit a new valid bill", () => {
  test("Then a new bill should be created", () => {
    //DOM initialization
    document.body.innerHTML = NewBillUI()
    // Grab the form
    const submitForm =  screen.getByTestId('form-new-bill')
    // Create a new instance of NewBill
    const newBillClass = new NewBill({ 
      document, 
      onNavigate, 
      store: mockStore, 
      localStorage: window.localStorage 
    })
    // Listen to the submit event
    const handleSubmit = jest.fn(newBillClass.handleSubmit)
    submitForm.addEventListener('submit', handleSubmit)

    // create a valid bill
    const bill = {
      type: 'Transports',
      name: 'test',
      date: '2021-09-01',
      amount: 30,
      vat: 10,
      pct: 20,
      commentary: 'test text for commentary',
      fileUrl: 'test.png',
      fileName: 'test.png',
    }

    document.querySelector(`select[data-testid="expense-type"]`).value = bill.type
        document.querySelector(`input[data-testid="expense-name"]`).value = bill.name
        document.querySelector(`input[data-testid="datepicker"]`).value = bill.date
        document.querySelector(`input[data-testid="amount"]`).value = bill.amount
        document.querySelector(`input[data-testid="vat"]`).value = bill.vat
        document.querySelector(`input[data-testid="pct"]`).value = bill.pct
        document.querySelector(`textarea[data-testid="commentary"]`).value = bill.commentary
        newBillClass.fileUrl = bill.fileUrl
        newBillClass.fileName = bill.fileName

    // submit the form
    fireEvent.submit(submitForm)

    // check if the handleSubmit function is called
    expect(handleSubmit).toHaveBeenCalled()
  })
})
