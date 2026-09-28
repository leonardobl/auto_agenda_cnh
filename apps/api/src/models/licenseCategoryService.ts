import type { LicenseCategoryModel, LicenseCategoryRecord } from './licenseCategoryModel.ts'

export interface LicenseCategoryService {
  list(): Promise<LicenseCategoryRecord[]>
}

interface LicenseCategoryServiceDeps {
  licenseCategoryModel: LicenseCategoryModel
}

// Static lookup (A/B/AB/C/D/E) — no business rule beyond "return them all", kept as a
// service so the controller never touches a *Model directly.
export function createLicenseCategoryService({
  licenseCategoryModel,
}: LicenseCategoryServiceDeps): LicenseCategoryService {
  return {
    list() {
      return licenseCategoryModel.findAll()
    },
  }
}
