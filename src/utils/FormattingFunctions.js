export const secondsToMinutes = (seconds) => {
  const secs = Math.round(seconds)

  if (secs < 0) throw new Error('Seconds must be positive')

  if (secs < 60) {
    if (secs < 10) return `0:0${secs}`

    return `0:${secs}`
  }

  const minuteDivisor = secs % (60 * 60)
  const minutes = Math.floor(minuteDivisor / 60)

  const secondDivisor = minuteDivisor % 60
  let remSecs = Math.ceil(secondDivisor)

  if (remSecs < 10 && remSecs > 0) remSecs = `0${remSecs}`
  if (remSecs === 0) remSecs = `${remSecs}0`

  const time = {
    m: minutes,
    s: remSecs
  }

  return `${time.m}:${time.s}`
}
