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
   * @param date
   */
  public static async isEmpty(
    classroom_id: string,
    date: Date = new Date()
  ): Promise<boolean> {
    const converted_date = this.convertDate(date)

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
          'times.day': converted_date.day,
          'times.start': { $lte: converted_date.time },
          'times.end': { $gte: converted_date.time }
        }
      }
    })

    const lectures = <LectureDoc[]>classroom.lectures
    let is_empty = true

    // make sure the classroom is empty
    lectures.forEach((lecture: LectureDoc) => {
      if (lecture.class !== null) {
        let time = (<ClassDoc>lecture.class).times[lecture.order]

        if (time.day == converted_date.day) {
          if (
            time.start <= converted_date.time &&
            time.end >= converted_date.time
          ) {
            is_empty = false
            return
          }
        }
      }
    })

    return Promise.resolve(is_empty)
  }

  /**
   * Localize GMT+0 date and convert as comparable form.
   *
   * @param date
   */
  private static convertDate(date: Date): CurrentDate {
    // localize
    const local_date = new Date(
      date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' })
    )

    // convert
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
