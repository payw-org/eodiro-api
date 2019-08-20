import { Response, SimpleHandler } from 'Http/RequestHandler'
import Floor from 'Database/models/floor'
import logger from 'Configs/log'
import { FloorDoc } from 'Database/schemas/floor'
import { ClassroomDoc } from 'Database/schemas/classroom'
import { LectureDoc } from 'Database/schemas/lecture'
import { ClassDoc } from 'Database/schemas/class'
import LecturesComparator from 'Helpers/LecturesComparator'
import { TimeDoc } from 'Database/schemas/time'

export interface LectureInfo {
  name: string
  instructor: string
  time: TimeDoc
}

interface ClassroomInfo {
  number: string
  lectures: LectureInfo[]
}

export default class ClassroomsController {
  /**
   * Get a listing of the classroom.
   */
  public static index(): SimpleHandler {
    return async (req, res): Promise<Response> => {
      const floorId = res.locals.floorId

      // find all classroom document of the floor
      const floor = (await Floor.findById(
        floorId,
        { _id: 0, classrooms: 1 },
        err => {
          if (err) {
            logger.error(err)
          }
        }
      ).populate({
        path: 'classrooms',
        select: 'number lectures -_id',
        options: { sort: { number: 1 } }, // sort by ascending order of classroom number
        populate: {
          path: 'lectures',
          select: 'class order -_id',
          populate: {
            path: 'class',
            select: '-times._id -_id'
          }
        }
      })) as FloorDoc

      const classrooms = floor.classrooms as ClassroomDoc[]

      // if classroom list not exist
      if (classrooms.length === 0) {
        res.status(404).json({
          err: {
            msg: 'Classrooms not found.'
          }
        })
      }

      let lectureList: LectureInfo[]
      const classroomList: ClassroomInfo[] = []

      // data formatting
      classrooms.forEach((classroom: ClassroomDoc) => {
        const lectures = classroom.lectures as LectureDoc[]
        lectureList = []

        lectures.forEach((lecture: LectureDoc) => {
          const cls = lecture.class as ClassDoc

          lectureList.push({
            name: cls.name,
            instructor: cls.instructor,
            time: cls.times[lecture.order]
          })
        })

        // sort by lecture time flow
        lectureList.sort(LecturesComparator.comparator())

        classroomList.push({
          number: classroom.number,
          lectures: lectureList
        })
      })

      return res.status(200).json({
        classrooms: classroomList
      })
    }
  }
}
