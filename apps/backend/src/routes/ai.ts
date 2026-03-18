import { Router } from 'express'
import { generateImage, getGenerationStatus } from '@/controllers/aiController'

const router = Router()

router.post('/generate', generateImage)
router.get('/status/:id', getGenerationStatus)

export default router
