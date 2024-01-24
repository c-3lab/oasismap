'use client'
import { useRouter } from 'next/navigation';
import { Button } from '@material-ui/core';
import HeaderForUnLoginUser from '@/components/ui/HeaderForUnLoginUser';

import style from './index.module.css';

function keycloakPage() {
  const router = useRouter();
  const onClickEvent = () => {
    router.push('https://www.google.com/intl/ja/account/about/')
  }
  const title = 'Oasismap';
  const googleInfo = 'Googleアカウントでログイン';
  const buttonValue = 'Google';

  return (
    <div>
      <HeaderForUnLoginUser title={'Oasismap'} />
      <div className={style.keycloak}>
        <span>{title}</span>
        <div className={style.span_google_link_display}>{googleInfo}
          <br />
          <Button className={style.button_styling} onClick={onClickEvent}>{buttonValue}</Button>
        </div>
      </div>
    </div>
  )
}

export default keycloakPage;