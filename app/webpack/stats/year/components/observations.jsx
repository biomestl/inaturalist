import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import moment from "moment";
import DateHistogram from "./date_histogram";
import TorqueMap from "../../../shared/components/torque_map";
import GlobalMap from "./global_map";
import ObservationsGrid from "./observations_grid";

const Observations = ( {
  data,
  site,
  user,
  year
} ) => {
  const series = {};
  const grayColor = "rgba( 40%, 40%, 40%, 0.5 )";
  if ( data.month_histogram ) {
    series.month = {
      title: I18n.t( "per_month" ),
      data: _.map( data.month_histogram, ( value, date ) => ( { date, value } ) ),
      style: "bar",
      color: grayColor,
      label: d => `<strong>${moment( d.date ).add( 2, "days" ).format( "MMMM" )}</strong>: ${I18n.toNumber( d.value, { precision: 0 } )}`
    };
  }
  if ( data.week_histogram ) {
    series.week = {
      title: I18n.t( "per_week" ),
      data: _.map( data.week_histogram, ( value, date ) => ( { date, value } ) ),
      color: "rgba( 168, 204, 9, 0.2 )",
      style: "bar",
      label: d => `<strong>${I18n.t( "week_of_date", { date: moment( d.date ).format( "LL" ) } )}</strong>: ${I18n.toNumber( d.value, { precision: 0 } )}`
    };
  }
  if ( data.day_histogram ) {
    series.day = {
      title: I18n.t( "per_day" ),
      data: _.map( data.day_histogram, ( value, date ) => ( { date, value } ) ),
      color: "#74ac00"
    };
  }
  const comparisonSeries = {};
  if ( data.day_histogram && data.day_last_year_histogram ) {
    comparisonSeries.this_year = {
      title: I18n.t( "this_year" ),
      data: _.map( data.day_histogram, ( value, date ) => ( { date, value } ) ),
      color: "#74ac00"
    };
    comparisonSeries.last_year = {
      title: I18n.t( "last_year" ),
      data: _.map( data.day_last_year_histogram, ( value, date ) => {
        const lastYear = parseInt( date.match( /\d{4}/ )[0], 0 );
        const newYear = lastYear + 1;
        const newDate = date.replace( lastYear, newYear );
        return { date: newDate, value };
      } ),
      color: grayColor
    };
  }
  let popular;
  if ( data.popular && data.popular.length > 0 ) {
    popular = (
      <ObservationsGrid observations={data.popular} identifier="popular" />
    );
  }
  moment.locale( I18n.locale );
  return (
    <div className="Observations">
      <h3><span>{ I18n.t( "verifiable_observations_by_observation_date" ) }</span></h3>
      <DateHistogram
        series={series}
        tickFormatBottom={d => moment( d ).format( "MMM D" )}
        onClick={d => {
          let url = "/observations?verifiable=true";
          const md = moment( d.date );
          if ( d.seriesName === "month" ) {
            url += `&year=${md.year( )}&month=${md.add( 2, "days" ).month( ) + 1}`;
          } else if ( d.seriesName === "week" ) {
            const d1 = md.format( "YYYY-MM-DD" );
            const d2 = md.endOf( "week" ).add( 1, "day" ).format( "YYYY-MM-DD" );
            url += `&d1=${d1}&d2=${d2}`;
          } else {
            url += `&on=${md.year( )}-${md.month( ) + 1}-${md.date( )}`;
          }
          if ( user ) {
            url += `&user_id=${user.login}`;
          }
          if ( site && site.id !== 1 ) {
            if ( site.place_id ) {
              url += `&place_id=${site.place_id}`;
            } else {
              url += `&site_id=${site.id}`;
            }
          } else {
            url += "&place_id=any";
          }
          window.open( url, "_blank" );
        }}
      />
      <h3><span>{ I18n.t( "observations_this_year_vs_last_year" ) }</span></h3>
      <DateHistogram
        series={comparisonSeries}
        tickFormatBottom={d => moment( d ).format( "MMM D" )}
        onClick={d => {
          let url = "/observations?verifiable=true";
          if ( d.seriesName === "last_year" ) {
            url += `&on=${d.date.getFullYear( ) - 1}-${d.date.getMonth( ) + 1}-${d.date.getDate( )}`;
          } else {
            url += `&on=${d.date.getFullYear( )}-${d.date.getMonth( ) + 1}-${d.date.getDate( )}`;
          }
          if ( user ) {
            url += `&user_id=${user.login}`;
          }
          if ( site && site.id !== 1 ) {
            if ( site.place_id ) {
              url += `&place_id=${site.place_id}`;
            } else {
              url += `&site_id=${site.id}`;
            }
          } else {
            url += "&place_id=any";
          }
          window.open( url, "_blank" );
        }}
      />
      { user ? (
        <TorqueMap
          params={{ user_id: user.id, year }}
          interval={user ? "weekly" : "monthly"}
          basemap="dark_nolabels"
          color="#74ac00"
        /> )
        : ( <GlobalMap year={year} site={site} /> )
      }
      <h3><span>{ I18n.t( "most_comments_and_faves" ) }</span></h3>
      { popular }
    </div>
  );
};

Observations.propTypes = {
  site: PropTypes.object,
  user: PropTypes.object,
  year: PropTypes.number.isRequired,
  data: PropTypes.object.isRequired
};

export default Observations;
