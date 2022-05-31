/**
 * @jest-environment jsdom
 */

/*
import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
    })
  })
})
*/

import { fireEvent, getByTestId, screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js" //
import { bills } from "../fixtures/bills.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import store from "../app/Store.js"
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
  })

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

        //const formData = new FormData()
        //formData.append = jest.fn()
       //const append = jest.spyOn(formData, 'append')
        //jest.spyOn(formData,'append').mockImplementation(() => {})
        // const formData = { append: jest.fn()}

        const handleChangeFile = jest.fn(newBillPage.handleChangeFile)
        // jest.spyOn(mockStore,'bills').mockImplementation(() => {})
        //const mockStoreBills = jest.fn(mockStore.bills())

        await waitFor (() => screen.getByTestId("file"))
        let inputFile = screen.getByTestId("file")
        inputFile.addEventListener('change', handleChangeFile)
        let file = new File(['hello'], 'hello.png', {type: 'image/png'})
        expect(file.name).toBe("hello.png")
        //userEvent.upload(inputFile, file)
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

        const user = await JSON.parse(window.localStorage.getItem("user"))
        expect(user.email).toBe('johndoe@email.com')
        
        expect(store.bills).toHaveBeenCalledTimes(2)
        
      })
    })

      describe("When I do not upload a justificative file in correct format", () => {
        test("Then the file should be refused", async () => {
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
            document, onNavigate, store: mockStore, localStorage: window.localStorage
          })

          jest.spyOn(window,'alert').mockImplementation(() => {})
          window.localStorage.getItem = jest.fn(window.localStorage.getItem)

          const handleChangeFile = jest.fn(newBillPage.handleChangeFile)
          await waitFor (() => screen.getByTestId("file"))
          let inputFile = screen.getByTestId("file")
          inputFile.addEventListener('change', handleChangeFile)
          let file = new File(['hello'], 'hello.gif', {type: 'image/gif'})
          expect(file.name).toBe("hello.gif")
          //userEvent.upload(inputFile, file)
          fireEvent.change(inputFile, {target: {
            files: [file]
          }})

          expect(handleChangeFile).toHaveBeenCalled()
          expect(window.alert).toHaveBeenCalledWith('Le fichier JUSTIFICATIF doit être de type : .jpg , .jpeg , ou .png')
          expect(inputFile.files).toBe(null)
        })
      })
    })

    describe("When I am on NewBill page", () => {
      describe("When I do not fill fields and I click on submit button Send", () => {
        test ("Then It should render NewBill page", async () => {
          document.body.innerHTML =  NewBillUI()

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

          const form = screen.getByTestId("form-new-bill")
          const handleSubmit = jest.fn((e) => e.preventDefault())

          form.addEventListener("submit", handleSubmit)
          fireEvent.submit(form)
          // expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
          expect(screen.getByTestId("form-new-bill")).toBeTruthy()
        })
      })
  
      describe("When I do fill all fields in correct format and I click on submit button Send", () => {
        test("Then the new bill should be registered and it should renders Bills page updated", async () => {
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
          store.bills().create = jest.fn(mockStore.bills().create)
          store.bills().update = jest.fn(mockStore.bills().update)
          const newBillPage = new NewBill({
            document, onNavigate, store: store, localStorage: window.localStorage
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
          expect(handleChangeFile).toHaveBeenCalled()
          expect(store.bills().create).toHaveBeenCalled()
          await store.bills().create()
          expect(store.bills().create).toHaveLastReturnedWith(Promise.resolve({
            fileUrl: 'https://localhost:3456/images/test.jpg', key: '1234'
          }))

       //   const bli = await store.bills().list()
       //  expect (bli.length).toBe(5)
        //  const billsList = await mockStore.bills().list()
        //  expect(billsList.length).toBe()
         

         // expect(inputFile.files[0].name).toStrictEqual("C:\\fakepath\\new.jpg")
         // const filePath = inputFile.files[0].name.split(/\\/g)
         // const fileName = filePath[filePath.length-1]
         // expect(fileName).toBe('new.jpg')
          const user = await JSON.parse(window.localStorage.getItem("user"))

          const handleSubmit = jest.fn(newBillPage.handleSubmit)
          newBillPage.updateBill = jest.fn(newBillPage.updateBill)
          newBillPage.onNavigate = jest.fn(newBillPage.onNavigate)   
         
          const form = screen.getByTestId("form-new-bill")
          form.addEventListener("submit", handleSubmit)
          fireEvent.submit(form)
          expect(handleSubmit).toHaveBeenCalled()
          expect(user.email).toBe('johndoe@email.com')
      //    expect(store.bills).toHaveBeenCalledTimes(4)
          
          expect(newBillPage.updateBill).toHaveBeenCalledWith(
            {
              email: user.email,
              type: inputData.expenseType,
              name: inputData.expenseName,
              amount: parseInt(inputData.amount),
              date: inputData.datepicker,
              vat: inputData.vat,
              pct: parseInt(inputData.pct),
              commentary: inputData.commentary,
              fileUrl: 'https://localhost:3456/images/test.jpg',
              fileName: '',
              status: "pending"
            })
          await store.bills().update
          expect(store.bills().update).toHaveLastReturnedWith(Promise.resolve({
            "id": "47qAXb6fIm2zOKkLzMro",
            "vat": "80",
            "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
            "status": "pending",
            "type": "Hôtel et logement",
            "commentary": "séminaire billed",
            "name": "encore",
            "fileName": "preview-facture-free-201801-pdf-1.jpg",
            "date": "2004-04-04",
            "amount": 400,
            "commentAdmin": "ok",
            "email": "a@a",
            "pct": 20
          }))
          store.bills()
          //const billsList = await mockStore.bills().list()
          //expect (billsList).toBe()
      //    const eyes = screen.getAllByTestId('icon-eye')
       //   expect(eyes).toBeTruthy
         expect(newBillPage.onNavigate).toHaveBeenCalled()
    
          expect(screen.getByText("Mes notes de frais")).toBeTruthy()
          expect(screen.getByTestId("tbody")).toBeTruthy()
          const lines = document.getElementsByTagName('tr')
          expect(lines).toBeTruthy()
          expect(lines.length).toEqual(1)
        //  expect(screen.getByText("encore")).toBeTruthy()
        })
      })
    })
  })
 
// test d'intégration POST
 
describe("Given I am a user connected as Employee", () => {
  describe("When I am on NewBill page", () => {
    describe("When I submit the form completed with correct data", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "e@e"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
    
      test("fetch data to mock API POST", async () => { 

      //  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      //  window.localStorage.setItem('user', JSON.stringify({
      //  type: 'Employee'
      //  }))
        document.body.innerHTML = NewBillUI()
      //  const onNavigate = (pathname) => {
      //   document.body.innerHTML = ROUTES({ pathname })
      // }

        
      let store = mockStore
      // store.bills = jest.fn(mockStore.bills)

      // mockStore.bills = jest.fn(mockStore.bills)
        const newBillPage = new NewBill({
          document, onNavigate, store: mockStore, localStorage: window.localStorage
        })

    //   test("fetches bills from an API and fails with 404 message error", async () => {
    //  mockStore.bills = jest.fn(mockStore.bills)
    
            store.bills.mockImplementationOnce(() => {
              return {
                create : (bill) => {
                  return Promise.reject(new Error("Erreur 404"))
                }
              }
            })
            


            const handleChangeFile = jest.fn(newBillPage.handleChangeFile)            
            let inputFile = screen.getByTestId("file")
            let file = new File(['hello'], 'hello.png', {type: 'image/png'})
            inputFile.addEventListener('change', handleChangeFile)
            fireEvent.change(inputFile, {target: {
              files: [file]
            }})

            expect(handleChangeFile).toHaveBeenCalled()
            expect(inputFile.files[0].name).toMatch(/(\.jpg|\.jpeg|\.png)$/i)
            expect (localStorageMock.getItem("user.email")).toBe()
            
            const form = screen.getByTestId("form-new-bill")
            const handleSubmit = jest.fn(newBillPage.handleSubmit)
            form.addEventListener("submit", handleSubmit)
            fireEvent.submit(form)

            expect(handleSubmit).toHaveBeenCalled()
          /// expect(window.onNavigate()).not.toHaveBeenCalled()
            
          
            //await new Promise(process.nextTick);
          // await Promise.reject()
          // const message = await screen.getByText(/Envoyer une note de frais/)
          // expect(message).toBeTruthy()
          
            //await expect(store.bills).rejects.toEqual({ error: "Erreur 404"})
          // await new Promise(process.nextTick);
          // window.onNavigate(ROUTES_PATH.Bills)
            const message = await screen.getByText("Envoyer une note de frais")
          expect(message).toBeTruthy()

          })
       //})
    })
  })
})






describe('When I post a NewBill', () => {
  test('Then posting the NewBill from mock API POST', async () => {
    // ----- Observation de la méthode bills du mockStore ----- //
    const createSpyBills = jest.spyOn(mockStore, 'bills')
    jest.spyOn(mockStore, 'bills')

    // ----- On récupère la liste des bills présentent dans le mockStore ----- //
    const billsList = await mockStore.bills().list()
    // Il y a bien 4 bills, par défault, dans le mockStore?
    expect(billsList.length).toBe(4)
    // ----- Envoie une nouvelle bill dans le mockStore ----- //
    let bill = {
      email: 'employee@tld.com',
      type: 'Hôtel et logement',
      name: 'mocked bill des enfers',
      amount: '400',
      date: '2004-04-04',
      vat: '80',
      pct: '20',
      commentary: 'mocked bill for POST test',
      fileUrl: 'https://localhost:3456/images/test.jpg',
      fileName: 'test.jpg',
      status: 'pending',
    }

    await mockStore
      .bills()
      .update({ data: JSON.stringify(bill), selector: '1234' })
    mockStore.bills().create(bill)

    // Le nombre de bills dans le store a t'il été incrémenté suite à notre update?
    waitFor(() => expect(billsList.length).toBe(5))
  })})