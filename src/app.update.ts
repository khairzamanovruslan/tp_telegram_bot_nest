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
    await ctx.reply(`Изменение пароля\nВведите старый пароль:`);
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
    await ctx.reply('Удаление ТП\nВведите пароль: ');
    ctx.session.type = typeHadlersSubstation.DELETE;
    ctx.session.passwordForDelete = false;
  }

  @Hears([typeHadlersSubstation.CREATE])
  async createTp(ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Добавить ТП\nВведите номер ТП: ');
    ctx.session.type = typeHadlersSubstation.CREATE;
    ctx.session.substationType = substationModeValue.NAME;
    ctx.session.substationName = '';
    ctx.session.substationCoordinates = '';
  }

  @On('text')
  async getTp(@Message('text') message: string, @Ctx() ctx: Context) {
    console.log(`session: ${ctx.session.type}`);
    await ctx.reply(`session: ${ctx.session.type}`);
    if (!ctx.session.type) return;
    if (ctx.session.type === typeHadlersSubstation.SEARCH) {
      const data = await this.appService.searchByName(message);
      if (!data.length) {
        await ctx.deleteMessage();
        await ctx.reply(
          `Поиск ТП\nПо запросу: ${message} \nНе найдено!\nВведите номер ТП: `,
        );
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
        ctx.session.passwordForDelete = false;
        return;
      }
      const passwordValue = await this.appService.getPasswordForDelete(message);
      const passDB = passwordValue?.passwordValue;
      if (passDB !== message) {
        await ctx.deleteMessage();
        await ctx.reply(
          `Удаление ТП\nВнимание!\nПароль не верный!\nВведите пароль:`,
        );
        return;
      } else {
        await ctx.reply(`Удаление ТП\nВерный пароль!\nВведите id ТП:`);
        ctx.session.passwordForDelete = true;
      }
    }

    if (ctx.session.type === typeHadlersSubstation.CREATE) {
      const data = await this.appService.searchByName(message);
      if (data.length > 0) {
        await ctx.reply(
          `Добавить ТП\nВнимание!\nНомер ТП: ${ctx.session.substationName} - уже существует!\nВведите уникальный номер ТП: `,
        );
        return;
      }

      const createSubstation = ctx.session.substationType;
      if (createSubstation === substationModeValue.NAME) {
        console.log(substationModeValue.NAME);
        ctx.session.substationName = message;
        ctx.session.substationType = substationModeValue.COORDINATES;
        await ctx.reply(
          `Добавить ТП\nНомер ТП: ${ctx.session.substationName}\nВведите координаты ТП:`,
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
          `Добавить ТП\nДанные записаны!\n\nНомер ТП: ${data.name}\nКоординаты ТП: ${data.coordinates}`,
        );
        return;
      }
    }

    if (ctx.session.type === typeHadlersSubstation.UPDATE_PASSWORD_FOR_DELETE) {
      if (ctx.session.newPassword) {
        const oldPasswordValue = ctx.session.oldPasswordValue;
        const newPassword = message;
        await this.appService.updatePassword(oldPasswordValue, newPassword);
        await ctx.reply(`Изменение пароля\n\nПароль измененен!`);
        ctx.session.type = typeHadlersSubstation.DEFAULT;
        ctx.session.oldPasswordValue = '';
        ctx.session.newPassword = false;
        return;
      }
      const passwordValue = await this.appService.getPasswordForDelete(message);
      const passDB = passwordValue?.passwordValue;
      if (passDB !== message) {
        await ctx.deleteMessage();
        await ctx.reply(
          `Изменение пароля\nВнимание!\nПароль не верный!\nВведите пароль:`,
        );
        return;
      } else {
        await ctx.reply(
          `Изменение пароля\nОтлично, Вы ввели верный пароль!\nВведите новый пароль:`,
        );
        ctx.session.oldPasswordValue = message;
        ctx.session.newPassword = true;
      }
    }
  }
}
