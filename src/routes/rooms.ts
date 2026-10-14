import type { FastifyPluginAsync } from "fastify";
import { error } from "node:console";

type Room = { id: number; name: string; capacity: number}

const rooms: Room[] = [
    {id: 1, name: 'A101', capacity: 30},
    {id: 2, name: 'A204', capacity: 12},
]
let nextId = 3

export const roomsRoutes: FastifyPluginAsync = async (app) => {
    app.get('/', async => rooms)

    app.get<{Params: {id: string} }>('/:id', async (request, reply)=>{

        const room = rooms.find((r)=>r.id === Number(request.params.id))
        if (!room) return reply.code(404).send({error: 'Room not found'})
        return room
    })

    app.post<{Body: { name: string; capacity: number}}>('/', async(request, reply)=> {
        const room: Room = {id: nextId, ...request.body}
        rooms.push(room)
        nextId++
        return reply.code(201).send(room)
    })
}