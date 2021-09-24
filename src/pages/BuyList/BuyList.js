import React, { Component } from 'react';
import './BuyList.css';
import NavBar from '../../components/NavBar/NavBar';
import CheckBox from '../../components/CheckBox/CheckBox';
import firebase from '../../components/Firebase';
import {Redirect} from 'react-router-dom';
import {Icon, Header, Table, Button} from 'semantic-ui-react';
import x from '../../images/x.png';

export default class BuyList extends Component {
    constructor(props){
        super(props);

        this.state = {
            rows: [],
            books: [],
            groups: [],
            toVerify: [],
            switch: false,
            search: '',
            searching: false
        }

        this.handleToggle = this.handleToggle.bind(this);
        this.verify = this.verify.bind(this);
        this.deleteFromList = this.deleteFromList.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount(){
        var db = firebase.firestore();
        var temp;
        var groups;
        db.collection('Members').doc(this.props.user['email']).get().then((snapshot) => {
            temp = snapshot.data().buylist;
            if(!temp){
                temp = [];
            }

            groups = snapshot.data().groupcodes;

            this.setState({
                groups: groups
            });

            var tempBooks = [];
            var book;
            temp.forEach((item, i) => {
                db.collection('Groups').doc(item.group).collection('Listings').doc(item.document).get().then((listing) => {
                    book = listing.data();
                    book['document'] = item.document;
                    if(book.buyer === ''){
                        book['status'] = "Pending";
                    }
                    else if(book.buyer === this.props.user['email']){
                        book['status'] = "Accepted";
                    }
                    else {
                        book['status'] = "Declined";
                    }

                    if(!book.sold){
                        tempBooks.push(book);
                    }
                });

                if(i === temp.length - 1){
                    this.setState({
                        books: tempBooks
                    });
                    setTimeout(() => {
                        this.createRows();
                    }, 500);
                }
            });
        });
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.switch !== prevState.switch){
            this.createRows();
        }
    }

    createRows(){
        var rows = [];
        this.state.books.forEach((item, i) => {
            console.log(item);
            if(!item.sold){
                const price = "$" + item.price.toFixed(2);
                // <Table.Cell><CheckBox key={i} type={item.group + " " + item.document + " " + i} onChange={this.handleToggle} checked={false} /></Table.Cell>
                rows.push(
                    <Table.Row key={i}>
                        <Table.Cell>{item.name}</Table.Cell>
                        <Table.Cell>{item.author}</Table.Cell>
                        <Table.Cell>{price}</Table.Cell>
                        <Table.Cell>{item.seller}</Table.Cell>
                        <Table.Cell>{item.status}</Table.Cell>
                        <Table.Cell>{item.status === "Accepted" ? (item.buyerapproval ? "Y" : "N") : "N/A" }</Table.Cell>
                        <Table.Cell>{item.status === "Accepted" ? (item.sellerapproval ? "Y" : "N") : "N/A" }</Table.Cell>
                        <Table.Cell>
                            {item.status === "Accepted" ?
                                <Button onClick={this.verify} color='green' name={item.group + " " + item.document + " " + i}>Verify</Button>
                                :
                                <Button disabled color='green' name={item.group + " " + item.document + " " + i}>Verify</Button>
                            }
                            <Button onClick={this.deleteFromList} color='red' name={item.group + " " + item.document + " " + i}>Remove</Button>
                        </Table.Cell>
                    </Table.Row>
                );
            }
        });

        this.setState({
            rows: rows
        });
    }

    handleToggle(event){
        const target = event.target;
        const name = target.id;
        console.log('here');
        const checked = target.checked;

        if(!this.state.toVerify.includes(name)){
            this.setState({
                toVerify: [...this.state.toVerify, name]
            });
        }
        else if(this.state.toVerify.includes(name)){
            var tempVerify = [];
            this.state.toVerify.forEach((item, i) => {
                if(item !== name){
                    tempVerify.push(item);
                }
            });

            this.setState({
                toVerify: tempVerify
            });
        }
    }

    verify(event){
        event.preventDefault();

        const book = event.target.name.split(" ");
        var db = firebase.firestore();
        db.collection('Groups').doc(book[0]).collection('Listings').doc(book[1]).get().then((snapshot) => {
            if(snapshot.data().sellerapproval){
                firebase.firestore().collection('Groups').doc(book[0]).collection('Listings').doc(book[1]).update({
                    buyerapproval: true,
                    sold: true
                }).then(() => {
                    const temps = [...this.state.books];
                    const temp = {...temps[parseInt(book[2])]};
                    temp.buyerapproval = true;
                    temp.sold = true;
                    temps[parseInt(book[2])] = temp;

                    this.setState({
                        books: temps,
                        switch: !this.state.switch
                    });
                });
            }
            else {
                firebase.firestore().collection('Groups').doc(book[0]).collection('Listings').doc(book[1]).update({
                    buyerapproval: true
                }).then(() => {
                    const temps = [...this.state.books];
                    const temp = {...temps[parseInt(book[2])]};
                    temp.buyerapproval = true;
                    temps[parseInt(book[2])] = temp;

                    this.setState({
                        books: temps,
                        switch: !this.state.switch
                    });
                });
            }
        });

        // this.state.toVerify.forEach((item, i) => {
        //     var items = item.split(" ");
        //     var db = firebase.firestore();
        //     db.collection('Groups').doc(items[0]).collection('Listings').doc(items[1]).get().then((snapshot) => {
        //         if(snapshot.data().sellerapproval){
        //             firebase.firestore().collection('Groups').doc(items[0]).collection('Listings').doc(items[1]).update({
        //                 buyerapproval: true,
        //                 sold: true
        //             }).then(() => {
        //                 const temps = [...this.state.books];
        //                 const temp = {...temps[parseInt(items[2])]};
        //                 temp.buyerapproval = true;
        //                 temp.sold = true;
        //                 temps[parseInt(items[2])] = temp;
        //
        //                 this.setState({
        //                     books: temps,
        //                     switch: !this.state.switch
        //                 });
        //             });
        //         }
        //         else {
        //             firebase.firestore().collection('Groups').doc(items[0]).collection('Listings').doc(items[1]).update({
        //                 buyerapproval: true
        //             }).then(() => {
        //                 const temps = [...this.state.books];
        //                 const temp = {...temps[parseInt(items[2])]};
        //                 temp.buyerapproval = true;
        //                 temps[parseInt(items[2])] = temp;
        //
        //                 this.setState({
        //                     books: temps,
        //                     switch: !this.state.switch
        //                 });
        //             });
        //         }
        //     });
        // });
    }

    deleteFromList(event){
        event.preventDefault();

        const book = event.target.name.split(" ");
        var db = firebase.firestore();
        db.collection('Groups').doc(book[0]).collection('Listings').doc(book[1]).get().then((snapshot) => {
            if(!snapshot.data().sold){
                db.collection('Groups').doc(book[0]).collection('Listings').doc(book[1]).update({
                    buyer: '',
                    buyerapproval: false,
                    sellerapproval: false,
                    requests: firebase.firestore.FieldValue.arrayRemove(this.props.user['email'])
                }).then(() => {
                    db.collection('Members').doc(this.props.user['email']).update({
                        buylist: firebase.firestore.FieldValue.arrayRemove({
                            document: book[1],
                            group: book[0]
                        })
                    }).then(() => {
                        const temps = [];
                        this.state.books.forEach((temp, i) => {
                            if(temp.group !== book[0] || temp.document !== book[1]){
                                temps.push(temp);
                            }
                        });

                        this.setState({
                            books: temps,
                            switch: !this.state.switch
                        });
                    });
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

    render() {
        var search = "?q=" + this.state.search;
        console.log(this.state.toVerify);
        return (
            <div className="buyList">
                <NavBar member={this.props.user['email']} books={this.state.books} handleChange={this.handleChange} handleSubmit={this.handleSubmit} />
                {this.state.searching ?
                    <Redirect to={{
                        pathname: "/search",
                        search: search
                    }} />
                    :
                    <React.Fragment>
                        <Header as='h1' icon className="pageHeader">
                            <Icon name='shop' />
                            Buy List
                        </Header>
                        {this.state.rows.length > 0 ?
                            <React.Fragment>
                                <Table compact celled>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Title</Table.HeaderCell>
                                            <Table.HeaderCell>Author</Table.HeaderCell>
                                            <Table.HeaderCell>Price</Table.HeaderCell>
                                            <Table.HeaderCell>Seller</Table.HeaderCell>
                                            <Table.HeaderCell>Status</Table.HeaderCell>
                                            <Table.HeaderCell>Buyer Verified</Table.HeaderCell>
                                            <Table.HeaderCell>Seller Verified</Table.HeaderCell>
                                            <Table.HeaderCell>Actions</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {this.state.rows}
                                    </Table.Body>
                                </Table>
                            </React.Fragment>
                            :
                            <div></div>
                        }

                    </React.Fragment>
                }
            </div>

        );
    }
}
