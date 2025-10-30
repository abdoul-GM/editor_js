
// Variable globale pour l'éditeur
let editor = null;

// Plugin Image personnalisé pour Editor.js
class SimpleImage {
    static get toolbox() {
        return {
            title: "Image",
            icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>',
        };
    }

    static get isReadOnlySupported() {
        return true;
    }

    constructor({ data, api, readOnly }) {
        this.api = api;
        this.readOnly = readOnly;
        this.data = {
            url: data.url || "",
            caption: data.caption || "",
            withBorder: data.withBorder !== undefined ? data.withBorder : false,
            withBackground:
                data.withBackground !== undefined ? data.withBackground : false,
            stretched: data.stretched !== undefined ? data.stretched : false,
            width: data.width || 100, // Largeur en pourcentage (par défaut 100%)
            alignment: data.alignment || "center", // Alignement par défaut: centre
        };

        this.wrapper = null;
        this.settings = [
            {
                name: "withBorder",
                icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15.8 10.592v2.043h2.35v2.138H15.8v2.232h-2.25v-2.232h-2.4v-2.138h2.4v-2.28h2.25v.237h1.15-1.15zM1.9 8.455v-3.42c0-1.154.985-2.09 2.2-2.09h4.2v2.137H4.15v3.373H1.9zm0 2.137h2.25v3.325H8.3v2.138H4.1c-1.215 0-2.2-.936-2.2-2.09v-3.373zm15.05-2.137H14.7V5.082h-4.15V2.945h4.2c1.215 0 2.2.936 2.2 2.09v3.42z"/></svg>',
            },
            {
                name: "stretched",
                icon: '<svg width="17" height="10" viewBox="0 0 17 10" xmlns="http://www.w3.org/2000/svg"><path d="M13.568 5.925H4.056l1.703 1.703a1.125 1.125 0 0 1-1.59 1.591L.962 6.014A1.125 1.125 0 0 1 .962 4.424L4.169.962a1.125 1.125 0 0 1 1.59 1.59L4.056 4.255h9.512l-1.703-1.703a1.125 1.125 0 0 1 1.59-1.59l3.207 3.206a1.125 1.125 0 0 1 0 1.591l-3.207 3.206a1.125 1.125 0 0 1-1.59-1.59L13.568 5.925z"/></svg>',
            },
            {
                name: "withBackground",
                icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.043 8.265l3.183-3.183h-2.924L4.75 10.636v2.923l4.15-4.15v2.351l-2.158 2.159H8.9v2.137H4.7c-1.215 0-2.2-.936-2.2-2.09v-8.93c0-1.154.985-2.09 2.2-2.09h10.663l.033-.033.034.034c1.178.04 2.12.96 2.12 2.089v3.23H15.3V5.359l-2.906 2.906h-2.35zM7.951 5.082H4.75v3.201l3.201-3.2zm5.099 7.078v3.04h4.15v-3.04h-4.15zm-1.1-2.137h6.35c.635 0 1.15.489 1.15 1.092v5.13c0 .603-.515 1.092-1.15 1.092h-6.35c-.635 0-1.15-.489-1.15-1.092v-5.13c0-.603.515-1.092 1.15-1.092z"/></svg>',
            },
        ];
    }

    render() {
        this.wrapper = document.createElement("div");
        this.wrapper.classList.add("simple-image");

        if (this.data.url) {
            this._createImage(this.data.url);
        } else {
            this._createUploader();
        }

        return this.wrapper;
    }

    _createImage(url) {
        this.wrapper.innerHTML = "";

        // Conteneur principal avec alignement
        const imageContainer = document.createElement("div");
        imageContainer.style.textAlign = this.data.alignment;
        imageContainer.style.width = "100%";

        const imageHolder = document.createElement("div");
        imageHolder.classList.add("simple-image__picture");
        imageHolder.style.display = "inline-block";
        imageHolder.style.width = this.data.stretched
            ? "100%"
            : this.data.width + "%";

        const image = document.createElement("img");
        image.src = url;
        image.alt = this.data.caption || "Image";
        image.style.width = "100%";
        image.style.height = "auto";

        if (this.data.withBorder) {
            image.style.border = "2px solid #ddd";
        }

        if (this.data.withBackground) {
            imageHolder.style.background = "#f9f9f9";
            imageHolder.style.padding = "20px";
        }

        imageHolder.appendChild(image);
        imageContainer.appendChild(imageHolder);
        this.wrapper.appendChild(imageContainer);

        if (!this.readOnly) {
            // Contrôles de taille
            const sizeControls = document.createElement("div");
            sizeControls.style.cssText = `
              margin-top: 10px;
              padding: 10px;
              background: #f5f5f5;
              border-radius: 6px;
              display: flex;
              align-items: center;
              gap: 10px;
            `;

            const sizeLabel = document.createElement("label");
            sizeLabel.textContent = "Taille:";
            sizeLabel.style.cssText =
                "font-size: 12px; color: #666; min-width: 45px;";

            const sizeSlider = document.createElement("input");
            sizeSlider.type = "range";
            sizeSlider.min = "20";
            sizeSlider.max = "100";
            sizeSlider.value = this.data.width;
            sizeSlider.style.cssText = "flex: 1;";

            const sizeValue = document.createElement("span");
            sizeValue.textContent = this.data.width + "%";
            sizeValue.style.cssText =
                "font-size: 12px; color: #667eea; font-weight: bold; min-width: 40px;";

            sizeSlider.addEventListener("input", (e) => {
                this.data.width = parseInt(e.target.value);
                sizeValue.textContent = this.data.width + "%";
                imageHolder.style.width = this.data.width + "%";
            });

            sizeControls.appendChild(sizeLabel);
            sizeControls.appendChild(sizeSlider);
            sizeControls.appendChild(sizeValue);
            this.wrapper.appendChild(sizeControls);

            // Contrôles d'alignement
            const alignmentControls = document.createElement("div");
            alignmentControls.style.cssText = `
              margin-top: 10px;
              padding: 10px;
              background: #f5f5f5;
              border-radius: 6px;
              display: flex;
              align-items: center;
              gap: 10px;
            `;

            const alignLabel = document.createElement("label");
            alignLabel.textContent = "Position:";
            alignLabel.style.cssText =
                "font-size: 12px; color: #666; min-width: 60px;";

            const alignments = [
                { name: "Gauche", value: "left", icon: "⬅️" },
                { name: "Centre", value: "center", icon: "↔️" },
                { name: "Droite", value: "right", icon: "➡️" },
            ];

            alignmentControls.appendChild(alignLabel);

            alignments.forEach((align) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.textContent = align.icon;
                btn.title = align.name;
                btn.style.cssText = `
                padding: 8px 12px;
                border: 2px solid ${this.data.alignment === align.value ? "#667eea" : "#ddd"
                    };
                background: ${this.data.alignment === align.value ? "#667eea" : "white"
                    };
                color: ${this.data.alignment === align.value ? "white" : "#666"
                    };
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.2s ease;
              `;

                btn.addEventListener("click", () => {
                    this.data.alignment = align.value;
                    imageContainer.style.textAlign = align.value;

                    // Mettre à jour les styles des boutons
                    alignmentControls.querySelectorAll("button").forEach((b) => {
                        b.style.border = "2px solid #ddd";
                        b.style.background = "white";
                        b.style.color = "#666";
                    });
                    btn.style.border = "2px solid #667eea";
                    btn.style.background = "#667eea";
                    btn.style.color = "white";
                });

                btn.addEventListener("mouseenter", () => {
                    if (this.data.alignment !== align.value) {
                        btn.style.borderColor = "#667eea";
                    }
                });

                btn.addEventListener("mouseleave", () => {
                    if (this.data.alignment !== align.value) {
                        btn.style.borderColor = "#ddd";
                    }
                });

                alignmentControls.appendChild(btn);
            });

            this.wrapper.appendChild(alignmentControls);

            // Légende
            const caption = document.createElement("div");
            caption.classList.add("simple-image__caption");
            caption.style.marginTop = "10px";

            const captionInput = document.createElement("input");
            captionInput.type = "text";
            captionInput.placeholder = "Légende de l'image...";
            captionInput.value = this.data.caption;
            captionInput.style.cssText = `
              width: 100%;
              padding: 8px;
              border: 1px solid #ddd;
              border-radius: 6px;
              font-size: 14px;
            `;

            captionInput.addEventListener("input", (e) => {
                this.data.caption = e.target.value;
            });

            caption.appendChild(captionInput);
            this.wrapper.appendChild(caption);
        } else if (this.data.caption) {
            const caption = document.createElement("div");
            caption.classList.add("simple-image__caption");
            caption.textContent = this.data.caption;
            this.wrapper.appendChild(caption);
        }
    }

    _createUploader() {
        const uploader = document.createElement("div");
        uploader.classList.add("simple-image__upload");

        uploader.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 10px;">🖼️</div>
            <div style="font-size: 1rem; color: #666;">Cliquez pour télécharger une image</div>
            <div style="font-size: 0.9rem; color: #999; margin-top: 5px;">ou glissez-déposez ici</div>
            <input type="file" accept="image/*" style="display: none;">
          `;

        const fileInput = uploader.querySelector('input[type="file"]');

        uploader.addEventListener("click", () => {
            fileInput.click();
        });

        fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith("image/")) {
                this._uploadFile(file);
            }
        });

        // Drag and drop
        uploader.addEventListener("dragover", (e) => {
            e.preventDefault();
            uploader.style.borderColor = "#667eea";
            uploader.style.background = "#f0f0f0";
        });

        uploader.addEventListener("dragleave", (e) => {
            e.preventDefault();
            uploader.style.borderColor = "#ddd";
            uploader.style.background = "#f9f9f9";
        });

        uploader.addEventListener("drop", (e) => {
            e.preventDefault();
            uploader.style.borderColor = "#ddd";
            uploader.style.background = "#f9f9f9";

            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith("image/")) {
                this._uploadFile(file);
            }
        });

        this.wrapper.appendChild(uploader);

        // Option URL
        const urlSection = document.createElement("div");
        urlSection.style.marginTop = "20px";

        const urlInput = document.createElement("input");
        urlInput.type = "text";
        urlInput.placeholder = "Ou collez l'URL de l'image...";
        urlInput.classList.add("simple-image__url-input");

        const buttons = document.createElement("div");
        buttons.classList.add("simple-image__buttons");

        const addButton = document.createElement("button");
        addButton.textContent = "Ajouter depuis URL";
        addButton.classList.add("simple-image__button");
        addButton.onclick = (e) => {
            e.preventDefault();
            if (urlInput.value.trim()) {
                this.data.url = urlInput.value.trim();
                this._createImage(this.data.url);
            }
        };

        buttons.appendChild(addButton);

        urlSection.appendChild(urlInput);
        urlSection.appendChild(buttons);
        this.wrapper.appendChild(urlSection);
    }

    _uploadFile(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            this.data.url = e.target.result;
            this._createImage(this.data.url);
        };

        reader.readAsDataURL(file);
    }

    save(blockContent) {
        const image = blockContent.querySelector("img");
        const captionInput = blockContent.querySelector(
            ".simple-image__caption input"
        );

        return Object.assign(this.data, {
            url: image ? image.src : this.data.url,
            caption: captionInput ? captionInput.value : this.data.caption,
        });
    }

    renderSettings() {
        const wrapper = document.createElement("div");

        this.settings.forEach((tune) => {
            const button = document.createElement("div");
            button.classList.add("cdx-settings-button");
            button.innerHTML = tune.icon;
            button.classList.toggle(
                "cdx-settings-button--active",
                this.data[tune.name]
            );

            wrapper.appendChild(button);

            button.addEventListener("click", () => {
                this._toggleTune(tune.name);
                button.classList.toggle("cdx-settings-button--active");
            });
        });

        return wrapper;
    }

    _toggleTune(tune) {
        this.data[tune] = !this.data[tune];
        this._createImage(this.data.url);
    }

    static get sanitize() {
        return {
            url: {},
            caption: {},
        };
    }
}

// Plugin Bold (Gras) personnalisé pour Editor.js (Inline Tool)
class BoldTool {
    static get isInline() {
        return true;
    }

    static get sanitize() {
        return {
            b: {},
            strong: {},
        };
    }

    constructor({ api }) {
        this.api = api;
        this.button = null;
        this.tag = "B";
        this.class = "cdx-bold";
    }

    render() {
        this.button = document.createElement("button");
        this.button.type = "button";
        // Icône "B" moderne avec dégradé
        this.button.innerHTML =
            '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bold-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#667eea;stop-opacity:1" /><stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" /></linearGradient></defs><path fill="url(#bold-gradient)" d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>';
        this.button.classList.add(this.api.styles.inlineToolButton);
        return this.button;
    }

    surround(range) {
        if (!range) return;
        this.api.selection.findParentTag(this.tag)
            ? this.unwrap(range)
            : this.wrap(range);
    }

    wrap(range) {
        const selectedText = range.extractContents();
        const bold = document.createElement(this.tag);
        bold.classList.add(this.class);
        bold.appendChild(selectedText);
        range.insertNode(bold);
        this.api.selection.expandToTag(bold);
    }

    unwrap(range) {
        const bold = this.api.selection.findParentTag(this.tag);
        const text = range.extractContents();
        bold.remove();
        range.insertNode(text);
    }

    checkState() {
        const bold = this.api.selection.findParentTag(this.tag);
        if (bold) {
            this.button.classList.add(this.api.styles.inlineToolButtonActive);
        } else {
            this.button.classList.remove(
                this.api.styles.inlineToolButtonActive
            );
        }
    }

    static get title() {
        return "Gras";
    }

    get shortcut() {
        return "CMD+B";
    }
}

// Plugin Italic personnalisé pour Editor.js (Inline Tool)
class ItalicTool {
    static get isInline() {
        return true;
    }

    static get sanitize() {
        return {
            i: {},
            em: {},
        };
    }

    constructor({ api }) {
        this.api = api;
        this.button = null;
        this.tag = "I";
        this.class = "cdx-italic";
    }

    render() {
        this.button = document.createElement("button");
        this.button.type = "button";
        // Icône "I" moderne avec dégradé
        this.button.innerHTML =
            '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="italic-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" /><stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" /></linearGradient></defs><path fill="url(#italic-gradient)" d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/></svg>';
        this.button.classList.add(this.api.styles.inlineToolButton);
        return this.button;
    }

    surround(range) {
        if (!range) return;
        this.api.selection.findParentTag(this.tag)
            ? this.unwrap(range)
            : this.wrap(range);
    }

    wrap(range) {
        const selectedText = range.extractContents();
        const italic = document.createElement(this.tag);
        italic.classList.add(this.class);
        italic.appendChild(selectedText);
        range.insertNode(italic);
        this.api.selection.expandToTag(italic);
    }

    unwrap(range) {
        const italic = this.api.selection.findParentTag(this.tag);
        const text = range.extractContents();
        italic.remove();
        range.insertNode(text);
    }

    checkState() {
        const italic = this.api.selection.findParentTag(this.tag);
        if (italic) {
            this.button.classList.add(this.api.styles.inlineToolButtonActive);
        } else {
            this.button.classList.remove(
                this.api.styles.inlineToolButtonActive
            );
        }
    }

    static get title() {
        return "Italique";
    }

    get shortcut() {
        return "CMD+I";
    }
}

// Plugin Underline (Souligner) personnalisé pour Editor.js (Inline Tool)
class UnderlineTool {
    static get isInline() {
        return true;
    }

    static get sanitize() {
        return {
            u: {},
        };
    }

    constructor({ api }) {
        this.api = api;
        this.button = null;
        this.tag = "U";
        this.class = "cdx-underline";
    }

    render() {
        this.button = document.createElement("button");
        this.button.type = "button";
        // Icône "U" moderne avec dégradé
        this.button.innerHTML =
            '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="underline-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" /><stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" /></linearGradient></defs><path fill="url(#underline-gradient)" d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>';
        this.button.classList.add(this.api.styles.inlineToolButton);
        return this.button;
    }

    surround(range) {
        if (!range) return;
        this.api.selection.findParentTag(this.tag)
            ? this.unwrap(range)
            : this.wrap(range);
    }

    wrap(range) {
        const selectedText = range.extractContents();
        const underline = document.createElement(this.tag);
        underline.classList.add(this.class);
        underline.appendChild(selectedText);
        range.insertNode(underline);
        this.api.selection.expandToTag(underline);
    }

    unwrap(range) {
        const underline = this.api.selection.findParentTag(this.tag);
        const text = range.extractContents();
        underline.remove();
        range.insertNode(text);
    }

    checkState() {
        const underline = this.api.selection.findParentTag(this.tag);
        if (underline) {
            this.button.classList.add(this.api.styles.inlineToolButtonActive);
        } else {
            this.button.classList.remove(
                this.api.styles.inlineToolButtonActive
            );
        }
    }

    static get title() {
        return "Souligner";
    }

    get shortcut() {
        return "CMD+U";
    }
}

// Plugin Alignement de texte personnalisé pour Editor.js (Inline Tool)
class AlignmentTool {
    static get isInline() {
        return true;
    }

    static get sanitize() {
        return {
            span: {
                style: true,
                "data-align": true,
            },
        };
    }

    constructor({ api }) {
        this.api = api;
        this.button = null;
        this.state = false;
        this.tag = "SPAN";
        this.class = "cdx-text-align";

        this.alignments = [
            {
                name: "Gauche",
                value: "left",
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z"/></svg>',
            },
            {
                name: "Centre",
                value: "center",
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z"/></svg>',
            },
            {
                name: "Droite",
                value: "right",
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z"/></svg>',
            },
            {
                name: "Justifier",
                value: "justify",
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/></svg>',
            },
        ];
    }

    render() {
        this.button = document.createElement("button");
        this.button.type = "button";
        // Icône d'alignement avec dégradé
        this.button.innerHTML =
            '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="align-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#fa709a;stop-opacity:1" /><stop offset="100%" style="stop-color:#fee140;stop-opacity:1" /></linearGradient></defs><path fill="url(#align-gradient)" d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z"/></svg>';
        this.button.classList.add(this.api.styles.inlineToolButton);
        return this.button;
    }

    surround(range) {
        this.showAlignmentPicker(range);
    }

    showAlignmentPicker(range) {
        // Créer un popup pour sélectionner l'alignement
        const alignmentPicker = this.createAlignmentPicker();
        document.body.appendChild(alignmentPicker);

        // Positionner le popup près du bouton
        const buttonRect = this.button.getBoundingClientRect();
        alignmentPicker.style.position = "fixed";
        alignmentPicker.style.top = buttonRect.bottom + 5 + "px";
        alignmentPicker.style.left = buttonRect.left + "px";
        alignmentPicker.style.zIndex = "9999";

        // Fonction pour appliquer l'alignement au bloc parent
        const applyAlignment = (alignment) => {
            // Obtenir le bloc parent (div ce-block__content)
            let currentNode = range.startContainer;
            let blockElement = null;

            // Chercher le wrapper du bloc
            while (currentNode && currentNode !== document.body) {
                if (
                    currentNode.classList &&
                    currentNode.classList.contains("ce-block__content")
                ) {
                    blockElement = currentNode;
                    break;
                }
                currentNode = currentNode.parentNode;
            }

            if (blockElement) {
                // Appliquer l'alignement au bloc
                blockElement.style.textAlign = alignment;
            }

            // Nettoyer le popup
            if (document.body.contains(alignmentPicker)) {
                document.body.removeChild(alignmentPicker);
            }
        };

        // Gérer la sélection d'alignement
        const alignmentOptions =
            alignmentPicker.querySelectorAll(".alignment-option");
        alignmentOptions.forEach((option) => {
            option.addEventListener("click", (e) => {
                const alignment = e.currentTarget.dataset.alignment;
                applyAlignment(alignment);
            });
        });

        // Fermer le popup si on clique ailleurs
        const closeHandler = (e) => {
            if (
                !alignmentPicker.contains(e.target) &&
                e.target !== this.button
            ) {
                if (document.body.contains(alignmentPicker)) {
                    document.body.removeChild(alignmentPicker);
                }
                document.removeEventListener("click", closeHandler);
            }
        };

        setTimeout(() => {
            document.addEventListener("click", closeHandler);
        }, 100);
    }

    createAlignmentPicker() {
        const picker = document.createElement("div");
        picker.style.cssText = `
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            gap: 8px;
          `;

        this.alignments.forEach((align) => {
            const alignOption = document.createElement("div");
            alignOption.classList.add("alignment-option");
            alignOption.dataset.alignment = align.value;
            alignOption.title = align.name;
            alignOption.innerHTML = align.icon;
            alignOption.style.cssText = `
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 6px;
              cursor: pointer;
              border: 2px solid transparent;
              transition: all 0.2s ease;
              background: #f9f9f9;
            `;

            alignOption.addEventListener("mouseenter", () => {
                alignOption.style.background = "#667eea";
                alignOption.style.borderColor = "#667eea";
                const svg = alignOption.querySelector("svg path");
                if (svg) svg.style.fill = "white";
            });

            alignOption.addEventListener("mouseleave", () => {
                alignOption.style.background = "#f9f9f9";
                alignOption.style.borderColor = "transparent";
                const svg = alignOption.querySelector("svg path");
                if (svg) svg.style.fill = "currentColor";
            });

            picker.appendChild(alignOption);
        });

        return picker;
    }

    checkState() {
        // Pas besoin de vérifier l'état pour cet outil
    }

    static get title() {
        return "Alignement";
    }
}

// Block Tune pour l'alignement (sauvegarde les données dans le JSON)
class AlignmentBlockTune {
    constructor({ api, data, config, block }) {
        this.api = api;
        this.block = block;
        this.data = data || {};
        this.config = config || {};

        // Valeur par défaut
        this.alignment = this.data.alignment || 'left';

        this.alignments = [
            {
                name: "Gauche",
                value: "left",
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z"/></svg>',
            },
            {
                name: "Centre",
                value: "center",
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z"/></svg>',
            },
            {
                name: "Droite",
                value: "right",
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z"/></svg>',
            },
            {
                name: "Justifier",
                value: "justify",
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/></svg>',
            },
        ];

        // Appliquer l'alignement au bloc lors du rendu
        this._applyAlignment();
    }

    static get isTune() {
        return true;
    }

    render() {
        // Créer un wrapper pour tous les boutons d'alignement
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.gap = '2px';

        this.alignments.forEach(align => {
            const button = document.createElement('button');
            button.type = 'button';
            button.innerHTML = align.icon;
            button.title = align.name;
            button.classList.add(this.api.styles.settingsButton);

            if (this.alignment === align.value) {
                button.classList.add(this.api.styles.settingsButtonActive);
            }

            button.addEventListener('click', () => {
                this.alignment = align.value;
                this._applyAlignment();

                // Mettre à jour les styles des boutons
                wrapper.querySelectorAll('button').forEach(btn => {
                    btn.classList.remove(this.api.styles.settingsButtonActive);
                });
                button.classList.add(this.api.styles.settingsButtonActive);
            });

            wrapper.appendChild(button);
        });

        return wrapper;
    }

    _applyAlignment() {
        // Appliquer l'alignement au bloc
        const blockContent = this.block.holder.querySelector('.ce-block__content');
        if (blockContent) {
            blockContent.style.textAlign = this.alignment;
        }
    }

    save() {
        return {
            alignment: this.alignment
        };
    }
}

// Plugin Color personnalisé pour Editor.js (Inline Tool)
class ColorTool {
    static get isInline() {
        return true;
    }

    static get sanitize() {
        return {
            span: {
                style: true,
                "data-color": true,
            },
        };
    }

    constructor({ api }) {
        this.api = api;
        this.button = null;
        this.state = false;
        this.tag = "SPAN";
        this.class = "cdx-text-color";

        // Palette de couleurs prédéfinies
        this.colors = [
            { name: "Rouge", value: "#FF0000" },
            { name: "Bleu", value: "#0000FF" },
            { name: "Vert", value: "#008000" },
            { name: "Orange", value: "#FFA500" },
            { name: "Violet", value: "#800080" },
            { name: "Rose", value: "#FF1493" },
            { name: "Cyan", value: "#00CED1" },
            { name: "Jaune", value: "#FFD700" },
            { name: "Noir", value: "#000000" },
            { name: "Gris", value: "#808080" },
        ];
    }

    render() {
        this.button = document.createElement("button");
        this.button.type = "button";
        // Icône palette de couleurs moderne avec dégradé arc-en-ciel
        this.button.innerHTML =
            '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="color-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#ff0000;stop-opacity:1" /><stop offset="20%" style="stop-color:#ff7f00;stop-opacity:1" /><stop offset="40%" style="stop-color:#ffff00;stop-opacity:1" /><stop offset="60%" style="stop-color:#00ff00;stop-opacity:1" /><stop offset="80%" style="stop-color:#0000ff;stop-opacity:1" /><stop offset="100%" style="stop-color:#8b00ff;stop-opacity:1" /></linearGradient></defs><path fill="url(#color-gradient)" d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.21-.64-1.67-.08-.09-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>';
        this.button.classList.add(this.api.styles.inlineToolButton);

        return this.button;
    }

    surround(range) {
        if (this.state) {
            this.unwrap(range);
            return;
        }

        this.wrap(range);
    }

    wrap(range) {
        // Créer un popup pour sélectionner la couleur
        const colorPicker = this.createColorPicker();
        document.body.appendChild(colorPicker);

        // Positionner le popup près du bouton
        const buttonRect = this.button.getBoundingClientRect();
        colorPicker.style.position = "fixed";
        colorPicker.style.top = buttonRect.bottom + 5 + "px";
        colorPicker.style.left = buttonRect.left + "px";
        colorPicker.style.zIndex = "9999";

        // Fonction pour appliquer la couleur
        const applyColor = (color) => {
            const selectedText = range.extractContents();
            const span = document.createElement(this.tag);
            span.style.color = color;
            span.setAttribute("data-color", color);
            span.classList.add(this.class);
            span.appendChild(selectedText);
            range.insertNode(span);

            // Nettoyer le popup
            if (document.body.contains(colorPicker)) {
                document.body.removeChild(colorPicker);
            }

            // Restaurer la sélection
            this.api.selection.expandToTag(span);
        };

        // Gérer la sélection de couleur prédéfinie
        const colorOptions = colorPicker.querySelectorAll(".color-option");
        colorOptions.forEach((option) => {
            option.addEventListener("click", (e) => {
                const color = e.currentTarget.dataset.color;
                applyColor(color);
            });
        });

        // Gérer le sélecteur de couleur personnalisée
        const customColorInput = colorPicker.querySelector(
            ".custom-color-input"
        );
        if (customColorInput) {
            customColorInput.addEventListener("change", (e) => {
                const color = e.target.value;
                applyColor(color);
            });
        }

        // Fermer le popup si on clique ailleurs
        const closeHandler = (e) => {
            if (!colorPicker.contains(e.target) && e.target !== this.button) {
                if (document.body.contains(colorPicker)) {
                    document.body.removeChild(colorPicker);
                }
                document.removeEventListener("click", closeHandler);
            }
        };

        setTimeout(() => {
            document.addEventListener("click", closeHandler);
        }, 100);
    }

    unwrap(range) {
        const span = this.api.selection.findParentTag(this.tag, this.class);
        const text = range.extractContents();

        span.remove();
        range.insertNode(text);
    }

    createColorPicker() {
        const picker = document.createElement("div");
        picker.style.cssText = `
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            width: 220px;
          `;

        // Grille de couleurs prédéfinies
        const colorGrid = document.createElement("div");
        colorGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-bottom: 12px;
          `;

        this.colors.forEach((color) => {
            const colorOption = document.createElement("div");
            colorOption.classList.add("color-option");
            colorOption.dataset.color = color.value;
            colorOption.title = color.name;
            colorOption.style.cssText = `
              width: 32px;
              height: 32px;
              background-color: ${color.value};
              border-radius: 4px;
              cursor: pointer;
              border: 2px solid transparent;
              transition: all 0.2s ease;
            `;

            colorOption.addEventListener("mouseenter", () => {
                colorOption.style.transform = "scale(1.1)";
                colorOption.style.borderColor = "#667eea";
            });

            colorOption.addEventListener("mouseleave", () => {
                colorOption.style.transform = "scale(1)";
                colorOption.style.borderColor = "transparent";
            });

            colorGrid.appendChild(colorOption);
        });

        picker.appendChild(colorGrid);

        // Séparateur
        const separator = document.createElement("div");
        separator.style.cssText = `
            height: 1px;
            background: #e0e0e0;
            margin: 8px 0;
          `;
        picker.appendChild(separator);

        // Section couleur personnalisée
        const customColorSection = document.createElement("div");
        customColorSection.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 5px 0;
          `;

        const customLabel = document.createElement("label");
        customLabel.textContent = "Couleur personnalisée:";
        customLabel.style.cssText = `
            font-size: 12px;
            color: #666;
            flex: 1;
          `;

        const customColorInput = document.createElement("input");
        customColorInput.type = "color";
        customColorInput.value = "#000000";
        customColorInput.classList.add("custom-color-input");
        customColorInput.style.cssText = `
            width: 40px;
            height: 32px;
            border: 2px solid #e0e0e0;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
          `;

        customColorInput.addEventListener("mouseenter", () => {
            customColorInput.style.borderColor = "#667eea";
        });

        customColorInput.addEventListener("mouseleave", () => {
            customColorInput.style.borderColor = "#e0e0e0";
        });

        customColorSection.appendChild(customLabel);
        customColorSection.appendChild(customColorInput);
        picker.appendChild(customColorSection);

        return picker;
    }

    checkState() {
        const span = this.api.selection.findParentTag(this.tag, this.class);
        this.state = !!span;

        if (this.state) {
            this.button.classList.add(this.api.styles.inlineToolButtonActive);
        } else {
            this.button.classList.remove(
                this.api.styles.inlineToolButtonActive
            );
        }
    }

    static get title() {
        return "Couleur du texte";
    }
}

// Wrapper pour Paragraph avec support de l'alignement
// Wrapper pour Paragraph avec support de l'alignement
// Wrapper pour Paragraph avec support de l'alignement
class ParagraphWithAlignment {
    constructor({ data, config, api, block }) {
        this.api = api;
        this.block = block;
        this._data = data || {};
        this.config = config || {};
        
        // Stocker l'alignement dans une propriété d'instance
        this._alignment = this._data.alignment || 'left';

        // Créer l'élément de paragraphe
        this._element = document.createElement('div');
        this._element.contentEditable = true;
        this._element.dataset.placeholder = config.placeholder || '';
        this._element.innerHTML = this._data.text || '';
    }

    render() {
        // Appliquer l'alignement sur le wrapper après le rendu
        setTimeout(() => {
            const blockWrapper = this._element.closest('.ce-block__content');
            if (blockWrapper) {
                blockWrapper.style.textAlign = this._alignment;
            }
        }, 0);
        
        return this._element;
    }

    renderSettings() {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.gap = '4px';
        wrapper.style.marginRight = '8px';

        const alignments = [
            { name: 'Gauche', value: 'left', icon: '⬅' },
            { name: 'Centre', value: 'center', icon: '↔' },
            { name: 'Droite', value: 'right', icon: '➡' },
            { name: 'Justifier', value: 'justify', icon: '⬌' }
        ];

        alignments.forEach(align => {
            const button = document.createElement('span');
            button.classList.add(this.api.styles.settingsButton);
            button.textContent = align.icon;
            button.title = align.name;
            button.classList.toggle(
                this.api.styles.settingsButtonActive,
                this._alignment === align.value
            );

            button.addEventListener('click', () => {
                // Mettre à jour la propriété d'instance
                this._alignment = align.value;
                
                // Appliquer sur le wrapper parent (ce-block__content)
                const blockWrapper = this._element.closest('.ce-block__content');
                if (blockWrapper) {
                    blockWrapper.style.textAlign = align.value;
                }

                // Mettre à jour les boutons
                wrapper.querySelectorAll('span').forEach(btn => {
                    btn.classList.remove(this.api.styles.settingsButtonActive);
                });
                button.classList.add(this.api.styles.settingsButtonActive);
            });

            wrapper.appendChild(button);
        });

        return wrapper;
    }

    save(blockContent) {
        // Lire l'alignement depuis le wrapper parent
        const blockWrapper = blockContent.closest('.ce-block__content');
        const alignment = blockWrapper ? blockWrapper.style.textAlign : this._alignment;
        
        return {
            text: blockContent.innerHTML,
            alignment: alignment || 'left'
        };
    }

    static get pasteConfig() {
        return {
            tags: ['P']
        };
    }

    static get sanitize() {
        return {
            text: {
                br: true,
                b: true,
                i: true,
                u: true,
                span: {
                    style: true,
                    'data-color': true,
                }
            }
        };
    }

    static get toolbox() {
        return {
            title: 'Paragraph',
            icon: '<svg width="14" height="14" viewBox="0 -1 14 14" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 3.5h-13v1h13v-1zm0-3h-13v1h13v-1zm0 6h-13v1h13v-1zm0 3h-13v1h13v-1z"/></svg>'
        };
    }
}


// Wrapper pour Header avec support de l'alignement
class HeaderWithAlignment {
    constructor({ data, config, api, block }) {
        this.api = api;
        this.block = block;
        this._data = data || {};
        this.config = config || {};
        this.levels = this.config.levels || [1, 2, 3, 4, 5, 6];
        this.defaultLevel = this.config.defaultLevel || 2;
        this.currentLevel = this._data.level || this.defaultLevel;

        // Stocker l'alignement dans une propriété d'instance
        this._alignment = this._data.alignment || 'left';

        // Créer l'élément de header
        this._element = this._createHeaderElement();
    }

    _createHeaderElement() {
        const tag = 'h' + this.currentLevel;
        const element = document.createElement(tag);
        element.contentEditable = true;
        element.dataset.placeholder = this.config.placeholder || '';
        element.innerHTML = this._data.text || '';
        return element;
    }

    render() {
        // Appliquer l'alignement sur le wrapper après le rendu
        setTimeout(() => {
            const blockWrapper = this._element.closest('.ce-block__content');
            if (blockWrapper) {
                blockWrapper.style.textAlign = this._alignment;
            }
        }, 0);

        return this._element;
    }

    renderSettings() {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '12px';

        // Groupe de boutons pour les niveaux de header
        const levelsWrapper = document.createElement('div');
        levelsWrapper.style.display = 'flex';
        levelsWrapper.style.gap = '2px';

        this.levels.forEach(level => {
            const button = document.createElement('span');
            button.classList.add(this.api.styles.settingsButton);
            button.textContent = 'H' + level;
            button.classList.toggle(
                this.api.styles.settingsButtonActive,
                level === this.currentLevel
            );

            button.addEventListener('click', () => {
                this.currentLevel = level;
                const newElement = this._createHeaderElement();
                this._element.replaceWith(newElement);
                this._element = newElement;

                // Réappliquer l'alignement sur le wrapper
                const blockWrapper = this._element.closest('.ce-block__content');
                if (blockWrapper) {
                    blockWrapper.style.textAlign = this._alignment;
                }

                // Mettre à jour les boutons
                levelsWrapper.querySelectorAll('span').forEach((btn, idx) => {
                    btn.classList.toggle(
                        this.api.styles.settingsButtonActive,
                        this.levels[idx] === level
                    );
                });
            });

            levelsWrapper.appendChild(button);
        });

        // Groupe de boutons pour l'alignement
        const alignWrapper = document.createElement('div');
        alignWrapper.style.display = 'flex';
        alignWrapper.style.gap = '2px';

        const alignments = [
            { name: 'Gauche', value: 'left', icon: '⬅' },
            { name: 'Centre', value: 'center', icon: '↔' },
            { name: 'Droite', value: 'right', icon: '➡' },
            { name: 'Justifier', value: 'justify', icon: '⬌' }
        ];

        alignments.forEach(align => {
            const button = document.createElement('span');
            button.classList.add(this.api.styles.settingsButton);
            button.textContent = align.icon;
            button.title = align.name;
            button.classList.toggle(
                this.api.styles.settingsButtonActive,
                this._alignment === align.value
            );

            button.addEventListener('click', () => {
                // Mettre à jour la propriété d'instance
                this._alignment = align.value;

                // Appliquer sur le wrapper parent (ce-block__content)
                const blockWrapper = this._element.closest('.ce-block__content');
                if (blockWrapper) {
                    blockWrapper.style.textAlign = align.value;
                }

                // Mettre à jour les boutons
                alignWrapper.querySelectorAll('span').forEach(btn => {
                    btn.classList.remove(this.api.styles.settingsButtonActive);
                });
                button.classList.add(this.api.styles.settingsButtonActive);
            });

            alignWrapper.appendChild(button);
        });

        container.appendChild(levelsWrapper);
        container.appendChild(alignWrapper);

        return container;
    }

    save(blockContent) {
        // Lire l'alignement depuis le wrapper parent
        const blockWrapper = blockContent.closest('.ce-block__content');
        const alignment = blockWrapper ? blockWrapper.style.textAlign : this._alignment;

        return {
            text: blockContent.innerHTML,
            level: this.currentLevel,
            alignment: alignment || 'left'
        };
    }

    static get sanitize() {
        return {
            text: {
                br: true,
                b: true,
                i: true,
                u: true,
                span: {
                    style: true,
                    'data-color': true,
                }
            },
            level: false
        };
    }

    static get toolbox() {
        return {
            title: 'Heading',
            icon: '<svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 8.48H3.95v15.12H7V8.48zm11.47 7.43v-1.24c0-1.67-.92-2.74-2.37-2.74-1.43 0-2.32 1.07-2.32 2.74v1.24h4.69zm3.47 7.69V15.91c0-1.79-.94-3.91-3.57-3.91-1.71 0-2.9.96-3.36 2h-.05v-1.61h-3.12V23.6h3.12v-7.69c0-1.31.67-2.05 1.71-2.05 1.02 0 1.64.74 1.64 2.05v7.69h3.63z"/></svg>'
        };
    }
}

// ============================================
// Fonction pour charger les données depuis article.json
// ============================================
async function loadArticleData() {
    try {
        console.log('📂 Chargement de article.json...');
        const response = await fetch('article.json');

        if (!response.ok) {
            throw new Error(`Impossible de charger article.json (${response.status})`);
        }

        const data = await response.json();
        console.log('✓ Données chargées depuis article.json');
        console.log(`   → ${data.blocks.length} blocs trouvés`);
        console.log(data);
        return data;
    } catch (error) {
        console.error('✗ Erreur lors du chargement de article.json:', error);
        console.warn('⚠️  Utilisation de données vides. Lancez start_server.bat pour charger article.json');

        // Retourner des données vides en cas d'erreur
        return {
            blocks: []
        };
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Attendre que tous les scripts soient chargés
    setTimeout(async () => {
        // Récupération des classes depuis window
        const Header = window.Header;
        const NestedList = window.NestedList;
        const Quote = window.Quote;
        const Delimiter = window.Delimiter;
        const Checklist = window.Checklist;
        const Paragraph = window.Paragraph;

        // Vérification que les plugins sont bien chargés
        console.log("Header:", Header);
        console.log("NestedList:", NestedList);
        console.log("Quote:", Quote);
        console.log("Delimiter:", Delimiter);
        console.log("Checklist:", Checklist);
        console.log("Paragraph:", Paragraph);
        console.log("SimpleImage:", SimpleImage);
        loadArticleData().then(data => {
            // Configuration d'Editor.js avec les plugins personnalisé
            console.log('Configuration de Editor.js...', data);

            // Initialisation d'Editor.js
            editor = new EditorJS({
                holder: "editorjs",

                // Contenu initial
                data: {
                    blocks: data.blocks || [],
                },

            // Configuration des outils
            tools: {
                paragraph: {
                    class: ParagraphWithAlignment,
                    inlineToolbar: true,
                },
                header: {
                    class: HeaderWithAlignment,
                    inlineToolbar: true,
                    config: {
                        placeholder: "Entrez un titre",
                        levels: [1, 2, 3, 4],
                        defaultLevel: 2,
                    },
                },
                image: {
                    class: SimpleImage,
                    inlineToolbar: true,
                },
                list: NestedList
                    ? {
                        class: NestedList,
                        inlineToolbar: true,
                        config: {
                            defaultStyle: "unordered",
                        },
                    }
                    : undefined,
                quote: Quote
                    ? {
                        class: Quote,
                        inlineToolbar: true,
                        config: {
                            quotePlaceholder: "Entrez une citation",
                            captionPlaceholder: "Auteur de la citation",
                        },
                    }
                    : undefined,
                delimiter: Delimiter || undefined,
                checklist: Checklist
                    ? {
                        class: Checklist,
                        inlineToolbar: true,
                    }
                    : undefined,
                bold: {
                    class: BoldTool,
                },
                italic: {
                    class: ItalicTool,
                },
                underline: {
                    class: UnderlineTool,
                },
                alignment: {
                    class: AlignmentTool,
                },
                color: {
                    class: ColorTool,
                },
            },

            placeholder: "Commencez à écrire votre contenu...",

            // Autofocus
            autofocus: true,
            });

            console.log("Editor.js initialisé avec succès!");
        }); // Fin du .then(data =>)
    }, 100); // Petit délai pour s'assurer que tous les scripts sont chargés
});

// Fonctions globales pour les boutons
async function saveContent() {
    if (!editor) {
        alert("L'éditeur n'est pas encore prêt");
        return;
    }

    try {
        const outputData = await editor.save();

        // Afficher le contenu sauvegardé
        const outputDiv = document.getElementById("output");
        const outputContent = document.getElementById("output-content");

        outputContent.textContent = JSON.stringify(outputData, null, 2);
        outputDiv.style.display = "block";

        // Scroll vers le résultat
        outputDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });

        console.log("Contenu sauvegardé:", outputData);
    } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        alert("Erreur lors de la sauvegarde du contenu");
    }
}

// Fonction pour effacer le contenu
async function clearContent() {
    if (!editor) {
        alert("L'éditeur n'est pas encore prêt");
        return;
    }

    if (confirm("Êtes-vous sûr de vouloir effacer tout le contenu ?")) {
        await editor.clear();
        document.getElementById("output").style.display = "none";
    }
}