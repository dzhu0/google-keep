import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import { getDatabase, ref, push, onValue, update, remove, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"

const appSettings = {
    // databaseURL: 
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const googleKeep = ref(database, "google-keep")

const form = document.getElementById("form")
const noteTitle = document.getElementById("note-title")
const noteText = document.getElementById("note-text")
const formButtons = document.getElementById("form-buttons")
const placeholder = document.getElementById("placeholder")
const notes = document.getElementById("notes")
const modal = document.getElementById("modal")
const modalTitle = document.getElementById("modal-title")
const modalText = document.getElementById("modal-text")
const colorTooltip = document.getElementById("color-tooltip")

let noteId = ""

let timeoutId = ""
let inToolbar = false
let inColorTooltip = false
let isColorTooltipOpen = false

onValue(googleKeep, snapshot => {
    if (snapshot.exists()) {
        clearNotes()
        placeholder.style.display = "none"
        Object.entries(snapshot.val()).forEach(displayNote)
    } else {
        placeholder.style.display = "block"
    }
})

document.addEventListener("click", e => {
    handleFormClick(e)

    switch (true) {
        case !!e.target.dataset.color:
            updateNoteColor(e)
            break
        case e.target.matches(".toolbar-color"):
            handleColorToolbarClick(e)
            break
        case e.target.matches(".toolbar-delete"):
            removeNote(e)
            break
        case e.target.matches("#modal-close-button"):
            closeModal()
            break
        case e.target.matches("#form-close-button"):
            closeForm()
            break
        case !!e.target.closest(".note"):
            openModal(e)
            break
    }
})

form.addEventListener("submit", e => {
    e.preventDefault()

    const title = noteTitle.value
    const text = noteText.value
    if (title || text) pushNote(title, text)
})

document.addEventListener("mouseover", e => {
    if (e.target.matches(".toolbar-color") && !isColorTooltipOpen) {
        inToolbar = true
        openTooltip(e)
    }
})

document.addEventListener("mouseout", e => {
    if (e.target.matches(".toolbar-color") && !isColorTooltipOpen) {
        inToolbar = false

        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            if (!inColorTooltip && !inToolbar) {
                closeTooltip(e)
            }
        }, 200)
    }
})

colorTooltip.addEventListener("mouseenter", () => {
    inColorTooltip = true
})

colorTooltip.addEventListener("mouseleave", () => {
    closeTooltip()
})

function handleFormClick(e) {
    const isFormClicked = form.contains(e.target)

    const title = noteTitle.value
    const text = noteText.value

    if (isFormClicked) {
        openForm()
    } else if (title || text) {
        pushNote(title, text)
    } else {
        closeForm()
    }
}

function clearNotes() {
    notes.innerHTML = ""
}

function displayNote(note) {
    const [id, { title, text, color }] = note
    notes.innerHTML += `
    <div class="note" style="background-color: ${color}" data-id="${id}">
        <div class="note-title">${title}</div>
        <div class="note-text">${text}</div>
        <div class="toolbar">
            <img
                class="toolbar-color"
                src="https://cdn.iconscout.com/icon/premium/png-512-thumb/palette-74796.png?f=avif&w=256"
            >
            <img
                class="toolbar-delete"
                src="https://cdn.iconscout.com/icon/free/png-512/delete-2902143-2411575.png?f=avif&w=256"
            >
        </div>
    </div>`
}

function pushNote(title, text) {
    const inputValue = { title, text, color: "#ffffff" }
    push(googleKeep, inputValue)
    closeForm()
}

async function getNote(id) {
    const snapshot = await get(ref(database, `google-keep/${id}`))
    if (snapshot.exists()) return snapshot.val()
}

function updateNote() {
    const title = modalTitle.value
    const text = modalText.value

    update(ref(database, `google-keep/${noteId}`), { title, text })
}

function updateNoteColor(e) {
    update(ref(database, `google-keep/${noteId}`), { color: e.target.dataset.color })
}

function removeNote(e) {
    selectNote(e)
    remove(ref(database, `google-keep/${noteId}`))
}

function selectNote(e) {
    const note = e.target.closest(".note")
    noteId = note.dataset.id
}

function openForm() {
    noteTitle.style.display = "block"
    formButtons.style.display = "block"
    noteText.style.height = "200px"
}

function closeForm() {
    noteTitle.style.display = "none"
    formButtons.style.display = "none"
    noteText.style.height = "38px"
    noteTitle.value = ""
    noteText.value = ""
}

async function openModal(e) {
    selectNote(e)

    const { title, text, color } = await getNote(noteId)

    modalTitle.value = title
    modalText.value = text
    modal.children[0].style.backgroundColor = color
    modal.classList.add("open-modal")
}

function closeModal() {
    updateNote()
    modal.classList.remove("open-modal")
}

function handleColorToolbarClick(e) {
    clearTimeout(timeoutId)

    if (isColorTooltipOpen) {
        closeTooltip()
    } else {
        isColorTooltipOpen = true
        openTooltip(e)
    }
}

function openTooltip(e) {
    selectNote(e)
    positionTooltip(e)
    colorTooltip.style.display = "flex"
}

function closeTooltip() {
    inColorTooltip = false
    isColorTooltipOpen = false
    colorTooltip.style.display = "none"
}

function positionTooltip(e) {
    const noteCoords = e.target.getBoundingClientRect()
    colorTooltip.style.left = `${noteCoords.left - 82}px`
    colorTooltip.style.top = `${noteCoords.bottom + 4}px`
}
