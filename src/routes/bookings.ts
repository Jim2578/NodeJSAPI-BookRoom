import { Type, TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyPluginAsync } from "fastify";
import { Booking, BookingBody } from "../schema/booking.ts";
import { HttpError } from "../plugins/errors.ts";

export const bookingsRoutes: FastifyPluginAsync = async (app) => {
    app.addHook("onRequest", app.authenticate)
    const typed = app.withTypeProvider<TypeBoxTypeProvider>()
    const {prisma} = app

    typed.get('/', 
        {
            schema: {
                tags: ['Bookings']
            }
        }, 
    async (request, response) => {
        return prisma.booking.findMany({
            include: {
                room: true,
            },
            orderBy: { startsAt: "asc"}
        })
    })

    typed.get('/:id', 
    {
        schema: {
            tags: ['Bookings'],
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
        const booking = await prisma.booking.findUnique({
            where: { 
                id: Number(request.params.id),
            }
        });
        if (!booking) throw new HttpError(404, 'Booking not found');
        return booking;
    })

    typed.post('/', 
        {
            schema: { 
                tags: ['Bookings'], 
                body: BookingBody 
            }
        }, async(request, reply)=>{
            const {roomId, startsAt, endsAt} =  request.body
            if (new Date(endsAt) <= new Date(startsAt)) {
                throw new HttpError(400, 'endsAt must be after startsAt')
            }
            const booking = await prisma.$transaction(async(tx)=>{
                const room = await tx.room.findUnique({
                    where: {
                        id: roomId
                    }
                })
                if (!room) throw new HttpError(404, 'Salle inconnu')
                const conflict = await tx.booking.findFirst({
                    where: {
                        roomId,
                        endsAt: { gt : startsAt},
                        startsAt: {lt: endsAt}
                    }
                })
                if (conflict) throw new HttpError(409, 'Conflit de date')
                return await tx.booking.create({
                    data: {
                        ...request.body,
                        userId: Number(request.user.sub)
                    }
                })
            })
            return reply.code(201).send(booking)

    })

    typed.delete('/:id', {
        schema: {
            tags: ['Bookings'], 
            params: Type.Object({
                id: Type.String({ minLength: 1 })
            }),
            response: {
                200: Type.Array(Booking),
                404: Type.Object({
                    error: Type.String()
                })
            }
        }
    }, async (request, reply) => {
        const booking = await prisma.booking.delete({
            where: {
                id: Number(request.params.id)
            }
        })
        if (!booking) throw new HttpError(404, 'Booking not found');
    });

    typed.patch('/:id',{
        schema: {
            tags: ['Bookings'],
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
    }, async (request) => {
      return await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { id: Number(request.params.id) },
        });
        if (!booking) throw new HttpError(404, "Booking not found");
        const startsAt = new Date(request.body.startsAt ?? booking.startsAt);
        const endsAt = new Date(request.body.endsAt ?? booking.endsAt);
        const roomId = request.body.roomId ?? booking.roomId;
        if (endsAt <= startsAt) {
          throw new HttpError(400, "endsAt must be after startsAt");
        }
        const conflict = await tx.booking.findFirst({
          where: {
            roomId,
            id: { not: booking.id },
            startsAt: { lt: startsAt },
            endsAt: { gt: endsAt },
          },
        });
        if (conflict) throw new HttpError(409, "Créneau déjà réservé");
 
        return await tx.booking.update({
          where: { id: Number(request.params.id) },
          data: request.body,
        });
      });
    },
)}