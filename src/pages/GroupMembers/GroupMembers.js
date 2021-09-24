import React, { Component } from 'react';
import './GroupMembers.css';
import Members from '../../components/Members/Members';
import GroupNavBar from '../../components/GroupNavBar/GroupNavBar';
import {Redirect} from 'react-router-dom';
import firebase from '../../components/Firebase';
import uuid from 'uuid';
import {Icon, Header} from 'semantic-ui-react';

export default class GroupMembers extends Component {
    constructor(props){
        super(props);

        this.state = {
            search: '',
            searched: false,
            members: [],
            group: '',
            refresh: true
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.removeMember = this.removeMember.bind(this);
    }

    componentDidMount(){
        this.updateUserData();
    }

    componentDidUpdate(){
        if(this.state.refresh){
            this.updateUserData();
            this.setState({
                refresh: false
            });
        }
    }

    updateUserData(){
        var db = firebase.firestore();

        db.collection('Groups').where('email', '==', this.props.user['email']).get().then((snapshot) => {
            if(snapshot.docs.length > 0){
                const id = snapshot.docs[0].id;
                var group = snapshot.docs[0].data();
                this.setState({
                    members: group.members,
                    group: id
                });
            }
        });
    }

    removeMember(event){
        event.preventDefault();

        const name = event.target.name;
        var db = firebase.firestore();
        db.collection('Groups').doc(this.state.group).update({
            members: firebase.firestore.FieldValue.arrayRemove(name)
        }).then(() => {
            db.collection('Groups').doc(this.state.group).collection('Listings').where('seller', '==', name).where('sold', '==', false).get().then((snapshot) => {
                snapshot.forEach((item, i) => {
                    var book = item.data();
                    if(!book.sold){
                        book.requests.forEach((request, i) => {
                            db.collection('Members').doc(request).update({
                                buylist: firebase.firestore.FieldValue.arrayRemove({"document": item.id, "group": book.group})
                            });
                            if(book.requests.length === i + 1){
                                item.ref.delete();
                            }
                        });
                    }
                });
            }).then(() => {
                db.collection('Groups').doc(this.state.group).collection('Listings').where('requests', 'array-contains', name).where('sold', '==', false).get().then((snapshot) => {
                    snapshot.docs.forEach((item, i) => {
                        var book = item.data();
                        db.collection('Groups').doc(this.state.group).collection('Listings').doc(item.id).update({
                            requests: firebase.firestore.FieldValue.arrayRemove(name)
                        }).then(() => {
                            if(book.buyer === name){
                                db.collection('Groups').doc(this.state.group).collection('Listings').doc(item.id).update({
                                    buyer: '',
                                    buyerapproval: false,
                                    sellerapproval: false
                                });
                            }
                        });
                    });
                }).then(() => {
                    var done = false;
                    db.collection('Members').doc(name).get().then((snapshot) => {
                        var toRemove = [];
                        var buyList = snapshot.data().buylist;
                        buyList.forEach((listing, i) => {
                            if(listing.group === this.state.group){
                                toRemove.push(listing);
                            }
                            if(buyList.length === i + 1){
                                db.collection('Members').doc(name).update({
                                    buylist: firebase.firestore.FieldValue.arrayRemove(...toRemove)
                                }).then(() => {
                                    this.setState({
                                        refresh: true
                                    });
                                    done = true;
                                });
                            }
                        });
                    }).then(() => {
                        if(!done){
                            this.setState({
                                refresh: true
                            });
                        }
                    });
                });
            });
        });
    }

    handleChange(event) {
        event.preventDefault();

        var search = event.target.value;
        var searchSplit = search.split(" ");
        var tempSearch = "";
        searchSplit.forEach((item, i) => {
            tempSearch += (item + "+");
        });
        this.setState({
            search: tempSearch.substring(0, tempSearch.length-1)
        });
    }

    handleSubmit(event){
        event.preventDefault();

        if(event.target.value !== ''){
            this.setState({
                searched: true
            });
        }
    }

    render() {
        var search = "?q=" + this.state.search;
        return (
            <div className="groupMembers">
                <GroupNavBar handleChange={this.handleChange} handleSubmit={this.handleSubmit} />
                {this.state.searched ?
                    <Redirect to={{
                        pathname: '/group/search',
                        search: search,
                        state: {
                            group: this.state.group
                        },
                        key: uuid.v4()
                    }} />
                    :
                    <div className="groupMembersContent">
                        <Header as='h1' icon className="pageHeader">
                            <Icon name='group' />
                            Members
                        </Header>
                        <Members members={this.state.members} removeMember={this.removeMember} />
                    </div>
                }
            </div>
        );
    }
}
