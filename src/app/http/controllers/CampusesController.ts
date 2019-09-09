import { Response, SimpleHandler } from 'Http/RequestHandler'
import University from 'Database/models/university'
import { UniversityDoc } from 'Database/schemas/university'
import LogHelper from 'Helpers/LogHelper'

interface CampusInfo {
  university: string
  campus: string
  vendor: string
}

export default class CampusesController {
  /**
   * Get a listing of the campus.
   */
  public static index(): SimpleHandler {
    return async (req, res): Promise<Response> => {
      const language = req.body.language

      // find all university document
      const universities = (await University.find(
        {},
        { _id: 0, name: 1, campus: 1, vendor: 1 },
        err => {
          if (err) {
            LogHelper.log('error', err)
          }
        }
      )
        .lean()
        .sort([['name.' + language, 1]])) as UniversityDoc[]

      // if not exist
      if (universities.length === 0) {
        return res.status(404).json({
          err: {
            msg: 'Campuses not found.'
          }
        })
      }

      // data formatting
      const campusList: CampusInfo[] = []
      universities.forEach(univ => {
        campusList.push({
          university: univ.name[language],
          campus: univ.campus[language],
          vendor: univ.vendor
        })
      })

      return res.status(200).json({
        campuses: campusList
      })
    }
  }
}
