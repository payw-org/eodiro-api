import { SimpleHandler, Response } from 'Http/RequestHandler'
import University from 'Database/models/university'
import ClassList from 'Database/models/class-list'
import PriorityComparator from 'Helpers/PriorityComparator'
import { UniversityDoc } from 'Database/schemas/university'
import { ClassListDoc } from 'Database/schemas/class-list'
import Class from 'Database/models/class'
import { checkSchema, ValidationChain } from 'express-validator'

interface FilterList {
  year: string[]
  semester: string[]
  campus: string[]
  mainCourse: string[]
  college: string[]
  subject: string[]
}

interface DefaultFilterValue {
  year: string
  semester: string
  campus: string
  mainCourse: string
}

interface UpdatedFilterValue extends DefaultFilterValue {
  college?: string
  subject?: string
}

interface GetFilterResponseBody {
  filterList: FilterList
  filterDefault: DefaultFilterValue
}

interface UpdateFilterResponseBody {
  filterList: FilterList
  filterValue: UpdatedFilterValue
}

const semesterPriorityTable = {
  겨울: 0,
  2: 1,
  여름: 2,
  1: 3
}

const campusPriorityTable = {
  서울: 0,
  안성: 1
}

const mainCoursePriorityTable = {
  학부: 0,
  대학원: 1
}

export default class FilterController {
  /**
   * Get all filter list and set default filter value.
   * Initialize and set session value about filter.
   * Return all filter list and default filter value.
   */
  public static get(): SimpleHandler {
    return async (req, res): Promise<Response> => {
      const yearList = await this.getYearList()
      const year = yearList[0]

      const semesterList = await this.getSemesterList(year)
      const semester = semesterList[0]

      const campusList = await this.getCampusList(year, semester)
      const campus = campusList[0]

      const mainCourseList = await this.getMainCourseList(
        year,
        semester,
        campus
      )
      const mainCourse = mainCourseList[0]

      const collegeList = await this.getCollegeList(
        year,
        semester,
        campus,
        mainCourse
      )

      const subjectList = await this.getSubjectList(
        year,
        semester,
        campus,
        mainCourse
      )

      req.session.filter = null // delete old session value about filter
      req.session.filter = {
        year: year,
        semester: semester,
        campus: campus,
        mainCourse: mainCourse
      }

      const responseBody: GetFilterResponseBody = {
        filterList: {
          year: yearList,
          semester: semesterList,
          campus: campusList,
          mainCourse: mainCourseList,
          college: collegeList,
          subject: subjectList
        },
        filterDefault: {
          year: year,
          semester: semester,
          campus: campus,
          mainCourse: mainCourse
        }
      }

      return res.status(200).json(responseBody)
    }
  }

  /**
   * Validate `update` request.
   */
  public static validateUpdate(): ValidationChain[] {
    return checkSchema({
      year: {
        optional: true,
        in: 'body',
        isString: true,
        trim: true,
        escape: true,
        errorMessage: '`year` must be a string.'
      },
      semester: {
        optional: true,
        in: 'body',
        isString: true,
        trim: true,
        escape: true,
        errorMessage: '`semester` must be a string.'
      },
      campus: {
        optional: true,
        in: 'body',
        isString: true,
        trim: true,
        escape: true,
        errorMessage: '`campus` must be a string.'
      },
      mainCourse: {
        optional: true,
        in: 'body',
        isString: true,
        trim: true,
        escape: true,
        errorMessage: '`mainCourse` must be a string.'
      },
      college: {
        optional: true,
        in: 'body',
        isString: true,
        trim: true,
        escape: true,
        errorMessage: '`college` must be a string.'
      },
      subject: {
        optional: true,
        in: 'body',
        isString: true,
        trim: true,
        escape: true,
        errorMessage: '`subject` must be a string.'
      }
    })
  }

  /**
   * Partial update to the filter value.
   * Get filter list and filter value according to updated thing.
   * Update session value about filter to new.
   * Return new filter list and filter value.
   */
  public static update(): SimpleHandler {
    return async (req, res): Promise<Response> => {
      const yearList = await this.getYearList()

      let year = req.body.year || req.session.filter.year // get old if not updated
      // Set as default if not in the list
      if (!yearList.includes(year)) {
        year = yearList[0]
      }

      const semesterList = await this.getSemesterList(year)

      let semester = req.body.semester || req.session.filter.semester
      if (!semesterList.includes(semester)) {
        semester = semesterList[0]
      }

      const campusList = await this.getCampusList(year, semester)

      let campus = req.body.campus || req.session.filter.campus
      if (!campusList.includes(campus)) {
        campus = campusList[0]
      }

      const mainCourseList = await this.getMainCourseList(
        year,
        semester,
        campus
      )

      let mainCourse = req.body.mainCourse || req.session.filter.mainCourse
      if (!mainCourseList.includes(mainCourse)) {
        mainCourse = mainCourseList[0]
      }

      const collegeList = await this.getCollegeList(
        year,
        semester,
        campus,
        mainCourse
      )

      let college
      // empty string filter value means all selecting
      if (req.body.college === '') {
        college = ''
      } else {
        college = req.body.college || req.session.filter.college
        if (!collegeList.includes(college)) {
          college = ''
        }
      }

      const subjectList = await this.getSubjectList(
        year,
        semester,
        campus,
        mainCourse,
        college
      )

      let subject
      if (req.body.subject === '') {
        subject = ''
      } else {
        subject = req.body.subject || req.session.filter.subject
        if (!subjectList.includes(subject)) {
          subject = ''
        }
      }

      // update to new filter value
      req.session.filter = {
        year: year,
        semester: semester,
        campus: campus,
        mainCourse: mainCourse
      }

      const responseBody: UpdateFilterResponseBody = {
        filterList: {
          year: yearList,
          semester: semesterList,
          campus: campusList,
          mainCourse: mainCourseList,
          college: collegeList,
          subject: subjectList
        },
        filterValue: {
          year: year,
          semester: semester,
          campus: campus,
          mainCourse: mainCourse
        }
      }

      if (college) {
        responseBody.filterValue.college = college
        req.session.filter.college = college
      }

      if (subject) {
        responseBody.filterValue.subject = subject
        req.session.filter.subject = subject
      }

      return res.status(200).json(responseBody)
    }
  }

  /**
   * Get year list by descending order.
   */
  private static async getYearList(): Promise<string[]> {
    const yearList = await ClassList.distinct('year')
    yearList.sort().reverse()

    return yearList
  }

  /**
   * Get semester list by priority.
   *
   * @param year
   */
  private static async getSemesterList(year: string): Promise<string[]> {
    const semesterList = await ClassList.distinct('semester', {
      year: year
    })
    semesterList.sort(PriorityComparator.comparator(semesterPriorityTable))

    return semesterList
  }

  /**
   * Get campus list by priority.
   *
   * @param year
   * @param semester
   */
  private static async getCampusList(
    year: string,
    semester: string
  ): Promise<string[]> {
    // find class lists by given year, semester
    const universities = (await University.find(
      {},
      { _id: 0, 'campus.kr': 1, classLists: 1 }
    )
      .lean()
      .populate({
        path: 'classLists',
        select: 'year semester -_id',
        match: {
          year: year,
          semester: semester
        }
      })) as UniversityDoc[]

    const campusList = universities
      .filter(univ => univ.classLists.length !== 0)
      .map(univ => univ.campus.kr)
    campusList.sort(PriorityComparator.comparator(campusPriorityTable))

    return campusList
  }

  /**
   * Get main course list by priority.
   *
   * @param year
   * @param semester
   * @param campus
   */
  private static async getMainCourseList(
    year: string,
    semester: string,
    campus: string
  ): Promise<string[]> {
    // find class lists by given year, semester, campus
    const university = (await University.findOne(
      { 'campus.kr': campus },
      {
        _id: 0,
        classLists: 1
      }
    )
      .lean()
      .populate({
        path: 'classLists',
        select: 'year semester mainCourse -_id',
        match: {
          year: year,
          semester: semester
        }
      })) as UniversityDoc

    const mainCourseList = (university.classLists as ClassListDoc[]).map(
      classList => classList.mainCourse
    )
    mainCourseList.sort(PriorityComparator.comparator(mainCoursePriorityTable))

    return mainCourseList
  }

  /**
   * Get college list by ascending order.
   *
   * @param year
   * @param semester
   * @param campus
   * @param mainCourse
   */
  private static async getCollegeList(
    year: string,
    semester: string,
    campus: string,
    mainCourse: string
  ): Promise<string[]> {
    // find class list by given year, semester, campus, main course
    const university = (await University.findOne(
      { 'campus.kr': campus },
      {
        _id: 0,
        classLists: 1
      }
    )
      .lean()
      .populate({
        path: 'classLists',
        select: 'year semester mainCourse classes -_id',
        match: {
          year: year,
          semester: semester,
          mainCourse: mainCourse
        }
      })) as UniversityDoc

    const classList = university.classLists[0] as ClassListDoc

    const collegeList = await Class.find(
      { _id: { $in: classList.classes } },
      { _id: 0, college: 1 }
    )
      .lean()
      .distinct('college')
    collegeList.sort()

    return collegeList
  }

  /**
   * Get subject list by ascending order.
   *
   * @param year
   * @param semester
   * @param campus
   * @param mainCourse
   * @param college
   */
  private static async getSubjectList(
    year: string,
    semester: string,
    campus: string,
    mainCourse: string,
    college?: string
  ): Promise<string[]> {
    // find class list by given year, semester, campus, main course
    const university = (await University.findOne(
      { 'campus.kr': campus },
      {
        _id: 0,
        classLists: 1
      }
    )
      .lean()
      .populate({
        path: 'classLists',
        select: 'year semester mainCourse classes -_id',
        match: {
          year: year,
          semester: semester,
          mainCourse: mainCourse
        }
      })) as UniversityDoc

    const classList = university.classLists[0] as ClassListDoc

    let subjectList
    if (!college) {
      subjectList = await Class.find(
        { _id: { $in: classList.classes } },
        { _id: 0, subject: 1 }
      )
        .lean()
        .distinct('subject')
    } else {
      subjectList = await Class.find(
        { _id: { $in: classList.classes }, college: college },
        { _id: 0, subject: 1 }
      )
        .lean()
        .distinct('subject')
    }
    subjectList.sort()

    return subjectList
  }
}
