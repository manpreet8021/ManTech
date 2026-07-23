import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const blockComponents = {
  h1: ({ children }) => (
    <h3 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-indigo-600 first:mt-0">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-indigo-600 first:mt-0">{children}</h3>
  ),
  h3: ({ children }) => <h4 className="mb-1.5 mt-4 text-sm font-semibold text-slate-800">{children}</h4>,
  p: ({ children }) => <p className="mb-3 text-sm leading-relaxed text-slate-700 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 ml-4 list-disc space-y-1 text-sm leading-relaxed text-slate-700">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal space-y-1 text-sm leading-relaxed text-slate-700">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
  code: ({ children }) => <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs text-slate-800">{children}</code>,
}

// Same styling, but without the block-level <p> wrapper, so this can be
// dropped inline (e.g. right after "1. ") without invalid <p> nesting.
const inlineComponents = {
  ...blockComponents,
  p: ({ children }) => <>{children}</>,
}

export default function MarkdownContent({ text, inline = false }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={inline ? inlineComponents : blockComponents}>
      {text}
    </ReactMarkdown>
  )
}
