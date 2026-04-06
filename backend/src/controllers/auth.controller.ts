import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/db';
import { env } from '../config/env';
import { successResponse, createdResponse } from '../utils/response.util';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, env.jwtSecret, { expiresIn: '30d' });
};

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      res.status(400);
      throw new Error('Please add all fields');
    }

    const { data: userExists } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: user, error } = await supabase
      .from('users')
      .insert([
        { 
          username, 
          email, 
          password_hash: hashedPassword, 
          role,
          credibility_score: 0 
        }
      ])
      .select()
      .single();

    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    if (user) {
      createdResponse(res, {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        credibility_score: user.credibility_score,
        token: generateToken(user.id, user.role),
      }, 'User registered successfully');
    }
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      res.status(400);
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
      successResponse(res, {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        credibility_score: user.credibility_score,
        token: generateToken(user.id, user.role),
      }, 'Login successful');
    } else {
      res.status(400);
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.id;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, role, credibility_score, created_at')
      .eq('id', userId)
      .single();
      
    if (error || !user) {
      res.status(404);
      throw new Error('User not found');
    }

    let doubtsCount = 0;
    const { count } = await supabase.from('doubts').select('*', { count: 'exact', head: true }).eq('user_id', userId);
    doubtsCount = count || 0;

    let totalAnswers = 0;
    let verifiedAnswers = 0;
    const { data: answersData } = await supabase
        .from('answers')
        .select('is_verified')
        .eq('user_id', userId);

    if (answersData) {
        totalAnswers = answersData.length;
        verifiedAnswers = answersData.filter(a => a.is_verified).length;
    }

    const accuracy = totalAnswers > 0 ? Math.round((verifiedAnswers / totalAnswers) * 100) : 0;
    const isTopContributor = user.credibility_score >= 100 || verifiedAnswers >= 5;

    (user as any).dailyLimit = 5;
    (user as any).doubtsPostedToday = doubtsCount;
    (user as any).totalAnswers = totalAnswers;
    (user as any).accuracy = accuracy;
    (user as any).isTopContributor = isTopContributor;

    successResponse(res, user, 'Profile retrieved');
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, role, credibility_score')
      .order('credibility_score', { ascending: false })
      .limit(10);

    if (error) {
      res.status(400);
      throw new Error(error.message);
    }
    
    successResponse(res, users, 'Leaderboard retrieved');
  } catch (error) {
    next(error);
  }
};
