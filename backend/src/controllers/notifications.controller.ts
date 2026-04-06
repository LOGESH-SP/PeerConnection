import { Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import { successResponse } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.id;

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    const formatted = notifications.map((n: any) => ({
       id: n.id,
       userId: n.user_id,
       message: n.message,
       type: n.type,
       isRead: n.is_read,
       doubtId: n.doubt_id,
       createdAt: n.created_at
    }));

    successResponse(res, formatted, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
};

export const markNotificationsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.id;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    successResponse(res, null, 'Notifications marked read');
  } catch (error) {
    next(error);
  }
};
