import axios from 'axios'
import * as cheerio from 'cheerio'

export async function getListingDetails(finnListingURL: string) {
  const response:any = await axios.get(finnListingURL).catch(err => console.log('Error in getting Finn url'))
  if (response.status === 200) {
    const html = response.data
    const $ = cheerio.load(html)

    const title = $('h1').text()
    const address = $('.word-break p')
      .first()
      .text()
    const price = $('div.h1.mtn.r-margin').text().replace(/[,-\s]/g, '')

    // console.log($('.word-break div'))
    // const price = $('.word-break div')['5'].text()
    // console.log(price)

    const listingTemp = {}

    const dlItems = $('dl.r-prl.mhn.multicol.col-count1upto640.col-count2upto768.col-count1upto990.col-count2from990')
    dlItems.children().each((i, ele) => {
      if (ele.name === 'dt') {
        let key = ele.children[0].data.trim()
        let value = ele.next.next.children[0].data.trim()
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

    const listing = {
      title,
      ...listingTemp,
      address, 
      price,
      facilities,
      finnListingURL,
    }
    return listing
  }

  return {}
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
      const finnListingURL = `https://www.finn.no${href}`
      listingURLs.push(finnListingURL)
    })
  }
  console.log(listingURLs)
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

