import React, { useState, useEffect } from "react";
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
import { AdminApplicationDetail } from "./components/AdminApplicationDetail";
import { store } from "./";
declare const __BUILD_TIME__: string;

export const App = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    store.init().then(() => {
      setInitialized(true);
    });
  }, []);

  if (!initialized) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const baseName = document.querySelector('base')?.getAttribute('href') ?? '/';
  const basename = baseName.replace(/\/$/, '');

  return (
    <Router basename={basename}>
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
        <Route exact path="/admin/application/:formNumber" component={AdminApplicationDetail} key={11} />

        <Redirect to="/" />
      </Switch>
      <RouteHome />
              <div style={{
            position: "fixed",
            bottom: "10px",
            right: "15px",
            fontSize: "11px",
            color: "#888888",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 1000
        }}>
            Version: {__BUILD_TIME__}
        </div>
    </Router>
  );
}
