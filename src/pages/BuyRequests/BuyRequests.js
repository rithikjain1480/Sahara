import React, { Component } from 'react';
import './BuyRequests.css';
import NavBar from '../../components/NavBar/NavBar';
import DropDown from '../../components/DropDown/DropDown';
// import Button from '../../components/Button/Button';
import firebase from '../../components/Firebase';
import { Accordion, Header, Icon, Button, Popup } from 'semantic-ui-react';
import {Redirect} from 'react-router-dom';

export default class BuyRequests extends Component {
    constructor(props){
        super(props);

        this.state = {
            groups: [],
            books: [],
            dropDowns: [],
            switch: false,
            searching: false,
            search: ''
        }

        this.verify = this.verify.bind(this);
        this.repeal = this.repeal.bind(this);
        this.accept = this.accept.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount(){
        var db = firebase.firestore();
        var tempGroups;
        var tempBooks = [];
        db.collection('Members').doc(this.props.user['email']).get().then((snapshot) => {
            this.setState({
                groups: snapshot.data().groupcodes
            });
            tempGroups = snapshot.data().groupcodes;
        }).then(() => {
            tempGroups.forEach((group, i) => {
                db.collection('Groups').doc(group).collection('Listings').get().then((listings) => {
                    listings.docs.forEach((item, j) => {
                        var book = item.data();
                        if(book.seller === this.props.user['email']){
                            book['document'] = item.id;
                            tempBooks.push(book);
                        }
                    });
                    if(i + 1 === tempGroups.length){
                        this.setState({
                            books: tempBooks
                        });
                    }
                });
            });
        }).then(() => {
            this.createDropDowns();
        });
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.books.length !== prevState.books.length || this.state.switch !== prevState.switch){
            this.createDropDowns();
        }
    }

    createDropDowns(){
        var tempDropDowns = []
        this.state.books.forEach((book, i) => {
            if(!book.sold){
                var list = [];
                if(book.buyer !== ""){
                    list.push(<div key={i + book.name} className="dropDownList">
                        {book.buyer}
                        <div>
                            <React.Fragment>
                                {this.state.books[i].sellerapproval ?
                                    <Popup position='top center' size='small' content='Awaiting buyer approval' trigger={<span style={{'display': 'inline-block'}}><Button name={book.group + " " + book.document + " " + i} color='green' disabled>Verify</Button></span>} />
                                    :
                                    <Button name={book.group + " " + book.document + " " + i} onClick={this.verify} color='green'>Verify</Button>
                                }
                            </React.Fragment>
                            <Button color='red' name={book.group + " " + book.document + " " + i} onClick={this.repeal}>Repeal</Button>
                        </div>
                    </div>)
                }
                else {
                    book.requests.forEach((request, j) => {
                        list.push(<div key={j} className="dropDownList">{request} <Button color='green' name={book.group + " " + book.document + " " + i + " " + request} onClick={this.accept}>Accept</Button></div>);
                    });
                }
                tempDropDowns.push(<DropDown key={book.document} title={book.name} author={book.author} requests={book.requests.length} list={list} />);
            }
        });

        this.setState({
            dropDowns: tempDropDowns
        });
    }

    accept(event){
        const book = event.target.name.split(" ");
        var db = firebase.firestore();

        const emailSub = "Selling " + this.state.books[book[2]].name;
        const emailBody = "Selling book";
        const emailTo = book[3];
        const emailCC = '';
        window.open("mailto:"+emailTo+'?cc='+emailCC+'&subject='+emailSub+'&body='+emailBody);

        db.collection('Groups').doc(book[0]).collection('Listings').doc(book[1]).update({
            buyer: book[3]
        }).then(() => {
            const temps = [...this.state.books];
            const temp = {...temps[parseInt(book[2])]};
            temp.buyer = book[3];
            temps[parseInt(book[2])] = temp;

            this.setState({
                books: temps,
                switch: !this.state.switch
            });
        });
    }

    verify(event){
        const book = event.target.name.split(" ");

        var db = firebase.firestore();
        if(this.state.books[book[2]].buyerapproval){
            db.collection('Groups').doc(book[0]).collection('Listings').doc(book[1]).update({
                sold: true,
                sellerapproval: true
            }).then(() => {
                const temps = [...this.state.books];
                const temp = {...temps[parseInt(book[2])]};
                temp.sellerapproval = true;
                temp.sold = true;
                temps[parseInt(book[2])] = temp;

                this.setState({
                    books: temps,
                    switch: !this.state.switch
                });
            });
        }
        else {
            db.collection('Groups').doc(book[0]).collection('Listings').doc(book[1]).update({
                sellerapproval: true
            }).then(() => {
                const temps = [...this.state.books];
                const temp = {...temps[parseInt(book[2])]};
                temp.sellerapproval = true;
                temps[parseInt(book[2])] = temp;

                this.setState({
                    books: temps,
                    switch: !this.state.switch
                });
            });
        }
    }

    repeal(event){
        const book = event.target.name.split(" ");

        var db = firebase.firestore();
        db.collection('Groups').doc(book[0]).collection('Listings').doc(book[1]).update({
            sellerapproval: false,
            buyerapproval: false,
            buyer: ''
        }).then(() => {
            const temps = [...this.state.books];
            const temp = {...temps[parseInt(book[2])]};
            temp.sellerapproval = false;
            temp.buyerapproval = false;
            temp.buyer = '';
            temps[parseInt(book[2])] = temp;

            this.setState({
                books: temps,
                switch: !this.state.switch
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

    render() {
        var search = "?q=" + this.state.search;
        return (
            <div className="buyRequests">
            <NavBar member={this.props.user['email']} books={this.state.books} handleChange={this.handleChange} handleSubmit={this.handleSubmit} />
            {this.state.searching ?
                <Redirect to={{
                    pathname: "/search",
                    search: search
                }} />
                :
                <React.Fragment>
                    <Header as='h1' icon className="pageHeader">
                        <Icon name='dollar' />
                        Buy Requests
                    </Header>
                    <Accordion exclusive={false} fluid styled>
                        {this.state.dropDowns}
                    </Accordion>
                </React.Fragment>
            }
            </div>
        );
    }
}
