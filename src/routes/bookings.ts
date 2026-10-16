import { Type, TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyPluginAsync } from "fastify";
import { Booking, BookingBody } from "../schema/booking.ts";
import { HttpError } from "../plugins/errors.ts";


type Booking = { 
    id: number; 
    idRoom: number; 
    idUser: number; 
    startsAt: string;
    endsAt: string;
}

let bookings: Booking[] = []
let nextId = 1

export const bookingsRoutes: FastifyPluginAsync = async (app) => {
    const typed = app.withTypeProvider<TypeBoxTypeProvider>()

    typed.get('/', {}, async (request, response) => {
        return bookings
    })

    typed.get('/:id', 
    {
        schema: {
            params: Type.Object({
                id: Type.String({minLength: 1})
            }),
            response: {
                200: Booking,
                404: Type.Object({
                    error: Type.String()
                })
            }
        }
    }, async(request, reply)=> {
        const {id} = request.params
        const booking = bookings.find((r)=>r.id === Number(id))
        if (!booking) throw new HttpError(404, 'Booking not found')
        return booking
    })

    typed.post('/', {schema: { body: BookingBody }}, async(request, reply)=>{
        const {endsAt, idRoom, idUser, startsAt} = request.body
        const booking: Booking = {
            id: nextId,
            idRoom,
            endsAt,
            startsAt,
            idUser
        }
        bookings.push(booking)
        nextId++
        return reply.code(201).send(booking)
    })

    app.delete<{Params: {id: string}}>('/:id', async(request, reply)=>{
        const booking = bookings.find((r)=>r.id === Number(request.params.id))
        if (!booking) throw new HttpError(404, 'Booking not found')
        bookings = bookings.filter((r)=>r.id !== Number(request.params.id))
        return reply.code(200).send(booking)
    })

    typed.patch('/:id',{
        schema: {
            params: Type.Object({
                id: Type.String({ minLength: 1})
            }),
            body: Type.Partial(BookingBody),
            response: {
                200: Booking,
                404: Type.Object({
                    error: Type.String()
                })
            }
        }
    }, async(request, reply) =>{
        const {id} = request.params
        const booking = bookings.find((r)=>r.id === Number(id))
        if (!booking) {
            throw new HttpError(404, 'Booking not found')
        }
        Object.assign(booking, request.body)
        return booking
    })
}