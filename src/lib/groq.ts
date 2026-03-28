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

  const incomeCategories = categories.filter(c => c.type === 'income').map(c => c.name)
  const expenseCategories = categories.filter(c => c.type === 'expense').map(c => c.name)
  const today = new Date().toISOString().split('T')[0]

  const prompt = `You are a financial transaction parser. Parse the following natural language input into a structured transaction.

Income categories (use EXACTLY one of these names if income): ${incomeCategories.join(', ')}
Expense categories (use EXACTLY one of these names if expense): ${expenseCategories.join(', ')}

Today's date: ${today}

Rules:
- Determine if it's income or expense from context
- Extract the amount (number only, no currency symbols)
- Extract a short name/title for the transaction
- Choose the BEST matching category from the list above — use the EXACT name, do not invent new categories
- Extract date if mentioned (format: YYYY-MM-DD), otherwise use today
- Extract description if any additional details exist
- Return ONLY valid JSON, no markdown, no extra text
- name always captialized first letter, category must match exactly from list, date in YYYY-MM-DD format, amount as full integer (no decimals)

- Currency Normalization: 
  - If the input uses "rb", "k", or "ribu", multiply the number by 1,000 (e.g., 50rb = 50000).
  - If the input uses "jt" or "juta", multiply the number by 1,000,000 (e.g., 1.5jt = 1500000).
  - Remove all dots (.) used as thousand separators and replace commas (,) with dots for decimals if necessary.
  - The final "amount" must be the full integer value.

Input: "${input}"

Return JSON:
{"type": "income|expense", "amount": number, "name": "string", "date": "YYYY-MM-DD", "category": "exact category name from list", "description": "optional string or null"}`

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
