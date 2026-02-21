import { Readable } from 'node:stream'
import {
  CopyObjectCommand,
  type CopyObjectCommandInput,
  CreateBucketCommand,
  type CreateBucketCommandInput,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListBucketsCommand,
  ListObjectsCommand,
  type ListObjectsCommandOutput,
  type PutObjectCommandInput,
  S3,
  type S3ClientConfig,
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { Response } from 'express'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import type { S3ServiceParamType } from './s3.types'

export class S3Service {
  private logger: ApiLoggingClassType
  private s3: typeof S3.prototype

  constructor(params: S3ServiceParamType) {
    this.logger = ApiLoggingClass.instance
    this.s3 = S3Service.getS3Client(params)
  }

  public static getS3ConfigForProvider(params: S3ServiceParamType): S3ClientConfig {
    const { accessKeyId, endpoint, provider, region, secretAccessKey } = params

    if (provider === 'minio') {
      return {
        credentials: {
          accessKeyId: accessKeyId ?? 'local',
          secretAccessKey: secretAccessKey ?? 'local123',
        },
        endpoint: endpoint ?? 'http://localhost:9000',
        forcePathStyle: true,
        region: region ?? 'us-east-1',
      }
    }

    if (provider === 'spaces') {
      return {
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
        },
        endpoint: endpoint,
        forcePathStyle: false,
        region: region ?? 'nyc3',
      }
    }

    // default AWS
    return {
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      forcePathStyle: false,
      region: region ?? 'us-east-1',
    }
  }

  public static getS3Client(params: S3ServiceParamType) {
    let s3Instance = new S3()
    const config = S3Service.getS3ConfigForProvider(params)

    try {
      s3Instance = new S3(config)
    } catch (err) {
      ApiLoggingClass.instance.logError((err as Error).message || 'Error creating S3 Client')
    }

    return s3Instance
  }

  private async createBucket(bucketName: string) {
    const params: CreateBucketCommandInput = {
      Bucket: bucketName,
    }
    const createBucketCmd = new CreateBucketCommand(params)
    try {
      const createResponse = await this.s3.send(createBucketCmd)
      if (createResponse.Location) {
        return true
      }

      return false
    } catch (err) {
      this.logger.logError((err as Error).message || `Error creating bucket: ${bucketName}`)
      return false
    }
  }

  private async doesBucketExist(bucketName: string) {
    try {
      const listCommand = new ListBucketsCommand()
      const listResponse = await this.s3.send(listCommand)
      let bucketExists = false
      if (!listResponse.Buckets) {
        return false
      }

      for (const bucket of listResponse.Buckets) {
        if (bucketName.startsWith(bucket.Name || '')) {
          bucketExists = true
        }
      }

      return bucketExists
    } catch (err) {
      this.logger.logError(`got error listing bucket: ${bucketName}`)
      this.logger.logError((err as Error).message || '')
      return false
    }
  }

  public async instantiate(appBucket: string, scopedBuckets: string[]) {
    for (const scopedBucket of scopedBuckets) {
      const bucketName = `${appBucket}-${scopedBucket}`
      if (!(await this.doesBucketExist(bucketName))) {
        await this.createBucket(bucketName)
      }
    }
  }

  /**
   * Uploads an object to S3.
   * @param bucket - The S3 bucket name
   * @param key - The object key (path)
   * @param file - The file buffer to upload
   * @param mimeType - The MIME type of the file
   * @param metadata - Optional metadata to attach to the object
   * @param acl - Access control list setting. Defaults to 'private' for security.
   *              Use 'public-read' only when files must be publicly accessible.
   */
  public async uploadObject(
    bucket: string,
    key: string,
    file: Buffer,
    mimeType: string,
    metadata?: Record<string, string>,
    acl: 'private' | 'public-read' = 'private',
  ) {
    try {
      const params: PutObjectCommandInput = {
        ACL: acl,
        Body: file,
        Bucket: bucket,
        ContentType: mimeType,
        Key: key,
        Metadata: metadata,
      }
      return await new Upload({
        client: this.s3,
        params,
      }).done()
    } catch (err) {
      this.logger.logError((err as Error).message || 'Error uploading S3 Object')
    }
  }

  async moveObject(
    sourcePath: string,
    destinationBucket: string,
    key: string,
    metaData?: Record<string, string>,
    tagging?: string,
  ) {
    const params: CopyObjectCommandInput = {
      Bucket: destinationBucket,
      CopySource: sourcePath,
      Key: key,
      Metadata: metaData,
      Tagging: tagging,
    }

    try {
      const command = new CopyObjectCommand(params)
      const moved = await this.s3.send(command)
      return moved.$metadata.httpStatusCode === 200
    } catch (err) {
      this.logger.logError((err as Error).message || 'Error moving S3 Object')
      throw new Error((err as Error).message || 'Error moving S3 Object')
    }
  }

  async getObject(bucket: string, key: string, res?: Response) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ResponseCacheControl: 'max-age=31536000',
      })
      const file = await this.s3.send(command)

      if (file.Body instanceof Readable) {
        if (res) {
          file.Body.once('error', (err) => {
            this.logger.logError('Error downloading S3 File', err)
          })

          res.set('etag', file.ETag)
          res.set('cache-control', file.CacheControl)

          file.Body.pipe(res)
        }

        return file.Body
      }

      return null
    } catch (ex) {
      this.logger.logError(`${(ex as Error).message}: ${bucket}/${key}`)
      throw new Error((ex as Error).message)
    }
  }

  async getSignedUrlPromise(bucketName: string, key: string, expiresInSeconds = 900) {
    try {
      const params = {
        Bucket: bucketName,
        Key: key,
      }

      const url = await getSignedUrl(this.s3, new GetObjectCommand(params), {
        expiresIn: expiresInSeconds,
      })

      return { expires: expiresInSeconds, url }
    } catch (ex) {
      const message = `Error Getting Signed Url. Message: ${(ex as Error).message}`
      throw new Error(message)
    }
  }

  async emptyS3Directory(bucket: string, dir: string) {
    if (!dir) {
      this.logger.logError('Directory name not provided.')
      return {
        message: 'Director not provided.',
        removed: false,
      }
    }

    const LIST_PARAMS = {
      Bucket: bucket,
      Prefix: `${dir}/`,
    }

    const listCommand = new ListObjectsCommand(LIST_PARAMS)
    let listedObjects: ListObjectsCommandOutput | undefined
    try {
      listedObjects = await this.s3.send(listCommand)
    } catch (err) {
      this.logger.logError(`Could not get list of object for: ${LIST_PARAMS.Prefix}`)
      this.logger.logError((err as Error).message || '')
    }

    if (listedObjects?.Contents && listedObjects.Contents.length === 0) {
      this.logger.logInfo(`S3 directory was empty: slug: ${dir}, in bucket: ${bucket}`)
      return {
        message: 'Directory is empty',
        removed: true,
      }
    }

    const deleteParams = {
      Bucket: bucket,
      Delete: { Objects: [] } as { Objects: { Key: string }[] },
    }

    listedObjects?.Contents?.forEach(({ Key }) => {
      return !!Key && deleteParams.Delete.Objects.push({ Key })
    })

    const deleteCommand = new DeleteObjectsCommand(deleteParams)
    try {
      await this.s3.send(deleteCommand)
    } catch (err) {
      this.logger.logError(`Could not delete objects from: ${LIST_PARAMS.Prefix}`)
      this.logger.logError((err as Error).message || '')
    }

    // there were sooo many items in the directory that the original list was truncated
    // run this function again.
    if (listedObjects?.IsTruncated) {
      this.logger.logInfo(
        `directory: { bucket: ${LIST_PARAMS.Bucket}, prefix: ${LIST_PARAMS.Prefix} } is truncated, recursing`,
      )
      await this.emptyS3Directory(bucket, dir)
    }

    return {
      message: 'Success',
      removed: !!listedObjects?.Contents?.length,
    }
  }

  public async getContentType(bucketName: string, folderName: string) {
    try {
      const headObjCmd = new HeadObjectCommand({
        Bucket: bucketName,
        Key: folderName,
      })
      const head = await this.s3.send(headObjCmd)

      return head.ContentType
    } catch (err) {
      this.logger.logError((err as Error).message || 'Could not get content type')
      return ''
    }
  }
}

export type S3ServiceType = typeof S3Service.prototype
