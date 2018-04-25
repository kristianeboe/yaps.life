import React from 'react'
import { Form } from 'semantic-ui-react'
import { LandlordFormValidation } from '../utils/FormValidations'

const genderOptions = [
  { key: 'm', text: 'Male', value: 'Male' },
  { key: 'f', text: 'Female', value: 'Female' }
]

const ContactInfo = ({
  contactInfo, landlord, handleChange, errors
}) => {
  const {
    displayName, age, gender, email, phone,
  } = contactInfo
  return (
    <div>
      <Form.Input
        fluid
        label="Name"
        placeholder="Name"
        name="displayName"
        value={displayName}
        onChange={handleChange}
        error={errors.displayName}
        onBlur={() => handleChange(null, { name: 'errors', value: { ...errors, displayName: !LandlordFormValidation.displayName(displayName) } })}
      />
      <Form.Group widths="equal">
        <Form.Input
          fluid
          label="Age"
          placeholder="Age"
          name="age"
          value={age}
          onChange={handleChange}
          error={errors.age}
          onBlur={() => handleChange(null, { name: 'errors', value: { ...errors, age: !LandlordFormValidation.age(age) } })}
        />
        <Form.Select
          fluid
          style={{ zIndex: 65 }}
          label="Gender"
          options={genderOptions}
          placeholder="Gender"
          value={gender}
          name="gender"
          onChange={handleChange}
          onBlur={() => handleChange(null, { name: 'errors', value: { ...errors, gender: !LandlordFormValidation.gender(gender) } })}
        />
      </Form.Group>
      {landlord && [
        <Form.Input
          key="email"
          fluid
          label="Email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={handleChange}
          error={errors.email}
        />,
        <Form.Input
          fluid
          key="phone"
          label="Phone"
          placeholder="Phone"
          name="phone"
          value={phone}
          onChange={handleChange}
          error={errors.phone}
        />
      ]}
    </div>

  )
}


export default ContactInfo
