import React, { useState, useContext } from "react";
import {
  AppBar, Toolbar, Box, Typography, Button, IconButton, Link, Badge,
  ListItemText, ListItemIcon, Menu, MenuItem, Tooltip
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AccountCircle, ExitToApp, ManageAccounts,
  ShoppingCart, Category, Brightness4, Brightness7, ContactPhone,
} from "@mui/icons-material";
import IconGravatar from "./IconGravatar";
import Drawer from "./custom/Drawer";
import { cancelAllRequests } from "../middlewares/Interceptors";
import { useMediaQueryContext } from "../providers/MediaQueryProvider";
import { useSnackbarContext } from "../providers/SnackbarProvider";
import { AuthContext } from "../providers/AuthProvider";
import { useCart } from "../providers/CartProvider";
import { isAdmin } from "../libs/Validation";
import logoMain from "../assets/images/LogoMain.png";
import config from "../config";


const Header = ({ theme, toggleTheme }) => {
  const { auth, isLoggedIn, signOut, didSignInBefore } = useContext(AuthContext);
  const { showSnackbar } = useSnackbarContext();
  //console.log("Snackbar Context in Header:", showSnackbar); // Debugging line
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  //const [authRoute, setIsAuthRoute] = useState(location.pathname === "/signin");
  const { cartItemsQuantity } = useCart();
  const { isMobile } = useMediaQueryContext();

  const sections = React.useMemo(() => [
    ...(config.ecommerce.enabled ? [{ // add cart to sections only if ecommerce is enabled
      key: "cart",
      to: "/cart",
      icon:
        cartItemsQuantity() ?
          <Badge badgeContent={cartItemsQuantity()} color="primary"><ShoppingCart /></Badge>
        :
          <ShoppingCart />
      ,
      text:
        cartItemsQuantity() && !isMobile ?
          <Badge badgeContent={cartItemsQuantity()} color="primary">{t("Cart")}</Badge>
        :
          t("Cart")
    }] : []),
    {
      key: "products",
      to: "/products",
      icon: <Category />,
      text: t("Products"),
    },
    {
      key: "contacts",
      to: "/contacts",
      icon: <ContactPhone />,
      text: t("Contacts"),
    },
  ], [cartItemsQuantity, isMobile, t, config.ecommerce.enabled]);

  // the highest priority role name
  const roleNameHighestPriority = isLoggedIn ? auth.user.roles.reduce(
    (previous, current) => previous.priority > current.priority ? previous : current
  ).name : "guest";

  // alert(location.pathname);
  // const isAuthRoute = () => (false);  //location.pathname === "/signin");
  const isAuthRoute = () => (location.pathname === "/signin" || location.pathname === "/signup" || location.pathname === "/forgot-password" || location.pathname === "/social-signin-success" || location.pathname === "/social-signin-error");

  const userItems = [
    ...(isLoggedIn && isAdmin(auth.user) ?
      [{
        label: t("Handle users"),
        icon: <ManageAccounts />,
        href: "/handle-users",
      },
      {
        label: t("Handle products"),
        icon: <Category />,
        href: "/handle-products",
      }]
    : []),
    {
      label: t("Change theme"),
      icon: (
        <IconButton onClick={toggleTheme} sx={{ padding: 0 }}>
          {theme.palette.mode === "light" ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      ),
      href: null,
      onClick: toggleTheme
    },
    ...(isLoggedIn ?
      [
        {
          label: `${t("Profile")} (${roleNameHighestPriority})`,
          icon: <AccountCircle />,
          href: `/edit-user/${auth?.user?.id}/editProfile`,
        },
        {
          label: t("Sign out"),
          icon: <ExitToApp />,
          href: false,
          onClick: () => handleSignOut(),
          shortcutKey: "", //"Ctrl-Q"
        },
      ] : [ ]
    ),
  ];

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const [anchorUserMenuEl, setAnchorUserMenuEl] = React.useState(null);
  const userMenuIsOpen = Boolean(anchorUserMenuEl);
  
  const handleUserMenuOpen = (event) => {
    setAnchorUserMenuEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorUserMenuEl(null);
  };
  
  const handleUserJoin = (event) => {
    navigate(
      didSignInBefore ? "/signin" : "/signup",
      { replace: true }
    );
  };

  const handleSignOut = async () => {
    console.log("handleSignOut");
    navigate("/", { replace: true });
    let ok;
    try {
      cancelAllRequests(); // cancel all ongoing requests, to avoid "You must be authenticated for this action" warnings
      ok = await signOut();
      console.log("signout result:", ok);
      navigate("/"); // navigate to home page, because guest user could not be entitled to stay on current page
    } catch (err) {
      console.error("signout error:", err);
    }
    showSnackbar(ok ? t("Sign out successful") : t("Sign out completed"), "success");
  };

  //console.log("sections:", sections);

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{ bgColor: theme.palette.ochre.light }}>
      <Toolbar>
        <Box
          component={Link}
          href="/"
          display="flex"
          alignItems="center"
          sx={{ textDecoration: "none" }}
        >
          <Box
            component="img"
            src={logoMain}
            alt="Main logo"
            sx={{ height: config.ui.headerHeight, marginRight: 2 }}
          />
          {/* <Typography variant="h6" component="span" sx={{ color: theme.palette.text.secondary, flexGrow: 1, }}>
            {config.title}
          </Typography> */}
        </Box>

        <Box sx={{
          display: "flex",
          alignItems: "center",
          flexGrow: 1,
        }}>
        </Box>

        {isMobile ?
          <>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => navigate("cart")}
              sx={{ mr: 2 }}
            >
              {cartItemsQuantity() ?
                <Badge badgeContent={cartItemsQuantity()} color="primary"><ShoppingCart /></Badge>
                :
                <ShoppingCart />
              }
            </IconButton>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          </>
        :
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {sections.map(section => (
              <Button key={section.key} color="inherit" component={RouterLink} to={section.to}>{section.text}</Button>
            ))}
            {/* <Button color="inherit" component={RouterLink} to="/products">{t("Products")}</Button>
                <Button color="inherit" component={RouterLink} to="/contacts">{t("Contacts")}</Button> */}
          </Box>
        }
        
        <> {/* user menu */}
          {isLoggedIn ?
            <Tooltip title={`${auth.user.email} (${roleNameHighestPriority})`}>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleUserMenuOpen}
                color="inherit"
              >
                {isLoggedIn ?
                  auth.user.profileImage ?
                    <img src={auth.user.profileImage} alt="user's icon" width={30} style={{ borderRadius: "50%" }} />
                  :
                  <IconGravatar
                    email={auth.user.email}
                    size={30}
                  />
                :
                  <AccountCircle />
                }
              </IconButton>
            </Tooltip>
          :
            <Button
              variant="contained"
              size="small"
              color="secondary"
              onClick={handleUserJoin}
              disabled={isAuthRoute()} 
            >
              {t("Join !")}
            </Button>
          }

          <Menu
            id="menu-appbar"
            anchorEl={anchorUserMenuEl}
            open={userMenuIsOpen}
            onClose={handleUserMenuClose}
            onClick={handleUserMenuClose} // to close on click everywhere
          >
            {userItems.map(({ label, icon, href, onClick, shortcutKey }) => (
              <MenuItem key={label} component={RouterLink} to={href} /*dense*/>
                <ListItemIcon>
                  {icon}
                </ListItemIcon>
                <ListItemText onClick={onClick}>{label}</ListItemText>
                {shortcutKey && <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                  &nbsp; {shortcutKey}
                </Typography>}
              </MenuItem>
            ))}
          </Menu>
        </>
        
      </Toolbar>

      <Drawer
        theme={theme}
        sections={sections}
        drawerOpen={drawerOpen}
        toggleDrawer={toggleDrawer}
      />
      
    </AppBar>
  );

};

export default Header;
