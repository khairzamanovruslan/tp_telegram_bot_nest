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
  async createTp(name: string, latitude: string, longitude: string) {
    const lastRecord = await this.substationRepository.findAll({
      order: [['id', 'DESC']],
      limit: 1,
    });
    const lastRecordId = lastRecord[0].dataValues.id;
    return this.substationRepository.create({
      id: lastRecordId + 1,
      name,
      latitude,
      longitude,
    });
  }
  async getLogListTp() {
    return this.substationRepository.findAndCountAll({
      order: [['name', 'ASC']],
      attributes: ['name'],
    });
  }
  async getOneTp(name: string) {
    return this.substationRepository.destroy({
      where: {
        name: {
          [Op.eq]: name,
        },
      },
    });
  }
  async daleteOneTp(name: string) {
    return this.substationRepository.findOne({
      where: {
        name: {
          [Op.eq]: name,
        },
      },
    });
  }
  async createUserToIdTg(id_tg: string) {
    return this.userRepository.create({ id_tg: id_tg, access_bot: true });
  }
  async getLogListUsers() {
    return this.userRepository.findAndCountAll();
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
