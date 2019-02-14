import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listings : null,
      isListView : false,
      listingDetail : null
    }
    fetch('http://dev1-sample.azurewebsites.net/properties.json', {mode: "cors"}) 
    .then(response => response.json())
    .then(response => {
      this.setState({listings: response.properties.filter(function(listing) {return listing.visibility === 'Public'})});
    })
    .catch(function() {
        console.error('failure fetching listings data');
    });
    this.toggleListView = this.toggleListView.bind(this);
    this.showListingDetail = this.showListingDetail.bind(this);
    this.hideListingDetail = this.hideListingDetail.bind(this);
    this.clickedCarouselLeft = this.clickedCarouselLeft.bind(this);
    this.clickedCarouselRight = this.clickedCarouselRight.bind(this);
    this.carouselPage = 0;
    this.maxcarouselPage = 0;
    this.sliderPositions = [];
    for (var i=0; i<10; i++) {
      this.sliderPositions.push('-' + (i * 680) + 'px');
    }
  }
  clickedCarouselLeft = function() {
    if (this.carouselPage > 0) {
      document.getElementsByClassName('carouselSlider')[0].style.animation = 'p' + this.carouselPage + 'to' + --this.carouselPage + ' 1s 1';
      document.getElementsByClassName('carouselSlider')[0].style.left = this.sliderPositions[this.carouselPage];
    }
  }
  clickedCarouselRight = function() {
    if (this.carouselPage < (this.maxcarouselPage-1)) {
      document.getElementsByClassName('carouselSlider')[0].style.animation = 'p' + this.carouselPage + 'to' + ++this.carouselPage + ' 1s 1';
      document.getElementsByClassName('carouselSlider')[0].style.left = this.sliderPositions[this.carouselPage];
    }
  }
  displayCarousel = function(photos) {
    if (photos.length === 0) {
      return <div>No Photos Available for this property</div>
    }
    this.carouselPage = 0;
    this.maxcarouselPage = photos.length;
    return (
      <div className="carousel">
        <div className="carouselButtons">
          <button className="carouselLeft" onClick={this.clickedCarouselLeft}>Prev Photo</button>
          <button className="carouselRight" onClick={this.clickedCarouselRight}>Next Photo</button>
        </div>
        <div className="carouselWindow">
          <table className="carouselSlider"><tbody><tr>
            {photos.map((photo, idx) => (
              <td key={'photo_'+idx}><img src={photo.urlMedium} alt={photo.id} /></td>
            ))}
          </tr></tbody></table>
        </div>
      </div>
    )
  }
  showListingDetail = function(listing) {
    this.setState({listingDetail : listing});
  }
  hideListingDetail = function() {
    this.setState({listingDetail : null});
  }
  toggleListView = function() {
    this.setState({isListView : !this.state.isListView});
  }
  formatNumber = function(inPrice) {
    return String(inPrice).replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
      return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
    });
  }
  formatPhysical = function(inPhysical) {
    let physicalDisplay = '';
    physicalDisplay += inPhysical.bedRooms ? inPhysical.bedRooms + 'bd, ' : '?bd, ';
    physicalDisplay += inPhysical.bathRooms ? inPhysical.bathRooms + 'ba | ' : '?ba | ';
    physicalDisplay += inPhysical.squareFeet ? this.formatNumber(inPhysical.squareFeet) + 'sqft | ' : '?sqft | ';
    physicalDisplay += ' Built in ' + (inPhysical.yearBuilt ? inPhysical.yearBuilt : '?');
    return physicalDisplay;
  }
  formatAddress = function(inAddress) {
    return (
    <div className="address">
      {inAddress.address1 ? <div>{inAddress.address1}</div> : null}
      {inAddress.address2 ? <div>{inAddress.address2}</div> : null}
      <div className="city_state_zip">
        {inAddress.city ? <span>{inAddress.city + ', '}</span> : null}
        {inAddress.state ? <span>{inAddress.state} </span> : null}
        {inAddress.zip ? <span>{inAddress.zip}</span> : null}
      </div>
    </div>)
  }
  render() {
    const buttonText = this.state.isListView ? 'List View' : 'Grid View';
    const displayListings = this.state.listings === null ? <img src="spinner.gif" alt="loading"/> : this.state.listings.map((listing, idx) => (
      <div onClick={() => this.showListingDetail(listing)} className="property_listing" key={'property_listing_' + idx}>
        <div className="img_container">
          <img className="mainImage" src={listing.mainImageUrl} alt={listing.id} />
        </div>
        <div className="price">{listing.financial ? ('$'+this.formatNumber(listing.financial.listPrice.toFixed(2))) : 'Price Not Available'}</div>
        <div className="physical">{listing.physical ? (this.formatPhysical(listing.physical)) : 'Physical data not available'}</div>
        <div className="rent">
          {listing.lease && listing.lease.leaseSummary ? ( 'Current Rent : $' + this.formatNumber(listing.lease.leaseSummary.monthlyRent.toFixed(2)) ) : 'Lease data not available'}
        </div>
        {listing.address ? this.formatAddress(listing.address) : 'Unknown Address'}
        <div className="grossYield">{(listing.financial && listing.lease && listing.lease.leaseSummary) ? 'Gross Yield : ' + (((listing.lease.leaseSummary.monthlyRent.toFixed(2) * 12)/listing.financial.listPrice.toFixed(2))*100).toFixed(2) + '%'  : 'Gross Yield Not Available'}</div>   {/* (monthly rent * 12 / list price) */}
      </div>
    ));
    const displayListingDetail = this.state.listingDetail ? 
      <div>
        {this.state.listingDetail.address ? this.formatAddress(this.state.listingDetail.address) : <div>Unknown Address</div>}
        {this.state.listingDetail.resources && this.state.listingDetail.resources.photos ? this.displayCarousel(this.state.listingDetail.resources.photos) : <div>No Photos Available</div>}
      </div> : null;
    return (
      <div className="App">
        { this.state.listingDetail ? <button onClick={this.hideListingDetail}>{'Back to ' + buttonText}</button> : <button onClick={this.toggleListView}>{buttonText}</button> }
        <div className={this.state.isListView ? 'list_view' : 'grid_view'}>
          { this.state.listingDetail ? displayListingDetail : displayListings }
        </div>
      </div>
    );
  }
}

export default App;
