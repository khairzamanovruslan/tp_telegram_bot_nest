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
import { actionButtons } from './app.buttons';
import { typeHadlersSubstation } from './types/types';
import { Context } from './context/context.interface';
import { substationUtils } from './app.utils';
import { createSubstationModeValue } from './types/types';

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly appService: AppService,
  ) {}

  @Start()
  async startCommand(ctx: Context) {
    ctx.session.type = typeHadlersSubstation.DEFAULT;
    await ctx.reply('Что ты хочешь сделать?', actionButtons());
  }
  @Hears([typeHadlersSubstation.LIST])
  async listTp(ctx: Context) {
    const { list } = substationUtils();
    await ctx.deleteMessage();
    ctx.session.type = typeHadlersSubstation.DEFAULT;
    const data = await this.appService.getAll();
    const resultList = `Список ТП:\n${list(data)}`;
    await ctx.reply(data.length ? resultList : 'Список пуст!');
  }

  @Hears([typeHadlersSubstation.SEARCH])
  async searchTp(ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Поиск ТП\nВведите номер ТП: ');
    ctx.session.type = typeHadlersSubstation.SEARCH;
  }

  @Hears([typeHadlersSubstation.DELETE])
  async deleteTp(ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Удаление ТП\nВведите id ТП: ');
    ctx.session.type = typeHadlersSubstation.DELETE;
  }

  @Hears([typeHadlersSubstation.CREATE])
  async createTp(ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Добавить ТП\nВведите номер ТП: ');
    ctx.session.type = typeHadlersSubstation.CREATE;
    ctx.session.createSubstation.type = createSubstationModeValue.NAME;
    ctx.session.createSubstation.name = '';
    ctx.session.createSubstation.coordinates = '';
  }

  @On('text')
  async getTp(@Message('text') message: string, @Ctx() ctx: Context) {
    console.log(`session: ${ctx.session.type}`);
    await ctx.reply(`session: ${ctx.session.type}`);
    if (!ctx.session.type) return;
    if (ctx.session.type === typeHadlersSubstation.SEARCH) {
      const { list, coordinates } = substationUtils();
      const data = await this.appService.getSearchByName(message);
      if (!data.length) {
        await ctx.deleteMessage();
        await ctx.reply(
          `Поиск ТП\nПо запросу: ${message} \nНе найдено!\nВведите номер ТП: `,
        );
        return;
      }
      await ctx.reply(
        `Поиск ТП\nПо запросу: ${message}\n\nСписок ТП:\n${list(data)}`,
      );
      coordinates(data).forEach(async (item) => {
        await ctx.reply(item);
      });
      ctx.session.type = typeHadlersSubstation.DEFAULT;
      return;
    }

    if (ctx.session.type === typeHadlersSubstation.DELETE) {
      const isNumber = /^\d+$/.test(message);
      if (!isNumber) {
        console.log('Не найдено');
        await ctx.deleteMessage();
        await ctx.reply(
          `Удаление ТП\nОшибка!\n${message} - не является id!\nВведите id ТП:`,
        );
        return;
      }
      const data = await this.appService.deleteTp(Number(message));
      if (!data) {
        await ctx.deleteMessage();
        await ctx.reply(
          `Удаление ТП\nВнимание!\n${message} - такого id не существует!\nВведите id ТП:`,
        );
        return;
      }
      await ctx.deleteMessage();
      await ctx.reply(`Удаление ТП\n\nДанные удалены!`);
      ctx.session.type = typeHadlersSubstation.DEFAULT;
      return;
    }

    if (ctx.session.type === typeHadlersSubstation.CREATE) {
      const createSubstation = ctx.session.createSubstation.type;
      if (createSubstation === createSubstationModeValue.NAME) {
        console.log(createSubstationModeValue.NAME);
        ctx.session.createSubstation.name = message;
        ctx.session.createSubstation.type =
          createSubstationModeValue.COORDINATES;
        await ctx.reply(
          `Добавить ТП\nНомер ТП: ${ctx.session.createSubstation.name}\nВведите координаты ТП:`,
        );
        return;
      }
      if (createSubstation === createSubstationModeValue.COORDINATES) {
        ctx.session.createSubstation.coordinates = message;
        let name = ctx.session.createSubstation.name;
        let coordinates = ctx.session.createSubstation.coordinates;
        const data = await this.appService.createTp(name, coordinates);
        name = '';
        coordinates = '';
        ctx.session.createSubstation.type = createSubstationModeValue.DEFAULT;
        ctx.session.type = typeHadlersSubstation.DEFAULT;
        await ctx.reply(
          `Добавить ТП\nДанные записаны!\n\nНомер ТП: ${data.name}\nКоординаты ТП: ${data.coordinates}`,
        );
        return;
      }
    }
  }
}
