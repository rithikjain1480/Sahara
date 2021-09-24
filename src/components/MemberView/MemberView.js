import React, { Component } from 'react';
import './MemberView.css';
import NavBar from '../NavBar/NavBar';
import TopPicks from '../TopPicks/TopPicks';
import {Redirect} from 'react-router-dom';

export default class MemberView extends Component {
    constructor(props){
        super(props);

        this.state = {
            searching: false,
            search: '',
            url: '',
            switch: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
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
            <div className="memberView">
                <NavBar member={this.props.member} books={this.props.books} handleChange={this.handleChange} handleSubmit={this.handleSubmit} />
                {this.state.searching ?
                    <Redirect to={{
                        pathname: "/search",
                        search: search
                    }} />
                    :
                    <TopPicks books={this.props.books}/>
                }
            </div>
        );
    }
}
