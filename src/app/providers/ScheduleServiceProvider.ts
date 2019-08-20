import EmptyCountScheduler from '../schedulers/EmptyCountScheduler'

export default class ScheduleServiceProvider {
  public boot(): void {
    EmptyCountScheduler.run()
  }
}
