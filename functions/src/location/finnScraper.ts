import axios from 'axios'
import * as cheerio from 'cheerio'

export async function getListingDetails(listingURL: string, nrOfFlatmates) {
  let response = {
    data: ''
  }
  try {
    response = await axios.get(listingURL)

  } catch(err) {
    console.log('Error in getting Finn url')
    return null
  }
  const html = response.data
  const $ = cheerio.load(html)

  const title = $('div > section:nth-child(4) > h1').text()
  const address = $('div > section:nth-child(4) > p')
    .text()
  const pricePerMonth = $('div > div:nth-child(5) > span.u-t3').text().replace(/[,-\s]/g, '')

  // need to init object for TypeScript
  const listingTemp = {
    propertyType: '',
    floor: 0,
    numberOfBedrooms: 0,
    propertySize: 0,
  }

  const dlItems = $('div.grid__unit.u-r-size2of3 > div > section:nth-child(6) > dl')
  dlItems.children().each((i, ele) => {
    if (ele.name === 'dt') {
      const key = ele.children[0].data.trim()
      let value:any = ele.next.next.children[0].data.trim()
      switch (key) {
        case 'Boligtype':
         value = value === 'Leilighet' ? 'apartment' : value
         listingTemp.propertyType = value
         break
        case 'Etasje':
          listingTemp.floor = value
        case 'Soverom':
          listingTemp.numberOfBedrooms = value
          break
        case 'Primærrom':
          value = value.split(' ')[0]
          listingTemp.propertySize = value
          break
          case 'Prim&aelig;rrom':
          value = value.split(' ')[0]
          listingTemp.propertySize = value
          break
        case 'Bruksareal':
          value = value.split(' ')[0]
          listingTemp.propertySize = value
          break
        case 'Leieperiode':
          try {
            const [from, to ] = value.split('-')
            const [day, month, year] = from.split('.')
            listingTemp['rentFrom'] = new Date(year, month-1, day)
            if (to) {
              const [rentToDay, rentToMonth, rentToYear] = to
              if (rentToYear === year) {
                listingTemp['rentTo'] = new Date(rentToYear, rentToMonth-1, rentToDay)
              }

            }
            break
            // new Date(year, month [, day [, hours [, minutes [, seconds [, milliseconds]]]]]);
          } catch (error) {
            console.log(error)
          }
        default:
          listingTemp[key] = value
      }
    }
  })

  const facilities = []
  const facilitiesSection = $('div.grid > div.grid__unit.u-r-size2of3 > div > div:nth-child(8) > ul')
  facilitiesSection.children().each((i, ele) => {
    facilities.push(ele.children[0].data.trim())
  })


  const pricePerRoom = listingTemp.numberOfBedrooms === 1 ?  Number(pricePerMonth) : Math.floor(Number(pricePerMonth) / nrOfFlatmates) //updatedMatch.flatmates.length)
  

  let propertySize =  listingTemp['propertySize']
  if (propertySize > 40) {
    propertySize = propertySize <  65 ? -2 : propertySize <  80 ? -1 : propertySize <  90 ? -0.5 : propertySize <  100 ? 0 : propertySize < 110 ? 0.5 : propertySize < 120 ? 1 : 2
  } else {
    propertySize = propertySize <  8 ? -2 : propertySize <  10 ? -1 : propertySize <  12 ? 0 : propertySize <  15 ? 1 : 2
  }

  const budget =
      pricePerRoom < 5000 ? -2 : pricePerRoom <= 5500 ? -1.5 : pricePerRoom <= 6000 ? -1 : pricePerRoom <= 6500 ? -0.5 : pricePerRoom <= 7000 ? 0 : pricePerRoom <= 8000 ? 0.5 : pricePerRoom <= 9000 ? 1 : pricePerRoom < 10500 ? 1.5 : 2
  
  const standard = 0
  const style = facilities.find(el => el === 'Moderne') ? 2 : 0

  const propertyVector = [budget, propertySize, standard, style]



  const listing = {
    title,
    ...listingTemp,
    address, 
    pricePerMonth,
    pricePerRoom,
    propertyVector,
    facilities,
    listingURL,
  }
  return listing
}



export async function getPropertyList(url) {
  const response = await axios.get(url)
  const urlList = []
  const listingURLs = []
  if (response.status === 200) {
    const $ = cheerio.load(response.data)
    // const initialTagsForNextPage = $('div.t4.centerify.r-margin').children()[0]
    
    const listings = $('div.unit.flex.align-items-stretch.result-item').children().each((i, ele) => {
      const href = ele.attribs.href
      const listingURL = `https://www.finn.no${href}`
      listingURLs.push(listingURL)
    })
  }
  return listingURLs

}

