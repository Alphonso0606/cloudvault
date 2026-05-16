// ─── Extraction de texte selon le type de fichier ───

// Extrait le texte d'une image via OCR (Tesseract.js)
export async function extractTextFromImage(file) {
    try {
        const { createWorker } = await import('tesseract.js')
        const worker = await createWorker('fra+eng', 1, {
            logger: () => {} // silence les logs
        })
        const imageUrl = URL.createObjectURL(file)
        const { data: { text } } = await worker.recognize(imageUrl)
        await worker.terminate()
        URL.revokeObjectURL(imageUrl)
        return text.trim()
    } catch (e) {
        console.warn('OCR échoué:', e)
        return ''
    }
}

// Extrait le texte d'un PDF via PDF.js
export async function extractTextFromPDF(file) {
    try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ''

        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) { // max 10 pages
            const page = await pdf.getPage(i)
            const content = await page.getTextContent()
            fullText += content.items.map(item => item.str).join(' ') + '\n'
        }

        return fullText.trim()
    } catch (e) {
        console.warn('Extraction PDF échouée:', e)
        return ''
    }
}

// Dispatcher principal selon le type
export async function extractText(file, fileType) {
    if (fileType === 'image') return extractTextFromImage(file)
    if (fileType === 'pdf')   return extractTextFromPDF(file)
    return '' // doc, video, audio → pas d'extraction client-side
}