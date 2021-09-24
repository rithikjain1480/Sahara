import React, { Component } from 'react';
import './SignUpForm.css';
import TextField from '../TextField/TextField';
import Button from '../Button/Button';
import SubmitButton from '../SubmitButton/SubmitButton';
// import {Redirect} from 'react-router-dom';
import firebase from 'firebase';
import { Tab } from 'semantic-ui-react';

export default class SignUpForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            group: true,
            groupEmail: '',
            memEmail: '',
            groupPassword:'',
            memPassword:'',
            groupVerify:'',
            memVerify:'',
            members: [],
            groupCode: '',
            groupName: '',
            memName: '',
            dob: ''
        };

        this.groupClicked = this.groupClicked.bind(this);
        this.memClicked = this.memClicked.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    groupClicked() {
        this.setState({
            group: true,
            memEmail: '',
            memPassword:'',
            memVerify:'',
            memName: '',
            dob: ''
        });

        try {
            document.getElementById('memForm').reset();
        } catch (e) {
            console.log(e);
        }
    }
    memClicked() {
        this.setState({
            group: false,
            groupEmail: '',
            groupPassword:'',
            groupVerify:'',
            groupCode: '',
            groupName: '',
        });

        try {
            document.getElementById('groupForm').reset();
        } catch (e) {
            console.log(e);
        }
    }

    handleChange(event) {
        const target = event.target;
        const name = target.name;

        this.setState({
            [name]: target.value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        if(this.state.group){
            if(this.state.groupEmail === '' || this.state.groupPassword === '' || this.state.groupVerify === '' || this.state.groupCode === '' || this.state.groupName === ''){
                return;
            }
            else if(this.state.groupPassword !== this.state.groupVerify){
                return;
            }
            else if(this.state.groupCode.includes(" ")){
                return;
            }
            firebase.firestore().collection('TakenGroupCodes').doc('GroupCodes').get().then((snapshot) => {
                if(snapshot.data().groupcodes.includes(this.state.groupCode)){
                    return;
                }
            }).then(() => {
                this.submit();
            });
        }
        else {
            var date = new Date();
            var tempDOB = this.state.dob;
            var dob = new Date(parseInt(tempDOB.split('-')[0]), parseInt(tempDOB.split('-')[1]) - 1, parseInt(tempDOB.split('-')[2]));
            if(this.state.memEmail === '' || this.state.memPassword === '' || this.state.memVerify === '' || this.state.memName === '' || this.state.dob === ''){
                return;
            }
            else if(this.state.memPassword !== this.state.memVerify){
                return;
            }
            else if((date.getTime() - dob.getTime()) / (1000 * 3600 * 24) < 1461){
                return;
            }
            else {
                this.submit();
            }
        }

    }

    submit(){
        const db = firebase.firestore();

        var email = this.state.memEmail;
        var pass = this.state.memPassword;
        var group = false;
        if(this.state.group){
            email = this.state.groupEmail;
            pass = this.state.groupPassword;
            group = true;
        }

        firebase.auth().createUserWithEmailAndPassword(email, pass).then(() => {
            firebase.auth().signInWithEmailAndPassword(email, pass).then(() => {
                if(group){
                    db.collection('Groups').doc(this.state.groupCode).set({
                        email: this.state.groupEmail,
                        members: [],
                        name: this.state.groupName,
                        type: 'Group',
                        categories: ['Sci-Fi', 'Fantasy', 'Mystery', 'Other'],
                        pimage: "Pic" + (Math.floor(Math.random() * 9) + 1),
                        enabled: true,
                        joinable: false,
                        groupcode: this.state.groupCode
                    }).then(() => {
                        db.collection('TakenGroupCodes').doc('GroupCodes').update({
                            groupcodes: firebase.firestore.FieldValue.arrayUnion(this.state.groupCode)
                        }).then(() => {
                            this.props.submitted();
                            // this.setState({
                            //     redirect: true
                            // });
                        }).catch(function(error){
                            console.log(error);
                            console.log('error here 1');
                        });
                    }).catch(function(error){
                        console.log(error);
                        console.log('error here 2');
                    });
                }
                else {
                    db.collection('Members').doc(this.state.memEmail).set({
                        dob: this.state.dob,
                        email: this.state.memEmail,
                        groupcodes: ['SAHARA'],
                        name: this.state.memName,
                        type: 'Member',
                        buylist: [],
                        pimage: 'Pic' + (Math.floor(Math.random() * 9) + 1)
                    }).then(() => {
                        db.collection('Groups').doc('SAHARA').update({
                            members: firebase.firestore.FieldValue.arrayUnion(this.state.memEmail)
                        }).then(() => {
                            this.props.submitted();
                        });
                    });
                }
            });
        }).catch(function(error){
            switch(error.code){
                case "auth/weak-password":
                    console.log('password must be at least 6 characters long');
                    break;
                case "auth/email-already-in-use":
                    console.log('email is taken');
                    break;
                case "auth/invalid-email":
                    console.log('email is invalid');
                    break;
                default:
                    console.log(error.code);
            }
        });
    }

    render() {
        return (
            <div className="signUpForm">
                <Tab
                    className="signUpTabs"
                    panes={[
                        {menuItem: 'Member', render: () => <Tab.Pane>
                            <div className="memberSignUp">
                                <form id='memForm' onSubmit={this.handleSubmit}>
                                    <TextField label="Name" type="memName" placeholder="Full name" onChange={this.handleChange} />
                                    <TextField label="Date of Birth" type="dob" placeholder="Date of birth" onChange={this.handleChange} />
                                    <TextField label="Email" type="memEmail" placeholder="Email address" onChange={this.handleChange} />
                                    <TextField label="Password" type="memPassword" placeholder="Password" onChange={this.handleChange} />
                                    <TextField label="Verify Password" type="memVerify" placeholder="Verify password" onChange={this.handleChange} />
                                    <SubmitButton text="Submit"/>
                                </form>
                            </div>
                        </Tab.Pane>},
                        {menuItem: 'Group', render: () => <Tab.Pane>
                            <div className="groupSignUp">
                                <form id='groupForm' onSubmit={this.handleSubmit}>
                                    <TextField label="Name" type="groupName" placeholder="Group name" onChange={this.handleChange} />
                                    <TextField label="Email" type="groupEmail" placeholder="Email address" onChange={this.handleChange} />
                                    <TextField label="Password" type="groupPassword" placeholder="Password" onChange={this.handleChange} />
                                    <TextField label="Verify Password" type="groupVerify" placeholder="Verify password" onChange={this.handleChange} />
                                    <TextField label="Group Code" type="groupCode" placeholder="Group code" onChange={this.handleChange} />
                                    <SubmitButton text="Submit"/>
                                </form>
                            </div>
                        </Tab.Pane>}
                    ]}
                />
            </div>
        );
    }
}
