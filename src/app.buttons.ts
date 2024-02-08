import { Markup } from 'telegraf';
import { mainEvents } from './types/types';

export function actionButtons() {
  return Markup.keyboard([Markup.button.callback(mainEvents.LIST, 'list_tp')]);
}
