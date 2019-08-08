import { SimpleHandler } from 'Http/RequestHandler'
import University from 'Database/models/university'
import logger from 'Configs/log'
import { UniversityDoc } from 'Database/schemas/university'

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
    return async (req, res) => {
      let language = req.body.language

      // find all university document
      const universities = <UniversityDoc[]>await University.find(
        {},
        { _id: 0, name: 1, campus: 1, vendor: 1 },
        err => {
          if (err) {
            logger.error(err)
          }
        }
      ).sort([['name.' + language, 1]])

      // if not exist
      if (universities.length === 0) {
        return res.status(404).json({
          err: {
            msg: 'Campuses not found.'
          }
        })
      }

      // data formatting
      const campus_list: CampusInfo[] = []
      universities.forEach(univ => {
        campus_list.push({
          university: univ.name[language],
          campus: univ.campus[language],
          vendor: univ.vendor
        })
      })

      return res.status(200).json({
        campuses: campus_list
      })
    }
  }
}
