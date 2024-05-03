import {useContext, useEffect, useState} from "react";
import {classicBlueTheme, warmEarthTheme} from "../themes";
import {Button, Menu, MenuItem} from "@mui/material";
import {setTheme} from "../slices/themeSlice";
import {useDispatch} from "react-redux";

const React = require('react');
const { Box, Typography } = require('@mui/material');

const Footer = () => {

    // const [anchorEl, setAnchorEl] = useState(null);
    // const open = Boolean(anchorEl);

    // const dispatch = useDispatch();

    // const handleClick = (event) => {
    //     setAnchorEl(event.currentTarget);
    // };
    //
    // const handleClose = () => {
    //     setAnchorEl(null);
    // };
    //
    // const handleThemeChange = (theme) => {
    //     setCurrentTheme(theme);
    //     dispatch(setTheme(theme));
    //     handleClose();
    // };


    return (
        <Box sx={{bgcolor: 'lightgray', p: 2, mt: 0}} component="footer">
            <Typography variant="body2" align="center">
                © {new Date().getFullYear()} Energy Trading App
            </Typography>

            {/*<div>*/}
            {/*    <Button onClick={handleClick}>*/}
            {/*        Change Theme ({currentThemeName})*/}
            {/*    </Button>*/}
            {/*    <Menu*/}
            {/*        open={open}*/}
            {/*        anchorEl={anchorEl}*/}
            {/*        onClose={handleClose}*/}
            {/*    >*/}
            {/*        <MenuItem onClick={() => handleThemeChange(warmEarthTheme)}>Warm Earth</MenuItem>*/}
            {/*        <MenuItem onClick={() => handleThemeChange(classicBlueTheme)}>Classic Blue</MenuItem>*/}
            {/*        /!* Add MenuItems for each theme *!/*/}
            {/*    </Menu>*/}
            {/*</div>*/}
        </Box>
    );
};

export default Footer;
// module.exports = Footer;