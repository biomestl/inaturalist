// skip_uglifier
import "babel-polyfill";
import moment from "moment";
import thunkMiddleware from "redux-thunk";
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { createStore, compose, applyMiddleware } from "redux";
import { bindShortcuts } from "redux-shortcuts";
import rootReducer from "./reducers/";
import {
  fetchObservations,
  fetchObservationsStats,
  setConfig,
  showNextObservation,
  showPrevObservation
} from "./actions/";
import App from "./components/app";

// Use custom relative times for moment
moment.locale( I18n.locale, {
  relativeTime: I18n.translations[I18n.locale].momentjs.shortRelativeTime
} );

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(
      thunkMiddleware
    ),
    // enable Redux DevTools if available
    window.devToolsExtension ? window.devToolsExtension() : applyMiddleware()
  )
);

store.dispatch( setConfig( {
  nodeApiHost: $( "[name='config:inaturalist_api_host']" ).attr( "content" )
} ) );

if ( CURRENT_USER !== undefined && CURRENT_USER !== null ) {
  store.dispatch( setConfig( {
    currentUser: CURRENT_USER
  } ) );
}

bindShortcuts(
  ["right", showNextObservation],
  ["left", showPrevObservation]
)( store.dispatch );

// retrieve initial set of observations
store.dispatch( fetchObservations() );
store.dispatch( fetchObservationsStats() );

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById( "app" )
);
