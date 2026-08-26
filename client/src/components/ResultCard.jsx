export default function ResultCard({ result }) {
  if (!result) return null

  return (
    <div className="result-card">
      <div className="result-card__header">
        <h2>Result</h2>
        <span className={`badge badge--${result.complexity.toLowerCase()}`}>
          {result.complexity} complexity
        </span>
      </div>

      <dl className="result-card__fields">
        <dt>Summary</dt>
        <dd>{result.summary}</dd>

        <dt>Key messaging</dt>
        <dd>{result.keyMessaging}</dd>

        <dt>Recommended format</dt>
        <dd>{result.recommendedFormat}</dd>

        <dt>Routing decision</dt>
        <dd className="routing">{result.routingDecision}</dd>
      </dl>

      <details>
        <summary>Raw JSON</summary>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </details>
    </div>
  )
}
