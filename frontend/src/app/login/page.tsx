'use client'
import HeaderForUnLoginUser from '../../components/ui/HeaderForUnLoginUser';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';

import style from './login.module.css'

function Login() {

  const search = 'search';
  const password = 'password';

  const onclickEvent = () => {
    alert('押下した')
  }

  return (
    <div className={style.login_all_part}>
      <HeaderForUnLoginUser
        title='Oasismap'
      />
      <div><TextField id="outlined-search" label={'ID'} type={search} size={'medium'} /></div>
      <div><TextField id="outlined-search" label={'パスワード'} type={password} /></div>
      <Button onClick={onclickEvent} className={style.button_styling}
        sx={{
          width: '200px',
        }}
      >{'ログイン'}
      </Button>
    </div>
  )
}

export default Login;
