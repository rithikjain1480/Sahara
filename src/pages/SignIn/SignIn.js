import React, { Component } from 'react';
import './SignIn.css';
import SignInForm from '../../components/SignInForm/SignInForm';
import LandingButtons from '../../components/LandingButtons/LandingButtons';
import signInImage from '../../images/signInImage.jpg';
import {Header, Icon} from 'semantic-ui-react';

export default class SignIn extends Component {
    // <div className="signInImage" style={{backgroundImage: 'url(' + signInImage + ')'}}></div>
    render() {
        return (
            <div className="signIn">
                <LandingButtons />
                <Header as='h1' icon className="pageHeader">
                    <Icon name='sign-in' />
                    Sign In
                </Header>
                <div className="signInInner">
                    <SignInForm />
                </div>
            </div>
        );
    }
}
