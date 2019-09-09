import mongoose from 'mongoose'
import classListSchema from 'Database/schemas/class-list'

export default mongoose.model('ClassList', classListSchema, 'classLists')
