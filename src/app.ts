import Fastify from 'fastify'
import { roomsRoutes } from './routes/rooms.ts'
import { bookingsRoutes } from './routes/bookings.ts'
import logger from './plugins/logger.ts'
import { error } from 'node:console'
import swagger from './plugins/swagger.ts'

export const buildApp = () => {
    const app = Fastify({ logger: true})

    app.get('/health', async () => ({ status: 'ok'}))
    app.register(logger)
    app.register(swagger)
    app.register(error)
    app.register(roomsRoutes, { prefix: '/rooms'})
    app.register(bookingsRoutes, { prefix: '/bookings'})
    
    return app;
}
