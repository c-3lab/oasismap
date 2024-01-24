import React, { useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Sidebar from '../../Sidebar';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      position: 'fixed',
      zIndex: theme.zIndex.drawer + 1,
      backgroundColor: '#FFFFFF',
      boxShadow: 'none',
      color: '#000000',
    },
    toolbar: {
      padding: 0,
    },
    title: {
      flexGrow: 1,
      fontWeight: 'bold',
      marginLeft: theme.spacing(5),
    },
    menuIcon: {
      fontSize: 40,
    },
  })
);

type Props = { title: string };

const HeaderForUnLoginUser: React.VFC<Props> = ({ title }) => {
  const classes = useStyles();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawerOpen = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      <AppBar className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="h6" className={classes.title}>
            {title}
          </Typography>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawerOpen}
          >
            <MenuIcon className={classes.menuIcon} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Sidebar
        isDrawerOpen={isDrawerOpen}
      />
    </>
  );
};

export default HeaderForUnLoginUser;
