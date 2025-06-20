import React from "react";
import { useContext } from "react";
// import { Paper, Typography } from "@mui/material";
// import { useTranslation } from "react-i18next";
import { AuthContext } from "../providers/AuthProvider";
// import FloatingLogo from "./FloatingLogo";
// import { MedicinesList }  from "./MedicinesList";
// import { MedicineInputAutocomplete }  from "./MedicineInputAutocomplete";
import Landing from "./Landing";
import FlowPatient from "./FlowPatient";
import EmailTemplateEditor from "./EmailTemplateEditor";
import FlowPatientStepperExample from "./FlowPatientStepperExample";
//import config from "../config";


function Home() {
  const { auth } = useContext(AuthContext);
  //const { t } = useTranslation();

  if (typeof auth?.user === "undefined") {
    console.log("auth.user is undefined", auth);
    return; // if auth.user is undefined, we don't know yet about user authentication...
  }

  return (
    <Landing />
  );

  // return (
  //   <FlowPatient />
  // );

  // return (
  //   <FlowPatientStepperExample />
  // );

  // return (
  //   <EmailTemplateEditor />
  // );

  // return (
  //   <MedicinesList />
  // );

  // return (
  //   <FloatingLogo text={config.title} />
  //   <MedicinesList />
  // );

  // return (
  //   <Paper sx={{ padding: 4 }}>
  //     {!auth?.user &&
  //       <Typography>{t("Home page for guest user")}</Typography>
  //     }
  //     {auth?.user &&
  //       <Typography>{t("Home page for logged user")}</Typography>
  //     }
  //     {/* <Button onClick={() => showSnackbar("This is a custom snackbar", "info")} fullWidth={false}>Show Snackbar</Button> */}
  //   </Paper>
  // );
}

export default React.memo(Home);
