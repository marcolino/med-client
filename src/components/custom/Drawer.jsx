import React from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { Drawer } from "@mui/material";
import {
  Box,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import config from "../../config";

const CustomDrawer = ({ theme, sections, drawerOpen, toggleDrawer }) => {
  const { t } = useTranslation();

  return (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={toggleDrawer(false)}
      sx={{
        top: config.ui.headerHeight + "px",
        '& .MuiDrawer-paper': {
          top: config.ui.headerHeight + "px", // to make sure the Drawer contents also respects this offset
        },
      }}
    >
      <Box
        sx={{ width: 200 }}
        role="presentation"
        onClick={toggleDrawer(false)}
        onKeyDown={toggleDrawer(false)}
      >
        <List /*dense*/>
          {sections.map(section => (
            <ListItem
              key={section.key}
              component={RouterLink}
              to={section.to}
              sx={{ borderBottom: 1, borderColor: "grey.400" }} // TODO: use theme....
            >
              <Box sx={{ display: "flex", alignItems: "center", color: "text.primary" }}>
                {section.icon} &emsp; <ListItemText primary={section.text} />
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

export default CustomDrawer;
