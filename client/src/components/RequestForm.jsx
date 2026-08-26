import { useState } from 'react'

export default function RequestForm({ onSubmit, loading }) {
  const [title, setTitle] = useState('Customer Success Story')
  const [description, setDescription] = useState(
    'Retail customer adopting Adobe Experience Cloud',
  )

  const canSubmit = title.trim() && description.trim() && !loading

  return (
    <form
      className="request-form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(title, description)
      }}
    >
      <label>
        <span>Title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          placeholder="Customer Success Story"
        />
      </label>

      <label>
        <span>Description</span>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          placeholder="Retail customer adopting Adobe Experience Cloud"
        />
      </label>

      <button type="submit" disabled={!canSubmit}>
        {loading ? 'Processing…' : 'Submit Request'}
      </button>
    </form>
  )
}
