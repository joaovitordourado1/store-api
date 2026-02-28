import z from "zod";

export const calculatingShippingSchema = z.object({
    zipCode :z.string().min(4)
})