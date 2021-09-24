import React, { Component } from 'react';
import './ProductView.css';
import firebase from '../../components/Firebase';
import NavBar from '../../components/NavBar/NavBar';
import GroupNavBar from '../../components/GroupNavBar/GroupNavBar';
import {Redirect} from 'react-router-dom';
import {Button, Image, Header, Icon} from 'semantic-ui-react';

export default class ProductView extends Component {
    constructor(props){
        super(props);

        this.state = {
            group: '',
            doc: '',
            title: '',
            author: '',
            isbn: '',
            condition: '',
            price: '',
            seller: '',
            desc: '',
            searching: false,
            books: [],
            search: '',
            member: null,
            showReq: false,
            myBook: false,
            image: '',
            sold: true,
            redirect: false
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.deleteListing = this.deleteListing.bind(this);
    }

    componentDidMount(){
        var productPath = window.location.href.split('/');
        var bookGroup;
        var bookDoc;
        for(const item in productPath){
            if(productPath[item] === 'product'){
                bookGroup = productPath[parseInt(item) + 1];
                bookDoc = productPath[parseInt(item) + 2];
                break;
            }
        }
        const db = firebase.firestore();
        db.collection('Groups').doc(bookGroup).collection('Listings').doc(bookDoc).get().then((snapshot) => {
            const data = snapshot.data();
            this.setState({
                group: bookGroup,
                doc: bookDoc,
                desc: data.description,
                condition: data.condition,
                price: parseFloat(data.price).toFixed(2),
                title: data.name,
                author: data.author,
                seller: data.seller,
                isbn: data.isbn,
                sold: data.sold
            });
            if(data.seller === this.props.user['email']){
                this.setState({
                    myBook: true
                });
            }
        }).then(() => {
            firebase.storage().ref().child('listingPics/' + bookGroup + bookDoc).getDownloadURL().then((url) => {
                this.setState({
                    image: url
                });
            })
        });

        db.collection('Groups').where('email', '==', this.props.user['email']).get().then((snapshot) => {
            var tempBooks = [];
            if(snapshot.docs.length === 0) {
                this.setState({
                    member: true
                });
                db.collection('Members').doc(this.props.user['email']).get().then((member) => {
                    member.data().groupcodes.forEach((group, i) => {
                        db.collection('Groups').doc(group).collection('Listings').get().then((listings) => {
                            var book;
                            listings.docs.forEach((item, i) => {
                                book = item.data();
                                book['document'] = item.id;
                                tempBooks.push(book);
                            });
                            if(i + 1 === member.data().groupcodes.length){
                                this.setState({
                                    books: tempBooks
                                });
                            }
                        });
                    });
                });
            }
            else {
                this.setState({
                    member: false
                });
            }
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

    handleClick(){
        var db = firebase.firestore();

        db.collection('Groups').doc(this.state.group).collection('Listings').doc(this.state.doc).update({
            requests: firebase.firestore.FieldValue.arrayUnion(this.props.user['email'])
        });

        db.collection('Members').doc(this.props.user['email']).update({
            buylist: firebase.firestore.FieldValue.arrayUnion({
                document: this.state.doc,
                group: this.state.group
            })
        });
    }

    deleteListing(){
        var db = firebase.firestore();
        db.collection('Groups').doc(this.state.group).collection('Listings').doc(this.state.doc).get().then((snapshot) => {
            var data = snapshot.data();
            data.requests.forEach((request, i) => {
                db.collection('Members').doc(request).update({
                    buylist: firebase.firestore.FieldValue.arrayRemove({
                        document: this.state.doc,
                        group: this.state.group
                    })
                });
                if(data.requests.length === i + 1){
                    db.collection('Groups').doc(this.state.group).collection('Listings').doc(this.state.doc).delete().then(() =>{
                        this.setState({
                            redirect: true
                        });
                    });
                }
            });
            if(data.requests.length === 0){
                db.collection('Groups').doc(this.state.group).collection('Listings').doc(this.state.doc).delete().then(() => {
                    this.setState({
                        redirect: true
                    });
                });
            }
        });
    }

    render() {
        var search = "?q=" + this.state.search;

        if(this.state.member === null){
            return (<div></div>);
        }

        return (
            <div className="productView">
                {this.state.redirect ?
                    <Redirect to="/" />
                    :
                    <React.Fragment>
                        {this.state.member ?
                            <NavBar member={this.props.user['email']} books={this.state.books} handleChange={this.handleChange} handleSubmit={this.handleSubmit} />
                            :
                            <GroupNavBar handleChange={this.handleChange} handleSubmit={this.handleSubmit} />
                        }
                        {this.state.searching ?
                            <Redirect to={{
                                pathname: "/search",
                                search: search
                            }} />
                            :
                            <React.Fragment>
                                <Header as='h1' icon className="pageHeader">
                                    <Icon name='book' />
                                    {this.state.title}
                                </Header>
                                <div className="productViewContent">
                                    <div className="productViewLeft">
                                        <div className="bookProductView"><Image src={this.state.image} size="medium" /></div>
                                        <p className="isbnProductView">{this.state.isbn}</p>
                                    </div>
                                    <div className="productViewRight">
                                        <p>By {this.state.author}</p>
                                        <p>List Price: ${this.state.price}</p>
                                        <p>Condition: {this.state.condition}</p>
                                        <p>Description: {this.state.desc}</p>
                                        <p>Seller Contact: {this.state.seller}</p>
                                    </div>
                                </div>
                                {this.state.member && !this.state.myBook &&
                                    <div className="requestBook">
                                        <Button onClick={this.handleClick}>Add to Buy List</Button>
                                    </div>
                                }
                                {(!this.state.sold && (!this.state.member || (this.state.member && this.state.myBook))) &&
                                    <div className="deleteBook">
                                        <Button onClick={this.deleteListing} color="red">Delete Listing</Button>
                                    </div>
                                }
                            </React.Fragment>
                        }
                    </React.Fragment>
                }
            </div>
        );
    }
}
