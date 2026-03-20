import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { InitialPage } from "./components/InitialPage";
import { FormView } from "./components/FormView";
import { LastPage } from "./components/LastPage";
import { RouteHome } from "./components/RouteHome";
import { ClosedPage } from "./components/ClosedPage";
import { OpeningPage } from "./components/OpeningPage";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { ApplicationPreview } from "./components/ApplicationPreview";
import { ApplicantLogin } from "./components/ApplicantLogin";
import { NewFormGate } from "./components/NewFormGate";

// Get basename from <base> tag and remove trailing slash for React Router
const baseHref = document.querySelector('base')?.getAttribute('href') ?? '/';
const baseName = baseHref.replace(/\/$/, '') || '/';

export const App = () => {
  return (
    <Router basename={baseName}>
      <Switch>
        <Route exact path="/" component={InitialPage} key={1} />
        <Route exact path="/formViewPage" component={FormView} key={2} />
        <Route exact path="/preview/:formNumber" component={ApplicationPreview} key={3} />
        <Route exact path="/lastViewPage" component={LastPage} key={4} />
        <Route exact path="/closedPage" component={ClosedPage} key={5} />
        <Route exact path="/openingPage" component={OpeningPage} key={6} />

        {/* Applicant login / new form */}
        <Route exact path="/applicant/login" component={ApplicantLogin} key={9} />
        <Route exact path="/new-form" component={NewFormGate} key={10} />

        {/* Admin routes */}
        <Route exact path="/admin/login" component={AdminLogin} key={7} />
        <Route exact path="/admin/dashboard" component={AdminDashboard} key={8} />

        <Redirect to="/" />
      </Switch>
      <RouteHome />
    </Router>
  );
}
