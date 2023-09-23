import React, {useMemo} from "react"
import {FrequencyAmplitude, StandingWave} from "../algorithm"
import {range, sumBy} from "lodash"
import {BUCKET_WIDTH, MAX_FREQUENCY, MIN_FREQUENCY} from "../constants"
import {notNull} from "../utils"
import {Line} from "react-chartjs-2"
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  LogarithmicScale,
  PointElement,
  Title
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title
)

export const FrequencyGraph = React.memo(function FrequencyGraph({
  data
}: {
  data: StandingWave[]
}) {
  const bucketedData: FrequencyAmplitude[] = useMemo(
    () => {
      const dataPoints = range(MIN_FREQUENCY, MAX_FREQUENCY, BUCKET_WIDTH)
        .map(startFrequency => {
          const endFrequency = startFrequency + BUCKET_WIDTH
          const waves = data
            .filter(w => w.frequency >= startFrequency && w.frequency < endFrequency)

          return waves.length > 0 ? {
            frequency: startFrequency,
            amplitude: sumBy(waves, w => w.amplitude * w.weight) / sumBy(waves, w => w.weight)
          } : null
        })
        .filter(notNull)

      if (dataPoints.length === 0) return []

      const averageAmplitude = sumBy(dataPoints, d => d.amplitude) / dataPoints.length

      return dataPoints.map(({frequency, amplitude}) => ({
        frequency,
        amplitude: amplitude - averageAmplitude
      }))
    },
    [data]
  )

  return (
    <Line
      options={{
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Simulated Frequency Response',
            font: {
              size: 32
            }
          }
        },
        scales: {
          y: {
            min: -1,
            max: 1,
            grid: {
              lineWidth: (ctx) => ctx.tick.value === 0 ? 3 : 1,
              color: (ctx) => ctx.tick.value === 0 ? '#6fa1c4' : undefined,
            }
          },
          x: {
            type: 'logarithmic'
          }
        }
      }}
      data={{
        labels: bucketedData.map(d => d.frequency + BUCKET_WIDTH / 2),
        datasets: [
          {
            data: bucketedData.map(d => d.amplitude),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)'
          }
        ],
      }}
    />
  )
})
