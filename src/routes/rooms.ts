import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import {Type} from "typebox"
import type { FastifyPluginAsync } from "fastify";
import { Room, RoomBody, RoomType } from "../schema/room.ts"
import { error } from "node:console";
import { HttpError } from "../plugins/errors.ts";
import prisma from "../plugins/prisma.ts";

export const roomsRoutes: FastifyPluginAsync = async (app) => {

    const typed = app.withTypeProvider<TypeBoxTypeProvider>()
    const {prisma} = app
    typed.get('/', {
        schema: {
            tags: ['Rooms'], 
            security: [{ touken: [] }],
            querystring: Type.Object({
                minCapacity: Type.Optional(Type.Integer({minimum:1}))
            },
            {
                additionalProperties: false
            }),
        }
    }, async (request, response) => {
        return prisma.room.findMany({
            where:{
                capacity: {
                    gte : request.query.minCapacity
                }
            }
        })

    })

    typed.get('/:id', 
    {
        schema: {
            tags: ['Rooms'], 
            params: Type.Object({
                id: Type.String({minLength: 1})
            }),
            response: {
                200: Room,
                404: Type.Object({
                    error: Type.String()
                })
            }
        },
        onRequest: [app.requireRole("ADMIN")]
    }, async(request, reply)=> {
        const room = await prisma.room.findUnique({
            where: { 
                id: Number(request.params.id),
            }
        });
        if (!room) throw new HttpError(404, 'Room not found');
        return room;
    })

    typed.post('/', {schema: { tags: ['Rooms'], body: RoomBody }}, async(request, reply)=>{
        const room = await prisma.room.create({
            data: request.body
        })
        return reply.code(201).send(room)
    })

    typed.delete('/:id', {
        schema: {
            tags: ['Rooms'], 
            params: Type.Object({
                id: Type.String({ minLength: 1 })
            }),
            response: {
                200: Type.Array(Room),
                404: Type.Object({
                    error: Type.String()
                })
            }
        }
    }, async (request, reply) => {
        const room = await prisma.room.delete({
            where: {
                id: Number(request.params.id)
            }
        })
        if (!room) throw new HttpError(404, 'Room not found');

    });

    typed.patch('/:id',{
        schema: {
            tags: ['Rooms'], 
            params: Type.Object({
                id: Type.String({ minLength: 1})
            }),
            body: Type.Partial(RoomBody),
            response: {
                200: Room,
                404: Type.Object({
                    error: Type.String()
                })
            }
        }
    }, async(request, reply) =>{
        return await prisma.room.update({
            where :{
                id: Number(request.params.id)
            },
            data: request.body
        })
    })
}