'use client'
import dynamic from 'next/dynamic';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import customData from './customData.json';
import LineData from './LineData.json'
import {BPlot, LPlot} from './graph';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', 'red', 'pink'];
const MAX_DATA_COUNT = 6000;

const now = DateTime.local();

const Map = dynamic(() => import('starseeker-frontend'), {
  ssr: false,
});

interface MyObject {
  timestamp: any;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
  average: number;
}

const pinData = customData.map(data => ({
  latitude: data.latitude,
  longitude: data.longitude,
  title: `ピン${customData.indexOf(data) + 1}`, 
}));

// 積み上げグラフ用データ
const oneYear = customData.map((obj) => ({
  ...obj,
  timestamp: Number(DateTime.fromISO(obj.timestamp).toFormat('MM')),
  average: (obj.q1 + obj.q2 + obj.q3 + obj.q4 + obj.q5 + obj.q6)/6,
}));

const oneMonth = customData.map((obj) => ({
  ...obj,
  timestamp: Number(DateTime.fromISO(obj.timestamp).toFormat('dd')),
  average: (obj.q1 + obj.q2 + obj.q3 + obj.q4 + obj.q5 + obj.q6)/6,
}));

const oneDay = customData.map((obj) => ({
  ...obj,
  timestamp: Number(DateTime.fromISO(obj.timestamp).toFormat('HH')),
  average: (obj.q1 + obj.q2 + obj.q3 + obj.q4 + obj.q5 + obj.q6)/6,
}));

//折れ線グラフ用データ
const oneYear3 = LineData.map((obj) => ({
  ...obj,
  timestamp: Number(DateTime.fromISO(obj.timestamp).toFormat('MM')),
  average: (obj.q1 + obj.q2 + obj.q3 + obj.q4 + obj.q5 + obj.q6)/6,
}));

const oneMonth3 = LineData.map((obj) => ({
  ...obj,
  timestamp: Number(DateTime.fromISO(obj.timestamp).toFormat('dd')),
  average: (obj.q1 + obj.q2 + obj.q3 + obj.q4 + obj.q5 + obj.q6)/6,
}));

const oneDay3 = LineData.map((obj) => ({
  ...obj,
  timestamp: Number(DateTime.fromISO(obj.timestamp).toFormat('HH')),
  average: (obj.q1 + obj.q2 + obj.q3 + obj.q4 + obj.q5 + obj.q6)/6,
}));

function mergeWithTime(objects: MyObject[], start: number, end: number, currentTime: number): MyObject[] {
  const sortedObjects = objects.sort((a, b) => a.timestamp - b.timestamp);
  const result: MyObject[] = [];

  for (let timestamp = start; timestamp <= end; timestamp++) {
    const matchingObjects = sortedObjects.filter(obj => obj.timestamp === timestamp);
    if (matchingObjects.length > 0) {
      const Q1 = matchingObjects.reduce((acc, obj) => acc + obj.q1, 0);
      const Q2 = matchingObjects.reduce((acc, obj) => acc + obj.q2, 0);
      const Q3 = matchingObjects.reduce((acc, obj) => acc + obj.q3, 0);
      const Q4 = matchingObjects.reduce((acc, obj) => acc + obj.q4, 0);
      const Q5 = matchingObjects.reduce((acc, obj) => acc + obj.q5, 0);
      const Q6 = matchingObjects.reduce((acc, obj) => acc + obj.q6, 0);
      
      const average = (Q1 + Q2 + Q3 + Q4 + Q5 + Q6)/6 ;

      result.push({ 
        timestamp, 
        q1: Q1,
        q2: Q2,
        q3: Q3,
        q4: Q4,
        q5: Q5,
        q6: Q6,
        average: average,
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
        average: 0,
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

console.log("整形前", oneDay.filter(item => item.timestamp))
console.log("整形後", oneDay2.filter(item => item.timestamp))

const oneDay4 = mergeWithTime(oneDay3, 0, 23, now.hour);
const oneMonth4 = mergeWithTime(oneMonth3, 1, 31, now.day);
const oneYear4 = mergeWithTime(oneYear3, 1, 12, now.month);

console.log("整形前", oneDay3.filter(item => item.timestamp))
console.log("整形後", oneDay4.filter(item => item.timestamp))


export default function Home() {
  const [viewMode, setViewMode] = useState('Day')
  const handleViewModeChange = (mode: React.SetStateAction<string>) => {
    setViewMode(mode);
  };
  const renderCustomDayTick = (tickProps: any) => {
    const { x, y, payload } = tickProps;
    const hour = payload.value;
    if (hour % 2 === 0) {
      return (
        <text x={x} y={y} dy={16} fill="#666" textAnchor="middle">
          {hour}
        </text>
      );
    }
    return null;
  };

  const renderCustomMonthTick = (tickProps: any) => {
    const { x, y, payload } = tickProps;
    const day = payload.value;
    if (day % 2 === 0) {
      return (
        <text x={x} y={y} dy={16} fill="#666" textAnchor="middle">
          {day}
        </text>
      );
    }
    return null;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* マップコンポーネントにピンデータを渡す */}
      <Map pointEntities={[]} surfaceEntities={[]} fiware={[]} pinData={pinData} />

      {/* Container */}
      <div className="w-full h-96 lg:w-1/2 xl:w-1/2 p-4 lg:p-8 bg-gray-200">
        <h1 className="text-2xl font-bold">積み上げ棒グラフ ({viewMode})</h1>
        <div className="h-[300px] bg-gray-700 rounded">
          {/* BPlotコンポーネントのplotdataを表示モードに基づいて選択 */}
          {viewMode === '時間' && (
            <BPlot plotdata={oneDay2} title="時間" color={COLORS} xTickFormatter={renderCustomDayTick} />
          )}
          {viewMode === '日' && (
            <BPlot plotdata={oneMonth2} title="日" color={COLORS} xTickFormatter={renderCustomMonthTick} />
          )}
          {viewMode === '月' && <BPlot plotdata={oneYear2} title="月" color={COLORS} />}
        </div>
      </div>

      {/* Container */}
      <div className="w-full h-96 lg:w-1/2 xl:w-1/2 p-4 lg:p-8 bg-gray-200">
        <h1 className="text-2xl font-bold">折れ線グラフ ({viewMode})</h1>
        <div className="h-[300px] bg-gray-700 rounded">
          {/* BPlotコンポーネントのplotdataを表示モードに基づいて選択 */}
          {viewMode === '時間' && (
            <LPlot plotdata={oneDay4} title="時間" color={COLORS} xTickFormatter={renderCustomDayTick} />
          )}
          {viewMode === '日' && (
            <LPlot plotdata={oneMonth4} title="日" color={COLORS} xTickFormatter={renderCustomMonthTick} />
          )}
          {viewMode === '月' && <LPlot plotdata={oneYear4} title="月" color={COLORS} />}
        </div>
      </div>

      {/* ボタンで表示モードを切り替える */}
      <div className="flex mt-4 space-x-4">
        <button
          onClick={() => handleViewModeChange('月')}
          className={`px-4 py-2 ${viewMode === '月' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
        >
          月
        </button>
        <button
          onClick={() => handleViewModeChange('日')}
          className={`px-4 py-2 ${viewMode === '日' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
        >
          日
        </button>
        <button
          onClick={() => handleViewModeChange('時間')}
          className={`px-4 py-2 ${viewMode === '時間' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
        >
          時間
        </button>
      </div>
    </main>
  )
}
