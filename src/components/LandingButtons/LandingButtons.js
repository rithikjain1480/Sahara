import React, { Component } from 'react';
import './LandingButtons.css';
// import Button from '../Button/Button';
import { Image, Button } from 'semantic-ui-react';
import logo from '../../images/logo.png';

export default class LandingButtons extends Component {
    redirect(target) {
        window.location = target;
    }

    render() {
        return (
            <React.Fragment>
                <div className="landingButtons">
                    <Image src={logo} size="small" onClick={() => {this.redirect('/')}} rounded className="navBarLogo" />
                    <div>
                        <Button onClick={() => {this.redirect("/signin")}}>Sign In</Button>
                        <Button onClick={() => {this.redirect("/getstarted")}}>Get Started</Button>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
