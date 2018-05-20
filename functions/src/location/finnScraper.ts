import axios from 'axios'
import * as cheerio from 'cheerio'

export async function getListingDetails(listingURL: string) {
  const response:any = await axios.get(listingURL).catch(err => console.log('Error in getting Finn url'))
  const html = response.data
  const $ = cheerio.load(html)

  const title = $('h1').text()
  const address = $('.word-break p')
    .first()
    .text()
  const pricePerMonth = $('div.h1.mtn.r-margin').text().replace(/[,-\s]/g, '')

  // console.log($('.word-break div'))
  // const price = $('.word-break div')['5'].text()
  // console.log(price)

  // need to init object for TypeScript
  const listingTemp = {
    propertyType: '',
    floor: 0,
    numberOfBedrooms: 0,
    propertySize: 0,
  }

  const dlItems = $('dl.r-prl.mhn.multicol.col-count1upto640.col-count2upto768.col-count1upto990.col-count2from990')
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
  const facilitiesSection = $('ul.bullets.col-count1upto480.col-count2upto990.col-count2from990')
  facilitiesSection.children().each((i, ele) => {
    facilities.push(ele.children[0].data.trim())
  })

  const pricePerRoom =
        Number(pricePerMonth) < 15000
          ? Number(pricePerMonth)
          : Math.floor(Number(pricePerMonth) / 4) //updatedMatch.flatmates.length)

  let propertySize =  listingTemp['propertySize']
  if (propertySize > 40) {
    propertySize = propertySize <  65 ? 1 : propertySize <  80 ? 2 : propertySize <  90 ? 2.5 : propertySize <  100 ? 3 : propertySize < 110 ? 3.5 : propertySize < 120 ? 4 : 5
  } else {
    propertySize = propertySize <  8 ? 1 : propertySize <  10 ? 2 : propertySize <  12 ? 3 : propertySize <  15 ? 4 : 5
  }

  const budget =
      pricePerRoom < 5000 ? 1 : pricePerRoom < 5500 ? 1.5 : pricePerRoom < 6000 ? 2 : pricePerRoom < 6500 ? 2.5 : pricePerRoom < 7000 ? 3 : pricePerRoom < 8000 ? 3.5 : pricePerRoom < 9000 ? 4 : pricePerRoom < 10500 ? 4.5 : 5
  
  const standard = 3
  const style = facilities.find(el => el === 'Moderne') ? 5 : 3

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

