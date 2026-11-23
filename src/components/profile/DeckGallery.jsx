import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import GALLERIES from '../../data/profileGalleries.js';
import { pad, reduced } from '../../lib/motion.js';
import { useInView } from './DeckSlides.jsx';

/*
 * Gallery slides: each of the deck's gallery pages as a live gallery built
 * from its own pictures, in one of three layouts —
 *
 *   grid   — a justified mosaic sized to the screen; the photos fly in from
 *            scattered angles and settle into place
 *   phones — the reels in phone frames, rising one after another, then
 *            floating; a frame can play the campaign's video
 *   laptop — a laptop whose lid opens as the slide arrives, playing the film
 *            (or the film's still, drifting), with the page's copy beside it
 *
 * Any picture opens the viewer: full screen, arrows / keys / Esc to browse.
 */

/* Row height for the mosaic, so the gallery fits one screen. */
const rowHeight = ( n ) => ( n <= 2 ? 56 : n <= 4 ? 34 : n <= 6 ? 29 : n <= 9 ? 23.5 : 19 );

/* Scatter for the mosaic entrance, stable per tile. */
const scatter = ( i ) => {
	const a = ( i * 137.5 * Math.PI ) / 180;
	return { '--sx': `${ Math.cos( a ) * 26 }vw`, '--sy': `${ Math.sin( a ) * 22 }vh`, '--sr': `${ ( ( i * 53 ) % 30 ) - 15 }deg`, '--i': i };
};

function Viewer( { items, index, onIndex, onClose, title } ) {
	const it = items[ index ];
	const step = ( d ) => onIndex( ( index + d + items.length ) % items.length );

	useEffect( () => {
		document.body.classList.add( 'pv-open' );
		const onKey = ( e ) => {
			if ( e.key === 'Escape' ) {
				onClose();
			} else if ( e.key === 'ArrowRight' || e.key === 'ArrowDown' ) {
				step( 1 );
			} else if ( e.key === 'ArrowLeft' || e.key === 'ArrowUp' ) {
				step( -1 );
			} else {
				return;
			}
			e.preventDefault();
			e.stopPropagation();
		};
		window.addEventListener( 'keydown', onKey, true );
		return () => {
			window.removeEventListener( 'keydown', onKey, true );
			document.body.classList.remove( 'pv-open' );
		};
	} );

	return createPortal(
		<div className="pvViewer" role="dialog" aria-modal="true" aria-label={ `${ title } — gallery` } onClick={ onClose }>
			<div className="pvViewer_stage" onClick={ ( e ) => e.stopPropagation() }>
				{ it.video
					? <video key={ it.video } src={ it.video } poster={ it.src } autoPlay loop muted playsInline controls />
					: <img key={ it.src } src={ it.full || it.src } alt={ `${ title } — ${ index + 1 } of ${ items.length }` } /> }
			</div>
			<p className="pvViewer_meta">{ title } <span>{ pad( index + 1 ) } / { pad( items.length ) }</span></p>
			<button type="button" className="pvViewer_close" onClick={ onClose } aria-label="Close gallery">✕</button>
			{ items.length > 1 && (
				<>
					<button type="button" className="pvViewer_nav pvViewer_nav--prev" onClick={ ( e ) => { e.stopPropagation(); step( -1 ); } } aria-label="Previous picture">←</button>
					<button type="button" className="pvViewer_nav pvViewer_nav--next" onClick={ ( e ) => { e.stopPropagation(); step( 1 ); } } aria-label="Next picture">→</button>
				</>
			) }
		</div>,
		document.body
	);
}

/* Plays a video only while its slide is showing (presentation or scroll). */
function useSlideVideo( slide, vid ) {
	useEffect( () => {
		const v = vid.current;
		const s = slide.current;
		if ( ! v || ! s || reduced ) {
			return undefined;
		}
		const load = () => {
			if ( ! v.getAttribute( 'src' ) ) {
				v.src = v.dataset.src;
			}
		};
		const play = () => {
			load();
			v.play().catch( () => {} );
		};
		const pause = () => v.pause();
		s.addEventListener( 'deck:enter', play );
		s.addEventListener( 'deck:leave', pause );
		const io = new IntersectionObserver( ( [ e ] ) => {
			if ( s.closest( '.cpDeck--present' ) ) {
				return;
			}
			if ( e.isIntersecting ) {
				play();
			} else {
				pause();
			}
		}, { threshold: 0.3 } );
		io.observe( s );
		return () => {
			s.removeEventListener( 'deck:enter', play );
			s.removeEventListener( 'deck:leave', pause );
			io.disconnect();
			v.pause();
		};
	}, [ slide, vid ] );
}

function Grid( { media, open } ) {
	const h = rowHeight( media.length );
	if ( media.length === 1 ) {
		const m = media[ 0 ];
		return (
			<button type="button" className="cpGal_hero" onClick={ () => open( 0 ) } aria-label="View full size">
				<img src={ m.src } alt="" loading="lazy" decoding="async" />
			</button>
		);
	}
	return (
		<div className="cpGal_grid" style={ { '--row': `${ h }vh` } }>
			{ media.map( ( m, i ) => (
				<button type="button" key={ m.src } className="cpGal_tile" onClick={ () => open( i ) }
					style={ { '--ar': m.w / m.h, ...scatter( i ) } } aria-label={ `View picture ${ i + 1 }` }>
					<img src={ m.src } alt="" loading="lazy" decoding="async" />
				</button>
			) ) }
			<span className="cpGal_fill" aria-hidden="true" />
		</div>
	);
}

function Phones( { media, open, text, slide } ) {
	const vid = useRef( null );
	useSlideVideo( slide, vid );
	return (
		<div className="cpGal_phones">
			<div className="cpGal_phoneRow">
				{ media.map( ( m, i ) => (
					<button type="button" key={ m.src } className="cpGal_phone" onClick={ () => open( i ) }
						style={ { '--i': i } } aria-label={ m.video ? 'Play the reel' : `View screen ${ i + 1 }` }>
						<span className="cpGal_screen">
							{ m.video
								? <video ref={ vid } data-src={ m.video } poster={ m.src } muted loop playsInline preload="none" aria-hidden="true" />
								: <img src={ m.src } alt="" loading="lazy" decoding="async" /> }
						</span>
					</button>
				) ) }
			</div>
			{ text && <p className="cpGal_note">{ text }</p> }
		</div>
	);
}

function Laptop( { media, open, text, video, slide } ) {
	const vid = useRef( null );
	useSlideVideo( slide, vid );
	const m = media[ 0 ];
	return (
		<div className="cpGal_laptopWrap">
			<button type="button" className="cpGal_laptop" onClick={ () => open( 0 ) } aria-label={ video ? 'Play the film full screen' : 'View full size' }>
				<span className="cpGal_lid">
					<span className="cpGal_display">
						{ video
							? <video ref={ vid } data-src={ video } poster={ m.src } muted loop playsInline preload="none" aria-hidden="true" />
							: <img className="cpGal_drift" src={ m.src } alt="" loading="lazy" decoding="async" /> }
					</span>
				</span>
				<span className="cpGal_base" aria-hidden="true" />
			</button>
			{ text && <p className="cpGal_text">{ text }</p> }
		</div>
	);
}

export default function DeckGallery( { page, bg, ink, caption, label } ) {
	const g = GALLERIES[ page ];
	const ref = useInView( 0.25 );
	const [ at, setAt ] = useState( -1 );
	if ( ! g ) {
		return null;
	}
	// The viewer browses the pictures; a laptop's film plays in it too.
	const items = g.layout === 'laptop' && g.video ? [ { ...g.media[ 0 ], video: g.video } ] : g.media;
	const open = ( i ) => setAt( i );
	const count = g.media.length;

	return (
		<section className={ `cpSlide cpGal cpGal--${ g.layout }` } ref={ ref } data-slide={ label }
			style={ { '--bg': bg, '--ink': ink } } aria-label={ caption }>
			<header className="cpGal_head">
				<p className="cpGal_title">{ caption }</p>
				<p className="cpGal_count">
					{ g.layout === 'laptop' ? 'Film' : g.layout === 'phones' ? `${ count } reels` : count > 1 ? `${ count } photographs` : 'Feature' }
					<span> · Click to view</span>
				</p>
			</header>
			{ g.layout === 'grid' && <Grid media={ g.media } open={ open } /> }
			{ g.layout === 'phones' && <Phones media={ g.media } open={ open } text={ g.text } slide={ ref } /> }
			{ g.layout === 'laptop' && <Laptop media={ g.media } open={ open } text={ g.text } video={ g.video } slide={ ref } /> }
			{ at >= 0 && <Viewer items={ items } index={ at } onIndex={ setAt } onClose={ () => setAt( -1 ) } title={ caption } /> }
		</section>
	);
}
