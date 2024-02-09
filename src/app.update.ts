import { AppService } from './app.service';
import {
  Ctx,
  Hears,
  InjectBot,
  Message,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { mainEvents } from './types/types';
import { Context } from './context/context.interface';

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly appService: AppService,
  ) {}
  @Start()
  async startCommand(ctx: Context) {
    ctx.session.type = mainEvents.SEARCH;
    await ctx.reply('Для поиска ТП, введите номер:');
  }

  @On('text')
  async getTp(@Message('text') message: string, @Ctx() ctx: Context) {
    if (!ctx.session.type) return;
    if (ctx.session.type === mainEvents.SEARCH) {
      const data = await this.appService.searchByName(message);
      if (!data.length) {
        await ctx.reply(`Не найдено!\nДля поиска, введите номер ТП:`);
        return;
      }
      await ctx.reply(data[0].coordinateFull || 'Координата не добавлена!');
      await ctx.reply(data[0].link || 'Ссылка не добавлена!');
      await ctx.reply('Для поиска ТП, введите номер:');
      ctx.session.type = mainEvents.SEARCH;
      return;
    }
  }
}
