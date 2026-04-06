import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import { successResponse, createdResponse } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';

export const createDoubt = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, category, tags } = req.body;
    const userId = req.user.id;

    if (!title || !description || !category) {
      res.status(400);
      throw new Error('Please add all required fields');
    }

    const { data: doubt, error } = await supabase
      .from('doubts')
      .insert([
        { 
          user_id: userId, 
          title, 
          description, 
          category 
        }
      ])
      .select()
      .single();

    if (error) {
      res.status(400);
      throw new Error(error.message);
    }
    
    // Process tags
    if (tags && Array.isArray(tags) && doubt) {
       for (const tag of tags) {
           let tagId;
           const { data: existingTag } = await supabase.from('tags').select('id').eq('name', tag).single();
           if (existingTag) {
               tagId = existingTag.id;
           } else {
               const { data: newTag } = await supabase.from('tags').insert([{ name: tag }]).select().single();
               if (newTag) tagId = newTag.id;
           }
           
           if (tagId) {
               await supabase.from('doubt_tags').insert([{ doubt_id: doubt.id, tag_id: tagId }]);
           }
       }
    }

    createdResponse(res, doubt, 'Doubt created successfully');
  } catch (error) {
    next(error);
  }
};

export const getDoubts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: doubts, error } = await supabase
      .from('doubts')
      .select(`
        id, title, description, user_id, created_at, category,
        user:users!user_id(username),
        doubt_tags(tags(name)),
        answers(is_verified)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({
        success: false,
        data: [],
        error: error.message
      });
      return;
    }

    const normalizedDoubts = (doubts || []).map((d: any) => ({
      ...d,
      userId: d.user_id,
      username: d.user?.username || 'Unknown',
      content: d.description,
      createdAt: d.created_at,
      tags: d.doubt_tags?.map((dt: any) => dt.tags?.name).filter(Boolean) || [],
      isSaved: false,
      answers_count: d.answers?.length || 0,
      status: d.answers?.some((a: any) => a.is_verified) ? 'Solved' : 'Unsolved',
      routeScore: 0
    }));

    res.status(200).json({
      success: true,
      data: normalizedDoubts
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: [],
      error: error.message || 'Internal Server Error'
    });
  }
};

export const getDoubtById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const { data: doubt, error } = await supabase
      .from('doubts')
      .select(`
        *,
        user:users!user_id(username),
        doubt_tags(tags(name))
      `)
      .eq('id', id)
      .single();

    if (error || !doubt) {
      res.status(404);
      throw new Error('Doubt not found');
    }

    successResponse(res, doubt, 'Doubt retrieved');
  } catch (error) {
    next(error);
  }
};

export const saveDoubt = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const { data: existing } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', userId)
            .eq('doubt_id', id)
            .single();

        if (existing) {
            // Unsave
            await supabase.from('bookmarks').delete().eq('id', existing.id);
            successResponse(res, { isSaved: false }, 'Doubt unsaved');
        } else {
            // Save
            await supabase.from('bookmarks').insert([{ user_id: userId, doubt_id: id }]);
            successResponse(res, { isSaved: true }, 'Doubt saved');
        }
    } catch (error) {
        next(error);
    }
};

export const getSavedDoubts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user.id;

        const { data: bookmarks, error } = await supabase
            .from('bookmarks')
            .select(`
                doubt_id,
                doubts:doubts(
                    *,
                    user:users!user_id(username, role),
                    answers(is_verified),
                    doubt_tags(tags(name))
                )
            `)
            .eq('user_id', userId);

        if (error) {
            res.status(400);
            throw new Error(error.message);
        }

        const normalizedDoubts = bookmarks?.map((b: any) => {
            const d = b.doubts;
            return {
                ...d,
                username: d.user?.username || 'Unknown',
                content: d.description,
                tags: d.doubt_tags?.map((dt: any) => dt.tags?.name).filter(Boolean) || [],
                isSaved: true,
                answers_count: d.answers?.length || 0,
                status: d.answers?.some((a: any) => a.is_verified) ? 'Solved' : 'Unsolved'
            };
        }) || [];

        successResponse(res, normalizedDoubts, 'Saved doubts retrieved');
    } catch (error) {
        next(error);
    }
};
