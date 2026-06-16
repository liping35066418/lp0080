import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import { configManager } from './configManager.js'
import { particleEngine } from './particleEngine.js'
import { signScheduler } from './signScheduler.js'
import { wsService } from './wsService.js'

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/auth', authRoutes)

app.use(
  '/api/health',
  (_req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
      wsClients: wsService.getClientCount(),
    })
  },
)

app.get('/api/config', (req: Request, res: Response) => {
  res.json({ success: true, data: configManager.get() })
})

app.post('/api/config', (req: Request, res: Response) => {
  const config = configManager.update(req.body || {})
  res.json({ success: true, data: config })
})

app.post('/api/sign', (req: Request, res: Response) => {
  const name = req.body?.name as string | undefined
  const event = signScheduler.triggerSign(name)
  res.json({ success: true, data: event })
})

app.post('/api/reset', (req: Request, res: Response) => {
  particleEngine.reset()
  signScheduler.reset()
  signScheduler.stop()
  res.json({ success: true })
})

app.get('/api/stats', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      signCount: particleEngine.getSignCount(),
      activeParticles: particleEngine.getActiveParticles().length,
      settledCount: particleEngine.getSettledCount(),
    },
  })
})

/**
 * error handler middleware
 */
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
