'use client'
import { useRouter } from "next/navigation";
import { Box, TextField } from "@material-ui/core";
import { Button, Checkbox } from "@mui/material";
import Link from "next/link";
import HeaderForUnLoginUser from "@/components/ui/HeaderForUnLoginUser";

import style from './index.module.css';

function keycloakAccountRegistrationPage() {
  const router = useRouter();

  return (
    <div className={style.container_wrapper_styling}>
      <HeaderForUnLoginUser title={'Oasismap'} />
      <Box className={style.text_field_wrapper}>
        <TextField id="outlined-search" label="ニックネーム" type="search" className={style.nickname_styling} />
        <br />
        <TextField id="outlined-search" label="年代" type="search" className={style.age_styling} />
        <br />
        <TextField id="outlined-search" label="性別" type="search" className={style.gender_styling} />
        <br />
        <TextField id="outlined-search" label="住所" type="search" className={style.address_styling} />
        <br />
        <div>
          <span>{'パスワード'}</span>
          <br />
          <TextField id="outlined-search" label="入力フォーム" type="search" />
          <br />
          <TextField id="outlined-search" label="入力確認" type="search" />
        </div>
        <br />
        <Link
          type="search"
          className={style.link_styling}
          href={"http://locahost:3000/"}
        >
          {'利用規約'}
        </Link>
        <br />
        <div>
          <Checkbox />
          <span className={style.checkobox_styling}>{'プライバシーポリシー'}</span>
        </div>
        <br />
        <Button className={style.button_styling} onClick={() => router.push('http://locahost:3000')}>{'登録する'}</Button>
      </Box>
    </div>
  )
}

export default keycloakAccountRegistrationPage