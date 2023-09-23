import React from "react"
import styled from "styled-components"
import ReactSlider, {ReactSliderProps} from "react-slider"
import {formatLength} from "../utils"

const StyledSlider = styled(ReactSlider)<ReactSliderProps<ReadonlyArray<number>>>`
  flex-grow: 1;
  border: 1px solid #ccc;
  
  ${p => p.orientation === 'vertical' ? `
    width: 80px;
    ${p.invert ? 'border-bottom' : 'border-top'}
  ` : `
    height: 80px;
    ${p.invert ? 'border-right' : 'border-left'}
  `}: 5px solid grey;
  
  .mark {
    display: none;
  }
`

const StyledThumb = styled.div<{$index: number, $vertical?: boolean, $inverted?: boolean}>`
  width: 80px;
  height: 80px;
  font-size: 0.9em;
  text-align: center;
  background-color: ${p => p.$index === 0 ? '#000' : '#aaa'};
  color: white;
  cursor: pointer;
  
  box-sizing: border-box;
  outline: none;
  
  border: 5px solid grey;

  ${p => p.$index === 0 ? `
    border-radius: 100%;
    line-height: 68px;
    ${p.$vertical ? `
      margin-top: -40px;
    ` : `
      margin-left: -40px;
    `}
  ` : `
    border-width: 0;
    line-height: 76px;
    ${p.$vertical ? `
      ${p.$inverted ? `
        border-bottom: 5px solid grey;
        border-radius: 70% 70% 0 0;
      ` : `
        border-top: 5px solid grey;
        border-radius: 0 0 70% 70%;
      `}
    ` : `
      ${p.$inverted ? `
        border-right: 5px solid grey;
        border-radius: 70% 0 0 70%;
      ` : `
        border-left: 5px solid grey;
        border-radius: 0 70% 70% 0;
      `}
    `}
  `}
`

const StyledTrack = styled.div<{$index: number, $vertical?: boolean}>`
  top: 0;
  bottom: 0;
  background: ${props => (props.$index === 0 ? '#c5ff89' : props.$index === 1 ? '#fff' : '#ccc')};
  border-radius: 4px;
  ${p => p.$vertical ? `
    ${p.$index === 2 ? `
      left: 0;
      width: 80px;
    ` : `
      left: 35px;
      width: 10px;
    `}
  ` : `
    ${p.$index === 2 ? `
      top: 0;
      height: 80px;
    ` : `
      top: 35px;
      height: 10px;
    `}
  `}
`

// props in meters, internally centimeters
export const GeometrySlider = React.memo(function GeometrySlider(
  {
    position,
    roomDimension,
    onChangePosition,
    onChangeRoomDimension,
    vertical,
    inverted,
    max
  }: {
    position: number
    roomDimension: number
    onChangePosition: (value: number) => void
    onChangeRoomDimension: (value: number) => void
    vertical?: boolean
    inverted?: boolean
    max: number
  }
) {
  return (
    <StyledSlider
      orientation={vertical ? 'vertical' : 'horizontal'}
      invert={inverted}
      value={[100 * position, 100 * roomDimension]}
      onChange={(value, index) => {
        onChangePosition(Math.max(value[0] / 100, 0.5))
        onChangeRoomDimension(value[1] / 100)
      }}
      renderTrack={(props, state) => (
        <StyledTrack {...props} $index={state.index} $vertical={vertical}/>
      )}
      renderThumb={(props, state) => {
        return (
          <StyledThumb {...props} $index={state.index} $vertical={vertical} $inverted={inverted}>
            {formatLength(state.valueNow / 100)}
          </StyledThumb>
        )
      }}
      min={0}
      max={100 * max}
      minDistance={50}
    />
  )
})

export default GeometrySlider
