import React, { Component } from 'react';
import './SignInForm.css';
import TextField from '../TextField/TextField';
import SubmitButton from '../SubmitButton/SubmitButton';
import firebase from 'firebase';
import {Redirect} from 'react-router-dom';

export default class SignInForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password:'',
            error: null,
            page: 'signin',
            code: '',
            isMounted: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount(){
        this.setState({
            isMounted: true
        });
    }

    handleChange(event) {
        const target = event.target;
        const name = target.name;
        this.setState({
            [name]: target.value
        });
    }
    handleSubmit(event) {
        firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(
            () => {
                this.setState({
                    page: ''
                });
            },
            () => {
                this.setState({
                    page: 'signin'
                });
            }
        );
        event.preventDefault();
    }

    render() {
        return (
            <div>
                {this.state.page === 'signin' ?
                    <form onSubmit={this.handleSubmit}>
                        <TextField label="Email" type="email" placeholder="Enter your email" onChange={this.handleChange} />
                        <TextField label="Password" type="password" placeholder="Enter your password" onChange={this.handleChange} />
                        <SubmitButton text="Submit"/>
                    </form>
                    :
                    <Redirect to='/' />
                }
            </div>
        );
    }
}
