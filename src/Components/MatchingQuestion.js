import React from 'react'
import 'rc-slider/assets/index.css'
// import 'rc-tooltip/assets/bootstrap.css'
import Tooltip from 'rc-tooltip'
import Slider from 'rc-slider'

const MatchingQuestion = (props) => {
  const { Handle } = Slider
  const wrapperStyle = {}

  const handle = (handleProps) => {
    const {
      value, dragging, index, ...restProps
    } = handleProps
    return (
      <Tooltip
        prefixCls="rc-slider-tooltip"
        overlay={value}
        visible={dragging}
        placement="top"
        key={index}
      >
        <Handle value={value} {...restProps} />
      </Tooltip>
    )
  }

  const { question } = props

  return (
    <div style={wrapperStyle}>
      <p>{question.text}</p>
      <Slider
        dots
        min={1}
        max={5}
        // defaultValue={parentState[props.type][question.key] ? parentState[props.type][question.key] : 3 }
        // value={props.value}
        value={props.value}
        name={question.key}
        handle={handle}
        onChange={v => props.handleSliderChange(v, question.key, question.type)}
      />
      {/* // marks={{1: 'Highly disagree', 5: 'Highly agree'}} /> */}
    </div>
  )
}

export default MatchingQuestion
