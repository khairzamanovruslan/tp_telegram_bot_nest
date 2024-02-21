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
    const id_tg = String(ctx.update['message']['from']['id']);
    const dataUser = await this.appService.searchUserToIdTg(id_tg);
    if (!dataUser.count) {
      await ctx.reply('Вам отказано в доступе!');
      return;
    }
    ctx.session.type = mainEvents.SEARCH;
    await ctx.reply('Для поиска ТП, введите номер:');
  }
  @Command('log_tp')
  async log(@Ctx() ctx: Context) {
    const id_tg = String(ctx.update['message']['from']['id']);
    const dataUser = await this.appService.searchUserToIdTg(id_tg);
    if (!dataUser.count) {
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
    return;
  }
  @Command('log_users')
  async logUsers(@Ctx() ctx: Context) {
    const id_tg = String(ctx.update['message']['from']['id']);
    const dataUser = await this.appService.searchUserToIdTg(id_tg);
    if (!dataUser.count) {
      await ctx.reply('Вам отказано в доступе!');
      return;
    }
    const { count, rows } = await this.appService.getLogListUsers();
    const listUsers = rows.map(
      (item, index) =>
        `№ п.п: ${index + 1}\nid_tg: ${item.id_tg}\nusername: ${
          item.username_tg || '-'
        }\nfirst_name: ${item.first_name_tg || '-'}\nlast_name: ${
          item.last_name_tg || '-'
        }\n\n`,
    );
    const resultListUsers = listUsers.join('');
    await ctx.reply(
      `Отчет_пользователи\n\nВсего: ${count} шт. \n\nСписок:\n${resultListUsers}`,
    );
    ctx.session.type = mainEvents.SEARCH;
    await ctx.reply('Для поиска ТП, введите номер:');
    return;
  }
  @Command('add_user')
  async addUser(@Ctx() ctx: Context) {
    const id_tg = String(ctx.update['message']['from']['id']);
    const dataUser = await this.appService.searchUserToIdTg(id_tg);
    if (!dataUser.count) {
      await ctx.reply('Вам отказано в доступе!');
      return;
    }
    ctx.session.type = mainEvents.ADD_USER;
    console.log(ctx.session.type);
    await ctx.reply(
      'Введите id пользоватателя:\n\nДля этого пользователь должен:\n1. Перейти в бота https://t.me/userinfobot\n2. Нажать кнопку старт\n3. Отправить вам Id',
    );
    return;
  }

  @On('text')
  async getTp(@Message('text') message: string, @Ctx() ctx: Context) {
    const id_tg = String(ctx.update['message']['from']['id']);
    const first_name = String(ctx.update['message']['from']['first_name']);
    const last_name = String(ctx.update['message']['from']['last_name']);
    const username = String(ctx.update['message']['from']['username']);
    const dataUser = await this.appService.searchUserToIdTg(id_tg);
    if (!dataUser.count) {
      await ctx.reply('Вам отказано в доступе!');
      return;
    }
    await this.appService.updateUserToIdTg(
      id_tg,
      first_name,
      username,
      last_name,
    );
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
  }
}
