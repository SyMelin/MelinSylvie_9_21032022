/**
 * @jest-environment jsdom
 */

import { fireEvent, getByTestId, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee', email: "johndoe@email.com"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      //l'icône mail doit être mise en valeur (via le css)
      expect(mailIcon.classList).toContain('active-icon')
    })
  })//test OK

  describe("When I am on NewBill page", () => {
    describe("When I upload a justificative file in correct format", () => {
      test("Then the file should be accepted", async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee', email: "johndoe@email.com"
        }))
      
        document.body.innerHTML = NewBillUI()
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = mockStore
        store.bills = jest.fn(mockStore.bills)
        const newBillPage = new NewBill({
          document, onNavigate, store, localStorage: window.localStorage
        })
        jest.spyOn(window,'alert').mockImplementation(() => {})

        const handleChangeFile = jest.fn(newBillPage.handleChangeFile)

        await waitFor (() => screen.getByTestId("file"))
        let inputFile = screen.getByTestId("file")
        inputFile.addEventListener('change', handleChangeFile)
        let file = new File(['hello'], 'hello.png', {type: 'image/png'})
        expect(file.name).toBe("hello.png")
        fireEvent.change(inputFile, {target: {
          files: [file]
        }})
        
        expect(handleChangeFile).toHaveBeenCalledTimes(1) 
        expect(inputFile.files.length).toStrictEqual(1)
        expect(inputFile.files).toContain(file)
        expect(inputFile.files[0]).toStrictEqual(file)
        expect(inputFile.files[0].name).toStrictEqual("hello.png")
        expect(inputFile.files[0].name).toMatch(/(\.jpg|\.jpeg|\.png)$/i)
        expect(window.alert).not.toHaveBeenCalled()
      })
    })

    describe("When I do not upload a justificative file in correct format", () => {
      test("Then the file should be refused", async () => {
        document.body.innerHTML = NewBillUI()
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const store = mockStore
        store.bills = jest.fn(mockStore.bills)
        const newBillPage = new NewBill({
          document, onNavigate, store, localStorage: window.localStorage
        })

        jest.spyOn(window,'alert').mockImplementation(() => {})

        const handleChangeFile = jest.fn(newBillPage.handleChangeFile)
        await waitFor (() => screen.getByTestId("file"))
        let inputFile = screen.getByTestId("file")
        inputFile.addEventListener('change', handleChangeFile)
        let file = new File(['hello'], 'hello.gif', {type: 'image/gif'})
        expect(file.name).toBe("hello.gif")
        fireEvent.change(inputFile, {target: {
          files: [file]
        }})

        expect(handleChangeFile).toHaveBeenCalled()
        expect(window.alert).toHaveBeenCalledWith('Le fichier JUSTIFICATIF doit être de type : .jpg , .jpeg , ou .png')
        expect(inputFile.files).toBe(null)
      })
    })
    describe("When I do not fill fields and I click on submit button Send", () => {
      test ("Then It should render NewBill page", async () => {
        document.body.innerHTML =  NewBillUI()

        //Fiels are empty
        const inputExpenseType = screen.getByTestId("expense-type")
        expect(inputExpenseType.value).toBe("Transports")
        const inputExpenseName = screen.getByTestId("expense-name")
        expect(inputExpenseName.value).toBe("")
        const inputDatepicker = screen.getByTestId("datepicker")
        expect(inputDatepicker.value).toBe("")
        const inputAmount = screen.getByTestId("amount")
        expect(inputAmount.value).toBe("")
        const inputVat = screen.getByTestId("vat")
        expect(inputVat.value).toBe("")
        const inputPct = screen.getByTestId("pct")
        expect(inputPct.value).toBe("")
        const inputCommentary = screen.getByTestId("commentary")
        expect(inputCommentary.value).toBe("")
        const inputFile = screen.getByTestId("file")
        expect(inputFile.value).toBe("")

        const store = mockStore
        const newBillPage = new NewBill({
          document, onNavigate, store: mockStore, localStorage: window.localStorage
        })

        const form = screen.getByTestId("form-new-bill")
        const handleSubmit = jest.fn(newBillPage.handleSubmit)
        form.addEventListener("submit", handleSubmit)
        fireEvent.submit(form)
        expect(handleSubmit).toHaveBeenCalled()
        //We should stay on the NewBill page
        expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
        expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      })
    })
  
    describe("When I do fill all fields in correct format and I click on submit button Send", () => {
      test("Then a new bill should be registered and it should renders Bills page updated", async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee', email: "johndoe@email.com"
        }))
        
        document.body.innerHTML = NewBillUI()
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const store = mockStore
        const newBillPage = new NewBill({
          document, onNavigate, store: mockStore, localStorage: window.localStorage
        })
        const newFile = new File(['new'], `C:\\fakepath\\new.jpg`, {type: 'image/jpg'})
        const inputData = {
          expenseType: "Transports",
          expenseName: "Test",
          datepicker: "2022-04-07",
          amount: "50",
          vat: "70",
          pct: "20",
          commentary: "pour le test",
          file: newFile
        }

        //All fields are filled with correct data
        const inputExpenseType = screen.getByTestId("expense-type")
        fireEvent.change(inputExpenseType, { target: { value: inputData.expenseType }})
        expect(inputExpenseType.value).toBe(inputData.expenseType)
        
        const inputExpenseName = screen.getByTestId("expense-name")
        fireEvent.change(inputExpenseName, { target: { value: inputData.expenseName }})
        expect(inputExpenseName.value).toBe(inputData.expenseName)
        
        const inputDatepicker = screen.getByTestId("datepicker")
        fireEvent.change(inputDatepicker, { target: { value: inputData.datepicker }})
        expect(inputDatepicker.value).toBe(inputData.datepicker)
        
        const inputAmount = screen.getByTestId("amount")
        fireEvent.change(inputAmount, { target: { value: inputData.amount }})
        expect(inputAmount.value).toBe(inputData.amount)
        
        const inputVat = screen.getByTestId("vat")
        fireEvent.change(inputVat, { target: { value: inputData.vat }})
        expect(inputVat.value).toBe(inputData.vat)

        const inputPct = screen.getByTestId("pct")
        fireEvent.change(inputPct, { target: { value: inputData.pct }})
        expect(inputPct.value).toBe(inputData.pct)

        const inputCommentary = screen.getByTestId("commentary")
        fireEvent.change(inputCommentary, { target: { value: inputData.commentary }})
        expect(inputCommentary.value).toBe(inputData.commentary)

        const handleChangeFile = jest.fn(newBillPage.handleChangeFile)
        const inputFile = screen.getByTestId("file")
        inputFile.addEventListener('change', handleChangeFile)
        fireEvent.change(inputFile, { target: { files: [inputData.file] }})

        const handleSubmit = jest.fn(newBillPage.handleSubmit)
        const form = screen.getByTestId("form-new-bill")
        form.addEventListener("submit", handleSubmit)
        fireEvent.submit(form)
        expect(handleSubmit).toHaveBeenCalled()
    
        expect(screen.getByText("Mes notes de frais")).toBeTruthy()
      })
    })
  })
})
 
// test d'intégration POST
 
describe("Given I am a user connected as Employee", () => {
  describe("When I am on NewBill page", () => {
    describe("When I upload a file with correct format", () => {
      test("fetch data to mock API POST and then render Bills page after Submit", async () => { 
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee', email: "employee@tld.com"
        }))
      
        document.body.innerHTML = NewBillUI()
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = mockStore
        store.bills = jest.fn(mockStore.bills)
        store.bills().create = jest.fn(mockStore.bills().create)
        store.bills().update = jest.fn(mockStore.bills().update)
        
        const newBillPage = new NewBill({
          document, onNavigate, store, localStorage: window.localStorage
        })

        const handleChangeFile = jest.fn(newBillPage.handleChangeFile)            
        let inputFile = screen.getByTestId("file")
        let file = new File(['hello'], 'hello.png', {type: 'image/png'})
        inputFile.addEventListener('change', handleChangeFile)
        fireEvent.change(inputFile, {target: {
          files: [file]
        }})
        expect(handleChangeFile).toHaveBeenCalled()
        // The Post request is the "create" method of store.bills() executed in 'handleCHangeFile'
        expect(inputFile.files[0].name).toMatch(/(\.jpg|\.jpeg|\.png)$/i)
        expect(store.bills().create).toHaveBeenCalled()
        const newBill = await store.bills().create()
        expect(store.bills().create).toHaveLastReturnedWith(Promise.resolve({
          fileUrl: 'https://localhost:3456/images/test.jpg', key: '1234'
        }))

        const handleSubmit = jest.fn(newBillPage.handleSubmit)
        const form = screen.getByTestId("form-new-bill")
        form.addEventListener("submit", handleSubmit)
        fireEvent.submit(form)
        expect(handleSubmit).toHaveBeenCalled()
        expect(screen.getByText("Mes notes de frais")).toBeTruthy()
      })
    })

    describe("When an error occurs on API", () => {
     beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee', email: "employee@tld.com"
      }))
        document.body.innerHTML = NewBillUI()
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
      })
      test("fetches bills from an API and fails with 404 message error then render NewBill page after Submit", async () => {
        const newBillPage = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage
        })

        mockStore.bills().create.mockImplementationOnce((bill) => {
          return Promise.reject(new Error("Erreur 404"))
        })

        const handleChangeFile = jest.fn(newBillPage.handleChangeFile)            
        let inputFile = screen.getByTestId("file")
        let file = new File(['hello'], 'hello.png', {type: 'image/png'})
        inputFile.addEventListener('change', handleChangeFile)
        fireEvent.change(inputFile, {target: {
          files: [file]
        }})
        expect(handleChangeFile).toHaveBeenCalled()
        // The Post request is the "create" method of store.bills() executed in 'handleCHangeFile'
        expect(inputFile.files[0].name).toMatch(/(\.jpg|\.jpeg|\.png)$/i)

        const handleSubmit = jest.fn(newBillPage.handleSubmit)
        const form = screen.getByTestId("form-new-bill")
        form.addEventListener("submit", handleSubmit)
        fireEvent.submit(form)
        expect(handleSubmit).toHaveBeenCalled()

        expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
      })
      test("fetches bills from an API and fails with 500 message error then render NewBill page after Submit", async () => {
        const newBillPage = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage
        })

        mockStore.bills().create.mockImplementationOnce((bill) => {
          return Promise.reject(new Error("Erreur 500"))
        })

        const handleChangeFile = jest.fn(newBillPage.handleChangeFile)            
        let inputFile = screen.getByTestId("file")
        let file = new File(['hello'], 'hello.png', {type: 'image/png'})
        inputFile.addEventListener('change', handleChangeFile)
        fireEvent.change(inputFile, {target: {
          files: [file]
        }})
        expect(handleChangeFile).toHaveBeenCalled()
        // The Post request is the "create" method of store.bills() executed in 'handleCHangeFile'
        expect(inputFile.files[0].name).toMatch(/(\.jpg|\.jpeg|\.png)$/i)

        const handleSubmit = jest.fn(newBillPage.handleSubmit)
        const form = screen.getByTestId("form-new-bill")
        form.addEventListener("submit", handleSubmit)
        fireEvent.submit(form)
        expect(handleSubmit).toHaveBeenCalled()

        expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
      })
    })
  })
})