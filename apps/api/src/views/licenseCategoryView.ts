import type { LicenseCategoryRecord } from '../models/licenseCategoryModel.ts'

export function presentLicenseCategory(category: LicenseCategoryRecord) {
  return { id: category.id, code: category.code, name: category.name }
}
