import z from "zod";


export const getRelatedProductSchema = z.object({

    id: z.string().regex(/^\d+$/)

})