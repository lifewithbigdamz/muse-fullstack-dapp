import { Request, Response } from 'express'
import { createError } from '@/middleware/errorHandler'

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = {
      address: '0x1234...5678',
      username: 'Artist Name',
      bio: 'Digital artist exploring AI-generated artwork',
      profileImage: 'https://example.com/profile.jpg',
      stats: {
        created: 24,
        collected: 156,
        favorites: 89,
      },
      createdAt: new Date().toISOString(),
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    const err = createError('Failed to fetch user profile', 500)
    next(err)
  }
}

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { username, bio, profileImage } = req.body
    
    const updatedUser = {
      address: '0x1234...5678',
      username: username || 'Artist Name',
      bio: bio || 'Digital artist exploring AI-generated artwork',
      profileImage: profileImage || 'https://example.com/profile.jpg',
      stats: {
        created: 24,
        collected: 156,
        favorites: 89,
      },
      updatedAt: new Date().toISOString(),
    }

    res.json({
      success: true,
      data: updatedUser,
    })
  } catch (error) {
    const err = createError('Failed to update user profile', 500)
    next(err)
  }
}
