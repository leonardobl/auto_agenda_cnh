import type { Request, Response } from 'express'
import type { LicenseCategoryService } from '../models/licenseCategoryService.ts'
import { presentLicenseCategory } from '../views/licenseCategoryView.ts'

interface LicenseCategoryControllerDeps {
  licenseCategoryService: LicenseCategoryService
}

export function createLicenseCategoryController({ licenseCategoryService }: LicenseCategoryControllerDeps) {
  return {
    list(_req: Request, res: Response) {
      const categories = licenseCategoryService.list()
      res.status(200).json(categories.map(presentLicenseCategory))
    },
  }
}
