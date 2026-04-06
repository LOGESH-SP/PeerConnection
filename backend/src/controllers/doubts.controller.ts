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
      .select('id, title, description, user_id, created_at, category')
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({
        success: false,
        data: [],
        error: error.message
      });
      return;
    }

    // Fetch relations manually to prevent PostgREST join errors
    const { data: users } = await supabase.from('users').select('id, username');
    const userMap = new Map((users || []).map((u: any) => [u.id, u.username]));

    const { data: answers } = await supabase.from('answers').select('doubt_id, is_verified');
    const answerMap = new Map();
    (answers || []).forEach((a: any) => {
        if (!answerMap.has(a.doubt_id)) answerMap.set(a.doubt_id, []);
        answerMap.get(a.doubt_id).push(a);
    });

    const { data: doubtTags } = await supabase.from('doubt_tags').select('doubt_id, tags(name)');
    const tagMap = new Map();
    (doubtTags || []).forEach((dt: any) => {
        if (!tagMap.has(dt.doubt_id)) tagMap.set(dt.doubt_id, []);
        if (dt.tags?.name) tagMap.get(dt.doubt_id).push(dt.tags.name);
    });

    const normalizedDoubts = (doubts || []).map((d: any) => {
      const dAnswers = answerMap.get(d.id) || [];
      return {
        ...d,
        userId: d.user_id,
        username: userMap.get(d.user_id) || 'Unknown',
        content: d.description,
        createdAt: d.created_at,
        tags: tagMap.get(d.id) || [],
        isSaved: false,
        answers_count: dAnswers.length,
        status: dAnswers.some((a: any) => a.is_verified) ? 'Solved' : 'Unsolved',
        routeScore: 0
      };
    });

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
      .select('*')
      .eq('id', id)
      .single();

    if (error || !doubt) {
      res.status(404);
      throw new Error('Doubt not found');
    }

    // Fetch relations manually
    const { data: user } = await supabase.from('users').select('username').eq('id', doubt.user_id).single();
    const { data: tagsData } = await supabase.from('doubt_tags').select('tags(name)').eq('doubt_id', doubt.id);

    const doubtWithRelations = {
        ...doubt,
        userId: doubt.user_id,
        username: user?.username || 'Unknown',
        content: doubt.description,
        createdAt: doubt.created_at,
        tags: tagsData?.map((dt: any) => dt.tags?.name).filter(Boolean) || []
    };

    successResponse(res, doubtWithRelations, 'Doubt retrieved');
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
            .select('doubt_id')
            .eq('user_id', userId);

        if (error) {
            res.status(400);
            throw new Error(error.message);
        }

        if (!bookmarks || bookmarks.length === 0) {
            successResponse(res, [], 'Saved doubts retrieved');
            return;
        }

        const doubtIds = bookmarks.map((b: any) => b.doubt_id);
        const { data: doubtsData } = await supabase.from('doubts').select('*').in('id', doubtIds);
        
        // Fetch relations manually 
        const { data: users } = await supabase.from('users').select('id, username, role');
        const userMap = new Map((users || []).map((u: any) => [u.id, u]));

        const { data: answers } = await supabase.from('answers').select('doubt_id, is_verified').in('doubt_id', doubtIds);
        const answerMap = new Map();
        (answers || []).forEach((a: any) => {
            if (!answerMap.has(a.doubt_id)) answerMap.set(a.doubt_id, []);
            answerMap.get(a.doubt_id).push(a);
        });

        const { data: doubtTags } = await supabase.from('doubt_tags').select('doubt_id, tags(name)').in('doubt_id', doubtIds);
        const tagMap = new Map();
        (doubtTags || []).forEach((dt: any) => {
            if (!tagMap.has(dt.doubt_id)) tagMap.set(dt.doubt_id, []);
            if (dt.tags?.name) tagMap.get(dt.doubt_id).push(dt.tags.name);
        });

        const normalizedDoubts = (doubtsData || []).map((d: any) => {
            const dAnswers = answerMap.get(d.id) || [];
            const userObj: any = userMap.get(d.user_id) || { username: 'Unknown' };
            return {
                ...d,
                userId: d.user_id,
                username: userObj.username,
                content: d.description,
                createdAt: d.created_at,
                tags: tagMap.get(d.id) || [],
                isSaved: true,
                answers_count: dAnswers.length,
                status: dAnswers.some((a: any) => a.is_verified) ? 'Solved' : 'Unsolved'
            };
        });

        successResponse(res, normalizedDoubts, 'Saved doubts retrieved');
    } catch (error) {
        next(error);
    }
};
