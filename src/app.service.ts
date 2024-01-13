import { Injectable } from '@nestjs/common';
import { Substation } from './app.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Substation) private substationRepository: typeof Substation,
  ) {}

  async getAll() {
    return this.substationRepository.findAll();
  }
  async searchByName(propName: string) {
    return this.substationRepository.findAll({
      raw: true,
      where: { name: { [Op.eq]: propName } },
    });
  }
  async deleteTp(message: number) {
    return this.substationRepository.destroy({
      where: { id: message },
    });
  }
  async createTp(name: string, coordinates: string) {
    return this.substationRepository.create({ name, coordinates });
  }
}
