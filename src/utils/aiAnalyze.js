// ─── Analyse IA via Claude API ───
// Génère un résumé + des tags automatiques depuis le texte extrait

export async function analyzeWithAI(text, fileName) {
    if (!text || text.length < 30) return { summary: '', aiTags: [] }

    // Tronque à 3000 caractères max pour ne pas dépasser le contexte
    const truncated = text.slice(0, 3000)

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 400,
                messages: [{
                    role: 'user',
                    content: `Tu es un assistant qui analyse des fichiers. Voici le contenu extrait du fichier "${fileName}":

${truncated}

Réponds UNIQUEMENT en JSON valide avec ce format exact (sans markdown, sans backticks) :
{
  "summary": "résumé en 1-2 phrases maximum",
  "aiTags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Les tags doivent être en minuscules, pertinents et utiles pour retrouver ce fichier.`
                }]
            })
        })

        const data = await response.json()
        const raw = data.content?.[0]?.text || '{}'
        const clean = raw.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)

        return {
            summary: parsed.summary || '',
            aiTags: Array.isArray(parsed.aiTags) ? parsed.aiTags.slice(0, 5) : []
        }
    } catch (e) {
        console.warn('Analyse IA échouée:', e)
        return { summary: '', aiTags: [] }
    }
}