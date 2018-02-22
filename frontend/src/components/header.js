import React from 'react';

import {
  Navbar, NavbarGroup, NavbarHeading, NavbarDivider, Button
} from "@blueprintjs/core";

import logo from '../icon.png'


export class Header extends React.Component {
  render() {
    return(
      <Navbar className="default-green-bg pt-dark">
        <NavbarGroup>
            <img className="pt-icon main-logo pt-align-left" src={logo} alt="omk logo" />
            <NavbarHeading>
              <h3>OpenMapKit Server</h3>
            </NavbarHeading>
        </NavbarGroup>
        <NavbarGroup align="right">
            <Button className="pt-minimal" icon="home">Home</Button>
            <Button className="pt-minimal" icon="document">Files</Button>
            <NavbarDivider />
            <Button className="pt-minimal" icon="user"></Button>
            <Button className="pt-minimal" icon="notifications"></Button>
            <Button className="pt-minimal" icon="cog"></Button>
        </NavbarGroup>
      </Navbar>
    );
  }
}
