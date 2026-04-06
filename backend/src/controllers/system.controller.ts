import { Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import { successResponse } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';

export const checkDatabaseStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const requiredTables = ['users', 'doubts', 'answers', 'daily_tracking', 'notifications', 'messages'];
    
    // Test each table concurrently
    const results = await Promise.all(
      requiredTables.map(async (table) => {
        const { error } = await supabase.from(table).select('id').limit(1);
        return {
          name: table,
          exists: !error || (error.code !== '42P01')
        };
      })
    );

    successResponse(res, results, 'Database status checked');
  } catch (error) {
    next(error);
  }
};
