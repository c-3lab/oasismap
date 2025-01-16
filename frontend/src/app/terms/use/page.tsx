'use client'
import React from 'react'
import { Grid, Typography } from '@mui/material'

const TermsOfService: React.FC = () => {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ px: '32px' }}
    >
      <Grid item xs={12} md={6}>
        <Grid item textAlign="center" sx={{ my: 2 }}>
          <Typography variant="h5">
            （雛形）地域幸福度可視化アプリ オープンベータ版 実証実験参加同意事項
          </Typography>
        </Grid>
        <Grid item textAlign="right">
          <Typography variant="body1">【自治体名】 </Typography>
          <Typography variant="body1">yyyy年mm月dd日</Typography>
        </Grid>
        <Grid item textAlign="left" sx={{ my: 2 }}>
          この度は、【自治体名】が実施する“地域幸福度可視化アプリ
          オープンベータ版”の実証実験にご協力いただき、誠にありがとうございます。本実証実験への参加にあたり、以下の内容をご確認のうえ、アカウント入力画面にチェックをお入れください。
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
            １．実証実験の概要
          </Typography>
          <Typography variant="body1">
            地域幸福度可視化アプリは、地域住民が日常の活動での感情や幸福度をリアルタイムで記録・共有できるアプリケーションです。
            本実証実験は、住民参加型のまちづくりを促進し、地域の幸福度向上を目指すものです。
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
            ２．参加条件
          </Typography>
          <Typography variant="body1" style={{ wordWrap: 'break-word' }}>
            ・インターネット接続可能なスマートフォンをお持ちの方
            <br />
            ・Googleアカウントをお持ちでログイン操作ができる方
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
            ３．提供サービス
          </Typography>
          <Typography variant="body1">
            ・地域幸福度可視化アプリ利用者アプリの提供
            <br />
            ・アプリ利用に関するサポート
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
            ４．個人情報の取扱い
          </Typography>
          <Typography variant="body1">
            本実証実験において収集される情報は、サービス提供事業者であるTIS株式会社および【自治体名】が厳重に管理し、プライバシーマークおよび情報セキュリティマネジメントシステムの要求事項に準拠して取り扱います。
            また、提供された個人情報は、実証実験の目的以外には使用されません。
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
            ５．禁止事項
          </Typography>
          <Typography variant="body1">
            ・本サービスを利用した営業活動
            <br />
            ・TIS株式会社および【自治体名】による本サービスの運営を妨害する行為
            <br />
            ・他のユーザ、第三者の権利を侵害する行為
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
            ６．健康管理と安全に関する注意事項
          </Typography>
          <Typography variant="body1">
            ・活動を行う際には、ご自身の健康状態を十分に管理ください。
            <br />
            ・体調がすぐれない場合や、医師から運動を控えるように指示されている場合は、参加を控えてください。
            <br />
            ・適切な水分補給と休憩を心がけ、無理のない範囲で活動を行ってください。
            <br />
            ・安全な場所で活動を行い、交通ルールの順守をお願いします。
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
            ７．同意の撤回
          </Typography>
          <Typography variant="body1">
            ・本実証実験への参加は任意であり、いつでも同意を撤回することができます。同意を撤回しても不利益を被ることはありません。
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default TermsOfService
