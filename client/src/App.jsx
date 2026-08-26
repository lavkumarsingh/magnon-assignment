import { useState } from 'react'
import RequestForm from './components/RequestForm'
import ResultCard from './components/ResultCard'
import './App.css'

function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (title, description) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const res = await fetch(`${baseUrl}/api/processWithLLM`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error ?? 'Request failed')
      }
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header>
        <h1>AI Workflow Assistant</h1>
        <p className="subtitle">
          Submit a content request. It is summarized by an LLM, scored for
          complexity, and routed to the right reviewer.
        </p>
      </header>

      <RequestForm onSubmit={handleSubmit} loading={loading} />

      {loading && <p className="status">Processing with the LLM…</p>}
      {error && <p className="error">{error}</p>}

      <ResultCard result={result} />
    </div>
  )
}

export default App
