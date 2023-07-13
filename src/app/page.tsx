'use client'
import React, { useEffect, useState, useRef } from 'react'
import Chart from 'chart.js/auto'
import chroma from 'chroma-js'
import 'chartjs-adapter-moment'
import { Select, Option, Input, Button } from '@material-tailwind/react'
import _ from 'lodash'

import API from '@/API'
import { Patient, dataRange, pointContext, segmentContext } from '@/types'

const isInRange = (value: number, rangeData: dataRange) =>
  value >= rangeData.min && value <= rangeData.max

const getInvertedColor = (color: string) =>
  `#${(0xffffff ^ parseInt(color.slice(1), 16)).toString(16).padStart(6, '0')}`

export default function Home() {
  const [patientData, setPatientData] = useState<Patient[]>()
  const [chart, setChart] = useState<Chart>()
  const canvasEl = useRef<HTMLCanvasElement | null>(null)
  const [selectedMarker, setSelectedMarker] = useState('')
  const [selectedRange, setSelectedRange] = useState<dataRange>({
    min: 0,
    max: 0,
  })
  const [bioMarkers, setBioMarkers] = useState<Record<string, dataRange>>({
    creatine: { min: 0.6, max: 1.2 },
    chloride: { min: 90, max: 110 },
    fasting_glucose: { min: 90, max: 120 },
    potassium: { min: 4, max: 8 },
    sodium: { min: 80, max: 130 },
    total_calcium: { min: 8, max: 11 },
    total_protein: { min: 8, max: 12 },
  })

  const loadData = async () => {
    try {
      const res = await API.Patient.getPatientData()
      setPatientData(res)
    } catch (e) {
      console.error(e)
    } finally {
    }
  }

  const setBiomarkerRange = () => {
    const newBioMarkers = _.cloneDeep(bioMarkers)
    newBioMarkers[selectedMarker].min = selectedRange.min
    newBioMarkers[selectedMarker].max = selectedRange.max
    setBioMarkers(newBioMarkers)
  }

  useEffect(() => {
    loadData()
  }, [])

  const skipped = (
    ctx: segmentContext,
    value: number | string | Array<number>
  ) => (ctx.p0.skip || ctx.p1.skip ? value : undefined)
  const down = (ctx: segmentContext, value: number | string | Array<number>) =>
    ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined

  useEffect(() => {
    if (chart) chart.destroy()
    if (!canvasEl.current) return
    if (!patientData) return
    // patientData[2].sodium = NaN
    const newDataset: any[] = []
    const colorPalette = chroma.scale('Set1').colors(7)
    const markers = Object.keys(bioMarkers)
    markers.forEach((marker, index) => {
      const bioMarker = bioMarkers[marker]
      newDataset.push({
        label: `${marker}(${bioMarker.min}~${bioMarker.max})`,
        data: patientData,
        parsing: {
          yAxisKey: marker,
          xAxisKey: 'date_testing',
        },
        borderColor: colorPalette[index],
        spanGaps: true,
        segment: {
          borderColor: (ctx: segmentContext) =>
            skipped(ctx, 'rgb(0,0,0,0.2)') || down(ctx, colorPalette[index]),
          borderDash: (ctx: segmentContext) => skipped(ctx, [6, 6]),
        },
        pointBorderWidth: 0,
        pointRadius: function (context: pointContext) {
          return context.parsed && isInRange(context.parsed.y, bioMarker)
            ? 3
            : 6 // Set a larger radius for y-value > 3, otherwise use a default radius
        },
        pointStyle: function (context: pointContext) {
          return context.parsed && isInRange(context.parsed.y, bioMarker)
            ? 'circle'
            : 'rectRot'
        },
        backgroundColor: colorPalette[index],
        pointBackgroundColor: function (context: pointContext) {
          return context.parsed && isInRange(context.parsed.y, bioMarker)
            ? colorPalette[index]
            : getInvertedColor(colorPalette[index])
        },
      })
    })

    const footer = () => {
      if (!patientData) return ''
      const patient = patientData[0]
      return `ClientId: ${patient.client_id}\nBirthday: ${patient.date_birthdate}\nGender: ${patient.gender}, Ethnicity:${patient.ethnicity}`
    }

    const tmp = new Chart(canvasEl.current, {
      type: 'line',
      data: {
        datasets: newDataset,
      },
      options: {
        hover: {
          mode: 'x',
        },
        animation: {
          duration: 0,
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              tooltipFormat: 'YYYY-MM-DD',
              unit: 'day',
              minUnit: 'hour',
            },
            ticks: {
              sampleSize: 10,
              autoSkip: true,
              autoSkipPadding: 20,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'nearest',
          axis: 'x',
          includeInvisible: true,
        },
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Patient Data',
          },
          tooltip: {
            callbacks: {
              footer: footer,
            },
          },
        },
      },
    })
    //@ts-ignore
    setChart(tmp)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientData, bioMarkers])

  return (
    <main className='flex h-screen flex-col items-center p-24 gap-10'>
      <div className='z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex'>
        <p
          className='fixed cursor-pointer left-0 top-0 flex w-full justify-center pulse border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30 select-none'
          onClick={() => loadData()}
        >
          Get Data
        </p>
        <div className='flex gap-2 items-center'>
          <Select
            variant='static'
            label='Select Biomarker'
            value={selectedMarker}
          >
            {Object.keys(bioMarkers).map((marker) => {
              return (
                <Option
                  key={marker}
                  onClick={() => {
                    setSelectedMarker(marker)
                    setSelectedRange({
                      min: bioMarkers[marker].min,
                      max: bioMarkers[marker].max,
                    })
                  }}
                >
                  {marker}
                </Option>
              )
            })}
          </Select>
          {
            <div className='flex gap-2'>
              <Input
                label='Min'
                type='number'
                disabled={!selectedMarker}
                min={0}
                size='md'
                value={selectedRange.min}
                onChange={(e) =>
                  setSelectedRange({
                    min: parseInt(e.target.value),
                    max: selectedRange.max,
                  })
                }
              />
              <Input
                label='Max'
                type='number'
                size='md'
                min={0}
                disabled={!selectedMarker}
                value={selectedRange.max}
                onChange={(e) =>
                  setSelectedRange({
                    max: parseInt(e.target.value),
                    min: selectedRange.min,
                  })
                }
              />
              <Button
                variant='outlined'
                disabled={!selectedMarker}
                className='w-full'
                onClick={() => setBiomarkerRange()}
              >
                SET
              </Button>
            </div>
          }
        </div>
      </div>
      <canvas
        id='patient-chart'
        className='w-full'
        ref={canvasEl}
        style={{ height: 350 }}
        height={350}
      ></canvas>
    </main>
  )
}
