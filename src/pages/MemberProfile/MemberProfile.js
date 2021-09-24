import React, {Component} from 'react';
import './MemberProfile.css';
// can remove withrouter from here
import {withRouter} from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
import ProfileView from '../../components/ProfileView/ProfileView';
import {Redirect} from 'react-router-dom';
import firebase from '../../components/Firebase';

class MemberProfile extends Component {
    constructor(props){
        super(props);

        this.state = {
            img: '',
            dob: '',
            name: '',
            email: '',
            activeGroupCodes: [],
            allGroupCodes: [],
            searching: false,
            search: '',
            refresh: false,
            newGroup: '',
            books: [],
            logOut: false,
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChangeGroups = this.handleChangeGroups.bind(this);
        this.handleSubmitGroups = this.handleSubmitGroups.bind(this);
        this.removeGroup = this.removeGroup.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.changeProfilePicture =  this.changeProfilePicture.bind(this);
    }

    componentDidMount(){
        this.updateUserData();
    }

    componentDidUpdate(prevProps){
        if(this.state.refresh){
            this.updateUserData();
            this.setState({
                refresh: false
            });
        }
    }

    updateUserData(){
        var db = firebase.firestore();
        var groups = [];
        var activeGroups = [];
        db.collection('Members').doc(this.props.user['email']).get().then((snapshot) => {
            var data = snapshot.data();
            const images = require.context('../../images', true);
            groups = data.groupcodes;
            this.setState({
                img: data.pimage ? images('./profiles/' + data.pimage + '.png') : '',
                dob: data.dob,
                email: this.props.user['email'],
                allGroupCodes: data.groupcodes,
                name: data.name,
                refresh: false
            });
        }).then(() => {
            groups.forEach((group, i) => {
                db.collection('Groups').doc(group).get().then((snapshot) => {
                    var members = snapshot.data().members;
                    if(members.includes(this.props.user['email'])){
                        activeGroups.push(group);
                    }
                    if(i + 1 === groups.length){
                        this.setState({
                            activeGroupCodes: activeGroups
                        });
                    }
                })
            });
        }).then(() => {
            var tempBooks = [];
            groups.forEach((group, i) => {
                db.collection('Groups').doc(group).collection('Listings').get().then((snapshot) => {
                    var book;
                    snapshot.docs.forEach((item, i) => {
                        book = item.data();
                        book['document'] = item.id;
                        tempBooks.push(book);
                    });
                    if(i + 1 === groups.length){
                        this.setState({
                            books: tempBooks
                        });
                    }
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
                searching: true
            });
        }
    }

    // editAddress(event){
    //     event.preventDefault();
    //
    //     this.setState({
    //         renderAddress: false
    //     });
    // }

    // handleChangeAddress(event){
    //     this.setState({
    //         newAddress: event.target.value
    //     });
    // }

    // saveAddress(event){
    //     event.preventDefault();
    //
    //     firebase.firestore().collection('Members').doc(this.props.user['email']).update({
    //         address: this.state.newAddress
    //     });
    //
    //     this.setState({
    //         address: this.state.newAddress,
    //         renderAddress: true
    //     });
    // }

    handleChangeGroups(event) {
        const target = event.target;

        this.setState({
            newGroup: target.value
        });
    }

    handleSubmitGroups(event){
        event.preventDefault();

        var db = firebase.firestore();

        db.collection('Groups').doc(this.state.newGroup).get().then((snapshot) => {
            var data = snapshot.data()
            if(data){
                // add joinable here
                if(data.enabled){
                    db.collection('Groups').doc(this.state.newGroup).update({
                        members: firebase.firestore.FieldValue.arrayUnion(this.props.user['email'])
                    }).then(() => {
                        db.collection('Members').doc(this.props.user['email']).update({
                            groupcodes: firebase.firestore.FieldValue.arrayUnion(this.state.newGroup)
                        }).then(() => {
                            this.setState({
                                refresh: true
                            });
                        });
                    }).catch((error) => {
                        console.log(error);
                    });
                }
            }
        });

        try {
            document.getElementById('addGroupForm').reset();
        } catch (e) {
            console.log(e);
        }
    }

    removeGroup(event){
        var db = firebase.firestore();
        const name = event.target.name;

        db.collection('Groups').doc(name).update({
            members: firebase.firestore.FieldValue.arrayRemove(this.props.user['email'])
        }).then(() => {
            db.collection('Groups').doc(name).collection('Listings').where('seller', '==', this.props.user['email']).where('sold', '==', false).get().then((snapshot) => {
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
                db.collection('Groups').doc(name).collection('Listings').where('requests', 'array-contains', this.props.user['email']).where('sold', '==', false).get().then((snapshot) => {
                    snapshot.docs.forEach((item, i) => {
                        var book = item.data();
                        db.collection('Groups').doc(name).collection('Listings').doc(item.id).update({
                            requests: firebase.firestore.FieldValue.arrayRemove(this.props.user['email'])
                        }).then(() => {
                            if(book.buyer === this.props.user['email']){
                                db.collection('Groups').doc(name).collection('Listings').doc(item.id).update({
                                    buyer: '',
                                    buyerapproval: false,
                                    sellerapproval: false
                                });
                            }
                        });
                    });
                }).then(() => {
                    var done = false;
                    db.collection('Members').doc(this.props.user['email']).get().then((snapshot) => {
                        var toRemove = [];
                        var buyList = snapshot.data().buylist;
                        buyList.forEach((listing, i) => {
                            if(listing.group === name){
                                toRemove.push(listing);
                            }
                            if(buyList.length === i + 1){
                                if(toRemove.length > 0){
                                    db.collection('Members').doc(this.props.user['email']).update({
                                        buylist: firebase.firestore.FieldValue.arrayRemove(...toRemove)
                                    }).then(() => {
                                    });
                                }
                                else {
                                    this.setState({
                                        refresh: true
                                    });
                                    done = true;
                                }
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

    handleClick(){
        var db = firebase.firestore();
        this.state.allGroupCodes.forEach((group, i) => {
            db.collection('Groups').doc(group).collection('Listings').where('buyer', '==', this.props.user['email']).where('sold', '==', false).get().then((snapshot) => {
                snapshot.docs.forEach((doc, j) => {
                    db.collection('Groups').doc(group).collection('Listings').doc(doc.id).update({
                        buyer: '',
                        buyerapproval: false,
                        sellerapproval: false,
                        requests: firebase.firestore.FieldValue.arrayRemove(this.props.user['email'])
                    });
                });
            }).then(() => {
                db.collection('Groups').doc(group).collection('Listings').where('seller', '==', this.props.user['email']).where('sold', '==', false).get().then((snapshot) => {
                    snapshot.docs.forEach((doc, j) => {
                        var data = doc.data();
                        var id = doc.id;
                        data.requests.forEach((request, k) => {
                            db.collection('Members').doc(request).update({
                                buylist: firebase.firestore.FieldValue.arrayRemove({
                                    document: id,
                                    group: group
                                })
                            });
                            if(data.requests.length === k + 1){
                                db.collection('Groups').doc(group).collection('Listings').doc(id).delete();
                            }
                        });
                    });
                }).then(() => {
                    db.collection('Groups').doc(group).collection('Listings').where('requests', 'array-contains', this.props.user['email']).get().then((snapshot) => {
                        snapshot.docs.forEach((doc, j) => {
                            db.collection('Groups').doc(group).collection('Listings').doc(doc.id).update({
                                requests: firebase.firestore.FieldValue.arrayRemove(this.props.user['email'])
                            });
                        });
                    }).then(() => {
                        db.collection('Groups').doc(group).update({
                            members: firebase.firestore.FieldValue.arrayRemove(this.props.user['email'])
                        }).then(() => {
                            db.collection('Members').doc(this.props.user['email']).delete().then(() => {
                                this.props.user.delete().then(() => {
                                    this.setState({
                                        logOut: true
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    changeProfilePicture(event){
        event.preventDefault();
        const images = require.context('../../images', true);
        // this may break depending on how the url ends up looking
        var imgName = event.target.src.split('/')[5].split('.')[0];
        this.setState({
            img: images('./profiles/' + imgName + '.png')
        });

        var db = firebase.firestore();
        db.collection('Members').doc(this.state.email).update({
            pimage: imgName
        });
    }

    render() {
        var search = "?q=" + this.state.search;
        return (
            <React.Fragment>
                {this.state.logOut ?
                    <Redirect to="/" />
                    :
                    <div className="memberProfile">
                        <NavBar member={this.props.user['email']} books={this.state.books} handleChange={this.handleChange} handleSubmit={this.handleSubmit} />
                        {this.state.searching ?
                            <Redirect to={{
                                pathname: "/search",
                                search: search
                            }} />
                            :
                            <ProfileView books={this.state.books} img={this.state.img} name={this.state.name} dob={this.state.dob} email={this.state.email} groupCodes={this.state.activeGroupCodes} handleChange={this.handleChangeGroups} handleSubmit={this.handleSubmitGroups} removeGroup={this.removeGroup} handleClick={this.handleClick} changeProfilePicture={this.changeProfilePicture} />
                        }
                    </div>
                }
            </React.Fragment>
        );
    }
}

export default withRouter(MemberProfile);
