import { useQuery } from '@tanstack/react-query'

interface MetadataResponse {
  success: boolean
  data: {
    title: string
    description: string
    image: string
    url: string
    type: string
    siteName: string
    twitterCard: string
    twitterSite: string
    additionalTags: Record<string, string>
  }
}

export const useArtworkMetadata = (artworkId: string) => {
  return useQuery<MetadataResponse>({
    queryKey: ['metadata', artworkId],
    queryFn: async () => {
      const response = await fetch(`/api/metadata/artwork/${artworkId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch artwork metadata')
      }
      return response.json()
    },
    enabled: !!artworkId,
  })
}
