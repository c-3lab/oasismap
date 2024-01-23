'use client'
import dynamic from 'next/dynamic';
import Image from 'next/image'
import { DateTime } from 'luxon';
import StarseekerFrontend from 'starseeker-frontend';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, Cell } from 'recharts';
import React from 'react';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', 'red', 'pink'];
const MAX_DATA_COUNT = 6000;

//グラフのサンプルデータ
const now = DateTime.local();
const lastDay = now.minus({ day: 1 })
const lastMonth = now.minus({ month: 1 })
const lastYear = now.minus({ year: 1 })

const Map = dynamic(() => import('starseeker-frontend'), {
  ssr: false,
});

const pinData = [
  { latitude: 35.967169, longitude: 139.394617, title: 'ピン1' },
  { latitude: 35.678, longitude: 139.789, title: 'ピン2' },
  // ... 他のピンデータ
];

interface MyObject {
  timestamp: any;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
}

let next = now;
let sampleData = [...Array(MAX_DATA_COUNT)].map((_, i) => {
    next = next.minus({ hour: Math.floor(Math.random()*3 )})
    return {
      timestamp: next,
      q1: Math.round(Math.random()),
      q2: Math.round(Math.random()),
      q3: Math.round(Math.random()),
      q4: Math.round(Math.random()),
      q5: Math.round(Math.random()),
      q6: Math.round(Math.random()),
    };
  }).reverse();

const oneYear = sampleData.filter(
  item => item.timestamp.equals(DateTime.max(lastYear,item.timestamp))
).map((obj) => ({
  ...obj,
  timestamp: Number(obj.timestamp.toFormat('MM')),
}));
const oneMonth = sampleData.filter(
  item => item.timestamp.equals(DateTime.max(lastMonth,item.timestamp))
).map((obj) => ({
  ...obj,
  timestamp: Number(obj.timestamp.toFormat('dd')),
}));

const oneDay = sampleData.filter(
  item => item.timestamp.equals(DateTime.max(lastDay,item.timestamp))
).map((obj) => ({
  ...obj,
  timestamp: Number(obj.timestamp.toFormat('HH')),
}));

function mergeWithTime(objects: MyObject[], start: number, end: number, currentTime: number): MyObject[] {
  const sortedObjects = objects.sort((a, b) => a.timestamp - b.timestamp);
  const result: MyObject[] = [];

  for (let timestamp = start; timestamp <= end; timestamp++) {
    const matchingObjects = sortedObjects.filter(obj => obj.timestamp === timestamp);
    if (matchingObjects.length > 0) {
      const totalQ1 = matchingObjects.reduce((acc, obj) => acc + obj.q1, 0);
      result.push({ 
        timestamp, 
        q1: matchingObjects.reduce((acc, obj) => acc + obj.q1, 0),
        q2: matchingObjects.reduce((acc, obj) => acc + obj.q2, 0),
        q3: matchingObjects.reduce((acc, obj) => acc + obj.q3, 0),
        q4: matchingObjects.reduce((acc, obj) => acc + obj.q4, 0),
        q5: matchingObjects.reduce((acc, obj) => acc + obj.q5, 0),
        q6: matchingObjects.reduce((acc, obj) => acc + obj.q6, 0),
      });
    } else {
      result.push({ 
        timestamp, 
        q1: 0,
        q2: 0,
        q3: 0,
        q4: 0,
        q5: 0,
        q6: 0,
      });
    }
  }
  const currentIndex = result.findIndex(obj => obj.timestamp === currentTime);
  if (currentIndex !== -1) {
    result.unshift(...result.splice(currentIndex, result.length - currentIndex));
  }

  return result;
}
const oneDay2 = mergeWithTime(oneDay, 0, 23, now.hour);
const oneMonth2 = mergeWithTime(oneMonth, 1, 31, now.day);
const oneYear2 = mergeWithTime(oneYear, 1, 12, now.month);

//console.log('現在', now.toFormat('y/MM/dd HH:mm:ss'))
//console.log('一日前', lastDay.toFormat('y/MM/dd HH:mm:ss'))
//console.log('一ヶ月前', lastMonth.toFormat('y/MM/dd HH:mm:ss'))
//console.log('一年前', lastYear.toFormat('y/MM/dd HH:mm:ss'))
console.log("整形前", oneDay.filter(item => item.timestamp))
console.log("整形後", oneDay2.filter(item => item.timestamp))

// 積立棒グラフ
const BPlot = (props: any) => {
  return (
    <>
    <h3 className="text-white text-center">{props.title}</h3>
    <ResponsiveContainer width="100%" height="100%" >
      <BarChart width={730} height={250} data={props.plotdata}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip/>
        <Bar dataKey="q1" stackId="a" fill={COLORS[0]} />
        <Bar dataKey="q2" stackId="a" fill={COLORS[1]} />
        <Bar dataKey="q3" stackId="a" fill={COLORS[2]} />
        <Bar dataKey="q4" stackId="a" fill={COLORS[3]} />
        <Bar dataKey="q5" stackId="a" fill={COLORS[4]} />
        <Bar dataKey="q6" stackId="a" fill={COLORS[5]} />
      </BarChart>
    </ResponsiveContainer>
    </>
  )
}


// or
//
// const Map = dynamic(() => import('starseeker-frontend/src/components/Map.tsx'), {
//   ssr: false,
// })

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* マップコンポーネントにピンデータを渡す */}
      <Map pointEntities={[]} surfaceEntities={[]} fiware={[]} pinData={pinData} />
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">src/app/page.tsx</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      {/* Container 1 */}
      <div className="w-full h-96 lg:w-1/2 xl:w-1/2 p-4 lg:p-8 bg-gray-200">
        <h1 className="text-2xl font-bold">Container 1</h1>
          <div className="h-[300px] bg-gray-700 rounded">
          <BPlot plotdata={oneDay2} title="Day"/>
          </div>
      </div>
      {/* Container 2 */}
      <div className="w-full h-96 lg:w-1/2 xl:w-1/2 p-4 lg:p-8 bg-gray-300">
        <h1 className="text-2xl font-bold">Container 2</h1>
          <div className="h-[300px] bg-gray-700 rounded">
            <BPlot plotdata={oneMonth2} title="Month"/>
          </div>
      </div>
      {/* Container 3 */}
      <div className="w-full h-96 lg:w-1/2 xl:w-1/2 p-4 lg:p-8 bg-gray-300">
        <h1 className="text-2xl font-bold">Container 3</h1>
          <div className="h-[300px] bg-gray-700 rounded">
            <BPlot plotdata={oneYear2} title="Year"/>
          </div>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Docs{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Learn{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Learn about Next.js in an interactive course with&nbsp;quizzes!
          </p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Templates{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Explore starter templates for Next.js.
          </p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Deploy{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div>
    </main>
  )
}
