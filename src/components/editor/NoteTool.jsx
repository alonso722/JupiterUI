class NoteTool {
    constructor({ data, config, api }) {
        this.data = data;
        this.config = config;
        this.api = api;
        this.container = null;
        this.editable = false;
    }

    static get toolbox() {
        return {
            title: 'Nota',
            icon: '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M5 3h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zm7 16v-2h3v-2h-3V9h4V7h-6v6h2v2h-2v2h3zm-3-9V7h6v3h-6z"/></svg>'
        };
    }

    render() {
        this.container = document.createElement('div');
        this.container.classList.add('note-tool-container');

        const toggleNoteButton = document.createElement('button');
        toggleNoteButton.innerText = this.editable ? 'Guardar' : 'Mostrar Nota';
        toggleNoteButton.classList.add('toggle-note-button');

        toggleNoteButton.addEventListener('click', () => {
            if (this.editable) {
                this.data.content = this.container.querySelector('.note-content').innerText;

                this.editable = false;
            } else {
                this.editable = true;
            }
            toggleNoteButton.innerText = this.editable ? 'Guardar' : 'Mostrar Nota';
            this.render();
        });

        this.container.innerHTML = '';
        const noteContent = document.createElement('div');
        noteContent.classList.add('note-content');
        noteContent.innerHTML = this.editable ? (this.data.content || '') : (this.data.content ? this.data.content : '[* Escribe la nota aquí]'); 
        noteContent.contentEditable = this.editable; 

        this.container.appendChild(noteContent);
        this.container.appendChild(toggleNoteButton);

        return this.container;
    }

    save() {
        const content = this.container.querySelector('.note-content');
        return {
            content: content ? content.innerHTML : ''
        };
    }

    validate(savedData) {
        if (!savedData.content.trim()) {
            return false;
        }
        return true;
    }

    renderSettings() {
        return '';
    }

    static get isReadOnlySupported() {
        return true;
    }
}

export default NoteTool;
