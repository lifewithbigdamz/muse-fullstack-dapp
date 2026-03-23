import { Request, Response, NextFunction } from 'express'
import { createError } from '@/middleware/errorHandler'

export const getArtworkMetadata = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    
    // Mock artwork data - in real app this would come from database
    const artwork = {
      id,
      title: `AI Artwork #${id}`,
      description: 'Generated with AI Model - A unique piece from the Muse AI Art Marketplace',
      imageUrl: `https://example.com/image${id}.jpg`,
      price: '0.1',
      currency: 'ETH',
      creator: '0x1234...5678',
      createdAt: new Date().toISOString(),
      category: 'abstract',
      prompt: 'A futuristic cityscape at sunset with flying cars and neon lights',
      aiModel: 'Stable Diffusion v2.1',
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const artworkUrl = `${baseUrl}/artwork/${id}`

    const metadata = {
      title: `${artwork.title} - Muse AI Art Marketplace`,
      description: `${artwork.description} | Price: ${artwork.price} ${artwork.currency} | Created with ${artwork.aiModel}`,
      image: artwork.imageUrl,
      url: artworkUrl,
      type: 'website',
      siteName: 'Muse - AI Art Marketplace',
      twitterCard: 'summary_large_image',
      twitterSite: '@museartmarket',
      additionalTags: {
        'art:category': artwork.category,
        'art:price': `${artwork.price} ${artwork.currency}`,
        'art:creator': artwork.creator,
        'art:ai_model': artwork.aiModel,
        'art:prompt': artwork.prompt,
      }
    }

    res.json({
      success: true,
      data: metadata,
    })
  } catch (error) {
    const err = createError('Failed to fetch artwork metadata', 500)
    next(err)
  }
}
