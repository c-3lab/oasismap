export class EntitySaveFailedException extends Error {
  constructor(
    readonly entityId: string,
    readonly cause: unknown,
  ) {
    super(`Entity save failed. entityId=${entityId}`);
    this.name = EntitySaveFailedException.name;
  }
}
