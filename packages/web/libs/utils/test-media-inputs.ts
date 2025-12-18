import { isMobile } from './is-mobile'

export { testAllMediaInputs, testCameraInputs }

//////////////////////

async function hasCameraAccess(ua: string): Promise<boolean> {
  const isIE = ua.indexOf('MSIE ') > -1

  if (isIE) {
    return false
  }

  // Determine enumerateDrives() is supported
  const canDetect =
    navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function'

  if (!canDetect) {
    return false
  }

  const hasWebCam = await navigator.mediaDevices.enumerateDevices().then((devices) => {
    return devices.some((d) => d.kind === 'videoinput')
  })

  return hasWebCam
}

async function cameraNotBlocked() {
  const constraint = { video: true }
  const media = await navigator.mediaDevices.getUserMedia(constraint)
  return media.active
}

async function audioNotBlocked() {
  const constraint = { audio: true }
  const media = await navigator.mediaDevices.getUserMedia(constraint)
  return media.active
}

async function testAllMediaInputs() {
  const ua = window.navigator.userAgent
  const mediaInputs = {
    audio: false,
    cameraEnabled: false,
    hasCamera: false,
    isMobile: isMobile(),
    userAgent: ua,
  }

  try {
    // Camera Tests
    const accessToCamera = await hasCameraAccess(ua)
    if (accessToCamera) {
      mediaInputs.hasCamera = true
    }
    const camNotBlocked = await cameraNotBlocked()
    if (camNotBlocked) {
      mediaInputs.cameraEnabled = true
    }

    // Audio Test
    const micNotBlocked = await audioNotBlocked()
    if (micNotBlocked) {
      mediaInputs.audio = true
    }
  } catch (e) {
    console.log((e as Error).name)
    try {
      const micNotBlocked = await audioNotBlocked()
      if (micNotBlocked) {
        mediaInputs.audio = true
      }
    } catch (e) {
      console.log((e as Error).name)
    }
  }

  return mediaInputs
}

async function testCameraInputs() {
  const ua = window.navigator.userAgent
  const mediaInputs = {
    cameraEnabled: false,
    hasCamera: false,
    isMobile: isMobile(),
    userAgent: ua,
  }

  try {
    // Camera Tests
    const accessToCamera = await hasCameraAccess(ua)
    if (accessToCamera) {
      mediaInputs.hasCamera = true
    }
    const camNotBlocked = await cameraNotBlocked()
    if (camNotBlocked) {
      mediaInputs.cameraEnabled = true
    }
  } catch (e) {
    console.log((e as Error).name)
  }

  return mediaInputs
}
