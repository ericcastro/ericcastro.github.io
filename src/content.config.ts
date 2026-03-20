import { defineCollection, z } from "astro:content";

const about = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    intro: z.string(),
    location: z.string(),
    occupation: z.string(),
    likes: z.string(),
    status: z.string(),
    heading: z.string()
  })
});

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.string(),
    author: z.string().optional(),
    category: z.string().optional(),
    featured: z.boolean().default(false)
  })
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    color: z.enum(["yellow", "blue", "green", "pink"]).default("yellow"),
    x: z.number(),
    y: z.number(),
    width: z.number().optional(),
    order: z.number().default(0)
  })
});

export const collections = { about, posts, projects };
