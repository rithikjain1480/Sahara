import React, {Component} from 'react';
import './ProfileView.css';
import Book from '../Book/Book';
import AddGroup from '../AddGroup/AddGroup';
// import Button from '../Button/Button';
import {Redirect} from 'react-router-dom';
import uuid from 'uuid';
import x from '../../images/x.png';
import {Icon, Tab, Button, Header, Modal} from 'semantic-ui-react';

export default class ProfileView extends Component {
    constructor(props){
        super(props);

        this.state = {
            myListingsLeft: [],
            myListingsRight: [],
            transactionHistoryLeft: [],
            transactionHistoryRight: [],
            currentTransactionsLeft: [],
            currentTransactionsRight: [],
            bought: 0,
            sold: 0,
            open: false,
            images: []
        }

        this.handlePicChange = this.handlePicChange.bind(this);
    }

    componentDidMount(){
        this.setListingsAndTransactions();
    }

    componentDidUpdate(prevProps){
        if(!prevProps){
            this.setListingsAndTransactions();
            return;
        }
        else if(this.props.books.length !== prevProps.books.length){
            this.setListingsAndTransactions();
            return;
        }

        var prevValues = Object.values(prevProps);
        var currValues = Object.values(this.props);
        if(currValues.length !== prevValues.length){
            this.setListingsAndTransactions();
        }
        else {
            for(var i=0; i<prevValues.length; i++){
                if(typeof prevValues[i] !== 'object'){
                    if(prevValues[i] !== currValues[i]){
                        this.setListingsAndTransactions();
                        break;
                    }
                }
                else {
                    if(prevValues[i].length !== currValues[i].length){
                        this.setListingsAndTransactions();
                    }
                    else {
                        prevValues[i].forEach((item, j) => {
                            if(item.document !== currValues[i][j].document){
                                this.setListingsAndTransactions();
                            }
                        });
                    }
                }
            }
        }
    }

    setListingsAndTransactions(){
        var tempTransactionsLeft = [];
        var tempTransactionsRight = [];
        var tempListingsLeft = [];
        var tempListingsRight = [];
        var tempCurrLeft = [];
        var tempCurrRight = [];
        var sold = 0;
        var bought = 0;
        this.props.books.forEach((item, i) => {
            // can be optimized using 'where'
            if(item.sold && item.buyer !== '' && (item.buyer === this.props.email || item.seller === this.props.email)){
                if(tempTransactionsLeft.length === tempTransactionsRight.length){
                    tempTransactionsLeft.push(<Book key={i} title={item.name} author={item.author} price={item.price} doc={item.document} group={item.group} image={item.pimage} />);
                }
                else {
                    tempTransactionsRight.push(<Book key={i} title={item.name} author={item.author} price={item.price} doc={item.document} group={item.group} image={item.pimage} />);
                }

                if(item.buyer === this.props.email){
                    bought++;
                }
                else {
                    sold++;
                }
            }
            else if(!item.sold && item.buyer === '' && item.seller === this.props.email){
                if(tempListingsLeft.length === tempListingsRight.length){
                    tempListingsLeft.push(<Book key={i} title={item.name} author={item.author} price={item.price} doc={item.document} group={item.group} image={item.pimage} />);
                }
                else {
                    tempListingsRight.push(<Book key={i} title={item.name} author={item.author} price={item.price} doc={item.document} group={item.group} image={item.pimage} />);
                }
            }
            else if(!item.sold && item.buyer !== '' && (item.buyer === this.props.email || item.seller === this.props.email)){
                if(tempCurrLeft.length === tempCurrRight.length){
                    tempCurrLeft.push(<Book key={i} title={item.name} author={item.author} price={item.price} doc={item.document} group={item.group} image={item.pimage} />);
                }
                else {
                    tempCurrRight.push(<Book key={i} title={item.name} author={item.author} price={item.price} doc={item.document} group={item.group} image={item.pimage} />);
                }
            }
        });

        const images = require.context('../../images', true);
        var imagesArr = [];
        for(var i = 1; i < 10; i++){
            var imgName = 'Pic' + i;
            imagesArr.push(images('./profiles/' + imgName + '.png'));
        }

        this.setState({
            myListingsLeft: tempListingsLeft,
            myListingsRight: tempListingsRight,
            transactionHistoryLeft: tempTransactionsLeft,
            transactionHistoryRight: tempTransactionsRight,
            currentTransactionsLeft: tempCurrLeft,
            currentTransactionsRight: tempCurrRight,
            bought: bought,
            sold: sold,
            refresh: false,
            images: imagesArr
        });
    }

    handlePicChange(event){
        this.props.changeProfilePicture(event);
        this.setState({
            open: false
        });
    }

    render() {
        var groups = [];
        this.props.groupCodes.forEach((item, i) => {
            (this.props.groupCodes.length > 1 && item !== "SAHARA" && item !== "SFHS") ? groups.push(<p key={i} className="memberGroupsProfile">{item} <img src={x} alt="delete" onClick={this.props.removeGroup} name={item} /> </p>) : groups.push(<p key={i} className="memberGroupsProfile">{item}</p>)
        });
        var profileImages = [];
        this.state.images.forEach((item, i) => {
            profileImages.push(<img className="modalProfileImage" key={i} src={item} alt="profile image" onClick={this.handlePicChange} />);
        });

        return (
            <div className="profileView">
                {this.state.refresh ?
                    <Redirect to={{
                        pathname: '/memberprofile',
                        key: uuid.v4()
                    }} />
                    :
                    <React.Fragment>
                        <Header as='h1' icon className="pageHeader">
                            <Icon name='user' />
                            {this.props.name}
                        </Header>
                        <div className="memberProfileTop">
                            <Modal
                                closeIcon
                                open={this.state.open}
                                trigger={<img className="memberProfileImage" src={this.props.img} alt="profile" />}
                                onClose={() => {
                                    this.setState({
                                        open: false
                                    });
                                }}
                                onOpen={() => {
                                    this.setState({
                                        open: true
                                    });
                                }}
                            >
                                <Header icon='user' content='Change Profile Picture' />
                                <Modal.Content className="modalProfileImages">
                                    {profileImages}
                                </Modal.Content>
                            </Modal>
                            <div>
                                <p className="memberProfileTopNumber">{this.state.bought}</p>
                                <p>{this.state.bought === 1 ? "Book Purchased" : "Books Purchased"}</p>
                            </div>
                            <div>
                                <p className="memberProfileTopNumber">{this.state.sold}</p>
                                <p>{this.state.sold === 1 ? "Book Sold" : "Books Sold"}</p>
                            </div>
                        </div>
                        <Tab
                            className="memberProfileTabs"
                            panes={[
                                {menuItem: 'My Listings', render: () => <Tab.Pane>
                                    <div className="myListingsProfile">
                                        {this.state.myListingsLeft.length > 0 ?
                                            <div className="myListingsProfileInner">
                                                <div>
                                                    {this.state.myListingsLeft}
                                                </div>
                                                <div>
                                                    {this.state.myListingsRight}
                                                </div>
                                            </div>
                                            :
                                            <p>No listings yet!</p>
                                        }
                                    </div>
                                </Tab.Pane>},
                                {menuItem: 'Current Transactions', render: () => <Tab.Pane>
                                    <div className="currentTransactionsProfile">
                                        {this.state.currentTransactionsLeft.length > 0 ?
                                            <div className="currentTransactionsProfileInner">
                                                <div>
                                                    {this.state.currentTransactionsLeft}
                                                </div>
                                                <div>
                                                    {this.state.currentTransactionsRight}
                                                </div>
                                            </div>
                                            :
                                            <p>No listings yet!</p>
                                        }
                                    </div>
                                </Tab.Pane>},
                                {menuItem: 'Transaction History', render: () => <Tab.Pane>
                                    <div className="transactionHistoryProfile">
                                        {this.state.transactionHistoryLeft.length > 0 ?
                                            <div className="transactionHistoryProfileInner">
                                                <div>
                                                    {this.state.transactionHistoryLeft}
                                                </div>
                                                <div>
                                                    {this.state.transactionHistoryRight}
                                                </div>
                                            </div>
                                            :
                                            <p>No listings yet!</p>
                                        }
                                    </div>
                                </Tab.Pane>}
                            ]}
                        />
                        <div className="memberGroupNames">
                            Groups
                            <div className="memberGroupContent">
                                {groups}
                                <AddGroup handleSubmit={this.props.handleSubmit} handleChange={this.props.handleChange} />
                            </div>
                        </div>
                        <Button color="red" onClick={this.props.handleClick} className="deleteMember">Delete Account</Button>
                    </React.Fragment>
                }
            </div>
        );
    }
}
