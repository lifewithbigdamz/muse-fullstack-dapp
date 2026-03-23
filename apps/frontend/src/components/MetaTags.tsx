import { useEffect } from 'react'

interface MetaTagsProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
  siteName?: string
  twitterCard?: string
  twitterSite?: string
  additionalTags?: Record<string, string>
}

export const MetaTags = ({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName = 'Muse - AI Art Marketplace',
  twitterCard = 'summary_large_image',
  twitterSite = '@museartmarket',
  additionalTags = {},
}: MetaTagsProps) => {
  useEffect(() => {
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: string) => {
      let tag: HTMLMetaElement | null = document.querySelector(
        property ? `meta[property="${property}"]` : `meta[name="${name}"]`
      )
      
      if (!tag) {
        tag = document.createElement('meta')
        if (property) {
          tag.setAttribute('property', property)
        } else {
          tag.setAttribute('name', name)
        }
        document.head.appendChild(tag)
      }
      
      tag.setAttribute('content', content)
    }

    // Update title
    if (title) {
      document.title = title
    }

    // Update basic meta tags
    if (description) {
      updateMetaTag('description', description)
    }

    // Update Open Graph tags
    if (title) updateMetaTag('og:title', title, 'og:title')
    if (description) updateMetaTag('og:description', description, 'og:description')
    if (image) updateMetaTag('og:image', image, 'og:image')
    if (url) updateMetaTag('og:url', url, 'og:url')
    updateMetaTag('og:type', type, 'og:type')
    updateMetaTag('og:site_name', siteName, 'og:site_name')

    // Update Twitter Card tags
    updateMetaTag('twitter:card', twitterCard)
    updateMetaTag('twitter:site', twitterSite)
    if (title) updateMetaTag('twitter:title', title)
    if (description) updateMetaTag('twitter:description', description)
    if (image) updateMetaTag('twitter:image', image)

    // Update additional custom tags
    Object.entries(additionalTags).forEach(([key, value]) => {
      updateMetaTag(key, value)
    })

    // Cleanup function to remove tags when component unmounts
    return () => {
      // Optionally clean up custom tags if needed
    }
  }, [title, description, image, url, type, siteName, twitterCard, twitterSite, additionalTags])

  return null // This component doesn't render anything
}
