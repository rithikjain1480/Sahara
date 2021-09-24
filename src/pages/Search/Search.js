import React, { Component } from 'react';
import './Search.css';
import NavBar from '../../components/NavBar/NavBar';
import QueryView from '../../components/QueryView/QueryView';
import QueryFilters from '../../components/QueryFilters/QueryFilters';
import Book from '../../components/Book/Book';
import {withRouter, Redirect} from 'react-router-dom';
import uuid from 'uuid';
import firebase from '../../components/Firebase';

class Search extends Component {
    // add filters to url so that filters will stay when refresh
    constructor(props){
        super(props);

        this.state = {
            searched: false,
            filtered: [],
            toRender: [],
            categories: [],
            search: window.location.href.split('/search?q=').length > 1 ? window.location.href.split('/search?q=')[1] : '',
            userData: null,
            books: [],
            allCategories: [],
            groups: []
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCategoryToggle = this.handleCategoryToggle.bind(this);
    }

    componentDidMount(){
        this.setUserData();

        this.executeSearch();
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.books.length !== prevState.books.length){
            this.executeSearch();
        }
        else if(this.props.location.key !== prevProps.location.key){
            this.executeSearch();
        }
        else if(prevState.categories.length !== this.state.categories.length){
            this.updateFiltered();
        }
        else {
            prevState.categories.forEach((item, i) => {
                if(item !== this.state.categories[i]){
                    this.updateFiltered();
                    return;
                }
            });
        }
    }

    setUserData(){
        var db = firebase.firestore();
        var tempBooks = [];
        var tempGroups = [];
        db.collection('Members').doc(this.props.user['email']).get().then((member) => {
            var groups = member.data().groupcodes;
            groups.forEach((group, j) => {
                db.collection('Groups').doc(group).get().then((snapshot) => {
                    if(snapshot.data().members.includes(this.props.user['email'])){
                        tempGroups.push(group);
                    }
                    if(groups.length === j + 1){
                        var tempCategories = [];
                        tempGroups.forEach((group, i) => {
                            db.collection('Groups').doc(group).collection('Listings').get().then((listings) => {
                                var book;
                                listings.docs.forEach((item, j) => {
                                    book = item.data();
                                    book['document'] = item.id;
                                    book['group'] = group;
                                    tempBooks.push(book);
                                });
                                if(i + 1 === tempGroups.length){
                                    this.setState({
                                        books: tempBooks,
                                        userData: member.data(),
                                        groups: tempGroups
                                    });
                                }
                            }).then(() => {
                                db.collection('Groups').doc(group).get().then((snapshot) => {
                                    snapshot.data().categories.forEach((category, j) => {
                                        if(!tempCategories.includes(category)){
                                            tempCategories.push(category);
                                        }
                                    });
                                    // tempCategories.push(...snapshot.data().categories);
                                });
                                if(i + 1 === this.state.groups.length){
                                    this.setState({
                                        allCategories: tempCategories
                                    });
                                }
                            });
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

        this.updateFiltered();
        if(event.target.value !== ''){
            this.setState({
                searched: true
            });
        }
    }

    handleCategoryToggle(event){
        const target = event.target;
        const name = target.innerHTML;

        // can remove this i think
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

    executeSearch(){
        var search = window.location.href.split('=')[1];
        const tempSearch = search.split("+");
        search = "";
        tempSearch.forEach((item, i) => {
            search += (item + " ")
        });
        search = search.trim();

        var tempFiltered = [];
        this.state.books.forEach((item, i) => {
            if(!item.sold && item.buyer === '') {
                tempFiltered.push(<Book key={i} title={item.name} price={item.price} author={item.author} doc={item.document} group={item.group} categories={item.categories} image={item.pimage} seller={item.seller} />);
            }
        });

        var newList = tempFiltered.filter((item) => {
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
        if(this.state.categories.length === 0){
            this.setState({
                toRender: this.state.filtered
            });
        }
        else {
            var newFiltered = []
            this.state.filtered.forEach((item, i) => {
                for(var j=0; j<item.props.categories.length; j++){
                    if(this.state.categories.includes(item.props.categories[j])){
                        newFiltered.push(item);
                        break;
                    }
                }
            });

            this.setState({
                toRender: newFiltered
            });
        }
        this.setState({
            searched: false
        });
    }

    render() {
        var search = "?q=" + this.state.search;
        if(!this.state.userData){
            // remove at some point
            console.log('broke');
            return (<div></div>);
        }

        return (
            <div className="search">
                <NavBar member={this.props.user['email']} books={this.state.books} handleChange={this.handleChange} handleSubmit={this.handleSubmit} searchTerm={this.state.search} />
                {this.state.searched ?
                    <Redirect to={{
                        pathname: "/search",
                        search: search,
                        key: uuid.v4()
                    }} />
                    :
                    <div className="searching">
                        <QueryFilters categories={this.state.allCategories} handleToggle={this.handleCategoryToggle} checked={this.state.categories} />
                        <QueryView books={this.state.toRender} />
                    </div>
                }
            </div>
        );
    }
}

export default withRouter(Search);
