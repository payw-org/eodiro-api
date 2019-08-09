import { SimpleHandler } from 'Http/RequestHandler'
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
    return async (req, res) => {
      let floor_id = res.locals.floor_id

      // find all classroom document of the floor
      const floor = <FloorDoc>await Floor.findById(
        floor_id,
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
      })

      const classrooms = <ClassroomDoc[]>floor.classrooms

      // if classroom list not exist
      if (classrooms.length === 0) {
        res.status(404).json({
          err: {
            msg: 'Classrooms not found.'
          }
        })
      }

      let lecture_list: LectureInfo[]
      const classroom_list: ClassroomInfo[] = []

      // data formatting
      classrooms.forEach((classroom: ClassroomDoc) => {
        const lectures = <LectureDoc[]>classroom.lectures
        lecture_list = []

        lectures.forEach((lecture: LectureDoc) => {
          const cls = <ClassDoc>lecture.class

          lecture_list.push({
            name: cls.name,
            instructor: cls.instructor,
            time: cls.times[lecture.order]
          })
        })

        // sort by lecture time flow
        lecture_list.sort(LecturesComparator.comparator())

        classroom_list.push({
          number: classroom.number,
          lectures: lecture_list
        })
      })

      return res.status(200).json({
        classrooms: classroom_list
      })
    }
  }
}
