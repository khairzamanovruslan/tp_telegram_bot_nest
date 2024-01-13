import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import * as LocalSession from 'telegraf-session-local';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Substation } from './app.model';
import * as path from 'path';
import { AppUpdate } from './app.update';
import { AppService } from './app.service';

const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TelegrafModule.forRoot({
      middlewares: [sessions.middleware()],
      token: process.env.TOKEN_TG_BOT,
    }),
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: path.resolve(__dirname, '..', 'db', 'tp.db'),
      autoLoadModels: true,
      synchronize: true,
      models: [Substation],
    }),
    SequelizeModule.forFeature([Substation]),
  ],
  providers: [AppService, AppUpdate],
})
export class AppModule {}
