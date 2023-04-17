class App {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || []
        // improve these to a state object
        this.title = ""
        this.text = ""
        this.color = ""
        this.id = ""
        this.timeoutId = ""
        this.inTooltip = false
        this.isTooltipOpen = false
        this.inToolbarColor = false

        this.$notes = document.querySelector("#notes")
        this.$placeholder = document.querySelector("#placeholder")
        this.$form = document.querySelector("#form")
        this.$noteTitle = document.querySelector("#note-title")
        this.$noteText = document.querySelector("#note-text")
        this.$formButtons = document.querySelector("#form-buttons")
        this.$formCloseButton = document.querySelector("#form-close-button")
        this.$modal = document.querySelector(".modal")
        this.$modalTitle = document.querySelector(".modal-title")
        this.$modalText = document.querySelector(".modal-text")
        this.$modalCloseButton = document.querySelector(".modal-close-button")
        this.$colorTooltip = document.querySelector("#color-tooltip")

        this.render()
        this.addEventListeners()
    }

    addEventListeners() {
        document.addEventListener("click", event => {
            this.handleFormClick(event)
            if (event.target.matches(".toolbar-color")) {
                clearTimeout(this.timeoutId)
                this.handleTooltipClick(event)
            } else if (event.target.matches(".toolbar-delete")) {
                this.deleteNote(event)
            } else if (event.target.closest(".note")) {
                this.selectNote(event)
                this.openModal()
            }
        })

        this.$form.addEventListener("submit", event => {
            event.preventDefault()
            const title = this.$noteTitle.value
            const text = this.$noteText.value
            if (title || text) {
                this.addNote({ title, text })
            }
        })

        this.$formCloseButton.addEventListener("click", event => {
            event.stopPropagation()
            this.closeForm()
        })

        document.addEventListener("mouseover", event => {
            if (event.target.matches(".toolbar-color") && !this.isTooltipOpen) {
                this.inToolbarColor = true
                this.positionTooltip(event)
                this.openTooltip(event)
            }
        })

        document.addEventListener("mouseout", event => {
            if (event.target.matches(".toolbar-color") && !this.isTooltipOpen) {
                this.inToolbarColor = false
                clearTimeout(this.timeoutId)
                this.timeoutId = setTimeout(() => {
                    if (!this.inTooltip && !this.inToolbarColor) {
                        this.closeTooltip(event)
                    }
                }, 200);
            }
        })

        this.$colorTooltip.addEventListener("mouseenter", () => {
            this.inTooltip = true
        })

        this.$colorTooltip.addEventListener("mouseleave", () => {
            this.closeTooltip()
        })

        this.$colorTooltip.addEventListener("click", event => {
            const color = event.target.dataset.color
            if (color) {
                this.editNoteColor(color)
            }
        })

        this.$modalCloseButton.addEventListener("click", event => {
            this.closeModal(event)
        })
    }

    handleFormClick(event) {
        const isFormClicked = this.$form.contains(event.target)

        const title = this.$noteTitle.value
        const text = this.$noteText.value

        if (isFormClicked) {
            this.openForm()
        } else if (title || text) {
            this.addNote({ title, text })
        } else {
            this.closeForm()
        }
    }

    openForm() { // DONE
        this.$noteTitle.style.display = "block"
        this.$formButtons.style.display = "block"
        this.$noteText.style.height = "200px"
    }

    closeForm() { // DONE
        this.$noteTitle.style.display = "none"
        this.$formButtons.style.display = "none"
        this.$noteText.style.height = "38px"
        this.$noteTitle.value = ""
        this.$noteText.value = ""
    }

    openModal() { // DONE
        this.$modal.classList.toggle("open-modal")
        this.$modalTitle.value = this.title
        this.$modalText.value = this.text
    }

    closeModal() { // DONE
        this.editNote()
        this.$modal.classList.toggle("open-modal")
    }

    handleTooltipClick(event) { // DONE
        this.positionTooltip(event)
        if (this.isTooltipOpen) {
            this.closeTooltip()
        } else {
            this.isTooltipOpen = true
            this.openTooltip(event)
        }
    }

    openTooltip(event) { // DONE
        this.id = event.target.dataset.id
        this.$colorTooltip.style.display = "flex"
    }

    positionTooltip(event) { // DONE
        const noteCoords = event.target.getBoundingClientRect()
        this.$colorTooltip.style.left = `${noteCoords.left - 82}px`
        this.$colorTooltip.style.top = `${noteCoords.bottom + 4}px`
    }

    closeTooltip() { // DONE
        this.inTooltip = false
        this.isTooltipOpen = false
        this.$colorTooltip.style.display = "none"
    }

    addNote({ title, text }) { // DONE
        const newNote = {
            title,
            text,
            color: "white",
            id: this.createId()
        }
        this.notes = [newNote, ...this.notes]
        this.render()
        this.closeForm()
    }

    createId() { // DONE
        const highestId = this.notes.reduce((high, { id }) => high > id ? high : id, 0)
        return String(Number(highestId) + 1)
    }

    editNote() { // DONE
        const newNote = {
            title: this.$modalTitle.value,
            text: this.$modalText.value,
            color: this.color,
            id: this.id
        }
        const otherNotes = this.notes.filter(note => note.id !== this.id)
        console.log(otherNotes)
        this.notes = [newNote, ...otherNotes]
        this.render()
    }

    editNoteColor(color) { // DONE
        this.notes = this.notes.map(note =>
            note.id === this.id ? { ...note, color } : note
        )
        this.render()
    }

    selectNote(event) {
        const $selectedNote = event.target.closest(".note")
        const [$noteTitle, $noteText] = $selectedNote.children
        this.title = $noteTitle.innerText
        this.text = $noteText.innerText
        this.color = $selectedNote.style.backgroundColor
        this.id = $selectedNote.dataset.id
    }

    deleteNote(event) { // DONE
        const id = event.target.dataset.id
        this.notes = this.notes.filter(note => note.id !== id)
        this.render()
    }

    render() { // DONE
        this.saveNotes()
        this.displayNotes()
    }

    saveNotes() { // DONE
        localStorage.setItem("notes", JSON.stringify(this.notes))
    }

    displayNotes() { // DONE
        this.$placeholder.style.display = this.notes.length ? "none" : "block"

        this.$notes.innerHTML = this.notes.map(({ title, text, color, id }) => `
<div class="note" style="background-color: ${color};" data-id="${id}">
	<div class="note-title">${title}</div>
	<div class="note-text">${text}</div>
	<div class="toolbar">
		<img
			class="toolbar-color"
			src="https://cdn.iconscout.com/icon/premium/png-512-thumb/palette-74796.png?f=avif&w=256"
			data-id=${id}
		>
		<img
			class="toolbar-delete"
			src="https://cdn.iconscout.com/icon/free/png-512/delete-2902143-2411575.png?f=avif&w=256"
			data-id=${id}
		>
	</div>
</div>`
        ).join("")
    }
}

new App()
