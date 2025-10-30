
// Variable globale pour stocker les données
let currentData = null;

// Fonction pour afficher un message de statut
function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
    statusDiv.style.display = 'block';

    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

// Fonction utilitaire pour convertir Markdown en HTML et préserver le HTML existant
function markdownToHTML(text) {
    if (!text) return '';

    // Le texte peut déjà contenir du HTML inline (b, i, u, span avec style)
    // On préserve ce HTML et on convertit seulement le markdown restant

    // Convertir **texte** en <strong>texte</strong> (seulement si pas déjà dans une balise HTML)
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Convertir *texte* en <em>texte</em> (seulement si pas déjà dans une balise HTML)
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    return text;
}

// Fonction récursive pour gérer les listes imbriquées
function renderListItems(items, listTag) {
    let html = '';

    items.forEach(item => {
        if (typeof item === 'object' && item.content !== undefined) {
            // Format NestedList avec content
            let content = markdownToHTML(item.content);
            html += `  <li>${content}`;

            // Si l'item a des sous-items, créer une liste imbriquée
            if (item.items && item.items.length > 0) {
                html += `\n    <${listTag}>\n`;
                html += renderListItems(item.items, listTag);
                html += `    </${listTag}>\n  `;
            }

            html += `</li>\n`;
        } else if (typeof item === 'string') {
            // Format simple avec juste du texte
            let content = markdownToHTML(item);
            html += `  <li>${content}</li>\n`;
        }
    });

    return html;
}

// Fonction pour convertir le JSON Editor.js en HTML
function convertToHTML(editorData) {
    let html = '';

    if (!editorData.blocks || !Array.isArray(editorData.blocks)) {
        throw new Error('Format JSON invalide : blocks manquant ou invalide');
    }

    editorData.blocks.forEach(block => {
        switch (block.type) {
            case 'header':
                const headerText = markdownToHTML(block.data.text);
                const headerAlign = block.data.alignment || '';
                const headerStyle = headerAlign ? ` style="text-align: ${headerAlign};"` : '';
                html += `<h${block.data.level}${headerStyle}>${headerText}</h${block.data.level}>\n`;
                break;

            case 'paragraph':
                const paragraphText = markdownToHTML(block.data.text);
                const paragraphAlign = block.data.alignment || '';
                const paragraphStyle = paragraphAlign ? ` style="text-align: ${paragraphAlign};"` : '';
                html += `<p${paragraphStyle}>${paragraphText}</p>\n`;
                break;

            case 'list':
                const listTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                const listAlign = block.data.alignment || '';
                const listStyle = listAlign ? ` style="text-align: ${listAlign};"` : '';
                html += `<${listTag}${listStyle}>\n`;

                if (block.data.items) {
                    html += renderListItems(block.data.items, listTag);
                }

                html += `</${listTag}>\n`;
                break;

            case 'quote':
                const quoteText = markdownToHTML(block.data.text);
                const quoteAlign = block.data.alignment || '';
                const quoteStyle = quoteAlign ? ` style="text-align: ${quoteAlign};"` : '';
                html += `<blockquote${quoteStyle}>\n`;
                html += `  <p>${quoteText}</p>\n`;
                if (block.data.caption) {
                    const captionText = markdownToHTML(block.data.caption);
                    html += `  <footer>— ${captionText}</footer>\n`;
                }
                html += `</blockquote>\n`;
                break;

            case 'image':
                // Support pour l'alignement de l'image
                const imageAlignment = block.data.alignment || 'center';
                const figureStyle = `text-align: ${imageAlignment};`;
                html += `<figure style="${figureStyle}">\n`;

                // Conteneur pour l'image avec largeur personnalisée
                const imageWidth = block.data.width || 100;
                const stretched = block.data.stretched;

                let containerStyle = 'display: inline-block; ';
                if (stretched) {
                    containerStyle += 'width: 100%; ';
                } else {
                    containerStyle += `width: ${imageWidth}%; `;
                }

                html += `  <div style="${containerStyle}">\n`;

                // Style de l'image
                let imgStyle = 'width: 100%; height: auto; ';
                if (block.data.withBorder) imgStyle += 'border: 2px solid #ddd; ';
                if (block.data.withBackground) imgStyle += 'background: #f9f9f9; padding: 20px; ';

                const altText = block.data.caption ? markdownToHTML(block.data.caption) : 'Image';
                html += `    <img src="${block.data.url}" alt="${altText}" style="${imgStyle}">\n`;
                html += `  </div>\n`;

                if (block.data.caption) {
                    const captionText = markdownToHTML(block.data.caption);
                    html += `  <figcaption>${captionText}</figcaption>\n`;
                }
                html += `</figure>\n`;
                break;

            case 'delimiter':
                html += `<div class="delimiter">* * *</div>\n`;
                break;

            case 'checklist':
                html += `<ul class="checklist">\n`;
                block.data.items.forEach(item => {
                    const checkedClass = item.checked ? ' class="checked"' : '';
                    const itemText = markdownToHTML(item.text);
                    html += `  <li${checkedClass}>${itemText}</li>\n`;
                });
                html += `</ul>\n`;
                break;

            default:
                console.warn('Type de bloc non supporté:', block.type);
                html += `<!-- Bloc non supporté: ${block.type} -->\n`;
        }
    });

    return html;
}

// Fonction pour charger et afficher un fichier JSON
function loadJSONFile(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const jsonData = JSON.parse(e.target.result);
            currentData = jsonData;

            // Convertir en HTML et afficher
            const htmlContent = convertToHTML(jsonData);
            document.getElementById('content').innerHTML = htmlContent;

            showStatus(`✓ Fichier "${file.name}" chargé avec succès`, 'success');
            console.log('Données JSON chargées:', jsonData);
        } catch (error) {
            showStatus(`✗ Erreur lors du chargement : ${error.message}`, 'error');
            console.error('Erreur:', error);
        }
    };

    reader.onerror = function () {
        showStatus('✗ Erreur lors de la lecture du fichier', 'error');
    };

    reader.readAsText(file);
}

// Fonction pour charger le fichier article.json par défaut
async function loadDefaultFile() {
    try {
        showStatus('Chargement de article.json...', 'info');

        const response = await fetch('article.json');

        if (!response.ok) {
            throw new Error(`Fichier non trouvé (${response.status})`);
        }

        const jsonData = await response.json();
        currentData = jsonData;

        // Convertir en HTML et afficher
        const htmlContent = convertToHTML(jsonData);
        document.getElementById('content').innerHTML = htmlContent;

        showStatus('✓ Fichier article.json chargé avec succès', 'success');
        console.log('Données JSON chargées:', jsonData);
    } catch (error) {
        showStatus(`✗ Erreur : ${error.message}`, 'error');
        console.error('Erreur:', error);
    }
}

// Fonction pour imprimer le contenu
function printContent() {
    window.print();
}

// Fonction pour télécharger le HTML
function downloadHTML() {
    if (!currentData) {
        showStatus('✗ Aucun contenu à télécharger', 'error');
        return;
    }

    try {
        const htmlContent = convertToHTML(currentData);

        const fullHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Editor.js</title>
  <style>
    body {
      font-family: Georgia, serif;
      line-height: 1.8;
      color: #333;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
    }
    h1 { font-size: 2.5rem; margin: 30px 0 20px; }
    h2 { font-size: 2rem; margin: 25px 0 15px; }
    h3 { font-size: 1.5rem; margin: 20px 0 12px; }
    h4 { font-size: 1.2rem; margin: 18px 0 10px; }
    p { margin: 15px 0; }

    /* Styles de formatage de texte */
    b, strong { font-weight: bold; }
    i, em { font-style: italic; }
    u { text-decoration: underline; }

    /* Support pour les couleurs inline */
    span[style*="color"] { }

    ul, ol { margin: 20px 0; padding-left: 40px; }
    li { margin: 10px 0; }
    blockquote {
      border-left: 5px solid #667eea;
      padding: 20px 30px;
      margin: 30px 0;
      background: #f8f9fa;
      font-style: italic;
    }
    figure {
      margin: 35px 0;
    }
    img { max-width: 100%; height: auto; border-radius: 8px; }
    figcaption { margin-top: 12px; font-style: italic; color: #666; text-align: center; }
    .delimiter { text-align: center; font-size: 2rem; margin: 40px 0; color: #ccc; }
    .checklist { list-style: none; padding-left: 0; }
    .checklist li { padding-left: 40px; position: relative; }
    .checklist li::before { content: '☐'; position: absolute; left: 0; font-size: 1.4rem; }
    .checklist li.checked::before { content: '☑'; color: #667eea; }
    .checklist li.checked { text-decoration: line-through; }
    code { background: #f4f4f4; padding: 3px 8px; border-radius: 4px; }
    a { color: #667eea; text-decoration: none; }

    /* Support pour l'impression */
    @media print {
      body { max-width: 100%; margin: 0; padding: 20px; }
      figure { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'document-' + Date.now() + '.html';
        link.click();

        URL.revokeObjectURL(url);

        showStatus('✓ Fichier HTML téléchargé', 'success');
    } catch (error) {
        showStatus(`✗ Erreur lors du téléchargement : ${error.message}`, 'error');
    }
}

// Event listener pour la sélection de fichier
document.getElementById('jsonFile').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        loadJSONFile(file);
    }
});

// Charger automatiquement article.json au démarrage
window.addEventListener('DOMContentLoaded', function () {
    // Vérifier si on est sur file:// ou http://
    if (window.location.protocol === 'file:') {
        // Mode fichier local - afficher un message informatif
        showStatus('⚠️ Mode fichier local détecté. Utilisez le bouton "Parcourir" pour charger un fichier, ou lancez un serveur web local.', 'info');
        document.getElementById('status').style.display = 'block';

        // Ne pas masquer le message après 5 secondes
        document.getElementById('status').onclick = function () {
            this.style.display = 'none';
        };
    } else {
        // Mode serveur web - charger automatiquement
        setTimeout(() => {
            loadDefaultFile();
        }, 500);
    }
});