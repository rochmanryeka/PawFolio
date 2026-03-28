import type { TransactionType } from '@/types'

interface ParsedTransaction {
  type: TransactionType
  amount: number
  name: string
  date: string
  category: string
  description?: string
}

export async function parseTransactionWithAI(
  input: string,
  apiKey: string,
  categories: { name: string; type: TransactionType }[]
): Promise<ParsedTransaction | null> {
  if (!apiKey) return null

  const categoryList = categories.map(c => `${c.name} (${c.type})`).join(', ')
  const today = new Date().toISOString().split('T')[0]

  const prompt = `You are a financial transaction parser. Parse the following natural language input into a structured transaction.

Available categories: ${categoryList}

Today's date: ${today}

Rules:
- Determine if it's income or expense from context
- Extract the amount (number only)
- Extract a short name/title
- Determine the best matching category from the list
- Extract date if mentioned, otherwise use today
- Extract description if any additional details exist
- Return ONLY valid JSON, no other text

Input: "${input}"

Return JSON format:
{"type": "income|expense", "amount": number, "name": "string", "date": "YYYY-MM-DD", "category": "category name", "description": "optional string or null"}`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a helpful financial assistant that parses transaction descriptions. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 256,
      }),
    })

    if (!response.ok) {
      console.error('Groq API error:', response.status)
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content?.trim()
    
    if (!content) return null

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0])
    
    return {
      type: parsed.type === 'income' ? 'income' : 'expense',
      amount: Math.abs(Number(parsed.amount)) || 0,
      name: String(parsed.name || ''),
      date: parsed.date || today,
      category: String(parsed.category || ''),
      description: parsed.description || undefined,
    }
  } catch (error) {
    console.error('Failed to parse transaction with AI:', error)
    return null
  }
}
