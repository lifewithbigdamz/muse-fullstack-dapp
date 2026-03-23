import { Router } from 'express'
import { getArtworkMetadata } from '@/controllers/metadataController'

const router = Router()

router.get('/artwork/:id', getArtworkMetadata)

export default router
