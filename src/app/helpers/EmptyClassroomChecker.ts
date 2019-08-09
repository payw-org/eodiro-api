import Classroom from 'Database/models/classroom'
import { ClassroomDoc } from 'Database/schemas/classroom'
import { LectureDoc } from 'Database/schemas/lecture'
import { ClassDoc } from 'Database/schemas/class'

interface CurrentDate {
  day: number
  time: string
}

export default class EmptyClassroomChecker {
  /**
   * Checks whether a classroom is empty.
   *
   * @param classroom_id
   */
  public static async isEmpty(classroom_id: string): Promise<boolean> {
    const curr_date = this.getCurrentDate()

    // find all lectures which time is matched with current time
    const classroom = <ClassroomDoc>await Classroom.findById(classroom_id, {
      _id: 0,
      lectures: 1
    }).populate({
      path: 'lectures',
      select: 'class order -_id',
      populate: {
        path: 'class',
        select: 'times -_id',
        match: {
          'times.day': curr_date.day,
          'times.start': { $lte: curr_date.time },
          'times.end': { $gte: curr_date.time }
        }
      }
    })

    const lectures = <LectureDoc[]>classroom.lectures
    let is_empty = true

    // make sure the classroom is empty
    lectures.forEach((lecture: LectureDoc) => {
      if (lecture.class !== null) {
        let time = (<ClassDoc>lecture.class).times[lecture.order]

        if (time.day == curr_date.day) {
          if (time.start <= curr_date.time && time.end >= curr_date.time) {
            is_empty = false
            return
          }
        }
      }
    })

    return Promise.resolve(is_empty)
  }

  /**
   * Get current local date as comparable form.
   */
  private static getCurrentDate(): CurrentDate {
    const local_date = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' })
    )

    let day = local_date.getDay()
    let hour = local_date
      .getHours()
      .toString()
      .padStart(2, '0')
    let min = local_date
      .getMinutes()
      .toString()
      .padStart(2, '0')

    return { day: day, time: hour + min }
  }
}
