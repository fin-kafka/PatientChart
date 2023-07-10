import Chart from 'chart.js/auto'

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center p-24 gap-10'>
      <div className='z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex'>
        <p className='fixed cursor-pointer left-0 top-0 flex w-full justify-center pulse border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30'>
          Click <span className='font-bold'>&nbsp;Here&nbsp;</span> to get
          randomly generated data.
        </p>
      </div>
      <div className='w-full min-h-[350px]'></div>
    </main>
  )
}
