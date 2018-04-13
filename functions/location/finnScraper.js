
const axios = require('axios')
const cheerio = require('cheerio')
// const fs = require('fs')

// const finnURL = 'https://www.finn.no/realestate/lettings/ad.html?finnkode=116441272'

const initialUrl =
  'https://www.finn.no/realestate/lettings/search.html?location=0.20061&no_of_bedrooms_from=3&property_type=1&property_type=16&property_type=3&property_type=4'
// const fronger = 'https://www.finn.no/realestate/lettings/search.html?location=0.20061&location=1.20061.20507&no_of_bedrooms_from=3&property_type=1&property_type=16&property_type=3&property_type=4'

function getListingDetails(finnURL) {
  return axios
    .get(finnURL)
    .then((response) => {
      const listing = {}
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

        listing.title = title
        listing.address = address
        listing.price = price
        const dlItems = $('dl.r-prl.mhn.multicol.col-count1upto640.col-count2upto768.col-count1upto990.col-count2from990')
        dlItems.children().each((i, ele) => {
          if (ele.name === 'dt') {
            const key = ele.children[0].data.trim()
            const value = ele.next.next.children[0].data.trim()
            listing[key] = value
          }
        })

        const facilities = []
        const facilitiesSection = $('ul.bullets.col-count1upto480.col-count2upto990.col-count2from990')
        facilitiesSection.children().each((i, ele) => {
          facilities.push(ele.children[0].data.trim())
        })
        listing.facilities = facilities
      }
      return listing
    })
    .catch(err => console.log(err))
}


function getPropertyList(url) {
  axios
    .get(url)
    .then((response) => {
      const urlList = []
      console.log(response.status)
      if (response.status === 200) {
        const $ = cheerio.load(response.data)
        // const initialTagsForNextPage = $('div.t4.centerify.r-margin').children()[0]
        $('div.line.flex.align-items-stretch.wrap.cols1upto480.cols2upto990.cols3from990')
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
      }
      return urlList
    }).then((urlList) => {
      urlList.forEach((href) => {
        const finnURL = `https://www.finn.no/${href}`
        console.log(finnURL)
        getListingDetails(finnURL)
      })
    })
    .catch(error => console.log('Erreor getting initial search page'))
}


// getPropertyList(initialUrl)
// getListingDetails('https://www.finn.no/realestate/lettings/ad.html?finnkode=106260400')
module.exports.getListingDetails = getListingDetails
module.exports.getPropertyList = getPropertyList
