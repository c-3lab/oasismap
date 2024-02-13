'use client'
import React, { useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Checkbox,
  Button,
  Grid,
  List,
  ListItem,
  ListItemButton,
} from '@mui/material'

import { MessagesContext } from '@/Contexts'

const HappinessInput: React.FC = () => {
  const messagesContext = useContext(MessagesContext)
  const router = useRouter()

  // チェックボックスの状態管理用オブジェクト
  const [checked, setChecked] = useState({
    happiness1: 0,
    happiness2: 0,
    happiness3: 0,
    happiness4: 0,
    happiness5: 0,
    happiness6: 0,
  })

  // チェックボックスの状態が全て0かどうかをチェック
  const isAllUnchecked = Object.values(checked).every((value) => value === 0)

  // チェックボックスのラベル配列
  const checkboxLabels = {
    happiness1: '➀ ワクワクする場所です',
    happiness2: '➁ 新たな発見や学びのある場所です',
    happiness3: '➂ ホッとする場所です',
    happiness4: '➃ 自分を取り戻せる場所です',
    happiness5: '➄ 自慢の場所です',
    happiness6: '➅ 思い出の場所です',
  }

  // チェックボックスの状態を変更
  const onCheckedChange = (key: keyof typeof checked) => {
    setChecked((prev) => ({ ...prev, [key]: prev[key] === 0 ? 1 : 0 }))
  }

  // 元いたページに戻る
  const onPageBack = () => {
    messagesContext.addMessage('送信成功')
    router.back()
  }

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      rowSpacing={4.5}
      sx={{ p: '32px' }}
    >
      <Grid item xs={12} md={8}>
        <List dense disablePadding sx={{ bgcolor: 'background.paper' }}>
          {Object.entries(checkboxLabels).map(([key, label]) => (
            <ListItem
              key={key}
              secondaryAction={
                <Checkbox
                  edge="end"
                  color="default"
                  sx={{ '& .MuiSvgIcon-root': { fontSize: 28 }, p: 0 }}
                  checked={checked[key as keyof typeof checked] === 1}
                  onChange={() => onCheckedChange(key as keyof typeof checked)}
                />
              }
              disablePadding
            >
              <ListItemButton
                sx={{ p: 0, height: 40, fontSize: 18 }}
                onClick={() => onCheckedChange(key as keyof typeof checked)}
              >
                {label}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Grid>
      <Grid item xs={12} md={8}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={() => onPageBack()}
          disabled={isAllUnchecked}
        >
          幸福度を送信
        </Button>
      </Grid>
    </Grid>
  )
}

export default HappinessInput
