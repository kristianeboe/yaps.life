import React from 'react'
import { Form, Button, Popup } from 'semantic-ui-react'
import { BUDGET_TEXT, PROPERTY_SIZE_TEXT, STANDARD_TEXT, STYLE_TEXT } from '../utils/CONSTANTS'


const PropertyVectorQuestions = ({
  propertyVector, landlord, handleChange
}) => {
  const [budget, propertySize, standard, style] = propertyVector
  return (
    <div>
      <Form.Field required >
        <label>{landlord ? 'The budget for the apartment is determined by the price pr room' : 'What is your budget?'}</label>
        <Button.Group widths={3} >
          <Popup
            trigger={<Button onClick={landlord ? e => e.preventDefault() : e => handleChange(e, { name: 'budget', value: 1 })} primary={budget === 1} >{ landlord ? BUDGET_TEXT.landlord[1] : BUDGET_TEXT.tenant[1]}</Button>}
            content="Less than 5000 kr pr month pr person"
          />
          <Button.Or />
          <Popup
            trigger={<Button onClick={landlord ? e => e.preventDefault() : e => handleChange(e, { name: 'budget', value: 3 })} primary={budget === 3} >{ landlord ? BUDGET_TEXT.landlord[3] : BUDGET_TEXT.tenant[3]}</Button>}
            content={landlord ? 'But not cheap either' : 'I can lean either way'}
          />
          <Button.Or />
          <Popup
            trigger={<Button onClick={landlord ? e => e.preventDefault() : e => handleChange(e, { name: 'budget', value: 5 })} primary={budget === 5} >{ landlord ? BUDGET_TEXT.landlord[5] : BUDGET_TEXT.tenant[5]}</Button>}
            content="More than 9 000 kr pr month pr person"
          />
        </Button.Group>
      </Form.Field>
      <Form.Field required >
        <label>{landlord ? 'Size of property' : 'Does size matter to you?'}</label>
        <Button.Group widths={3} >
          <Button primary={propertySize === 1} onClick={e => handleChange(e, { name: 'propertySize', value: 1 })} >{landlord ? PROPERTY_SIZE_TEXT.landlord[1] : PROPERTY_SIZE_TEXT.tenant[1]}</Button>
          <Button.Or />
          <Button primary={propertySize === 3} onClick={e => handleChange(e, { name: 'propertySize', value: 3 })} >{landlord ? PROPERTY_SIZE_TEXT.landlord[3] : PROPERTY_SIZE_TEXT.tenant[3]}</Button>
          <Button.Or />
          <Button primary={propertySize === 5} onClick={e => handleChange(e, { name: 'propertySize', value: 5 })} >{landlord ? PROPERTY_SIZE_TEXT.landlord[5] : PROPERTY_SIZE_TEXT.tenant[5]}</Button>
        </Button.Group>
      </Form.Field>
      <Form.Field required >
        <label>{landlord ? 'Standard' : 'Standard'}</label>
        <Button.Group widths={3} >
          <Button primary={standard === 1} onClick={e => handleChange(e, { name: 'standard', value: 1 })} >{landlord ? STANDARD_TEXT.landlord[1] : STANDARD_TEXT.tenant[1]}</Button>
          <Button.Or />
          <Button primary={standard === 3} onClick={e => handleChange(e, { name: 'standard', value: 3 })} >{landlord ? STANDARD_TEXT.landlord[3] : STANDARD_TEXT.tenant[3]}</Button>
          <Button.Or />
          <Button primary={standard === 5} onClick={e => handleChange(e, { name: 'standard', value: 5 })} >{landlord ? STANDARD_TEXT.landlord[5] : STANDARD_TEXT.tenant[5]}</Button>
        </Button.Group>
      </Form.Field>
      <Form.Field required >
        <label>{landlord ? 'Style' : 'Style'}</label>
        <Button.Group widths={3} >
          <Button name="style" primary={style === 1} onClick={e => handleChange(e, { name: 'style', value: 1 })} >{landlord ? STYLE_TEXT.landlord[1] : STYLE_TEXT.tenant[1]}</Button>
          <Button.Or />
          <Button name="style" primary={style === 3} onClick={e => handleChange(e, { name: 'style', value: 3 })} >{landlord ? STYLE_TEXT.landlord[3] : STYLE_TEXT.tenant[3]}</Button>
          <Button.Or />
          <Button name="style" primary={style === 5} onClick={e => handleChange(e, { name: 'style', value: 5 })} >{landlord ? STYLE_TEXT.landlord[5] : STYLE_TEXT.tenant[5]}</Button>
        </Button.Group>
      </Form.Field>
    </div>
  )
}


export default PropertyVectorQuestions
