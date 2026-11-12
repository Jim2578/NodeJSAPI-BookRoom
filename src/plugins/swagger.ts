import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import fp from 'fastify-plugin'

export default fp(async (app)=>{
    await app.register(swagger,{
        openapi: { info: {title: 'RoomBook', version: '1.0.0'}},
    })
    await app.register(swaggerUi, { routePrefix: '/docs'})
})