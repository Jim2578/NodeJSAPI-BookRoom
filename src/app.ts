import "dotenv/config"
import Fastify from 'fastify'
import { roomsRoutes } from './routes/rooms.ts'
import { bookingsRoutes } from './routes/bookings.ts'
import logger from './plugins/logger.ts'
import error from './plugins/errors.ts'
import swagger from './plugins/swagger.ts'
import prisma from './plugins/prisma.ts'
import { authsRoutes } from './routes/auths.ts'
import auths from './plugins/auths.ts'

export const buildApp = () => {
    const app = Fastify({ logger: true})
    app.register(error)
    app.register(prisma)
    app.get('/health', async () => ({ status: 'ok'}))
    app.register(logger)
    app.register(swagger)
    app.register(auths)
    app.register(roomsRoutes, { prefix: '/rooms'})
    app.register(bookingsRoutes, { prefix: '/bookings'})
    app.register(authsRoutes, {prefix: '/auths'} )
    
    return app;
}
