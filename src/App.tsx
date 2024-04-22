import React from "react";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect, Link,

} from "react-router-dom";
import {Button} from "react-bootstrap";
// import { createBrowserHistory } from 'history';
import {InitialPage} from "./components/InitialPage";
import {About} from "./components/About";
import {Dashboard} from "./components/Dashboard";
import {FormView} from "./components/FormView";
import { LastPage } from "./components/LastPage";
import { RouteHome } from "./components/RouteHome";
import { ClosedPage } from "./components/ClosedPage";
import { OpeningPage } from "./components/OpeningPage";

const baseName = document.querySelector('base')?.getAttribute('href') ?? '/';

// export const history = createBrowserHistory();
/*export const navigateTo=(path:string,state?:any)=>{
 setTimeout(()=>{
     history.push(path) ;
 })
}*/

// This site has 3 pages, all of which are rendered
// dynamically in the browser (not server rendered).
//
// Although the page does not ever refresh, notice how
// React Router keeps the URL up to date as you navigate
// through the site. This preserves the browser history,
// making sure things like the back button and bookmarks
// work properly.

export const App=() =>{

  return (
    <Router basename={baseName} >
   


        {/*
          A <Switch> looks through all its children <Route>
          elements and renders the first one whose path
          matches the current URL. Use a <Switch> any time
          you have multiple routes, but you want only one
          of them to render at a time
        */}
        <Switch>
          <Route exact path="/" component={InitialPage} key={1}/>

            <Route exact path="/formViewPage" component={FormView} key={2}/>
            <Route exact path="/lastViewPage" component={LastPage} key={3}/>
            <Route exact path="/closedPage" component={ClosedPage} key={4}/>
            <Route exact path="/openingPage" component={OpeningPage} key={5}/>
            {/* <Route exact path="/about" component={About} key={2}/> */}

          {/* <Route exact path="/dashboard" component={Dashboard} key={3}/> */}
           <Redirect to={"/"}/>
        </Switch>
        <RouteHome  />
      
    </Router>
  );
}