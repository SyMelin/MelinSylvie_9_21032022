import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

//const fileAllowedExtension = ['.jpg', '.jpeg', '.png']
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
    //CORRECTION [Bug Hunt] - Bills : Ajout de l'attribut "accept" pour suggérer les extensions de fichiers attendues lors de la sélection par l'utlisateur dans un dossier
    //Attention : il ne s'agit que d'une suggestion, cela ne bloque pas la saisie d'un autre type de fichier que ceux attendus
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
      //console.log("value", e.target.value)
      const filePath = e.target.value.split(/\\/g)
      //console.log('filePath', filePath)
      //console.log(filePath.length)
      const fileName = filePath[filePath.length-1]
      //console.log('fileName', fileName)
      //CORRECTION [Bug Hunt] - Bills: instruction pour bloquer la saisie par l'utilisateur d'autres types de fichier que ceux attendus
      //Si le nom du fichier saisi se termine par l'une des extensions autorisées, le fichier est accepté et le script se poursuit
      //Sinon, alors on empêche la poursuite du script et une alerte est renvoyée
      if (isFileAllowed(file.type) === true ) {
        //console.log("input.value", e.target.value)
        //console.log("input.files", e.target.files)
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