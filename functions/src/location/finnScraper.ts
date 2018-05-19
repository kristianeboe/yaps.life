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

  const listingTemp = {}

  const dlItems = $('dl.r-prl.mhn.multicol.col-count1upto640.col-count2upto768.col-count1upto990.col-count2from990')
  dlItems.children().each((i, ele) => {
    if (ele.name === 'dt') {
      let key = ele.children[0].data.trim()
      let value:any = ele.next.next.children[0].data.trim()
      switch (key) {
        case 'Boligtype':
         key = 'propertyType' 
         value = value === 'Leilighet' ? 'apartment' : value
          break;
        case 'Etasje':
          key= 'floor'
          break
        case 'Soverom':
          key='numberOfBedrooms'
          break
        case 'Primærrom':
          key='propertySize'
          value = value.split(' ')[0]
          break
        case 'Leieperiode':
          key="rentFrom"
          try {
            const [from, to ] = value.split('-')
            const [day, month, year] = from.split('.')
            value= new Date(year, month-1, day)
            if (to) {
              const [rentToDay, rentToMonth, rentToYear] = to
              if (rentToYear === year) {
                listingTemp['rentTo'] = new Date(rentToYear, rentToMonth-1, rentToDay)
              }

            }
            // new Date(year, month [, day [, hours [, minutes [, seconds [, milliseconds]]]]]);
          } catch (error) {
            console.log(error)
          }
        default:
          break;
      }
      listingTemp[key] = value
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

    const propertySize = listingTemp['propertySize'] > 100 ? 5 : listingTemp['propertySize'] < 60 ? 1 : 3
    const budget =
        pricePerRoom > 7900 ? 5 : pricePerRoom < 5500 ? 1 : 3
    const standard = 3
    const style = 3
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
    /* $('div.line.flex.align-items-stretch.wrap.cols1upto480.cols2upto990.cols3from990')
      .children()
      .each((i, ele) => {
        // console.log(ele.children)
        ele.children.forEach((tag) => {
          if (tag.name === 'a') {
            console.log(tag.attribs.href)
            urlList.push(tag.attribs.href)
          }
        })
        // console.log(ele.children[0])
      })
    } */

  /* urlList.forEach(async (href) => {
    const finnURL = `https://www.finn.no/${href}`
    console.log(finnURL)
    const listing = await getListingDetails(finnURL)
    console.log(listing)
  }) */
  

}

