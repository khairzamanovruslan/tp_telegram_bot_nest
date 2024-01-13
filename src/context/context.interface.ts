import { createSubstationSchema, typeHadlersSubstation } from '../types/types';
import { Context as ContextTelegraf } from 'telegraf';

export interface Context extends ContextTelegraf {
  session: {
    type?: typeHadlersSubstation;
    createSubstation: createSubstationSchema;
  };
}
