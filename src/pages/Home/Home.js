import React, { Component } from 'react';
import './Home.css';
import MemberView from '../../components/MemberView/MemberView';
import firebase from '../../components/Firebase';
import {withRouter, Redirect} from 'react-router-dom';
import uuid from 'uuid';

class Home extends Component {
    _isMounted = false;

    constructor(props){
        super(props);

        this.state = {
            email: null,
            code: null,
            groups: [],
            books: [],
            isMember: null,
            members: [],
            userData: null,
            categories: []
        };
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            this.setState({
                email: this.props.user['email']
            });

            this.setData();
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(!prevState){
            this.setData();
        }
        else if(this.state.groups.length !== prevState.groups.length){
            // this.setData();
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    setData(){
        var member = true;
        var tempBooks = [];
        var code;
        var user = firebase.firestore().collection('Groups').where('email', '==', this.props.user['email']);
        user.get().then((snapshot) => {
            snapshot.forEach((doc) => {
                code = doc.id;
                member = false;
            });
            var db = firebase.firestore();
            var tempGroups = [];
            var groups;
            var userData;
            if(member){
                db.collection('Members').doc(this.props.user['email']).get().then((snapshot) => {
                    try {
                        var data = snapshot.data();
                        groups = data.groupcodes;
                        this.setState({
                            userData: data,
                            groups: groups
                        });
                    } catch (e) {
                        this.setData();
                    }
                }).then(() => {
                    this.state.groups.forEach((group, i) => {
                        db.collection('Groups').doc(group).get().then((query) => {
                            if(query.data().members.includes(this.props.user['email'])){
                                tempGroups.push(group)
                            }
                            if(groups.length === i + 1){
                                this.setState({
                                    groups: tempGroups
                                });
                            }
                        });
                    });
                }).then(() => {
                    this.state.groups.forEach((item, i) => {
                        var group = item;
                        db.collection('Groups').doc(group).collection('Listings').get().then((snapshot) => {
                            var book;
                            snapshot.docs.forEach((item, i) => {
                                book = item.data();
                                book['document'] = item.id;
                                tempBooks.push(book);
                            });
                            if(i + 1 === this.state.groups.length){
                                this.setState({
                                    books: tempBooks
                                });
                            }
                        });
                    });
                }).then(() => {
                    var tempCategories = [];
                    this.state.groups.forEach((item, i) => {
                        db.collection('Groups').doc(item).get().then((snapshot) => {
                            tempCategories.push(...snapshot.data().categories);
                        });
                        if(i + 1 === this.state.groups.length){
                            this.setState({
                                categories: tempCategories
                            });
                        }
                    });
                });

                this.setState({
                    code: ' ',
                    isMember: true
                });
            }
            else {
                this.setState({
                    isMember: false,
                    code: code
                });
            }
        });
    }

    render() {
        if(this.state.isMember === null){
            return (<div></div>);
        }

        // might be able to remove members from redirect
        return (
            <div className="home">
                {this.state.code ?
                    this.state.isMember ?
                        <MemberView renderProfile={this.props.renderProfile} member={this.state.email} books={this.state.books} userData={this.state.userData} categories={this.state.categories} />
                        :
                        <Redirect to={{
                            pathname: '/group/search',
                            state: {
                                group: this.state.code
                            },
                            key: uuid.v4()
                        }} />
                    :
                    <div></div>
                }
            </div>

        );
    }
}

export default withRouter(Home);
