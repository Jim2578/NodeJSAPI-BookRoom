import { Type, Static } from "@fastify/type-provider-typebox";

export const BookingBody = Type.Object({
    idRoom: Type.Integer({minimum: 1}),
    idUser: Type.Integer({minimum: 1}),
    startsAt: Type.String({format:"date-time"}),
    endsAt: Type.String({format:"date-time"})
})

export type BookingBodyType = Static<typeof BookingBody>

export const Booking = Type.Object({
    id: Type.Integer(),
    idRoom: Type.Integer({minimum: 1}),
    idUser: Type.Integer({minimum: 1}),
    startsAt: Type.String({format:"date-time"}),
    endsAt: Type.String({format:"date-time"})
})

export type BookingType = Static<typeof Booking>