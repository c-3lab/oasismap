import React, { useState, useEffect } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import ListItemText from '@material-ui/core/ListItemText';
import { useRouter } from 'next/navigation';

import style from './Sidebar.module.css';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    toolBar: theme.mixins.toolbar,
    treeView: {
      maxWidth: drawerWidth,
      flexGrow: 1,
    },
  })
);

type Props = {
  isDrawerOpen: boolean;
};

const Sidebar: React.VFC<Props> = ({
  isDrawerOpen,
}) => {
  const classes = useStyles();

  // 画面遷移するためのrouterです。(ReactのuseNavigateとほぼ一緒です。)
  const router = useRouter();

  return (
    <Drawer
      anchor="right"
      open={isDrawerOpen}
      variant="persistent"
      className={classes.drawer}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={style.separated_item}>
        {/* TODO: 利用者幸福度のモックURLを追加する必要がある。 */}
        <ListItemText className={style.menu_icon_user} primary={'利用者幸福度'} onClick={() => router.push('https://www.abelsoft.co.jp/')} />
        {/* TODO: 全体の幸福度のモックURLを追加する必要がある。 */}
        <ListItemText className={style.menu_icon_all} primary={'全体の幸福度'} onClick={() => router.push("https://www.abelsoft.co.jp/")} />
        {/* TODO: ログアウトのモックURLを追加する必要がある。 */}
        <ListItemText className={style.menu_icon_logout} primary={'ログアウト'} onClick={() => router.push("https://www.abelsoft.co.jp/")} />
      </div>
    </Drawer>
  );
};

export default Sidebar;
