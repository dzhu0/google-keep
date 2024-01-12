// Import Firebase modules using CDN links
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import { getDatabase, ref, push, onValue, update, remove, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"

// Firebase configuration object with database URL
const appSettings = {
    // Uncomment the following line and add your FIREBASE URL
    databaseURL: "https://playground-e3130-default-rtdb.firebaseio.com/"
}

// Initialize Firebase app
const app = initializeApp(appSettings)
// Get reference to the Firebase database
const database = getDatabase(app)
// Reference to the "google-keep" node in the database
const googleKeep = ref(database, "google-keep")

// DOM elements
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

// Variables to track note and tooltip state
let noteId = ""
let timeoutId = ""
let inToolbar = false
let inColorTooltip = false
let isColorTooltipOpen = false

// Event listener for changes in the "google-keep" node
onValue(googleKeep, snapshot => {
    clearNotes()

    if (snapshot.exists()) {
        placeholder.style.display = "none"
        // Display each note from the database
        Object.entries(snapshot.val()).forEach(displayNote)
    } else {
        placeholder.style.display = "block"
    }
})

// General click event listener for various actions
document.addEventListener("click", e => {
    handleFormClick(e)

    switch (true) {
        // Update note color on color selection
        case !!e.target.dataset.color:
            updateNoteColor(e)
            break
        // Handle toolbar color click
        case e.target.matches(".toolbar-color"):
            handleColorToolbarClick(e)
            break
        // Remove note on delete icon click
        case e.target.matches(".toolbar-delete"):
            removeNote(e)
            break
        // Close modal on modal close button click
        case e.target.matches("#modal-close-button"):
            closeModal()
            break
        // Close form on form close button click
        case e.target.matches("#form-close-button"):
            closeForm()
            break
        // Open modal on note click
        case !!e.target.closest(".note"):
            openModal(e)
            break
    }
})

// Form submission event listener
form.addEventListener("submit", e => {
    e.preventDefault()

    const title = noteTitle.value
    const text = noteText.value
    // Push a new note to the database on form submission
    if (title || text) pushNote(title, text)
})

// Mouseover event listener for color tooltip
document.addEventListener("mouseover", e => {
    if (e.target.matches(".toolbar-color") && !isColorTooltipOpen) {
        inToolbar = true
        openTooltip(e)
    }
})

// Mouseout event listener for color tooltip
document.addEventListener("mouseout", e => {
    if (e.target.matches(".toolbar-color") && !isColorTooltipOpen) {
        inToolbar = false

        // Set timeout to close tooltip if mouse is not over toolbar or tooltip
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            if (!inColorTooltip && !inToolbar) {
                closeTooltip(e)
            }
        }, 200)
    }
})

// Mouseenter event listener for color tooltip
colorTooltip.addEventListener("mouseenter", () => {
    inColorTooltip = true
})

// Mouseleave event listener for color tooltip
colorTooltip.addEventListener("mouseleave", () => {
    closeTooltip()
})

// Function to handle various form-related actions
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

// Function to clear notes from the UI
function clearNotes() {
    notes.innerHTML = ""
}

// Function to display a note in the UI
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

// Function to push a new note to the database
function pushNote(title, text) {
    const inputValue = { title, text, color: "#ffffff" }
    push(googleKeep, inputValue)
    closeForm()
}

// Function to retrieve a note from the database
async function getNote(id) {
    const snapshot = await get(ref(database, `google-keep/${id}`))
    if (snapshot.exists()) return snapshot.val()
}

// Function to update an existing note
function updateNote() {
    const title = modalTitle.value
    const text = modalText.value

    update(ref(database, `google-keep/${noteId}`), { title, text })
}

// Function to update the color of an existing note
function updateNoteColor(e) {
    update(ref(database, `google-keep/${noteId}`), { color: e.target.dataset.color })
}

// Function to remove a note from the database
function removeNote(e) {
    selectNote(e)
    remove(ref(database, `google-keep/${noteId}`))
}

// Function to set the currently selected note
function selectNote(e) {
    const note = e.target.closest(".note")
    noteId = note.dataset.id
}

// Function to open the note editing form
function openForm() {
    noteTitle.style.display = "block"
    formButtons.style.display = "block"
    noteText.style.height = "200px"
}

// Function to close the note editing form
function closeForm() {
    noteTitle.style.display = "none"
    formButtons.style.display = "none"
    noteText.style.height = "38px"
    noteTitle.value = ""
    noteText.value = ""
}

// Function to open the note editing modal
async function openModal(e) {
    selectNote(e)

    const { title, text, color } = await getNote(noteId)

    modalTitle.value = title
    modalText.value = text
    modal.children[0].style.backgroundColor = color
    modal.classList.add("open-modal")
}

// Function to close the note editing modal
function closeModal() {
    updateNote()
    modal.classList.remove("open-modal")
}

// Function to handle color toolbar click events
function handleColorToolbarClick(e) {
    clearTimeout(timeoutId)

    if (isColorTooltipOpen) {
        closeTooltip()
    } else {
        isColorTooltipOpen = true
        openTooltip(e)
    }
}

// Function to open the color tooltip
function openTooltip(e) {
    selectNote(e)
    positionTooltip(e)
    colorTooltip.style.display = "flex"
}

// Function to close the color tooltip
function closeTooltip() {
    inColorTooltip = false
    isColorTooltipOpen = false
    colorTooltip.style.display = "none"
}

// Function to position the color tooltip relative to the selected note
function positionTooltip(e) {
    const noteCoords = e.target.getBoundingClientRect()
    colorTooltip.style.left = `${noteCoords.left - 82}px`
    colorTooltip.style.top = `${noteCoords.bottom + 4}px`
}
