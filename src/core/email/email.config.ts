import 'dotenv/config';
import Container, { Token } from 'typedi';
export const RESEND_API_KEY = new Token<string>('RESEND_API_KEY');
Container.set(RESEND_API_KEY, process.env.RESEND_API_KEY);
