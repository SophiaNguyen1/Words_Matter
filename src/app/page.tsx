'use client'

import { useState, useCallback } from 'react'
import { Button } from "@/app/components/ui/button"
import { Textarea } from "@/app/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert"
import { Loader2 } from 'lucide-react'

// Replace this with your actual OpenAI API key
const OPENAI_API_KEY = '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'

// Common problematic terms and their inclusive alternatives
const inclusiveReplacements: { [key: string]: string } = {
  'guys': 'everyone',
  'kill': 'stop',
  'crazy': 'intense',
  'insane': 'incredible',
  'man hours': 'person hours',
  'manpower': 'workforce',
  'chairman': 'chairperson',
  'mailman': 'mail carrier',
  'policeman': 'police officer',
  'fireman': 'firefighter',
  'stewardess': 'flight attendant',
  'mankind': 'humankind',
  'manned': 'staffed',
  'master': 'primary',
  'slave': 'secondary',
  'blacklist': 'blocklist',
  'whitelist': 'allowlist',
  'blind spot': 'unseen area',
  'grandfathered': 'legacy status',
}

export default function InclusivityChecker() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkInclusivity = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // First, apply predefined replacements
      let modifiedText = inputText.toLowerCase()
      Object.entries(inclusiveReplacements).forEach(([term, replacement]) => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi')
        modifiedText = modifiedText.replace(regex, replacement)
      })

      // Then, use AI to further improve inclusivity
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an AI assistant that helps make workplace communication more inclusive. Identify and suggest alternatives for any remaining non-inclusive language, focusing on gender-neutral terms and avoiding ableist, racist, or otherwise exclusionary language. Provide an improved version of the input text."
            },
            {
              role: "user",
              content: modifiedText
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch response from OpenAI')
      }

      const data = await response.json()
      setOutputText(data.choices[0].message.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [inputText])

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Workplace Inclusivity Checker</CardTitle>
          <CardDescription>Enter your text to check for non-inclusive language and get suggestions for more inclusive alternatives.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter your workplace communication here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={5}
            className="mb-4"
          />
          <Button onClick={checkInclusivity} disabled={isLoading || inputText.trim() === ''}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Check Inclusivity'
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {outputText && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Suggested Inclusive Version:</h3>
              <p className="text-sm text-gray-600">{outputText}</p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}