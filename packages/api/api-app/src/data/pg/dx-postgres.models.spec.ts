import { getPostgresModels, logLoadedPostgresModels } from './dx-postgres.models'

jest.mock('@dx3/api-libs/error-handler/error-handler.ts')

describe('getPostgresModels', () => {
  it('should exist', () => {
    // arrange
    // act
    // assert
    expect(getPostgresModels).toBeDefined()
  })

  it('should return an array of models when invoked', () => {
    // arrange
    // act
    const models = getPostgresModels()
    // assert
    expect(models).toBeDefined()
    expect(models).toHaveLength(8)
  })
})

describe('logLoadedPostgresModels', () => {
  // beforeEach(() => {
  //   jest.spyOn(console, 'table').mockImplementation(() => {});
  // });

  it('should exist', () => {
    // arrange
    // act
    // assert
    expect(logLoadedPostgresModels).toBeDefined()
  })
})
