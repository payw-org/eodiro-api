/**
 * Model for empty classroom count info which calculated in advance.
 *
 * @author H.Chihoon
 * @copyright 2019 Payw
 */

import mongoose from 'mongoose'
import emptyCountSchema from '../schemas/empty_count'

export default mongoose.model('EmptyCount', emptyCountSchema, 'emptyCounts')
