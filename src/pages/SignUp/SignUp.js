import React, { Component } from 'react';
import './SignUp.css';
import SignUpForm from '../../components/SignUpForm/SignUpForm';
import LandingButtons from '../../components/LandingButtons/LandingButtons';
import {Redirect} from 'react-router-dom';
import {Header, Icon} from 'semantic-ui-react';

export default class SignUp extends Component {
    constructor(props){
        super(props);

        this.state = {
            redirect: false
        }

        this.submitted = this.submitted.bind(this);
    }

    submitted(){
        this.setState({
            redirect: true
        });
    }

    render() {
        return (
            <div className="signUp">
                <LandingButtons />
                {this.state.redirect ?
                    <Redirect to="/" />
                    :
                    <React.Fragment>
                        <Header as='h1' icon className="pageHeader">
                            <Icon name='signup' />
                            Sign Up
                        </Header>
                        <SignUpForm submitted={this.submitted} />
                    </React.Fragment>
                }
            </div>
        );
    }
}
