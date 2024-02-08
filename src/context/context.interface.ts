import { mainEvents } from '../types/types';
import { Context as ContextTelegraf } from 'telegraf';

export interface Context extends ContextTelegraf {
  session: {
    type?: mainEvents;
  };
}
