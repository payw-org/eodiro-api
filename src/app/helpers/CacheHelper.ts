import LRU from 'lru-cache'

const cacheOptions = {
  max: 5000000,
  maxAge: 1000 * 60 * 60 * 72
}

export default class CacheHelper {
  /**
   * LRU cache
   */
  private static cache = new LRU(cacheOptions)

  public static getCache(): LRU<{}, {}> {
    return this.cache
  }
}
