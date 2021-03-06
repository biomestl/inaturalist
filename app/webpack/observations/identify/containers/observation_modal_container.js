import { connect } from "react-redux";
import { updateCurrentUser } from "../../../shared/ducks/config";
import ObservationModal from "../components/observation_modal";
import {
  hideCurrentObservation,
  addIdentification,
  addComment,
  toggleCaptive,
  toggleReviewed,
  agreeWithCurrentObservation,
  showNextObservation,
  showPrevObservation,
  updateCurrentObservation,
  fetchDataForTab,
  submitIdentificationWithConfirmation
} from "../actions";

function mapStateToProps( state ) {
  let images;
  const { observation } = state.currentObservation;
  if ( observation && observation.photos && observation.photos.length > 0 ) {
    let defaultPhotoSize = "medium";
    if ( $( ".image-gallery" ).width( ) > 600 ) {
      defaultPhotoSize = "large";
    }
    images = observation.photos.map( photo => ( {
      original: photo.photoUrl( defaultPhotoSize ),
      zoom: photo.photoUrl( "original" ),
      thumbnail: photo.photoUrl( "square" ),
      originalDimensions: photo.original_dimensions
    } ) );
  }
  return Object.assign( {}, {
    images,
    blind: state.config.blind,
    controlledTerms: state.controlledTerms.terms,
    currentUser: state.config.currentUser
  }, state.currentObservation );
}

function mapDispatchToProps( dispatch ) {
  return {
    onClose: ( ) => {
      dispatch( hideCurrentObservation( ) );
    },
    toggleCaptive: ( ) => {
      dispatch( toggleCaptive( ) );
    },
    toggleReviewed: ( ) => {
      dispatch( toggleReviewed( ) );
    },
    addIdentification: ( ) => {
      dispatch( addIdentification( ) );
    },
    addComment: ( ) => {
      dispatch( addComment( ) );
    },
    agreeWithCurrentObservation: ( ) => {
      dispatch( agreeWithCurrentObservation( ) ).then( ( ) => {
        $( ".ObservationModal:first" ).find( ".sidebar" ).scrollTop( $( window ).height( ) );
      } );
    },
    showNextObservation: ( ) => {
      dispatch( showNextObservation( ) );
    },
    showPrevObservation: ( ) => {
      dispatch( showPrevObservation( ) );
    },
    chooseTab: tab => {
      dispatch( updateCurrentObservation( { tab } ) );
      dispatch( fetchDataForTab( ) );
    },
    setImagesCurrentIndex: index => {
      dispatch( updateCurrentObservation( { imagesCurrentIndex: index } ) );
    },
    toggleKeyboardShortcuts: keyboardShortcutsShown => {
      dispatch( updateCurrentObservation( { keyboardShortcutsShown: !keyboardShortcutsShown } ) );
    },
    chooseSuggestedTaxon: ( taxon, options = {} ) => {
      const ident = {
        observation_id: options.observation.id,
        taxon_id: taxon.id,
        vision: options.vision
      };
      dispatch( updateCurrentObservation( { tab: "info" } ) );
      dispatch( submitIdentificationWithConfirmation( ident, {
        confirmationText: options.confirmationText
      } ) );
    },
    updateCurrentUser: updates => dispatch( updateCurrentUser( updates ) )
  };
}

const ObservationModalContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)( ObservationModal );

export default ObservationModalContainer;
