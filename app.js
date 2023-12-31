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

let googleKeep = JSON.parse(localStorage.getItem('notes')) || []

let selectedNote = {
    title: "",
    text: "",
    color: "",
    id: ""
}

let timeoutId = ""
let inTooltip = false
let isTooltipOpen = false
let inToolbarColor = false

render()

document.addEventListener("click", e => {
    handleFormClick(e)

    switch (true) {
        case !!e.target.dataset.color:
            editNoteColor(e)
            break
        case e.target.matches(".toolbar-color"):
            handleTooltipClick(e)
            break
        case e.target.matches(".toolbar-delete"):
            deleteNote(e)
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
    if (title || text) addNote({ title, text })
})

document.addEventListener("mouseover", e => {
    if (e.target.matches(".toolbar-color") && !isTooltipOpen) {
        inToolbarColor = true
        openTooltip(e)
    }
})

document.addEventListener("mouseout", e => {
    if (e.target.matches(".toolbar-color") && !isTooltipOpen) {
        inToolbarColor = false

        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            if (!inTooltip && !inToolbarColor) {
                closeTooltip(e)
            }
        }, 200);
    }
})

colorTooltip.addEventListener("mouseenter", () => {
    inTooltip = true
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
        addNote({ title, text })
    } else {
        closeForm()
    }
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

function addNote(formInput) {
    const newNote = {
        ...formInput,
        color: "white",
        id: createId()
    }
    googleKeep.unshift(newNote)

    closeForm()
    render()
}

function createId() {
    const highestId = googleKeep.reduce((high, { id }) => high > id ? high : id, 0)
    return String(Number(highestId) + 1)
}

function openModal(e) {
    selectNote(e)

    modalTitle.value = selectedNote.title
    modalText.value = selectedNote.text

    modal.children[0].style.backgroundColor = selectedNote.color

    modal.classList.add("open-modal")
}

function closeModal() {
    editNote()

    modal.classList.remove("open-modal")
}

function selectNote(e) {
    const note = e.target.closest(".note")
    selectedNote = googleKeep.find(({ id }) => id === note.dataset.id)
}

function editNote() {
    const title = modalTitle.value
    const text = modalText.value

    if (title === selectedNote.title && text === selectedNote.text) return

    selectedNote.title = modalTitle.value
    selectedNote.text = modalText.value

    googleKeep = googleKeep.filter(note => note !== selectedNote)
    googleKeep.unshift(selectedNote)

    render()
}

function deleteNote(e) {
    selectNote(e)
    googleKeep = googleKeep.filter(note => note !== selectedNote)

    render()
}

function handleTooltipClick(e) {
    clearTimeout(timeoutId)

    if (isTooltipOpen) {
        closeTooltip()
    } else {
        isTooltipOpen = true
        openTooltip(e)
    }
}

function openTooltip(e) {
    selectNote(e)
    positionTooltip(e)
    colorTooltip.style.display = "flex"
}

function closeTooltip() {
    inTooltip = false
    isTooltipOpen = false
    colorTooltip.style.display = "none"
}

function positionTooltip(e) {
    const noteCoords = e.target.getBoundingClientRect()
    colorTooltip.style.left = `${noteCoords.left - 82}px`
    colorTooltip.style.top = `${noteCoords.bottom + 4}px`
}

function editNoteColor(e) {
    selectedNote.color = e.target.dataset.color
    render()
}

function render() {
    saveNotes()
    displayNotes()
}

function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(googleKeep))
}

function displayNotes() {
    placeholder.style.display = googleKeep.length ? "none" : "block"

    notes.innerHTML = googleKeep.map(({ title, text, color, id }) => `
<div class="note" style="background-color: ${color};" data-id="${id}">
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
    ).join("")
}
