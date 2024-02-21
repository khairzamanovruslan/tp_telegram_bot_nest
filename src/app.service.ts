import { Injectable } from '@nestjs/common';
import { Substation, Users } from './app.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Substation) private substationRepository: typeof Substation,
    @InjectModel(Users) private userRepository: typeof Users,
  ) {}
  async searchByName(propName: string) {
    return this.substationRepository.findAll({
      raw: true,
      where: { name: { [Op.eq]: propName } },
    });
  }
  async getLogListTp() {
    return this.substationRepository.findAndCountAll({
      order: [['name', 'ASC']],
      attributes: ['name'],
    });
  }
  async createUserToIdTg(id_tg: string) {
    return this.userRepository.create({ id_tg: id_tg });
  }
  async getLogListUsers() {
    return this.userRepository.findAndCountAll();
  }
  async updateUserToIdTg(
    id_tg: string,
    first_name: string,
    username: string,
    last_name: string,
  ) {
    return this.userRepository.update(
      {
        first_name_tg: first_name,
        username_tg: username,
        last_name_tg: last_name,
      },
      {
        where: {
          id_tg: id_tg,
        },
      },
    );
  }
  async searchUserToIdTg(id_tg: string) {
    return this.userRepository.findAndCountAll({
      where: {
        id_tg: {
          [Op.eq]: id_tg,
        },
      },
    });
  }
}
