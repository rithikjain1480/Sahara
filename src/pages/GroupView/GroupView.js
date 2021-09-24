import React, { Component } from 'react';
import './GroupView.css';
import GroupNavBar from '../../components/GroupNavBar/GroupNavBar';
import GroupQueryFilters from '../../components/GroupQueryFilters/GroupQueryFilters';
import QueryView from '../../components/QueryView/QueryView';
import Book from '../../components/Book/Book';
import {withRouter, Redirect} from 'react-router-dom';
import uuid from 'uuid';
import firebase from '../../components/Firebase';

class GroupView extends Component {
    constructor(props){
        super(props);

        this.state = {
            toRender: 'listings',
            filtered: [],
            searched: false,
            renderFiltered: [],
            search: window.location.href.split('/search?q=').length > 1 ? window.location.href.split('/search?q=')[1] : '',
            allCategories: [],
            categories: [],
            books: [],
            members: [],
            listings: []
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCategoryToggle = this.handleCategoryToggle.bind(this);
        this.handleListingToggle = this.handleListingToggle.bind(this);
    }

    componentDidMount(){
        if(this.props.location.state) {
            var db = firebase.firestore();
            var code = this.props.location.state.group;

            db.collection('Groups').doc(code).collection('Listings').get().then((snapshot) => {
                var book;
                var tempBooks = [];
                snapshot.docs.forEach((item, i) => {
                    book = item.data();
                    book['document'] = item.id;
                    book['group'] = code;
                    tempBooks.push(<Book key={book.document} title={book.name} price={book.price} author={book.author} doc={book.document} group={book.group} categories={book.categories} sold={book.sold} buyer={book.buyer} image={book.pimage} seller={book.seller} />);
                });
                this.setState({
                    books: tempBooks
                });
                db.collection('Groups').doc(code).get().then((snapshot) => {
                    this.setState({
                        members: snapshot.data().members
                    });
                });
            });

            var tempCategories = [];

            db.collection('Groups').doc(code).get().then((snapshot) => {
                tempCategories.push(...snapshot.data().categories);
            });
            this.setState({
                allCategories: tempCategories
            });

            this.executeSearch();
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.books.length !== prevState.books.length) {
            this.executeSearch();
        }
        else if(this.props.location.key !== prevProps.location.key){
            this.executeSearch();
        }
        else if(prevState.categories.length !== this.state.categories.length){
            this.updateFiltered();
        }
        else if(prevState.listings.length !== this.state.listings.length){
            this.updateFiltered();
        }
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

    handleCategoryToggle(event){
        const target = event.target;
        const name = target.innerHTML;
        const checked = target.checked;

        if(!this.state.categories.includes(name)){
            this.setState({
                categories: [...this.state.categories, name]
            });
        }
        else if(this.state.categories.includes(name)) {
            var tempCategories = [];
            this.state.categories.forEach((item, i) => {
                if(item !== name){
                    tempCategories.push(item);
                }
            });
            this.setState({
                categories: tempCategories
            });
        }
    }

    handleListingToggle(event){
        const target = event.target;
        const name = target.innerHTML;
        console.log(name);
        const checked = target.checked;

        if(!this.state.listings.includes(name)){
            this.setState({
                listings: [...this.state.listings, name]
            });
        }

        else if(this.state.listings.includes(name)){
            var tempListings = [];
            this.state.listings.forEach((item, i) => {
                if(item !== name){
                    tempListings.push(item);
                }
            });
            this.setState({
                listings: tempListings
            });
        }
    }

    executeSearch(){
        var search = window.location.href.split('=');
        if(search.length === 1){
            search = '';
        }
        else {
            search = search[1];
        }

        const tempSearch = search.split("+");
        search = "";
        tempSearch.forEach((item, i) => {
            search += (item + " ")
        });
        search = search.trim();

        var newList = this.state.books.filter((item) => {
            var searchTerm = search.toLowerCase();
            return item.props.title.toLowerCase().includes(searchTerm) || item.props.author.toLowerCase().includes(searchTerm) || item.props.doc.substring(0,13).includes(searchTerm) || item.props.seller.toLowerCase().includes(searchTerm);
        });

        this.setState({
            filtered: newList
        });

        setTimeout(() => {
            this.updateFiltered();
        }, 500);
    }

    updateFiltered(){
        var newFiltered = [];
        if(this.state.categories.length === 0 && this.state.listings.length === 0){
            this.setState({
                renderFiltered: this.state.filtered
            });
        }
        else if(this.state.categories.length === 0){
            this.state.filtered.forEach((item, i) => {
                this.state.listings.forEach((type, i) => {
                    if(type === "Open Listings"){
                        if(item.props.buyer === "" && !item.props.sold){
                            newFiltered.push(item);
                        }
                    }
                    else if(type === "Transaction History"){
                        if(item.props.buyer !== "" && item.props.sold){
                            newFiltered.push(item);
                        }
                    }
                    else {
                        if(item.props.buyer !== "" && !item.props.sold){
                            newFiltered.push(item);
                        }
                    }
                });
            });

            this.setState({
                renderFiltered: newFiltered
            });
        }
        else if(this.state.listings.length === 0){
            this.state.filtered.forEach((item, i) => {
                for(var j=0; j<item.props.categories.length; j++){
                    if(this.state.categories.includes(item.props.categories[j])){
                        newFiltered.push(item);
                        break;
                    }
                }
            });

            this.setState({
                renderFiltered: newFiltered
            });
        }
        else {
            var tempFiltered = [];
            this.state.filtered.forEach((item, i) => {
                this.state.listings.forEach((type, i) => {
                    if(type === "openListings"){
                        if(item.props.buyer === "" && !item.props.sold){
                            tempFiltered.push(item);
                        }
                    }
                    else if(type === "transactionHistory"){
                        if(item.props.buyer !== "" && item.props.sold){
                            tempFiltered.push(item);
                        }
                    }
                    else {
                        if(item.props.buyer !== "" && !item.props.sold){
                            tempFiltered.push(item);
                        }
                    }
                });
            });

            tempFiltered.forEach((item, i) => {
                for(var j=0; j<item.props.categories.length; j++){
                    if(this.state.categories.includes(item.props.categories[j])){
                        newFiltered.push(item);
                        break;
                    }
                }
            });

            this.setState({
                renderFiltered: newFiltered
            });
        }
        this.setState({
            searched: false
        });
    }

    render() {
        if(!this.props.location.state){
            return (<Redirect to={{
                pathname: '/'
            }} />);
        }

        var search = "?q=" + this.state.search;
        return (
            <div className="groupView">
                <GroupNavBar handleChange={this.handleChange} handleSubmit={this.handleSubmit} searchTerm={this.state.search} />
                {this.state.searched ?
                    <Redirect to={{
                        pathname: '/group/search',
                        search: search,
                        state: {
                            group: this.props.location.state.group
                        },
                        key: uuid.v4()
                    }} />
                    :
                    <div className="groupViewContent">
                        <GroupQueryFilters categories={this.state.allCategories} handleToggle={this.handleCategoryToggle} handleListingToggle={this.handleListingToggle} checked={this.state.categories} checkedListings={this.state.listings} />
                        <div className="groupBooks">
                            <QueryView books={this.state.renderFiltered} />
                        </div>
                    </div>
                }
            </div>
        );
    }
}

export default withRouter(GroupView);
