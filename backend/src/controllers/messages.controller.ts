import { Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import { successResponse, createdResponse } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*, users(username)')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    const formatted = messages.map((m: any) => ({
       id: m.id,
       userId: m.user_id,
       username: m.users?.username || 'Unknown',
       content: m.content,
       createdAt: m.created_at
    }));

    successResponse(res, formatted, 'Messages retrieved');
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.id;
    const { content } = req.body;

    const { data: message, error } = await supabase
      .from('messages')
      .insert([{ user_id: userId, content }])
      .select('*, users(username)')
      .single();

    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    const formatted = {
       id: message.id,
       userId: message.user_id,
       username: message.users?.username || 'Unknown',
       content: message.content,
       createdAt: message.created_at
    };

    createdResponse(res, formatted, 'Message sent');
  } catch (error) {
    next(error);
  }
};
