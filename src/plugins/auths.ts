import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import "dotenv"
import { FastifyRequest } from "fastify";
import { HttpError } from "./errors.ts";

export type Role =  "STUDENT" | "ADMIN"

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload : { sub: string; role: string };
        user: { sub: string; role: string};
    }
}

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (req: FastifyRequest) => Promise<void>
        requireRole: (role: Role) => (req: FastifyRequest) => Promise<void>
    }
}

export default fp(async (app)=>{
    const secret = process.env.JWT_SECRET
    if(!secret) throw new Error('JWT_SECRET manquant')
    app.register(jwt, { secret, sign: {expiresIn: "1h"}})
    app.decorate("authenticate", async(req: FastifyRequest) => {
        try {
            await req.jwtVerify()
        } catch (error) {
            throw new HttpError(401, 'Authentification requise')
        }
    })
    app.decorate("requireRole", (role: Role) => async(req: FastifyRequest)=> {
        if(req.user.role !== role) throw new HttpError(403, "Premission insuffisante")
    })
})
