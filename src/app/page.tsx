'use client'

import { useState, useCallback } from 'react'
import { Button } from "@/app/components/ui/button"
import { Textarea } from "@/app/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert"
import { Loader2 } from 'lucide-react'

// Replace this with your actual Hugging Face API key
const HUGGINGFACE_API_KEY = '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'

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

      // Then, use Hugging Face Inference API to further improve inclusivity
      const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`
        },
        body: JSON.stringify({
          inputs: modifiedText,
          parameters: {
            max_length: 500,
            min_length: 100,
            do_sample: false
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch response from Hugging Face')
      }

      const data = await response.json()
      setOutputText(data[0].summary_text)
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
              <p className="text-sm text-white">{outputText}</p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}