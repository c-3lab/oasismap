'use client' // Pageの先頭にこの文が無いとページが表示されないです。
import dynamic from 'next/dynamic';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import HeaderForLoginUser from '../components/ui/HeaderForLoginUser';
import DateButton from '../components/ui/PeriodButton';
import DateTimeTextbox from '../components/ui/DateTimeTextbox';
// import Graph from '';//chart.jsから作成したグラフを呼び出して下さい。
// import LocationOnIcon from '@mui/icons-material/LocationOn';// ピンのアイコンの参考としております。
import './globals.css';

const Map = dynamic(
  () => import('starseeker-frontend').then((module) => module.Map),
  { ssr: false }
)

export default function Home() {
  const router = useRouter();

  return (
    <div className='oasismap-container'>
      <HeaderForLoginUser title='Oasismap' userName="Hello@gmail.com" />
      <div>
        <Map pointEntities={[]} surfaceEntities={[]} fiware={{
          tenant: '',
          servicePath: ''
        }}/>
      </div>
      <main className="flex min-h-screen flex-col items-center justify-between">
        {/* Mapの表示を調整する場合、divタグで囲みそれで調整する様にした方が良いと思います。 */}
        <div className='p-8'>
          {/* こちらにグラフのタグが入ります。 ライブラリはchart.js*/}
          <DateButton month='月' day='日' time='時間' />
          <DateTimeTextbox label='開始日' startingPeriod={'2024/01/24'} finishingPeriod={'2024/01/24'} />
          <br />
          <DateTimeTextbox label='終了日' startingPeriod={'2024/01/24'} finishingPeriod={'2024/01/24'} />
          {/* 以下のタグはピンのアイコンタグです。(Material/ui) */}
          {/* <LocationOnIcon /> */}
          <Button className='button-field' onClick={() => router.push('https://www.google.co.jp/')}>{'幸福度を入力'}</Button>
        </div>
      </main>
    </div>
  );
}
