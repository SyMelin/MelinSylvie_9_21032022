/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js" //
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression:
       //l'icône des notes de frais doit être mise en valeur (via le css)
       expect(windowIcon.classList).toContain('active-icon')
       //

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
       //antiChrono classe les éléments par ordre décroissant
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

//Ajout de tests

  describe("When I am on Bills Page but it is loading", () => {
    test("Then, Loading page should be rendered", () => {
      document.body.innerHTML = BillsUI( { loading:  true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe("When I am on Bills Page but back-end send an error message", () => {
    test("The, , Error page shoud be rendered", () => {
      document.body.innerHTML = BillsUI (  {error: 'some error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  //test unitaire sur handleClickNewBill
  describe("When I am on Bills Page, and I click on New Bill button", () => {
    test("Then It should renders NewBill page", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const billsPage = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })

      const handleClickNewBill = jest.fn(billsPage.handleClickNewBill)
      const buttonNewBill = screen.getByTestId('btn-new-bill')
      buttonNewBill.addEventListener('click', handleClickNewBill)
      userEvent.click(buttonNewBill)
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })
  })

  //test unitaire sur handleClickIconEye
  describe("When I am on Bills Page, and I click on any icon eye", () => {
    test('A modal should open', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const billsPage = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })

      const handleClickIconEye = jest.fn(billsPage.handleClickIconEye)
      const eyes = screen.getAllByTestId('icon-eye')
      eyes.forEach(eye => {
        eye.addEventListener('click', handleClickIconEye(eye))
        userEvent.click(eye)
        expect(handleClickIconEye).toHaveBeenCalled()
      })
      
      const modale = screen.getByTestId('modaleFile')
      expect(modale).toBeTruthy()
    })
  })
})

//test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e" }))
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Type"))
      const contentPending  = await waitFor(() => screen.getByText("100 €")) 
      expect(contentPending).toBeTruthy()
     /**
      * 
      */
    })
  })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, 'bills')
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee"=',
        email: 'e@e'
      }))
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})