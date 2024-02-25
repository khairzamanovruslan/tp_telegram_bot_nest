import { mainEvents } from '../types/types';
import { Context as ContextTelegraf } from 'telegraf';

export interface Context extends ContextTelegraf {
  session: {
    type?: mainEvents;
    add_tp_name_value: string;
  };
}
