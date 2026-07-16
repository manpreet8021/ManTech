export function getYoutubeVideoId(url) {
  if (!url) return null

  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1)
    }

    if (parsed.searchParams.get('v')) {
      return parsed.searchParams.get('v')
    }

    const embedMatch = parsed.pathname.match(/\/embed\/([^/]+)/)
    if (embedMatch) return embedMatch[1]

    return null
  } catch {
    return null
  }
}

export function getYoutubeThumbnail(url) {
  const id = getYoutubeVideoId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

export function getYoutubeEmbedUrl(url) {
  const id = getYoutubeVideoId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}
