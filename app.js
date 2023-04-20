class App {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || []

        this.note = {
            title: "",
            text: "",
            color: "",
            id: ""
        }

        this.timeoutId = ""
        this.inTooltip = false
        this.isTooltipOpen = false
        this.inToolbarColor = false

        this.$form = document.querySelector("#form")
        this.$noteTitle = document.querySelector("#note-title")
        this.$noteText = document.querySelector("#note-text")
        this.$formButtons = document.querySelector("#form-buttons")
        this.$placeholder = document.querySelector("#placeholder")
        this.$notes = document.querySelector("#notes")
        this.$modal = document.querySelector("#modal")
        this.$modalTitle = document.querySelector("#modal-title")
        this.$modalText = document.querySelector("#modal-text")
        this.$colorTooltip = document.querySelector("#color-tooltip")

        this.addEventListeners()
        this.render()
    }

    addEventListeners() {
        document.addEventListener("click", event => {
            this.handleFormClick(event)

            if (event.target.dataset.color) {
                this.editNoteColor(event)
            } else if (event.target.matches(".toolbar-color")) {
                this.handleTooltipClick(event)
            } else if (event.target.matches(".toolbar-delete")) {
                this.deleteNote(event)
            } else if (event.target.matches("#modal-close-button")) {
                this.closeModal()
            } else if (event.target.matches("#form-close-button")) {
                this.closeForm()
            } else if (event.target.closest(".note")) {
                this.openModal(event)
            }
        })

        this.$form.addEventListener("submit", event => {
            event.preventDefault()

            const title = this.$noteTitle.value
            const text = this.$noteText.value
            if (title || text) this.addNote({ title, text })
        })

        document.addEventListener("mouseover", event => {
            if (event.target.matches(".toolbar-color") && !this.isTooltipOpen) {
                this.inToolbarColor = true
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

    openForm() {
        this.$noteTitle.style.display = "block"
        this.$formButtons.style.display = "block"
        this.$noteText.style.height = "200px"
    }

    closeForm() {
        this.$noteTitle.style.display = "none"
        this.$formButtons.style.display = "none"
        this.$noteText.style.height = "38px"

        this.$noteTitle.value = ""
        this.$noteText.value = ""
    }
    
    addNote(formInput) {
        const newNote = {
            ...formInput,
            color: "white",
            id: this.createId()
        }
        this.notes.unshift(newNote)

        this.closeForm()
        this.render()
    }

    createId() {
        const highestId = this.notes.reduce((high, { id }) => high > id ? high : id, 0)
        return String(Number(highestId) + 1)
    }

    openModal(event) {
        this.selectNote(event)

        this.$modalTitle.value = this.note.title
        this.$modalText.value = this.note.text

        this.$modal.children[0].style.backgroundColor = this.note.color

        this.$modal.classList.add("open-modal")
    }

    closeModal() {
        this.editNote()

        this.$modal.classList.remove("open-modal")
    }

    selectNote(event) {
        const $selectedNote = event.target.closest(".note")
        this.note = this.notes.find(({ id }) => id === $selectedNote.dataset.id)
    }

    editNote() {
        const title = this.$modalTitle.value
        const text = this.$modalText.value

        if (title === this.note.title && text === this.note.text) return
        
        this.note.title = this.$modalTitle.value
        this.note.text = this.$modalText.value

        this.notes = this.notes.filter(note => note !== this.note)
        this.notes.unshift(this.note)

        this.render()
    }

    deleteNote(event) {
        this.selectNote(event)
        this.notes = this.notes.filter(note => note !== this.note)

        this.render()
    }

    handleTooltipClick(event) {
        clearTimeout(this.timeoutId)

        if (this.isTooltipOpen) {
            this.closeTooltip()
        } else {
            this.isTooltipOpen = true
            this.openTooltip(event)
        }
    }

    openTooltip(event) {
        this.selectNote(event)
        this.positionTooltip(event)
        this.$colorTooltip.style.display = "flex"
    }

    closeTooltip() {
        this.inTooltip = false
        this.isTooltipOpen = false
        this.$colorTooltip.style.display = "none"
    }

    positionTooltip(event) {
        const noteCoords = event.target.getBoundingClientRect()
        this.$colorTooltip.style.left = `${noteCoords.left - 82}px`
        this.$colorTooltip.style.top = `${noteCoords.bottom + 4}px`
    }

    editNoteColor(event) {
        this.note.color = event.target.dataset.color
        this.render()
    }

    render() {
        this.saveNotes()
        this.displayNotes()
    }

    saveNotes() {
        localStorage.setItem("notes", JSON.stringify(this.notes))
    }

    displayNotes() {
        this.$placeholder.style.display = this.notes.length ? "none" : "block"

        this.$notes.innerHTML = this.notes.map(({ title, text, color, id }) => `
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
}

new App()
