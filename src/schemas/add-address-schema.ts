import z from "zod";

export const addAdressSchema = z.object({
    zipcode: z.string(),
    street : z.string(),
    number: z.string(),
    complement: z.string().optional(),
    city: z.string(),
    state: z.string(),
    country: z.string()
    

})