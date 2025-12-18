type AppleWellKnownComponent = {
  [key: string]: string | boolean
  comment: string
  exclude?: boolean
}

type AppleWellKnownDetails = {
  appIDs: string[]
  components: AppleWellKnownComponent[]
}

export type AppleWellKnownData = {
  applinks: {
    details: AppleWellKnownDetails[]
  }
  webcredentials: {
    apps: string[]
  }
}

export type AndroiodWellKnownData = {
  relation: string[]
  target: {
    namespace: string
    package_name: string
    sha256_cert_fingerprints: string[]
  }
}
