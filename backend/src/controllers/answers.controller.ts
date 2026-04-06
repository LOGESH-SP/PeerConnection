import { Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import { successResponse, createdResponse } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';
import { validateAnswerWithAI } from '../utils/ai.util';

// Trust Score calculation utility
const calculateTrustScore = (aiScore: number, credScore: number, upvotes: number, downvotes: number) => {
    // trustScore = (ai_score * 0.2) + (credibility * 0.3) + (upvotes * 2) - (downvotes * 1)
    const normAi = (aiScore || 0) * 0.2;
    const normCred = (credScore || 0) * 0.3;
    const voteImpact = (upvotes * 2) - (downvotes * 1);
    
    // Normalize bounds between 0 and 100 roughly
    let rawScore = Math.floor(normAi + normCred + voteImpact);
    return Math.max(0, Math.min(100, rawScore));
};

export const postAnswer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { doubtId } = req.params;
    const { step1, step2, step3 } = req.body;
    const userId = req.user.id;
    
    if (!step1 || !step2 || !step3) {
      res.status(400);
      throw new Error('Please provide all 3 steps');
    }

    const { data: doubt, error: doubtError } = await supabase
        .from('doubts')
        .select('*')
        .eq('id', doubtId)
        .single();
        
    if (doubtError || !doubt) {
        res.status(404);
        throw new Error('Doubt not found');
    }

    const aiResult = await validateAnswerWithAI(doubt.title, doubt.description, [step1, step2, step3]);
    let isVerified = false; // Do not auto-verify answers purely based on AI score

    const { data: answer, error } = await supabase
      .from('answers')
      .insert([
        { 
          doubt_id: doubtId,
          user_id: userId, 
          step1, 
          step2, 
          step3,
          ai_score: aiResult.score,
          is_verified: isVerified
        }
      ])
      .select()
      .single();

    if (error) {
      res.status(400);
      throw new Error(error.message);
    }
    
    // No auto-verified credibility points based solely on AI

    createdResponse(res, { answer, ai_validation: aiResult }, 'Answer posted successfully');
  } catch (error) {
    next(error);
  }
};

export const getAnswersByDoubt = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { doubtId } = req.params;

    const { data: answers, error } = await supabase
      .from('answers')
      .select(`
        *, 
        user:users(id, username, role, credibility_score),
        votes(vote_type),
        reports(id)
      `)
      .eq('doubt_id', doubtId);

    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    // Calculate metrics
    const enrichedAnswers = answers.map(ans => {
        const upvotes = ans.votes?.filter((v: any) => v.vote_type === 'UPVOTE').length || 0;
        const downvotes = ans.votes?.filter((v: any) => v.vote_type === 'DOWNVOTE').length || 0;
        
        const trustScore = calculateTrustScore(ans.ai_score, ans.user?.credibility_score, upvotes, downvotes);

        return {
            ...ans,
            trustScore,
            upvotes,
            downvotes,
            is_under_review: ans.reports && ans.reports.length > 0
        };
    });

    // Smart Routing: Best Answer Auto-Selection
    // Sort descending by trustScore
    enrichedAnswers.sort((a, b) => b.trustScore - a.trustScore);

    // If threshold met, mark best_answer (UI only overriding for now)
    if (enrichedAnswers.length > 0 && enrichedAnswers[0].trustScore >= 40) {
        enrichedAnswers[0].is_best_answer_computed = true;
    }

    successResponse(res, enrichedAnswers, 'Answers retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const recheckAnswer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        // Fetch answer, votes, user cred
        const { data: answer, error } = await supabase
          .from('answers')
          .select(`*, user:users(credibility_score), doubts(title, description), votes(vote_type)`)
          .eq('id', id)
          .single();

        if (error || !answer) throw new Error('Answer not found');

        // Re-run AI validation as part of the intelligence architecture
        const aiResult = await validateAnswerWithAI(
           answer.doubts.title, 
           answer.doubts.description, 
           [answer.step1, answer.step2, answer.step3]
        );

        const upvotes = answer.votes?.filter((v: any) => v.vote_type === 'UPVOTE').length || 0;
        const downvotes = answer.votes?.filter((v: any) => v.vote_type === 'DOWNVOTE').length || 0;
        
        const newTrustScore = calculateTrustScore(aiResult.score, answer.user?.credibility_score, upvotes, downvotes);

        // Maintain version history & last_reviewed timestamp
        const oldHistory = answer.version_history || [];
        const newHistoryConfig = [...oldHistory, {
             reviewed_at: new Date().toISOString(),
             previous_ai_score: answer.ai_score,
             new_ai_score: aiResult.score,
             trust_score_snapshot: newTrustScore
        }];

        const { data: updated, error: updateError } = await supabase
            .from('answers')
            .update({ 
               ai_score: aiResult.score,
               ai_confidence: aiResult.confidence || 0,
               last_reviewed: new Date().toISOString(),
               version_history: newHistoryConfig
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw new Error(updateError.message);

        successResponse(res, { answer: updated, calculatedTrustScore: newTrustScore }, 'Recheck complete');
    } catch (error) {
        next(error);
    }
};

export const submitFeedback = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { answerId } = req.params;
        const { isHelpful } = req.body;
        const userId = req.user.id;
        const voteType = isHelpful ? 'UPVOTE' : 'DOWNVOTE';

        // Upsert vote
        const { error: upsertError } = await supabase
            .from('votes')
            .upsert({ user_id: userId, answer_id: answerId, vote_type: voteType }, { onConflict: 'user_id,answer_id' });

        if (upsertError) {
            res.status(400);
            throw new Error('Failed to record feedback');
        }
        
        // Increase credibility if helpful
        if (isHelpful) {
            const { data: answer } = await supabase.from('answers').select('user_id').eq('id', answerId).single();
            if (answer) {
                 await supabase.rpc('increment_credibility', { user_id_param: answer.user_id, points: 2 });
            }
        }

        successResponse(res, null, 'Feedback submitted');
    } catch (error) {
        next(error);
    }
};

export const verifyAnswer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { answerId } = req.params;
    
    // Only Mentors/Admins could verify ideally, assuming handled here
    const { data: answer, error } = await supabase
        .from('answers')
        .update({ is_verified: true })
        .eq('id', answerId)
        .select()
        .single();
        
    if (error) {
        res.status(400);
        throw new Error('Failed to verify answer');
    }

    await supabase.rpc('increment_credibility', { user_id_param: answer.user_id, points: 15 });
    
    successResponse(res, answer, 'Answer verified');
  } catch (error) {
    next(error);
  }
};

export const flagAnswer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { answerId } = req.params;
        const { reason } = req.body;
        const userId = req.user.id;

        const { error } = await supabase
            .from('reports')
            .insert([{ user_id: userId, answer_id: answerId, reason: reason || 'Flagged via UI' }]);

        if (error) {
            res.status(400);
            throw new Error('Failed to flag answer');
        }

        successResponse(res, null, 'Answer flagged for review');
    } catch (error) {
        next(error);
    }
};
