import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const about = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/about" }),
  schema: z.object({
    heading: z.string()
  })
});

const cmd = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/cmd" }),
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
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/posts" }),
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
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/projects" }),
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
