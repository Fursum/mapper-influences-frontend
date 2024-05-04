export enum InfluenceTypeEnum {
  Respect = "Respect",
  Fascination = "Fascination",
  Implementation = "Implementation",
}

export function convertFromInfluence(type: InfluenceTypeEnum) {
  switch (type) {
    case InfluenceTypeEnum.Respect:
      return 1;
    case InfluenceTypeEnum.Fascination:
      return 4;
    case InfluenceTypeEnum.Implementation:
      return 7;
    default:
      return 0;
  }
}

export function convertToInfluence(type: number) {
  switch (type) {
    case 1:
      return InfluenceTypeEnum.Respect;
    case 4:
      return InfluenceTypeEnum.Fascination;
    case 7:
      return InfluenceTypeEnum.Implementation;
    default:
      return InfluenceTypeEnum.Respect;
  }
}
