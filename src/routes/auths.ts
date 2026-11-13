import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyPluginAsync } from "fastify";
import argon2 from "argon2";
import Type from "typebox"
import { Http2ServerRequest } from "node:http2";
import { HttpError } from "../plugins/errors.ts";

const Credentials = Type.Object({
    email: Type.String({format: "email"}),
    password: Type.String({minLength: 8})
})

export const authsRoutes: FastifyPluginAsync = async (app) => {
    const typed = app.withTypeProvider<TypeBoxTypeProvider>();
    const {prisma} = app;

    typed.post('/register', {
        schema:{
            body: Credentials
        }
    }, async (response, reply)=>{
            const passwordHash = await argon2.hash(response.body.password)
            const user = await prisma.user.create({
                data: {
                    email: response.body.email,
                    passwordHash
                },
                select: {
                    id: true,
                    email: true,
                    role: true
                }
            })
            return reply.code(201).send(user)
        }
    )
    typed.post('/login', {
        schema:{
            body: Credentials
        }
    }, async(request) => {
        const user = await prisma.user.findUnique({
            where: {
                email: request.body.email
            }
        })
        const ok = user && (await argon2. verify(user.passwordHash, request.body.password))
        if (!user || !ok) throw new HttpError (401, 'Identifiants invalides !')
        const token = app.jwt.sign({sub: String(user.id), role: user.role})
        return { token };
    })
}