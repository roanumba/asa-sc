import {Button} from "react-bootstrap";
import React from "react";
// import {navigateTo} from "../App";
import {Link} from "react-router-dom";

export const Dashboard=() =>{
  return (
    <div>
      <h2>Dashboard</h2>
        <Link to="/about">About</Link>{' '}
        <Link to="/">Home</Link>   {' '}
    </div>
  );
}
