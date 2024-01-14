import { substationMode, typeHadlersSubstation } from '../types/types';
import { Context as ContextTelegraf } from 'telegraf';

export interface Context extends ContextTelegraf {
  session: {
    type?: typeHadlersSubstation;
    substationName?: string;
    substationCoordinates?: string;
    substationLink?: string;
    substationType: substationMode;
    passwordForDelete: boolean;
    newPassword: boolean;
    oldPasswordValue: string;
  };
}
