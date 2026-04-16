import { defineCollection, z } from "astro:content";

const about = defineCollection({
  type: "content",
  schema: z.object({
    heading: z.string()
  })
});

const cmd = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    location: z.string(),
    hometown: z.string(),
    bio: z.string(),
    occupation: z.string(),
    website: z.string(),
    status: z.string()
  })
});

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    shortTitle: z.string().optional(),
    date: z.string(),
    author: z.string().optional(),
    category: z.string().optional(),
    featured: z.boolean().default(false),
    clippy: z
      .union([
        z.string(),
        z.object({
          message: z.string(),
          href: z.string().optional(),
          label: z.string().optional(),
          secondary: z
            .object({
              href: z.string(),
              label: z.string()
            })
            .optional()
        })
      ])
      .optional()
  })
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    period: z.string(),
    intro: z.string(),
    summary: z.string(),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url()
        })
      )
      .default([]),
    color: z.enum(["yellow", "blue", "green", "pink"]).default("yellow"),
    x: z.number(),
    y: z.number(),
    width: z.number().optional(),
    order: z.number().default(0),
    clippy: z
      .object({
        message: z.string(),
        href: z.string().optional(),
        label: z.string().optional(),
        secondary: z
          .object({
            href: z.string(),
            label: z.string()
          })
          .optional()
      })
      .optional()
  })
});

export const collections = { about, cmd, posts, projects };
