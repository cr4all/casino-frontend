export type CommissionModel = 'cpa' | 'revshare' | 'hybrid';

export function commissionModelIncludesCpa(model: string): boolean {
  return model === 'cpa' || model === 'hybrid';
}

export function commissionModelIncludesRevshare(model: string): boolean {
  return model === 'revshare' || model === 'hybrid';
}

export function isSubCommissionModelAllowed(
  parentModel: string,
  subModel: CommissionModel,
): boolean {
  if (commissionModelIncludesCpa(subModel) && !commissionModelIncludesCpa(parentModel)) {
    return false;
  }

  if (commissionModelIncludesRevshare(subModel) && !commissionModelIncludesRevshare(parentModel)) {
    return false;
  }

  return true;
}

export function getAllowedSubAffiliateCommissionModels(parentModel: string): CommissionModel[] {
  const all: CommissionModel[] = ['cpa', 'revshare', 'hybrid'];

  return all.filter((model) => isSubCommissionModelAllowed(parentModel, model));
}

export function getDefaultSubAffiliateCommissionModel(parentModel: string): CommissionModel {
  return getAllowedSubAffiliateCommissionModels(parentModel)[0] ?? 'revshare';
}
