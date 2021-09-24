import React, { Component } from 'react';
import './TopPicks.css';
import Book from '../Book/Book';
import {Header, Icon} from 'semantic-ui-react';

export default class TopPicks extends Component {
    constructor(props){
        super(props);

        this.state = {
            numPicks: 6,
            booksLeft: [],
            booksRight: []
        };
    }

    componentDidMount(){
        this.updateTopPicks();
    }

    componentDidUpdate(prevProps){
        var lengthChanged = prevProps.books.length === this.props.books.length;
        var shouldChangeState = false;
        if(lengthChanged){
            for(var i=0; i<prevProps.books.length; i++){
                if(prevProps.books[i].document !== this.props.books[i].document){
                    shouldChangeState = true;
                }
                if(shouldChangeState) {
                    this.updateTopPicks();
                    break;
                }
            }
        }
        else {
            this.updateTopPicks();
        }
    }

    updateTopPicks() {
        var counter = 0;
        var tempBooksLeft = [];
        var tempBooksRight = [];
        for(const book in this.props.books){
            if(counter === this.state.numPicks){
                break;
            }
            var item = this.props.books[book];
            if(!item.sold && item.buyer === '') {
                if(tempBooksLeft.length === tempBooksRight.length){
                    tempBooksLeft.push(<Book key={item.document} title={item.name} price={item.price} author={item.author} doc={item.document} group={item.group} categories={item.categories} image={item.pimage} />);
                }
                else {
                    tempBooksRight.push(<Book key={item.document} title={item.name} price={item.price} author={item.author} doc={item.document} group={item.group} categories={item.categories} image={item.pimage} />);
                }
                counter += 1;
            }
        }

        this.setState({
            booksLeft: tempBooksLeft,
            booksRight: tempBooksRight
        });
    }

    render() {
        return (
            <div className="topPicks">
                <Header as='h1' icon className="pageHeader">
                    <Icon name='tag' />
                    Best Deals
                </Header>
                <div className="topPicksContent">
                    <div>
                        {this.state.booksLeft}
                    </div>
                    <div>
                        {this.state.booksRight}
                    </div>
                </div>
            </div>
        );
    }
}
