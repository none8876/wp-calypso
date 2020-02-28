/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { url as mediaUrl } from 'lib/media/utils';
import { getUrlParts } from 'lib/url/url-parts';
import MediaLibraryListItemFileDetails from './list-item-file-details';
import getSelectedSiteSlug from 'state/ui/selectors/get-selected-site-slug';
import getSelectedSiteId from 'state/ui/selectors/get-selected-site-id';
import isPrivateSite from 'state/selectors/is-private-site';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import ProxiedImage from './proxied-image';
import { MEDIA_IMAGE_THUMBNAIL, SCALE_CHOICES } from 'lib/media/constants';

export class MediaLibraryListItemImage extends React.Component {
	static propTypes = {
		media: PropTypes.object,
		scale: PropTypes.number,
		maxScale: PropTypes.number,
		maxImageWidth: PropTypes.number,
		thumbnailType: PropTypes.string,
	};

	static defaultProps = {
		maxImageWidth: 450,
		maxScale: SCALE_CHOICES[ SCALE_CHOICES.length - 1 ],
	};

	static getDerivedStateFromProps( props, state ) {
		const maxSeenScale = state.maxSeenScale || 0;
		return props.scale > maxSeenScale ? { maxSeenScale: props.scale } : null;
	}

	state = {};

	getImageDimensions = () => {
		const width = this.props.media.width || this.state.imageWidth;
		const height = this.props.media.height || this.state.imageHeight;

		return { width, height };
	};

	getImageStyle = () => {
		const dimensions = this.getImageDimensions();

		return {
			maxHeight: dimensions.height > dimensions.width ? 'none' : '100%',
			maxWidth: dimensions.height < dimensions.width ? 'none' : '100%',
		};
	};

	setUnknownImageDimensions = event => {
		let newState = null;

		if ( ! this.props.media.width ) {
			newState = {
				imageWidth: event.target.clientWidth,
			};
		}

		if ( ! this.props.media.height ) {
			newState = newState || {};
			newState.imageHeight = event.target.clientHeight;
		}

		if ( newState ) {
			this.setState( newState );
		}
	};

	render() {
		const { isAtomic, isPrivate, media, siteSlug } = this.props;

		const width = Math.round(
			( 1 / this.props.maxScale ) * this.state.maxSeenScale * this.props.maxImageWidth
		);

		// Site privacy / coming soon are getting clobbered when the media lib loads
		// Should be fixed when D39264-code lands
		// Hard-coding for now so I can keep working...
		const useProxy = true || !! ( isAtomic && isPrivate );

		const className = 'media-library__list-item-centered';

		if ( useProxy ) {
			const { pathname, hostname } = getUrlParts( media?.URL );
			if ( hostname === siteSlug && pathname.length ) {
				// TODO: Support resizing
				return (
					<ProxiedImage
						siteSlug={ siteSlug }
						mediaUrl={ pathname }
						onLoad={ this.setUnknownImageDimensions }
						alt={ this.props.media.alt || this.props.media.title }
						style={ this.getImageStyle() }
						className={ className }
					/>
				);
			}
		}
		const url = mediaUrl( this.props.media, {
			resize: `${ width },${ width }`,
			size: this.props.thumbnailType === MEDIA_IMAGE_THUMBNAIL ? 'medium' : false,
		} );

		if ( ! url ) {
			return (
				<MediaLibraryListItemFileDetails
					scale={ this.props.scale }
					media={ this.props.media }
					icon="image"
				/>
			);
		}

		return (
			<MediaImage
				src={ url }
				onLoad={ this.setUnknownImageDimensions }
				alt={ this.props.media.alt || this.props.media.title }
				style={ this.getImageStyle() }
				className={ className }
				draggable="false"
			/>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	return {
		isAtomic: isSiteAutomatedTransfer( state, siteId ),
		isPrivate: isPrivateSite( state, siteId ),
		siteSlug: getSelectedSiteSlug( state ),
	};
} )( MediaLibraryListItemImage );
