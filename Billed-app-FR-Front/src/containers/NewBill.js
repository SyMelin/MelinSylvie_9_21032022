import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

const fileAllowedExtension = ['jpg', 'jpeg', 'png']

const isFileAllowed = (string) => {
  return fileAllowedExtension.map(ext => string.endsWith(ext)).includes(true)
}

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    //CORRECTION [Bug Hunt] - Bills : Addition of "accept" attribute to suggest expected file extensions when the user selects a file from a folder
    //Warning : that is only a suggestion, it will not block the input of a file with other extension than those expected
    file.setAttribute('accept', '.jpg,.jpeg,.png')
    //
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault()
    if (e.target.files !== null) {
      const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
      const filePath = e.target.value.split(/\\/g)
      const fileName = filePath[filePath.length-1]
      //CORRECTION [Bug Hunt] - Bills: instruction to block input by the user of a file with a type different from those expected
      //If the name of theinput file ends by of the authorized extensions, the file will be accepted and the instruction reading continues 
      //Else, the instruction reading is stopped and an alert is thrown
      if (isFileAllowed(file.type) === true ) {
        const formData = new FormData()
        const email = JSON.parse(localStorage.getItem("user")).email
        formData.append('file', file)
        formData.append('email', email)

        this.store
          .bills()
          .create({
            data: formData,
            headers: {
              noContentType: true
            }
          })
          .then(({fileUrl, key}) => {
            console.log(fileUrl)
            this.billId = key
            this.fileUrl = fileUrl
            this.fileName = fileName
          }).catch(error => console.error(error))
      } else {
        window.alert('Le fichier JUSTIFICATIF doit être de type : .jpg , .jpeg , ou .png')
        e.target.value = null
        e.target.files = null
        console.log("input.value", e.target.value)
        console.log("input.files", e.target.files)
      }
    }  
  }

  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}