'use strict'

const neutralProfile = {
  scaleX: [ 1, 1 ],
  scaleY: [ 1, 1 ],
  offsetXStaffSpaces: [ 0, 0 ],
  offsetYStaffSpaces: [ 0, 0 ],
  rotationDegrees: [ 0, 0 ],
  skewXDegrees: [ 0, 0 ],
  skewYDegrees: [ 0, 0 ],
  perspectiveX: [ 0, 0 ],
  perspectiveY: [ 0, 0 ],
  blurRadiusStaveLineThicknesses: [ 0, 0 ],
  inkThicknessStaveLineThicknesses: [ 0, 0 ],
  noiseStandardDeviation: [ 0, 0 ],
  illuminationAmplitude: [ 0, 0 ],
  vignetteAmplitude: [ 0, 0 ],
  contrastFactor: [ 1, 1 ],
  paperLevel: [ 0, 0 ],
  paddingStaffSpaces: 0.75,
  maxOutputPixels: 40000000
}

function profile (values) {
  return { ...neutralProfile, ...values }
}

export const fullPageMutationProfiles = {
  clean: profile({}),
  screenshot: profile({
    scaleX: [ 0.94, 1.06 ],
    scaleY: [ 0.94, 1.06 ],
    offsetXStaffSpaces: [ -0.3, 0.3 ],
    offsetYStaffSpaces: [ -0.3, 0.3 ],
    noiseStandardDeviation: [ 0.001, 0.004 ],
    illuminationAmplitude: [ 0, 0.015 ],
    contrastFactor: [ 0.96, 1.04 ]
  }),
  'scan-light': profile({
    scaleX: [ 0.92, 1.08 ],
    scaleY: [ 0.92, 1.08 ],
    offsetXStaffSpaces: [ -0.5, 0.5 ],
    offsetYStaffSpaces: [ -0.5, 0.5 ],
    rotationDegrees: [ -0.7, 0.7 ],
    skewXDegrees: [ -0.25, 0.25 ],
    skewYDegrees: [ -0.2, 0.2 ],
    blurRadiusStaveLineThicknesses: [ 0, 0.35 ],
    inkThicknessStaveLineThicknesses: [ -0.2, 0.2 ],
    noiseStandardDeviation: [ 0.002, 0.009 ],
    illuminationAmplitude: [ 0.01, 0.045 ],
    vignetteAmplitude: [ 0, 0.025 ],
    contrastFactor: [ 0.9, 1.08 ],
    paperLevel: [ 0, 0.004 ]
  }),
  'scan-medium': profile({
    scaleX: [ 0.82, 1.18 ],
    scaleY: [ 0.82, 1.18 ],
    offsetXStaffSpaces: [ -0.9, 0.9 ],
    offsetYStaffSpaces: [ -0.9, 0.9 ],
    rotationDegrees: [ -2, 2 ],
    skewXDegrees: [ -0.9, 0.9 ],
    skewYDegrees: [ -0.7, 0.7 ],
    perspectiveX: [ -0.012, 0.012 ],
    perspectiveY: [ -0.012, 0.012 ],
    blurRadiusStaveLineThicknesses: [ 0.15, 0.75 ],
    inkThicknessStaveLineThicknesses: [ -0.4, 0.4 ],
    noiseStandardDeviation: [ 0.006, 0.02 ],
    illuminationAmplitude: [ 0.035, 0.11 ],
    vignetteAmplitude: [ 0.015, 0.07 ],
    contrastFactor: [ 0.8, 1.16 ],
    paperLevel: [ 0.001, 0.01 ]
  }),
  'scan-hard': profile({
    scaleX: [ 0.72, 1.28 ],
    scaleY: [ 0.72, 1.28 ],
    offsetXStaffSpaces: [ -1.4, 1.4 ],
    offsetYStaffSpaces: [ -1.4, 1.4 ],
    rotationDegrees: [ -4, 4 ],
    skewXDegrees: [ -1.8, 1.8 ],
    skewYDegrees: [ -1.4, 1.4 ],
    perspectiveX: [ -0.035, 0.035 ],
    perspectiveY: [ -0.035, 0.035 ],
    blurRadiusStaveLineThicknesses: [ 0.3, 1.25 ],
    inkThicknessStaveLineThicknesses: [ -0.65, 0.65 ],
    noiseStandardDeviation: [ 0.012, 0.038 ],
    illuminationAmplitude: [ 0.08, 0.2 ],
    vignetteAmplitude: [ 0.04, 0.13 ],
    contrastFactor: [ 0.7, 1.25 ],
    paperLevel: [ 0.003, 0.02 ],
    paddingStaffSpaces: 1
  })
}

export default fullPageMutationProfiles
