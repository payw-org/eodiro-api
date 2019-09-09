import { SimpleHandler, Response } from 'Http/RequestHandler'
import ClassList from 'Database/models/class-list'
import PriorityComparator from 'Helpers/PriorityComparator'
import University from 'Database/models/university'
import { UniversityDoc } from 'Database/schemas/university'
import { ClassListDoc } from 'Database/schemas/class-list'
import Class from 'Database/models/class'
import { ClassDoc } from 'Database/schemas/class'
import Fuse from 'fuse.js'
import { checkSchema, ValidationChain } from 'express-validator'

interface FilterList {
  year: string[]
  semester: string[]
  campus: string[]
  mainCourse: string[]
  college: string[]
  subject: string[]
}

interface FilterValue {
  year: string
  semester: string
  campus: string
  mainCourse: string
  college?: string
  subject?: string
}

interface Filter {
  value: FilterValue
  list: FilterList
}

type SearchResults = ClassDoc[]

interface SearchReturn {
  isEnd: boolean
  result: SearchResults
}

interface Search {
  word: string
  page: number
  count: number
  isEnd: boolean
  result: SearchResults
}

interface GetResponseBody {
  filter: Filter
  search: Search
}

interface UpdateResponseBody {
  filter?: Filter
  search: Search
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

const searchOptions = {
  shouldSort: true,
  threshold: 0.5,
  location: 0,
  distance: 100,
  maxPatternLength: 80,
  minMatchCharLength: 1,
  keys: [
    {
      name: 'name',
      weight: 0.5
    },
    {
      name: 'instructor',
      weight: 0.3
    },
    {
      name: 'note',
      weight: 0.2
    }
  ]
}

const defaultCount = 50

export default class SearchController {
  /**
   * Validate `get` request.
   */
  public static validateGet(): ValidationChain[] {
    return checkSchema({
      count: {
        optional: true,
        in: 'query',
        isInt: true,
        errorMessage: '`count` must be a number.'
      }
    })
  }

  /**
   * Get default filter list and value.
   * And Search by default filter value.
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

      const filterList: FilterList = {
        year: yearList,
        semester: semesterList,
        campus: campusList,
        mainCourse: mainCourseList,
        college: collegeList,
        subject: subjectList
      }

      const filterValue: FilterValue = {
        year: year,
        semester: semester,
        campus: campus,
        mainCourse: mainCourse
      }

      const searchWord = ''
      const searchPage = 0
      const searchCount = parseInt(req.query.count) || defaultCount
      const searchResult = await this.search(
        filterValue,
        searchWord,
        searchPage,
        searchCount
      )

      const responseBody: GetResponseBody = {
        filter: {
          value: filterValue,
          list: filterList
        },
        search: {
          word: searchWord,
          page: searchPage,
          count: searchCount,
          isEnd: searchResult.isEnd,
          result: searchResult.result
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
      'filter.isChange': {
        optional: true,
        in: 'body',
        isBoolean: true,
        errorMessage: '`isChange` must be boolean.'
      },
      'filter.year': {
        exists: true,
        in: 'body',
        isString: true,
        trim: true,
        escape: true,
        errorMessage: '`year` must be a string.'
      },
      'filter.semester': {
        exists: true,
        in: 'body',
        isString: true,
        trim: true,
        escape: true,
        errorMessage: '`semester` must be a string.'
      },
      'filter.campus': {
        exists: true,
        in: 'body',
        isString: true,
        trim: true,
        escape: true,
        errorMessage: '`campus` must be a string.'
      },
      'filter.mainCourse': {
        exists: true,
        in: 'body',
        isString: true,
        trim: true,
        escape: true,
        errorMessage: '`mainCourse` must be a string.'
      },
      'filter.college': {
        optional: true,
        in: 'body',
        isString: true,
        trim: true,
        escape: true,
        errorMessage: '`college` must be a string.'
      },
      'filter.subject': {
        optional: true,
        in: 'body',
        isString: true,
        trim: true,
        escape: true,
        errorMessage: '`subject` must be a string.'
      },
      'search.word': {
        optional: true,
        in: 'body',
        isString: true,
        trim: true,
        escape: true,
        errorMessage: '`word` must be a string.'
      },
      'search.page': {
        optional: true,
        in: 'body',
        isInt: true,
        errorMessage: '`page` must be a number.'
      },
      'search.count': {
        optional: true,
        in: 'body',
        isInt: true,
        errorMessage: '`count` must be a number.'
      }
    })
  }

  /**
   * Partial update filter value or search word.
   * And search by updated filter value.
   */
  public static update(): SimpleHandler {
    return async (req, res): Promise<Response> => {
      let year = req.body.filter.year
      let semester = req.body.filter.semester
      let campus = req.body.filter.campus
      let mainCourse = req.body.filter.mainCourse
      let college = req.body.filter.college
      let subject = req.body.filter.subject
      let isChange = false
      if (req.body.filter.isChange !== false) {
        isChange = true
      }

      let filterList: FilterList

      // if filter value is changed
      if (isChange) {
        // Check if filter value are valid.
        // And get updated filter list.

        const yearList = await this.getYearList()
        if (!yearList.includes(year)) {
          year = yearList[0]
        }

        const semesterList = await this.getSemesterList(year)
        if (!semesterList.includes(semester)) {
          semester = semesterList[0]
        }

        const campusList = await this.getCampusList(year, semester)
        if (!campusList.includes(campus)) {
          campus = campusList[0]
        }

        const mainCourseList = await this.getMainCourseList(
          year,
          semester,
          campus
        )
        if (!mainCourseList.includes(mainCourse)) {
          mainCourse = mainCourseList[0]
        }

        const collegeList = await this.getCollegeList(
          year,
          semester,
          campus,
          mainCourse
        )
        if (!collegeList.includes(college)) {
          college = ''
        }

        const subjectList = await this.getSubjectList(
          year,
          semester,
          campus,
          mainCourse,
          college
        )
        if (!subjectList.includes(subject)) {
          subject = ''
        }

        filterList = {
          year: yearList,
          semester: semesterList,
          campus: campusList,
          mainCourse: mainCourseList,
          college: collegeList,
          subject: subjectList
        }
      }

      const filterValue: FilterValue = {
        year: year,
        semester: semester,
        campus: campus,
        mainCourse: mainCourse
      }

      if (college) {
        filterValue.college = college
      }

      if (subject) {
        filterValue.subject = subject
      }

      let searchWord, searchCount, searchPage
      if (req.body.search) {
        searchWord = req.body.search.word || ''
        searchPage = req.body.search.page || 0
        searchCount = req.body.search.count || defaultCount
      } else {
        searchWord = ''
        searchPage = 0
        searchCount = defaultCount
      }
      const searchResult = await this.search(
        filterValue,
        searchWord,
        searchPage,
        searchCount
      )

      let responseBody: UpdateResponseBody
      if (isChange) {
        responseBody = {
          filter: {
            value: filterValue,
            list: filterList
          },
          search: {
            word: searchWord,
            page: searchPage,
            count: searchCount,
            isEnd: searchResult.isEnd,
            result: searchResult.result
          }
        }
      } else {
        responseBody = {
          search: {
            word: searchWord,
            page: searchPage,
            count: searchCount,
            isEnd: searchResult.isEnd,
            result: searchResult.result
          }
        }
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

    const classesId = (university.classLists[0] as ClassListDoc).classes

    let subjectList
    if (!college) {
      subjectList = await Class.find(
        { _id: { $in: classesId } },
        { _id: 0, subject: 1 }
      )
        .lean()
        .distinct('subject')
    } else {
      subjectList = await Class.find(
        { _id: { $in: classesId }, college: college },
        { _id: 0, subject: 1 }
      )
        .lean()
        .distinct('subject')
    }
    subjectList.sort()

    return subjectList
  }

  /**
   * Search by filter and word.
   * And slice by page and count.
   *
   * @param filter
   * @param word
   * @param count
   * @param page
   */
  private static async search(
    filter: FilterValue,
    word: string,
    page: number,
    count: number
  ): Promise<SearchReturn> {
    const searchReturn: SearchReturn = {
      result: [],
      isEnd: true
    }

    const university = (await University.findOne(
      { 'campus.kr': filter.campus },
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
          year: filter.year,
          semester: filter.semester,
          mainCourse: filter.mainCourse
        }
      })) as UniversityDoc

    if (university === null) {
      return searchReturn
    }

    if (university.classLists.length === 0) {
      return searchReturn
    }

    const classIds = (university.classLists[0] as ClassListDoc).classes

    let classes: ClassDoc[]
    if (word === '') {
      classes = await Class.find(
        {
          _id: { $in: classIds },
          college: filter.college || /.*/g,
          subject: filter.subject || /.*/g
        },
        { _id: 0, __v: 0, 'locations._id': 0, 'times._id': 0 }
      )
        .lean()
        .skip(page * count)
        .limit(count + 1)
    } else {
      classes = await Class.find(
        {
          _id: { $in: classIds },
          college: filter.college || /.*/g,
          subject: filter.subject || /.*/g
        },
        { _id: 0, __v: 0, 'locations._id': 0, 'times._id': 0 }
      ).lean()

      const fuse = new Fuse(classes, searchOptions)
      classes = fuse.search(word).slice(page * count, (page + 1) * count + 1)
    }

    if (classes.length === count + 1) {
      searchReturn.isEnd = false
    }
    searchReturn.result = classes.slice(0, count)

    return searchReturn
  }
}
