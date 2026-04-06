import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['STUDENT', 'MENTOR', 'ADMIN'])
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

export const doubtSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title requires at least 5 characters'),
    description: z.string().min(10, 'Description requires at least 10 characters'),
    category: z.string().min(2, 'Category is required'),
    tags: z.array(z.string()).optional()
  })
});

export const answerSchema = z.object({
  body: z.object({
    step1: z.string().min(5, 'Step 1 is required and must be clear'),
    step2: z.string().optional(),
    step3: z.string().optional()
  })
});

export const messageSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Message content is required')
  })
});

export const feedbackSchema = z.object({
  body: z.object({
    isHelpful: z.boolean()
  })
});

export const flagSchema = z.object({
  body: z.object({
    reason: z.string().optional()
  })
});
