import { Markup } from 'telegraf';
import { typeHadlersSubstation } from './types/types';

export function actionButtons() {
  return Markup.keyboard(
    [
      Markup.button.callback(typeHadlersSubstation.LIST, 'list_tp'),
      Markup.button.callback(typeHadlersSubstation.CREATE, 'create_tp'),
      Markup.button.callback(typeHadlersSubstation.DELETE, 'delete_tp'),
      Markup.button.callback(typeHadlersSubstation.SEARCH, 'search_tp'),
    ],
    { columns: 2 },
  );
}
