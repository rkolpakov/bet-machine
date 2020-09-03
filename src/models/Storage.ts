import { IStorageData, IStorage } from '../interfaces'

export default class Storage implements IStorage {
  private storage: IStorageData = {}

  public set(data: IStorageData) {
    this.storage = data
  }

  public get() {
    return this.storage
  }
}
