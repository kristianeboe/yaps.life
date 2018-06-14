import { MATCH_LOCATION_OPTIONS, PROPERTY_TYPE_OPTIONS, BUDGET_OPTIONS, PROPERTY_SIZE_OPTIONS, STANDARD_OPTIONS, STYLE_OPTIONS } from './CONSTANTS'
import moment from 'moment'

const validStandardInput = input => input.length > 0 && input.length < 100
const isNumber = number => !isNaN(parseFloat(number)) && isFinite(number)

export const validDisplayName = displayName => validStandardInput(displayName)
export const validAge = age => isNumber(age) && age > 0 && age < 100
export const validGender = gender => gender === 'Male' || gender === 'Female'
export const validEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}
export const validPassword = password => password.length > 5
export const validPhone = phone => phone.length === 0 || phone.length >= 8 && phone.length < 14


export const validStudyProgramme = studyProgramme => validStandardInput(studyProgramme)

const validListingTitle = title => validStandardInput(title)
const validNumberOfBedrooms = numberOfBedrooms => isNumber(numberOfBedrooms) && numberOfBedrooms > 0 && numberOfBedrooms < 10
const validPrice = pricePerRoom => isNumber(pricePerRoom) && pricePerRoom >= 0
const validMatchLocation = matchLocation => MATCH_LOCATION_OPTIONS.some(el => el.value === matchLocation)
const validPropertyType = propertyType => PROPERTY_TYPE_OPTIONS.some(el => el.value === propertyType)
const validAddress = address => address.length > 0
const validLatLng = latLng => latLng.lat && latLng.lng

const validBudget = buget => BUDGET_OPTIONS.some(el => el.value === buget)
const validPropertySize = propertySize => PROPERTY_SIZE_OPTIONS.some(el => el.value === propertySize)
const validStandard = standard => STANDARD_OPTIONS.some(el => el.value === standard)
const validStyle = style => STYLE_OPTIONS.some(el => el.value === style)
const validPropertyVector = propertyVector => propertyVector.length === 4 && propertyVector.reduce((f, c) => [-2, 0, 2].includes(c))


const validListingURL = listingURL => listingURL.length === 0 || listingURL.includes('finn.no') || listingURL.includes('airbnb.com') || listingURL.includes('hybel.no') || listingURL.includes('utleiemegleren.no')
const validTOS = tos => tos
const validReadyToMatch = readyToMatch => true || false
const validRentFrom = () => true // date.isValid()
const validRentTo = () => true // date.isValid()
const validpersonalityVector = personalityVector => personalityVector.length === 20 && personalityVector.reduce((f, c) => [-2, -1, 0, 1, 2].includes(c))

/* const validStudyProgramme = studyProgramme =>
const validUniversity = university =>
 */
export const LandlordFormValidation = {
  displayName: validDisplayName,
  age: validAge,
  gender: validGender,
  email: validEmail,
  phone: validPhone
}


export const UploadListingFormValidation = {
  title: validListingTitle,
  numberOfBedrooms: validNumberOfBedrooms,
  pricePerRoom: validPrice,
  propertyType: validPropertyType,
  matchLocation: validMatchLocation,
  address: validAddress,
  propertyVector: validPropertyVector,
  addressLatLng: validLatLng,
  listingURL: validListingURL,
  tos: validTOS,
}

export const EvaluateListingFormValidation = {
  address: validAddress,
  pricePerMonth: validPrice,
  pricePerRoom: validPrice,
  budget: validBudget,
  propertySize: validPropertySize,
  standard: validStandard,
  style: validStyle,
  propertyVector: validPropertyVector,
  listingURL: validListingURL,
}

export const ProfileFormValidation = {
  displayName: validDisplayName,
  age: validAge,
  gender: validGender,
  fieldOfStudy: validStandardInput,
  university: validStandardInput,
  matchLocation: validMatchLocation,
  workplace: validAddress,
  workplaceLatLng: validLatLng,
  rentFrom: validRentFrom,
  rentTo: validRentTo,
  propertyVector: validPropertyVector,
  tos: validTOS,
  readyToMatch: validReadyToMatch,
  personalityVector: validpersonalityVector,
}

/*
this.setState({
  title: 'Home in Oslo',
  numberOfBedrooms: '4',
  pricePerRoom: 60000,
  propertyType: 'apartment',
  matchLocation: 'oslo',
  address: 'Arnebråtveien 75D Oslo',
  propertyVector: [1, 3, 3, 5],
  addressLatLng: { lat: 222, lng: 333 },
  listingURL: 'https://finn.no',
  tos: true,
}) */
