export enum typeHadlersSubstation {
  DEFAULT = 'default',
  LIST = 'Список ТП',
  SEARCH = 'Поиск ТП',
  DELETE = 'Удалить ТП',
  CREATE = 'Добвить ТП',
}

export enum substationModeValue {
  NAME = 'name',
  COORDINATES = 'coordinates',
  DEFAULT = 'default',
}

export type substationMode =
  | substationModeValue.NAME
  | substationModeValue.COORDINATES
  | substationModeValue.DEFAULT;
