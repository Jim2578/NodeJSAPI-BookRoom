import Fastify from 'fastify'
import { roomsRoutes } from './routes/rooms.ts'
import { bookingsRoutes } from './routes/bookings.ts'

export const buildApp = () => {
    const app = Fastify({ logger: true})

    app.get('/health', async () => ({ status: 'ok'}))
    app.register(roomsRoutes, { prefix: '/rooms'})
    app.register(bookingsRoutes, { prefix: '/bookings'})
    
    return app;
}
