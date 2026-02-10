import { z } from 'zod';

export const ImageFieldSchema = z.object({
    src: z.string().optional(),
    alt: z.string().optional(),
});

export const FieldSchema = z.object({
    value: z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.null(),
        z.undefined(),
        z.object({
            href: z.string(),
            text: z.string().optional(),
            title: z.string().optional(),
        }),
        ImageFieldSchema,
    ]),
    jsonValue: z.object({
        value: ImageFieldSchema,
    }).optional(),
}).transform((val) => val.jsonValue?.value || val.value);

export const ComponentSchema: z.ZodType<any> = z.lazy(() => z.object({
    componentName: z.string(),
    dataSource: z.string(),
    placeholders: z.record(z.string(), z.array(ComponentSchema)).optional(),
    fields: z.union([
        z.object({
            data: z.looseObject({}).transform((data) => {
                // Deep transformation function
                const transformDeep = (obj: any): any => {
                    if (!obj || typeof obj !== 'object') return obj;

                    if (Array.isArray(obj)) {
                        return obj.map(transformDeep);
                    }

                    const result: any = {};
                    for (const [key, value] of Object.entries(obj)) {
                        if (key === 'jsonValue' && value && typeof value === 'object' && 'value' in value) {
                            const val = (value as any).value;
                            result[key] = {
                                value: {
                                    href: val.href,
                                    title: val.title,
                                    text: val.text
                                }
                            };
                        } else {
                            result[key] = transformDeep(value);
                        }
                    }
                    return result;
                };

                return transformDeep(data);
            }),
        }),
        z.record(z.string(), z.union([FieldSchema, z.array(FieldSchema)]))
    ]).optional()
}));

export type Component = z.infer<typeof ComponentSchema>;

export function sanitizeLayout(layout: Record<string, Component[]>) {
    return z.record(z.string(), z.array(ComponentSchema)).parse(layout);
}
