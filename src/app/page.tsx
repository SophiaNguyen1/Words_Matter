'use client'
import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Button } from "@/app/components/ui/button"
import { Textarea } from "@/app/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert"
import { Loader2 } from 'lucide-react'

type Language = 'en' | 'es' | 'fr';

const inclusiveReplacements: Record<Language, Record<string, string>> = {
  en: {
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
  },
  es: {
    'chicos': 'todos',
    'matar': 'detener',
    'loco': 'intenso',
    'insano': 'increíble',
    'horas hombre': 'horas persona',
    'mano de obra': 'fuerza laboral',
    'presidente': 'presidenta',
    'cartero': 'cartera',
    'policía': 'oficial de policía',
    'bombero': 'bombera',
    'azafata': 'asistente de vuelo',
    'humanidad': 'humanidad',
    'tripulado': 'tripulada',
    'maestro': 'primario',
    'esclavo': 'secundario',
    'lista negra': 'lista de bloqueo',
    'lista blanca': 'lista de permitidos',
    'punto ciego': 'área no vista',
    'abuelo': 'estado heredado',
  },
  fr: {
    'les gars': 'tout le monde',
    'tuer': 'arrêter',
    'fou': 'intense',
    'insensé': 'incroyable',
    'heures homme': 'heures personne',
    'main-d\'œuvre': 'effectif',
    'président': 'présidente',
    'facteur': 'factrice',
    'policier': 'agent de police',
    'pompier': 'sapeur-pompier',
    'hôtesse de l\'air': 'agent de bord',
    'humanité': 'humanité',
    'habité': 'occupé',
    'maître': 'principal',
    'esclave': 'secondaire',
    'liste noire': 'liste de blocage',
    'liste blanche': 'liste d\'autorisation',
    'angle mort': 'zone non visible',
    'grand-père': 'statut hérité',
  }
}

function matchCase(text: string, pattern: string) {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i)
    const patternChar = pattern.charAt(i)
    if (patternChar === patternChar.toUpperCase()) {
      result += char.toUpperCase()
    } else {
      result += char.toLowerCase()
    }
  }
  return result
}

export default function InclusivityChecker() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inclusivityScore, setInclusivityScore] = useState<number | null>(null)
  const [language, setLanguage] = useState('en')

  const checkInclusivity = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setInclusivityScore(null)

    try {
      let modifiedText = inputText
      let nonInclusiveCount = 0
      const replacements = inclusiveReplacements[language as Language]

      // Split inputText into words for processing
      const words = inputText.split(/\b/)

      // Iterate over each word in the input
      modifiedText = words.map((word) => {
        // Check if the word needs to be replaced
        const replacement = replacements[word.toLowerCase()]

        if (replacement) {
          nonInclusiveCount++
          // If replacement exists, use the replacement word
          return replacement
        } else {
          // If no replacement, preserve the case of the word using matchCase
          return matchCase(word, word)
        }
      }).join('')

      // Calculate inclusivity score
      const totalWords = words.filter(word => word.trim()).length // Count actual words (ignore spaces and punctuation)
      const score = totalWords === 0 ? 0 : Math.max(0, 100 - (nonInclusiveCount / totalWords) * 100)
      setInclusivityScore(score)

      setOutputText(modifiedText)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [inputText, language])

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-500'
    if (score >= 80) return 'text-green-500'
    if (score >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-center mb-4">
        <Image src="/logo.jpg" alt="Logo" width={150} height={150} />
      </div>
      <div className="flex justify-center mb-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border rounded-md p-2 text-black"
        >
          <option value="en" className="text-black">English</option>
          <option value="es" className="text-black">Spanish</option>
          <option value="fr" className="text-black">French</option>
        </select>
      </div>
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
          {inclusivityScore !== null && (
            <div className={`mt-4 text-lg font-semibold ${getScoreColor(inclusivityScore)}`}>
              Inclusivity Score: {inclusivityScore.toFixed(2)} / 100
            </div>
          )}
          {outputText && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Suggested Inclusive Version:</h3>
              <p className="text-sm text-white whitespace-pre-wrap">{outputText}</p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}