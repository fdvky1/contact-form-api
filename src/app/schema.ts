import { Static, Type } from '@sinclair/typebox'

export const MessageSendReq = Type.Object({
    name: Type.String(),
    email: Type.String({ format: 'email' }),
    message: Type.String(),
    token: Type.String(),
})

export type MessageSendReqType = Static<typeof MessageSendReq>