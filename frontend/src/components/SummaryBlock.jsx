function parseSummary(text) {
  const lines = text.split('\n')
  const sections = []
  let current = null

  for (const line of lines) {
    const heading = line.match(/^##\s+(.*)/)
    if (heading) {
      current = { title: heading[1].trim(), body: [] }
      sections.push(current)
    } else if (line.trim()) {
      if (!current) {
        current = { title: null, body: [] }
        sections.push(current)
      }
      current.body.push(line.trim())
    }
  }

  return sections
}

export default function SummaryBlock({ text }) {
  const sections = parseSummary(text)

  return (
    <div className="space-y-6">
      {sections.map((section, i) => (
        <div key={i}>
          {section.title && (
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-600">
              {section.title}
            </h3>
          )}
          {section.body.map((line, j) =>
            line.startsWith('- ') ? (
              <p key={j} className="ml-4 text-sm leading-relaxed text-slate-700 before:mr-2 before:content-['•']">
                {line.slice(2)}
              </p>
            ) : (
              <p key={j} className="text-sm leading-relaxed text-slate-700">
                {line}
              </p>
            ),
          )}
        </div>
      ))}
    </div>
  )
}
