import React, {useMemo, useState} from 'react'
import {useThrottle} from "@uidotdev/usehooks"
import styled from "styled-components"
import GeometrySlider from "./components/GeometrySlider"
import {AlgorithmInput, getStandingWaves} from "./algorithm"
import {FrequencyGraph} from "./components/FrequencyGraph"

const AppContainer = styled.div`
  width: 100%;
  padding: 32px;
  box-sizing: border-box;
  
  display: flex;
  flex-direction: column;
`

const MainRow = styled.div`
  width: 100%;
  margin-bottom: 32px;

  display: flex;
  flex-direction: row;

  > * {
    margin: 32px;
  }
`

const MiddleColumn = styled.div`
  flex-grow: 1;
  
  display: flex;
  flex-direction: column;
`

const VerticalSliderTitleColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  > label {
    max-width: 130px;
    font-weight: bold;
    margin-bottom: 16px;
    text-align: center;
  }
`

const WidthTitle = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 16px;
  align-items: center;
  justify-content: space-evenly;
  max-width: 150px;

  > label {
    font-weight: bold;
    margin-bottom: 16px;
    color: #666;
    text-align: center;
  }
`

const HorizontalSliderTitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const GraphContainer = styled.div`
  flex-grow: 1;
  margin-bottom: 64px;
  min-height: 600px;
`

function App() {
  const [roomWidth, setRoomWidth] = useState(3.5)
  const [roomDepth, setRoomDepth] = useState(5.6)
  const [roomHeight, setRoomHeight] = useState(2.5)
  const [disLeft, setDisLeft] = useState(1.40)
  const [disFront, setDisFront] = useState(1.6)
  const [disFloor, setDisFloor] = useState(1.05)

  const offCenter = useMemo(
    () => Math.abs(disLeft - roomWidth / 2) > roomWidth / 10,
    [disLeft, roomWidth]
  )

  const input: AlgorithmInput = useMemo(() => ({
    geometry: {
      room: {
        width: roomWidth,
        depth: roomDepth,
        height: roomHeight
      },
      position: {
        left: disLeft,
        front: disFront,
        floor: disFloor
      }
    }
  }), [
    roomWidth,
    roomDepth,
    roomHeight,
    disLeft,
    disFront,
    disFloor
  ])

  const throttledInput = useThrottle<AlgorithmInput>(input, 100)

  const data = useMemo(() => getStandingWaves(throttledInput), [throttledInput])

  return (
    <AppContainer>
      <MainRow>
        <VerticalSliderTitleColumn>
          <label>Room depth / distance from front wall</label>
          <GeometrySlider position={disFront} roomDimension={roomDepth} onChangePosition={setDisFront} onChangeRoomDimension={setRoomDepth} vertical max={10}/>
        </VerticalSliderTitleColumn>
        <MiddleColumn>
          <GraphContainer>
            <FrequencyGraph data={data}/>
          </GraphContainer>
          <HorizontalSliderTitleRow>
            <WidthTitle>
              <label>Room width / distance from left wall</label>
              <button onClick={() => setDisLeft(roomWidth / 2)}>Center</button>
            </WidthTitle>
            <GeometrySlider position={disLeft} roomDimension={roomWidth} onChangePosition={setDisLeft} onChangeRoomDimension={setRoomWidth} max={10}/>
          </HorizontalSliderTitleRow>
        </MiddleColumn>
        <VerticalSliderTitleColumn>
          <label>Room height / ear level height</label>
          <GeometrySlider position={disFloor} roomDimension={roomHeight} onChangePosition={setDisFloor} onChangeRoomDimension={setRoomHeight} vertical inverted max={5}/>
        </VerticalSliderTitleColumn>
      </MainRow>
      { offCenter && <div>Warning: Being horizontally off center will cause stereo image to be imbalanced</div> }
    </AppContainer>
  )
}

export default App
