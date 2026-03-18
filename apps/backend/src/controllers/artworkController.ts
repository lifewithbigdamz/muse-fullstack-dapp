import { Request, Response } from 'express'
import { createError } from '@/middleware/errorHandler'

export const getArtworks = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', category, sort } = req.query
    
    const artworks = [
      {
        id: '1',
        title: 'AI Artwork #1',
        description: 'Generated with AI Model',
        imageUrl: 'https://example.com/image1.jpg',
        price: '0.1',
        currency: 'ETH',
        creator: '0x1234...5678',
        createdAt: new Date().toISOString(),
        category: 'abstract',
      },
      {
        id: '2',
        title: 'AI Artwork #2',
        description: 'Generated with AI Model',
        imageUrl: 'https://example.com/image2.jpg',
        price: '0.15',
        currency: 'ETH',
        creator: '0x8765...4321',
        createdAt: new Date().toISOString(),
        category: 'portrait',
      },
    ]

    res.json({
      success: true,
      data: artworks,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: artworks.length,
      },
    })
  } catch (error) {
    const err = createError('Failed to fetch artworks', 500)
    next(err)
  }
}

export const getArtworkById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const artwork = {
      id,
      title: `AI Artwork #${id}`,
      description: 'Generated with AI Model',
      imageUrl: `https://example.com/image${id}.jpg`,
      price: '0.1',
      currency: 'ETH',
      creator: '0x1234...5678',
      createdAt: new Date().toISOString(),
      category: 'abstract',
      prompt: 'A futuristic cityscape at sunset with flying cars and neon lights',
      aiModel: 'Stable Diffusion v2.1',
    }

    res.json({
      success: true,
      data: artwork,
    })
  } catch (error) {
    const err = createError('Failed to fetch artwork', 500)
    next(err)
  }
}

export const createArtwork = async (req: Request, res: Response) => {
  try {
    const { title, description, imageUrl, price, prompt, aiModel } = req.body
    
    const artwork = {
      id: Date.now().toString(),
      title,
      description,
      imageUrl,
      price,
      currency: 'ETH',
      creator: '0x1234...5678',
      createdAt: new Date().toISOString(),
      category: 'ai-generated',
      prompt,
      aiModel,
    }

    res.status(201).json({
      success: true,
      data: artwork,
    })
  } catch (error) {
    const err = createError('Failed to create artwork', 500)
    next(err)
  }
}
