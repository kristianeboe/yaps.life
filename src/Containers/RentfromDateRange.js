import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Form } from 'semantic-ui-react'

const RentFromDateRange = ({
  rentFrom, rentTo, handleDateChange, landlord, dateError
}) => (
  <Form.Group widths="equal">
    <Form.Field readOnly style={{ zIndex: 10 }} error={dateError} >
      <label>Rent from</label>
      <DatePicker
        dateFormat="YYYY/MM/DD"
        selected={rentFrom}
        onChange={date => handleDateChange('rentFrom', date)}
      />
    </Form.Field>
    <Form.Field readOnly style={{ zIndex: 10 }} error={dateError} >
      <label>Rent to</label>
      <DatePicker
        dateFormat="YYYY/MM/DD"
        selected={rentTo}
        onChange={date => handleDateChange('rentTo', date)}
        showWeekNumbers
      />
    </Form.Field>
  </Form.Group>
)

export default RentFromDateRange
