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
