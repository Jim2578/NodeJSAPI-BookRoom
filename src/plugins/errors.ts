import { FastifyError } from 'fastify'
import fp from 'fastify-plugin'
import { error } from 'node:console'
import { Prisma } from '../generated/prisma/client.ts'
import { PrismaClient } from '@prisma/client/extension'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'


export default fp(async (app)=>{

    const prismaErrors = {
        P2002 : {statusCode : 409, error: 'Conflict', message: 'Cette valeur existe deja'},
        P2003 : {statusCode : 409, error: 'Conflict', message: 'Cette ressource et référencée ailleurs'},
        P2025 : {statusCode : 409, error: 'Conflict', message: 'Ressource introuvable'}
    }


    app.setErrorHandler((error: FastifyError, request, reply) => {
        if (error.validation || (error.statusCode && error.statusCode < 500)){
            return reply.send(error)
        }
        //console.log("LUUUUUUUUUUUUUUUUUUUUUUUUCAAS" + `${error}`);
        
        if(error instanceof PrismaClientKnownRequestError && error.code in prismaErrors ){
            const {statusCode, ...rest} = prismaErrors[error.code as keyof typeof prismaErrors]
            return reply.code(statusCode).send({statusCode, ...rest});
        }
        request.log.error(error)
        reply.status(500).send({ 
            statusCode: 500, 
            error: 'Internal Server Error', 
            message: error
        })
    })
})

export class HttpError extends Error {
    constructor(public statusCode: number, message: string){
        super(message)
    }
}