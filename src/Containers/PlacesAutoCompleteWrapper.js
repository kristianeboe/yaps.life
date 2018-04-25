import React from 'react'
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng
} from 'react-places-autocomplete'
import googleLogo from '../assets/images/powered_by_google_default.png'

const PlacesAutoCompleteWrapper = ({ handleChange, fieldValue, landlord }) => (
  <PlacesAutocomplete
    styles={{ root: { zIndex: 50 } }}
    inputProps={{
        name: landlord ? 'address' : 'workplace',
        placeholder: landlord ? 'Address of property' : 'Where are you going to work?',
        value: fieldValue,
        onChange: workplace => handleChange(null, { name: landlord ? 'address' : 'workplace', value: workplace }),
    }}
    renderFooter={() => (
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '4px'
        }}
      >
        <div>
          <img
            src={googleLogo}
            style={{ display: 'inline-block', width: '150px' }}
            alt="Powered by Google"
          />
        </div>
      </div>
    )}
    onSelect={(workplace) => {
      handleChange(null, { name: landlord ? 'address' : 'workplace', value: workplace })
      geocodeByAddress(workplace)
          .then(results => getLatLng(results[0]))
          .then(({ lat, lng }) => {
              handleChange(null, {
                  name: landlord ? 'addressLatLng' : 'workplaceLatLng',
                  value: { lat, lng }
              })
          })
          .catch((error) => {
            console.log('Oh no!', error)
            handleChange(null, {
              name: landlord ? 'addressLatLng' : 'workplaceLatLng',
              value: null
            })
          })
        }}
    shouldFetchSuggestions={({ value }) => value.length > 2}
    highlightFirstSuggestion
    options={{
            types: landlord ? ['address'] : ['establishment'],
        }}
  />
)


export default PlacesAutoCompleteWrapper
