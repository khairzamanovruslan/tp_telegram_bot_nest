export enum typeHadlersSubstation {
  DEFAULT = 'default',
  LIST = 'Список ТП',
  SEARCH = 'Поиск ТП',
  DELETE = 'Удалить ТП',
  CREATE = 'Добвить ТП',
}

export enum createSubstationModeValue {
  NAME = 'name',
  COORDINATES = 'coordinates',
  DEFAULT = 'default',
}

export type createSubstationMode =
  | createSubstationModeValue.NAME
  | createSubstationModeValue.COORDINATES
  | createSubstationModeValue.DEFAULT;

export interface createSubstationSchema {
  name?: string;
  coordinates?: string;
  type?: createSubstationMode;
}
