import { AppService } from './app.service';
import {
  Ctx,
  Hears,
  InjectBot,
  Message,
  On,
  Start,
  Update,
  Command,
} from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { actionButtons } from './app.buttons';
import { typeHadlersSubstation, substationModeValue } from './types/types';
import { Context } from './context/context.interface';
import { substationUtils } from './app.utils';

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly appService: AppService,
  ) {}

  @Command('update_password')
  async updatePassword(ctx: Context) {
    ctx.session.type = typeHadlersSubstation.UPDATE_PASSWORD_FOR_DELETE;
    ctx.session.oldPasswordValue = '';
    ctx.session.newPassword = false;
    await ctx.reply(`Введите старый пароль:`);
  }

  @Command('admin_new_password')
  async adminNewPassword(ctx: Context) {
    await this.appService.clearPassword();
    await this.appService.createDefaultPassword();
    await ctx.reply(`+`);
  }

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
    const resultList = `Список ТП:\n${list(data)}Всего: ${data.length}`;
    await ctx.reply(data.length ? resultList : 'Список пуст!');
  }

  @Hears([typeHadlersSubstation.SEARCH])
  async searchTp(ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Для поиска, введите номер ТП: ');
    ctx.session.type = typeHadlersSubstation.SEARCH;
  }

  @Hears([typeHadlersSubstation.DELETE])
  async deleteTp(ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Для удаления, введите пароль: ');
    ctx.session.type = typeHadlersSubstation.DELETE;
    ctx.session.passwordForDelete = false;
  }

  @Hears([typeHadlersSubstation.CREATE])
  async createTp(ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Для добавления, введите номер ТП: ');
    ctx.session.type = typeHadlersSubstation.CREATE;
    ctx.session.substationType = substationModeValue.NAME;
    ctx.session.substationName = '';
    ctx.session.substationCoordinates = '';
  }

  @On('text')
  async getTp(@Message('text') message: string, @Ctx() ctx: Context) {
    if (!ctx.session.type) return;
    if (ctx.session.type === typeHadlersSubstation.SEARCH) {
      const data = await this.appService.searchByName(message);
      if (!data.length) {
        await ctx.reply(`Не найдено!\nДля поиска, введите номер ТП:`);
        return;
      }
      await ctx.reply(data[0].coordinates);
      ctx.session.type = typeHadlersSubstation.DEFAULT;
      return;
    }

    if (ctx.session.type === typeHadlersSubstation.DELETE) {
      if (ctx.session.passwordForDelete) {
        const isNumber = /^\d+$/.test(message);
        if (!isNumber) {
          await ctx.deleteMessage();
          await ctx.reply(
            `${message} - не является id!\nДля удаления, введите id ТП:`,
          );
          return;
        }
        const data = await this.appService.deleteTp(Number(message));
        if (!data) {
          await ctx.deleteMessage();
          await ctx.reply(
            `${message} - такого id не существует!\nДля удаления, введите id ТП:`,
          );
          return;
        }
        await ctx.reply(`Данные удалены!`);
        ctx.session.type = typeHadlersSubstation.DEFAULT;
        ctx.session.passwordForDelete = false;
        return;
      }
      const passwordValue = await this.appService.getPasswordForDelete(message);
      const passDB = passwordValue?.passwordValue;
      if (passDB !== message) {
        await ctx.deleteMessage();
        await ctx.reply(`Не верный пароль!\nВведите пароль:`);
        return;
      } else {
        await ctx.deleteMessage();
        await ctx.reply(`Введите id ТП:`);
        ctx.session.passwordForDelete = true;
      }
    }

    if (ctx.session.type === typeHadlersSubstation.CREATE) {
      ctx.session.substationName = message;
      const data = await this.appService.searchByName(message);
      if (data.length > 0) {
        await ctx.reply(
          `${ctx.session.substationName} - уже существует!\nДля добавления, введите уникальный номер ТП: `,
        );
        return;
      }

      const createSubstation = ctx.session.substationType;
      if (createSubstation === substationModeValue.NAME) {
        console.log(substationModeValue.NAME);
        ctx.session.substationName = message;
        ctx.session.substationType = substationModeValue.COORDINATES;
        await ctx.reply(
          `Номер ТП: ${ctx.session.substationName}\nВведите координаты ТП:`,
        );
        return;
      }
      if (createSubstation === substationModeValue.COORDINATES) {
        ctx.session.substationCoordinates = message;
        let name = ctx.session.substationName;
        let coordinates = ctx.session.substationCoordinates
          .trim()
          .split(' ')
          .join('');
        const data = await this.appService.createTp(name, coordinates);
        name = '';
        coordinates = '';
        ctx.session.substationType = substationModeValue.DEFAULT;
        ctx.session.type = typeHadlersSubstation.DEFAULT;
        await ctx.reply(
          `Данные записаны!\n\nНомер ТП: ${data.name}\nКоординаты ТП: ${data.coordinates}`,
        );
        return;
      }
    }

    if (ctx.session.type === typeHadlersSubstation.UPDATE_PASSWORD_FOR_DELETE) {
      if (ctx.session.newPassword) {
        const oldPasswordValue = ctx.session.oldPasswordValue;
        const newPassword = message;
        await this.appService.updatePassword(oldPasswordValue, newPassword);
        await ctx.deleteMessage();
        await ctx.reply(`Пароль измененен!`);
        ctx.session.type = typeHadlersSubstation.DEFAULT;
        ctx.session.oldPasswordValue = '';
        ctx.session.newPassword = false;
        return;
      }
      const passwordValue = await this.appService.getPasswordForDelete(message);
      const passDB = passwordValue?.passwordValue;
      if (passDB !== message) {
        await ctx.deleteMessage();
        await ctx.reply(`Не верный пароль!\nВведите пароль:`);
        return;
      } else {
        await ctx.deleteMessage();
        await ctx.reply(`Введите новый пароль:`);
        ctx.session.oldPasswordValue = message;
        ctx.session.newPassword = true;
      }
    }
  }
}
