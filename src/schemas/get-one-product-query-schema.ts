import z from "zod";


export const getOneProductquerySchema = z.object({

    limit: z.string().regex(/^\d+$/).optional()


})