import { ForbiddenError, NotFoundError } from "../../core/errors/app-error"
import type { GymRepository } from "./gym.repository"

const mapGym = (gym: { readonly id: string; readonly name: string; readonly address: string }) => ({
  _id: gym.id,
  name: gym.name,
  address: gym.address,
})

export class GymService {
  constructor(private readonly repository: GymRepository) {}

  async create(userId: string, name: string, address: string) {
    return mapGym(await this.repository.create(userId, name, address))
  }

  async list(userId: string) {
    return (await this.repository.list(userId)).map(mapGym)
  }

  async get(userId: string, gymId: string) {
    const gym = await this.repository.findOne(userId, gymId)

    if (!gym || gym.deletedAt) {
      throw new NotFoundError("GYM_NOT_FOUND")
    }

    return mapGym(gym)
  }

  async update(userId: string, gymId: string, name: string, address: string) {
    const gym = await this.repository.findOne(userId, gymId)

    if (!gym) {
      throw new ForbiddenError("GYM_ACCESS_DENIED")
    }

    return mapGym(await this.repository.update(gymId, name, address))
  }

  async remove(userId: string, gymId: string) {
    const gym = await this.repository.findOne(userId, gymId)

    if (!gym) {
      throw new ForbiddenError("GYM_ACCESS_DENIED")
    }

    await this.repository.softDelete(gymId)
    return { msg: "DELETED" }
  }
}
