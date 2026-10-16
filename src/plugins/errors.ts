import { FastifyError } from 'fastify'
import fp from 'fastify-plugin'


export default fp(async (app)=>{
    app.setErrorHandler((error: FastifyError, request, reply) => {
        if (error.validation || (error.statusCode && error.statusCode < 500)){
            return reply.send(error)
        }
        request.log.error(error)
        reply.status(500).send({ 
            statusCode: 500, 
            error: 'Internal Server Error', 
            message: 'Erreur interne'
        })
    })
})

export class HttpError extends Error {
    constructor(public statusCode: number, message: string){
        super(message)
    }
}