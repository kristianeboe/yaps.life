export const BUDGET_TO_TEXT = {
  1: 'Low price',
  3: 'Normal price',
  5: 'High end'
}

export const PROPERTY_SIZE_TO_TEXT = {
  1: 'Small',
  3: 'Largeish',
  5: 'Huge'
}


export const STANDARD_TO_TEXT = {
  1: 'Fixer upper',
  3: 'Not new',
  5: 'Good as new'
}

export const STYLE_TO_TEXT = {
  1: 'Old fashioned',
  3: 'Refurbished',
  5: 'Modern/Hipster'
}


export const BUDGET_TEXT = {
  landlord: {
    1: 'Relativly cheap',
    3: 'Not expensive',
    5: 'Premium'
  },
  tenant: {
    1: 'As cheap as possible',
    3: 'Flexible',
    5: 'I want to live like royalty!'
  }
}

export const PROPERTY_SIZE_TEXT = {
  landlord: {
    1: 'Quite small',
    3: 'Standard',
    5: 'Huge'
  },
  tenant: {
    1: 'A cupboard under the stairs is fine',
    3: 'Flexible',
    5: 'I need space!'
  }
}

export const STANDARD_TEXT = {
  landlord: {
    1: 'Could use a fresh stroke of paint',
    3: 'Nothing to complain about',
    5: 'Good as new'
  },
  tenant: {
    1: 'A fixer upper is fine with me',
    3: 'Flexible',
    5: 'Give me something brand new!'
  }
}

export const STYLE_TEXT = {
  landlord: {
    1: 'Rustic',
    3: 'A little bit of both',
    5: 'Modern'
  },
  tenant: {
    1: 'Old fashioned',
    3: 'Flexible',
    5: 'Modern'
  }
}

export const MATCH_LOCATION_OPTIONS = [
  { key: 'oslo', text: 'Oslo', value: 'oslo' },
]

export const PROPERTY_TYPE_OPTIONS = [
  { key: '1', text: 'Apartment', value: 'apartment' },
  { key: '2', text: 'House', value: 'House' },
  { key: '3', text: 'Villa', value: 'Villa' },
]

export const BUDGET_OPTIONS = [
  { key: '1', value: 1, text: 'Low price' },
  { key: '2', value: 3, text: 'Normal price' },
  { key: '3', value: 5, text: 'High end' }
]

export const PROPERTY_SIZE_OPTIONS = [
  { key: '1', value: 1, text: 'Small' },
  { key: '2', value: 3, text: 'Largeish' },
  { key: '3', value: 5, text: 'Huge' }
]

export const STANDARD_OPTIONS = [
  { key: '1', value: 1, text: 'Fixer upper' },
  { key: '2', value: 3, text: 'Not new' },
  { key: '3', value: 5, text: 'Good as new' },
]

export const STYLE_OPTIONS = [
  { key: '1', value: 1, text: 'Old fashioned' },
  { key: '2', value: 3, text: 'Refurbished' },
  { key: '3', value: 5, text: 'Modern/Hipster' },
]


export const UNIVERSITY_OPTIONS = [
  { key: 'ntnu', text: 'NTNU', value: 'NTNU' },
  { key: 'nhh', text: 'NHH', value: 'NHH' },
  { key: 'bi', text: 'BI Oslo', value: 'BI' },
  { key: 'uio', text: 'UIO', value: 'UIO' },
  { key: 'uit', text: 'UIT', value: 'UIT' },
  { key: 'uib', text: 'UIB', value: 'UIB' },
]

export const FIELD_OF_STUDY_OPTIONS = [
  { key: 'cs', text: 'Computer Science', value: 'computer_sciecne' },
  { key: 'fin', text: 'Finance', value: 'finance' },
  { key: 'des', text: 'Design', value: 'design' },
  { key: 'arc', text: 'Architecture', value: 'architechture' },
  { key: 'law', text: 'Law', value: 'law' },
  { key: 'pm', text: 'Physics & Mathematics', value: 'phys_math' },
  { key: 'con', text: 'Construction', value: 'construction' },
  { key: 'een', text: 'Electrical Engineering', value: 'electrical_engineering' },
  { key: 'cen', text: 'Checmical Engineering', value: 'checmical_engineering' },
]

export const TYPE_OF_WORK_OPTIONS = [
  { key: 'c', text: 'Coding', value: 'coding' },
  { key: 's', text: 'Strategy', value: 'strategy' },
  { key: 'pm', text: 'Project management', value: 'project_management' },
  { key: 'f', text: 'Finance', value: 'finance' },
  { key: 'su', text: 'Startup', value: 'startup' },
  { key: 'd', text: 'Design', value: 'design' },
  { key: 'e', text: 'Engineering', value: 'engineering' },
]
