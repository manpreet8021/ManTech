import { useState } from 'react'
import Modal from './Modal'
import { getYoutubeVideoId } from '../utils/youtube'

export default function AddVideoModal({ open, onClose, onAdd }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [pdfFile, setPdfFile] = useState(null)

  const urlLooksValid = url === '' || getYoutubeVideoId(url) != null

  const reset = () => {
    setName('')
    setUrl('')
    setPdfFile(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!getYoutubeVideoId(url)) return

    // TODO: replace with a real RTK Query mutation, sending multipart/form-data
    // (name, url, pdf file) to the Node backend, e.g. addVideo(formData)
    onAdd({ name, url, pdf_name: pdfFile?.name ?? null })
    reset()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add a video">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="video-name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Video title
          </label>
          <input
            id="video-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Chapter 3 — Trigonometry Basics"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="video-url" className="mb-1.5 block text-sm font-medium text-slate-700">
            YouTube URL
          </label>
          <input
            id="video-url"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
              urlLooksValid
                ? 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
                : 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
            }`}
          />
          {!urlLooksValid && (
            <p className="mt-1 text-xs text-rose-500">That doesn't look like a valid YouTube URL.</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Lecture notes (PDF) <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <label
            htmlFor="video-pdf"
            className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600"
          >
            <span className="truncate">{pdfFile ? pdfFile.name : 'Choose a PDF file'}</span>
            <span className="ml-2 shrink-0 text-xs font-medium text-indigo-600">Browse</span>
          </label>
          <input
            id="video-pdf"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!url || !urlLooksValid}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Add video
          </button>
        </div>
      </form>
    </Modal>
  )
}
