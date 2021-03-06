/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import MainWrapper from './main-wrapper';
import FormattedHeader from 'components/formatted-header';
import PlansFeaturesMain from 'my-sites/plans-features-main';
import PlansSkipButton from 'components/plans/plans-skip-button';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Constants
 */
const defaultJetpackSite = { jetpack: true, plan: {}, isUpgradeable: () => true };

class JetpackPlansGrid extends Component {
	static propTypes = {
		basePlansPath: PropTypes.string,
		hideFreePlan: PropTypes.bool,
		interval: PropTypes.string,
		isLanding: PropTypes.bool,
		onSelect: PropTypes.func,
		selectedSite: PropTypes.object,
		hidePersonalOfferReset: PropTypes.bool,

		// Connected
		translate: PropTypes.func.isRequired,
	};

	handleSkipButtonClick = () => {
		this.props.recordTracksEvent( 'calypso_jpc_plans_skip_button_click' );

		this.props.onSelect( null );
	};

	renderConnectHeader() {
		const { isLanding, translate } = this.props;

		const headerText = translate( 'Explore our Jetpack plans' );
		let subheaderText = translate( "Now that you're set up, pick a plan that fits your needs." );

		if ( isLanding ) {
			subheaderText = translate( 'Pick a plan that fits your needs.' );
		}
		return <FormattedHeader headerText={ headerText } subHeaderText={ subheaderText } />;
	}

	render() {
		const { interval, hidePersonalOfferReset } = this.props;
		const defaultInterval = 'yearly';
		const hidePersonal = hidePersonalOfferReset;

		return (
			<MainWrapper isWide className="jetpack-connect__hide-plan-icons">
				<div
					className={ classNames( 'jetpack-connect__plans', {
						'is-offer-reset-test': hidePersonal,
					} ) }
				>
					{ this.renderConnectHeader() }
					<div id="plans">
						<PlansFeaturesMain
							site={ this.props.selectedSite || defaultJetpackSite }
							isInSignup={ true }
							isLandingPage={ ! this.props.selectedSite }
							basePlansPath={ this.props.basePlansPath }
							onUpgradeClick={ this.props.onSelect }
							intervalType={ interval ? interval : defaultInterval }
							hideFreePlan={ this.props.hideFreePlan }
							displayJetpackPlans={ true }
							hidePersonalPlan={ hidePersonal }
						/>

						<PlansSkipButton onClick={ this.handleSkipButtonClick } />

						{ this.props.children }
					</div>
				</div>
			</MainWrapper>
		);
	}
}

export default connect( null, {
	recordTracksEvent,
} )( localize( JetpackPlansGrid ) );
