import z from "zod";

export const getOrderBySessionIdSchema = z.object({
    sessionId: z.string()
})