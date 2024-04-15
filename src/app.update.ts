import { AppService } from './app.service';
import {
  Ctx,
  InjectBot,
  Message,
  On,
  Start,
  Update,
  Command,
} from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { mainEvents, mainCommands } from './types/types';
import { Context } from './context/context.interface';
import { countOccurrences } from './utils/checking-string-for-char';

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly appService: AppService,
  ) {}
  @Start()
  async startCommand(ctx: Context) {
    const id_tg = String(ctx.update['message']['from']['id']);
    const dataUser = await this.appService.searchUserToIdTg(id_tg);
    if (!dataUser.count || !dataUser.rows[0].access_bot) {
      await ctx.reply('Вам отказано в доступе!');
      return;
    }
    ctx.session.type = mainEvents.SEARCH;
    ctx.session.add_tp_name_value = '';
    await ctx.reply('Для поиска ТП, введите номер:');
    const logMessageForAdmin = `+++\nUser id: ${id_tg}\nКоманда: /start\n+++`;
    await ctx.telegram.sendMessage(process.env.ID_ADMIN_TG, logMessageForAdmin);
  }
  @Command(mainCommands.LOG_TP)
  async log(@Ctx() ctx: Context) {
    const id_tg = String(ctx.update['message']['from']['id']);
    const dataUser = await this.appService.searchUserToIdTg(id_tg);
    if (!dataUser.count || !dataUser.rows[0].access_bot) {
      await ctx.reply('Вам отказано в доступе!');
      return;
    }
    const { count, rows } = await this.appService.getLogListTp();
    const listItemsName = rows.map((item) => item.name);
    const listItemsNameStr = listItemsName.join(', ');
    await ctx.reply(
      `Отчет\n\nВсего: ${count} шт. \n\nСписок ТП:\n${listItemsNameStr}`,
    );
    ctx.session.type = mainEvents.SEARCH;
    await ctx.reply('Для поиска ТП, введите номер:');
    const logMessageForAdmin = `+++\nUser id: ${id_tg}\nКоманда: /${mainCommands.LOG_TP}\n+++`;
    await ctx.telegram.sendMessage(process.env.ID_ADMIN_TG, logMessageForAdmin);
    return;
  }
  @Command(mainCommands.LOG_USERS)
  async logUsers(@Ctx() ctx: Context) {
    const id_tg = String(ctx.update['message']['from']['id']);
    const dataUser = await this.appService.searchUserToIdTg(id_tg);
    if (!dataUser.count || !dataUser.rows[0].access_bot) {
      await ctx.reply('Вам отказано в доступе!');
      return;
    }
    const { count, rows } = await this.appService.getLogListUsers();
    const listUsers = rows.map(
      (item, index) =>
        `№ п.п: ${index + 1}\nid_tg: ${item.id_tg}\nФИО: ${
          item.full_name || '-'
        }\nДоступ к боту: ${item.access_bot || '-'}\n\n`,
    );
    const resultListUsers = listUsers.join('');
    await ctx.reply(
      `Отчет_пользователи\n\nВсего: ${count} шт. \n\nСписок:\n${resultListUsers}`,
    );
    ctx.session.type = mainEvents.SEARCH;
    await ctx.reply('Для поиска ТП, введите номер:');
    const logMessageForAdmin = `+++\nUser id: ${id_tg}\nКоманда: /${mainCommands.LOG_USERS}\n+++`;
    await ctx.telegram.sendMessage(process.env.ID_ADMIN_TG, logMessageForAdmin);
    return;
  }
  @Command(mainCommands.ADD_USER)
  async addUser(@Ctx() ctx: Context) {
    const id_tg = String(ctx.update['message']['from']['id']);
    const dataUser = await this.appService.searchUserToIdTg(id_tg);
    if (!dataUser.count || !dataUser.rows[0].access_bot) {
      await ctx.reply('Вам отказано в доступе!');
      return;
    }
    ctx.session.type = mainEvents.ADD_USER;
    await ctx.reply(
      'Введите id пользоватателя:\n\nДля этого пользователь должен:\n1. Перейти в бота https://t.me/userinfobot\n2. Нажать кнопку старт\n3. Отправить вам Id',
    );
    const logMessageForAdmin = `+++\nUser id: ${id_tg}\nКоманда: /${mainCommands.ADD_USER}\n+++`;
    await ctx.telegram.sendMessage(process.env.ID_ADMIN_TG, logMessageForAdmin);
    return;
  }

  @Command(mainCommands.ADD_TP)
  async addTp(@Ctx() ctx: Context) {
    const id_tg = String(ctx.update['message']['from']['id']);
    const dataUser = await this.appService.searchUserToIdTg(id_tg);
    if (!dataUser.count || !dataUser.rows[0].access_bot) {
      await ctx.reply('Вам отказано в доступе!');
      return;
    }
    ctx.session.type = mainEvents.ADD_TP_NAME;
    ctx.session.add_tp_name_value = '';
    await ctx.reply('Введите номер ТП:');
    const logMessageForAdmin = `+++\nUser id: ${id_tg}\nКоманда: /${mainCommands.ADD_TP}\n+++`;
    await ctx.telegram.sendMessage(process.env.ID_ADMIN_TG, logMessageForAdmin);
    return;
  }

  @Command(mainCommands.DELETE_TP)
  async deleteTp(@Ctx() ctx: Context) {
    const id_tg = String(ctx.update['message']['from']['id']);
    const dataUser = await this.appService.searchUserToIdTg(id_tg);
    if (!dataUser.count || !dataUser.rows[0].access_bot) {
      await ctx.reply('Вам отказано в доступе!');
      return;
    }
    ctx.session.type = mainEvents.DELETE_TP;
    await ctx.reply('Для удаления введите номер ТП:');
    const logMessageForAdmin = `+++\nUser id: ${id_tg}\nКоманда: /${mainCommands.DELETE_TP}\n+++`;
    await ctx.telegram.sendMessage(process.env.ID_ADMIN_TG, logMessageForAdmin);
    return;
  }

  @On('text')
  async getTp(@Message('text') message: string, @Ctx() ctx: Context) {
    const id_tg = String(ctx.update['message']['from']['id']);
    const logMessageForAdmin = `+++\nUser id: ${id_tg}\nСообщение: ${message}\n+++`;
    await ctx.telegram.sendMessage(process.env.ID_ADMIN_TG, logMessageForAdmin);
    const dataUser = await this.appService.searchUserToIdTg(id_tg);
    if (!dataUser.count || !dataUser.rows[0].access_bot) {
      await ctx.reply('Вам отказано в доступе!');
      return;
    }
    if (!ctx.session.type) return;
    if (ctx.session.type === mainEvents.SEARCH) {
      const data = await this.appService.searchByName(message);
      if (!data.length) {
        await ctx.reply(`Не найдено!\nДля поиска, введите номер ТП:`);
        return;
      }
      const latitude = data[0].latitude;
      const longitude = data[0].longitude;
      if (!latitude) {
        await ctx.reply('Координата не обнаружена!');
      }
      const linkForUser = `https://yandex.ru/maps/?pt=${longitude},${latitude}&z=18&l=map`;
      await ctx.reply(`${latitude},${longitude}`);
      await ctx.reply(linkForUser);
      await ctx.reply('Для поиска ТП, введите номер:');
      ctx.session.type = mainEvents.SEARCH;
      return;
    }
    if (ctx.session.type === mainEvents.ADD_USER) {
      try {
        await this.appService.createUserToIdTg(message);
        await ctx.reply(
          'Отлично, пользователь добавлен!\nТеперь у него есть доступ к ТП.',
        );
        await ctx.reply('Для поиска ТП, введите номер:');
        ctx.session.type = mainEvents.SEARCH;
        return;
      } catch (e) {
        await ctx.reply(
          'Ошибка!\nВ БД с таким id уже есть пользователь!\nНажмите /start - для обычной работы с ботом',
        );
        await ctx.reply('Введите другое "Имя пользователя": ');
      }
    }
    if (ctx.session.type === mainEvents.ADD_TP_NAME) {
      const data = await this.appService.searchByName(message);
      if (data.length) {
        await ctx.reply(
          `Извините, ТП с таким номером уже существует.\nПожалуйста попробуйте другой номер:`,
        );
        ctx.session.add_tp_name_value = '';
        return;
      }
      await ctx.reply(
        'Хорошо.\nФормат координат: 57.042185,60.504975\nТеперь введите координаты ТП:',
      );
      ctx.session.add_tp_name_value = message;
      ctx.session.type = mainEvents.ADD_TP_COORDINATES;
      return;
    }
    if (ctx.session.type === mainEvents.ADD_TP_COORDINATES) {
      const messagePrepear = message.replaceAll(' ', '');
      const lengthComma = countOccurrences(messagePrepear, ',');
      if (lengthComma !== 1) {
        await ctx.reply(
          'Ошибка!\nОбратите внимание на запятые, н-р:57.042185,60.504975\nВведите координаты ТП:',
        );
        return;
      }
      const latitude = messagePrepear.split(',')[0];
      const longitude = messagePrepear.split(',')[1];
      const latitudePoint = countOccurrences(latitude, '.');
      const longitudePoint = countOccurrences(longitude, '.');
      if (latitudePoint !== 1 || longitudePoint !== 1) {
        await ctx.reply(
          'Ошибка!\nОбратите внимание на точки, н-р:57.042185,60.504975\nВведите координаты ТП:',
        );
        return;
      }
      const data = await this.appService.createTp(
        ctx.session.add_tp_name_value,
        latitude,
        longitude,
      );
      const dataRes = data.dataValues;
      await ctx.reply(
        `Отлично! Новая ТП добавлена в базу.\nНомер: ${dataRes.name}\nКоординаты: ${dataRes.latitude},${dataRes.longitude}`,
      );
      ctx.session.type = mainEvents.SEARCH;
      ctx.session.add_tp_name_value = '';
      await ctx.reply('Для поиска ТП, введите номер:');
      return;
    }
    if (ctx.session.type === mainEvents.DELETE_TP) {
      const data = await this.appService.getOneTp(message);
      if (!data) {
        await ctx.reply(
          'Не обнаружена ТП с указанным номером!\nПопробуйте еще раз ввести номер:',
        );
        return;
      }
      await this.appService.daleteOneTp(message);
      await ctx.reply('Отлично! ТП удалена.');
      await ctx.reply('Для поиска ТП, введите номер:');
      ctx.session.type = mainEvents.SEARCH;
    }
  }
}
