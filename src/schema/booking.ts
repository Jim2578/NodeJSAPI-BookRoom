import { Type, Static } from "@fastify/type-provider-typebox";

export const BookingBody = Type.Object({
    roomId: Type.Integer({minimum: 1}),
    userId: Type.Integer({minimum: 1}),
    startsAt: Type.Unsafe<Date>({
        type: "string",
        format:"date-time"
    }),
    endsAt: Type.Unsafe<Date>({
        type: "string",
        format:"date-time"
    })
})

export type BookingBodyType = Static<typeof BookingBody>

export const Booking = Type.Object({
    id: Type.Integer(),
    roomId: Type.Integer({minimum: 1}),
    userId: Type.Integer({minimum: 1}),
    startsAt: Type.Unsafe({
        type: "string",
        format:"date-time"
    }),
    endsAt: Type.Unsafe({
        type: "string",
        format:"date-time"
    })
})

export type BookingType = Static<typeof Booking>