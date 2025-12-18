import { S3Service, type S3ServiceType } from './index'

describe('index', () => {
  describe('Exports', () => {
    it('should export S3Service', () => {
      expect(S3Service).toBeDefined()
    })

    it('should export S3Service as a class', () => {
      expect(typeof S3Service).toBe('function')
      expect(S3Service.name).toBe('S3Service')
    })
  })

  describe('Named Exports', () => {
    it('should allow importing S3Service', () => {
      expect(S3Service).toBeDefined()
    })

    it('should have correct class structure', () => {
      expect(S3Service.prototype).toBeDefined()
      expect(S3Service.prototype.constructor).toBe(S3Service)
    })
  })

  describe('Type Exports', () => {
    it('should export S3ServiceType type', () => {
      // TypeScript compilation will fail if this type is not exported
      // Types don't exist at runtime, so we verify by attempting to use the type
      const testType = {} as S3ServiceType
      expect(testType).toBeDefined()
    })

    it('should allow using S3ServiceType', () => {
      // Verify the type can be used in type annotations
      const service: S3ServiceType = {} as S3ServiceType
      expect(service).toBeDefined()
    })
  })

  describe('Re-exports from s3.service', () => {
    it('should re-export S3Service from service file', () => {
      // If import is successful, this should work
      expect(S3Service).toBeDefined()
      expect(S3Service.name).toBe('S3Service')
    })

    it('should maintain class functionality through re-export', () => {
      expect(S3Service.prototype).toBeDefined()
    })

    it('should have static getS3Client method', () => {
      expect(S3Service.getS3Client).toBeDefined()
      expect(typeof S3Service.getS3Client).toBe('function')
    })
  })

  describe('Module Structure', () => {
    it('should provide clean module interface', () => {
      // Verify main exports are accessible
      expect(S3Service).toBeDefined()
    })

    it('should allow class usage from index', () => {
      expect(typeof S3Service).toBe('function')
    })
  })

  describe('Type Integrity', () => {
    it('should maintain type definitions across re-export', () => {
      const serviceType: S3ServiceType = {} as S3ServiceType
      expect(serviceType).toBeDefined()
    })

    it('should allow type usage in variable declarations', () => {
      let service: S3ServiceType
      service = {} as S3ServiceType
      expect(service).toBeDefined()
    })
  })

  describe('Class Properties', () => {
    it('should have getS3Client static method available', () => {
      expect(S3Service.getS3Client).toBeDefined()
    })

    it('should have prototype defined', () => {
      expect(S3Service.prototype).toBeDefined()
    })

    it('should have constructor available', () => {
      expect(S3Service.prototype.constructor).toBe(S3Service)
    })
  })

  describe('Export Consistency', () => {
    it('should export both class and type', () => {
      expect(S3Service).toBeDefined()
      const type: S3ServiceType = {} as S3ServiceType
      expect(type).toBeDefined()
    })

    it('should maintain correct export types', () => {
      // Named export
      expect(S3Service).toBeDefined()
      // Type export
      const _typeCheck: S3ServiceType = {} as S3ServiceType
      expect(_typeCheck).toBeDefined()
    })
  })

  describe('Method Availability', () => {
    it('should have all expected methods on prototype', () => {
      expect(S3Service.prototype.emptyS3Directory).toBeDefined()
      expect(S3Service.prototype.getObject).toBeDefined()
      expect(S3Service.prototype.getSignedUrlPromise).toBeDefined()
      expect(S3Service.prototype.instantiate).toBeDefined()
      expect(S3Service.prototype.moveObject).toBeDefined()
      expect(S3Service.prototype.uploadObject).toBeDefined()
    })

    it('should have methods as functions', () => {
      expect(typeof S3Service.prototype.emptyS3Directory).toBe('function')
      expect(typeof S3Service.prototype.getObject).toBe('function')
      expect(typeof S3Service.prototype.getSignedUrlPromise).toBe('function')
      expect(typeof S3Service.prototype.instantiate).toBe('function')
      expect(typeof S3Service.prototype.moveObject).toBe('function')
      expect(typeof S3Service.prototype.uploadObject).toBe('function')
    })
  })
})
