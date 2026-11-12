import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import {Type} from "typebox"
import type { FastifyPluginAsync } from "fastify";
import { Room, RoomBody, RoomType } from "../schema/room.ts"
import { error } from "node:console";
import { HttpError } from "../plugins/errors.ts";
import prisma from "../plugins/prisma.ts";

//type Room = { id: number; name: string; capacity: number}

let rooms: RoomType[] = [
    {id: 1, name: 'A101', capacity: 30},
    {id: 2, name: 'A204', capacity: 12},
]
let nextId = 3

export const roomsRoutes: FastifyPluginAsync = async (app) => {

    const typed = app.withTypeProvider<TypeBoxTypeProvider>()
    const {prisma} = app
    typed.get('/', {
        schema: {
            tags: ['Rooms'], 
            querystring: Type.Object({
                minCapacity: Type.Optional(Type.Integer({minimum:1}))
            },
            {
                additionalProperties: false
            })
        }
    }, async (request, response) => {
        return prisma.room.findMany({
            where:{
                capacity: {
                    gte : request.query.minCapacity
                }
            }
        })
        // const {minCapacity} = request.query
        // if (minCapacity) {
        //     return rooms.filter((r=> r.capacity >= minCapacity))
        // }else{
        //     return rooms
        // }
    })
    // app.get('/', async => rooms)



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
        }
    }, async(request, reply)=> {
        const {id} = request.params
        const room = rooms.find((r)=>r.id === Number(id))
        if (!room) throw new HttpError(404, 'Room not found')
        // return reply.code(404).send({error: 'Room not found'})
        return room
    })

    // app.get<{Params: {id: string} }>('/:id', async (request, reply)=>{

    //     const room = rooms.find((r)=>r.id === Number(request.params.id))
    //     if (!room) return reply.code(404).send({error: 'Room not found'})
    //     return room
    // })
    typed.post('/', {schema: { tags: ['Rooms'], body: RoomBody }}, async(request, reply)=>{
        const {capacity, name} = request.body
        const room: RoomType = {
            id: nextId,
            name,
            capacity
        }
        rooms.push(room)
        nextId++
        return reply.code(201).send(room)
    })

    // app.post<{Body: { name: string; capacity: number}}>('/', async(request, reply)=> {
    //     const room: Room = {id: nextId, ...request.body}
    //     rooms.push(room)
    //     nextId++
    //     return reply.code(201).send(room)
    // })

    // app.delete<{Params: {id: string}}>('/:id', async(request, reply)=>{
    //     const room = rooms.find((r)=>r.id === Number(request.params.id))
    //     if (!room) throw new HttpError(404, 'Room not found')
    //     rooms = rooms.filter((r)=>r.id !== Number(request.params.id))
    //     return reply.code(200).send(rooms)
    // })

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
        const room = rooms.find((r) => r.id === Number(request.params.id));
        if (!room) throw new HttpError(404, 'Room not found');
        rooms = rooms.filter((r) => r.id !== Number(request.params.id));
        return reply.code(200).send(rooms);
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
        const {id} = request.params
        const room = rooms.find((r)=>r.id === Number(id))
        if (!room) {
            throw new HttpError(404, 'Room not found')
        }
        Object.assign(room, request.body)
        return room
    })
}