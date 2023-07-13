'use client'
import React, { useEffect, useState, useRef } from 'react'
import Chart from 'chart.js/auto'
import chroma from 'chroma-js'
import 'chartjs-adapter-moment'
import API from '@/API'
import { Dataset, Patient, Point } from '@/types'

const bioMarkers = [
  'creatine',
  'chloride',
  'fasting_glucose',
  'potassium',
  'sodium',
  'total_calcium',
  'total_protein',
]

export default function Home() {
  const [patientData, setPatientData] = useState<Patient[]>()
  const [chart, setChart] = useState<Chart>()
  const canvasEl = useRef<HTMLCanvasElement | null>(null)

  const loadData = async () => {
    try {
      const res = await API.Patient.getPatientData()
      setPatientData(res)
    } catch (e) {
      console.error(e)
    } finally {
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const skipped = (ctx: any, value: any) =>
    ctx.p0.skip || ctx.p1.skip ? value : undefined
  const down = (ctx: any, value: any) =>
    ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined

  useEffect(() => {
    if (chart) chart.destroy()
    if (!canvasEl.current) return
    if (!patientData) return
    const newDataset: any[] = []
    const colorPalette = chroma.scale('Set1').colors(7)
    bioMarkers.forEach((marker, index) => {
      newDataset.push({
        label: marker,
        data: patientData,
        parsing: {
          yAxisKey: marker,
          xAxisKey: 'date_testing',
        },
        borderColor: colorPalette[index],
        spanGaps: true,
        segment: {
          borderColor: (ctx: any) =>
            skipped(ctx, 'rgb(0,0,0,0.2)') || down(ctx, colorPalette[index]),
          borderDash: (ctx: any) => skipped(ctx, [6, 6]),
        },
        pointRadius: 4,
        backgroundColor: colorPalette[index],
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
    console.log(tmp.data)
    //@ts-ignore
    setChart(tmp)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientData])

  return (
    <main className='flex h-screen flex-col items-center p-24 gap-10'>
      <div className='z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex'>
        <p
          className='fixed cursor-pointer left-0 top-0 flex w-full justify-center pulse border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30 select-none'
          onClick={() => loadData()}
        >
          Click <span className='font-bold'>&nbsp;Here&nbsp;</span> to get
          randomly generated data.
        </p>
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
