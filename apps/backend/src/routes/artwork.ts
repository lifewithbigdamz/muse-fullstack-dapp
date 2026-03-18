import { Router } from 'express'
import { getArtworks, getArtworkById, createArtwork } from '@/controllers/artworkController'

const router = Router()

router.get('/', getArtworks)
router.get('/:id', getArtworkById)
router.post('/', createArtwork)

export default router
