import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import GALLERIES from '../../data/profileGalleries.js';
import { pad, reduced, ytEmbed } from '../../lib/motion.js';
import { useInView } from './DeckSlides.jsx';
import { Ring, Loupe, Wall, Brut } from './PhotoShowcase.jsx';

/*
 * Gallery slides: each of the deck's gallery pages as a live gallery built
 * from its own pictures, in one of three layouts —
 *
 *   grid   — an editorial slideshow: a large feature frame that cross-fades
 *            with a slow zoom, a counter and a thumbnail rail
 *   phones — the reels in phone frames, rising one after another, then
 *            floating; a frame can play the campaign's video
 *   laptop — a laptop whose lid opens as the slide arrives, playing the film
 *            (or the film's still, drifting), with the page's copy beside it
 *   ring / loupe / wall / brut — the interactive photography layouts
 *            (see PhotoShowcase.jsx)
 *
 * Any picture opens the viewer: full screen, arrows / keys / Esc to browse.
 */

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
				{ it.yt
					? <iframe key={ it.yt } className="pvViewer_yt" src={ ytEmbed( it.yt, 'autoplay=1&controls=1' ) } title={ title }
						allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
					: it.video
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

/*
 * Plays a slide's video(s) only while the slide is showing (presentation or
 * scroll). `vid` is a video, or an element holding several (a phone row).
 */
function useSlideVideo( slide, vid ) {
	useEffect( () => {
		const el = vid.current;
		const s = slide.current;
		if ( ! el || ! s || reduced ) {
			return undefined;
		}
		const vids = el.tagName === 'VIDEO' ? [ el ] : [ ...el.querySelectorAll( 'video' ) ];
		if ( ! vids.length ) {
			return undefined;
		}
		const play = () => vids.forEach( ( v ) => {
			if ( ! v.getAttribute( 'src' ) ) {
				v.src = v.dataset.src;
			}
			v.play().catch( () => {} );
		} );
		const pause = () => vids.forEach( ( v ) => v.pause() );
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
			pause();
		};
	}, [ slide, vid ] );
}

/* True while the slide is showing (presentation: deck events; else on screen). */
function useSlideActive( slide ) {
	const [ on, setOn ] = useState( false );
	useEffect( () => {
		const s = slide.current;
		if ( ! s ) {
			return undefined;
		}
		const enter = () => setOn( true );
		const leave = () => setOn( false );
		s.addEventListener( 'deck:enter', enter );
		s.addEventListener( 'deck:leave', leave );
		const io = new IntersectionObserver( ( [ e ] ) => {
			if ( ! s.closest( '.cpDeck--present' ) ) {
				setOn( e.isIntersecting );
			}
		}, { threshold: 0.4 } );
		io.observe( s );
		return () => {
			s.removeEventListener( 'deck:enter', enter );
			s.removeEventListener( 'deck:leave', leave );
			io.disconnect();
		};
	}, [ slide ] );
	return on;
}


/*
 * The photo gallery as an editorial slideshow: a large feature frame that
 * cross-fades with a slow zoom, a big counter, and a thumbnail rail; it
 * advances on its own while the slide is up (paused on hover), and any
 * thumbnail shows that photo. The feature opens the viewer.
 */
/*
 * A cover-flow row: the chosen photograph large in the middle, the others
 * stepping down in size toward each edge. A side picture comes to the
 * centre when clicked; the centre one opens the viewer. Arrows step too.
 */
const FLOW = [ 1, 0.62, 0.42, 0.28 ]; // height by distance from the centre

/* The viewport size, kept current (the flow row lays itself out in px). */
function useViewport() {
	const [ vp, setVp ] = useState( () => ( { w: window.innerWidth, h: window.innerHeight } ) );
	useEffect( () => {
		const on = () => setVp( { w: window.innerWidth, h: window.innerHeight } );
		window.addEventListener( 'resize', on );
		return () => window.removeEventListener( 'resize', on );
	}, [] );
	return vp;
}

function Grid( { media, open } ) {
	const n = media.length;
	const [ at, setAt ] = useState( 0 );
	const vp = useViewport();

	if ( n === 1 ) {
		return (
			<button type="button" className="cpGal_hero" onClick={ () => open( 0 ) } aria-label="View full size">
				<img src={ media[ 0 ].src } alt="" loading="lazy" decoding="async" />
			</button>
		);
	}

	const side = Math.min( FLOW.length - 1, Math.floor( ( n - 1 ) / 2 ) );
	const go = ( d ) => setAt( ( k ) => ( k + d + n ) % n );
	// Size each picture by its distance from the centre and its own shape,
	// then lay them out from the centre outwards so the chosen one is centred.
	const phone = vp.w < 900;
	const rowH = phone ? vp.w * 0.62 : Math.min( vp.h * 0.5, 540 );
	const maxW = ( phone ? 0.7 : 0.34 ) * vp.w;
	const gap = phone ? 8 : 16;
	const row = [];
	for ( let d = -side; d <= side; d++ ) {
		const i = ( at + d + n ) % n;
		const sc = FLOW[ Math.abs( d ) ];
		const ar = media[ i ].w / media[ i ].h;
		let h = rowH * sc;
		let w = h * ar;
		if ( w > maxW * sc ) {
			w = maxW * sc;
			h = w / ar;
		}
		row.push( { i, d, w, h } );
	}
	const c = row.findIndex( ( r ) => r.d === 0 );
	row[ c ].x = 0;
	for ( let k = c + 1; k < row.length; k++ ) {
		row[ k ].x = row[ k - 1 ].x + row[ k - 1 ].w / 2 + gap + row[ k ].w / 2;
	}
	for ( let k = c - 1; k >= 0; k-- ) {
		row[ k ].x = row[ k + 1 ].x - row[ k + 1 ].w / 2 - gap - row[ k ].w / 2;
	}

	return (
		<div className="cpGal_flow">
			<ul className="cpGal_flowRow" style={ { height: rowH } }>
				{ row.map( ( { i, d, w, h, x } ) => {
					const m = media[ i ];
					return (
						<li key={ i } className={ d === 0 ? 'is-on' : undefined }
							style={ { width: w, height: h, left: `calc(50% + ${ x - w / 2 }px)`, top: ( rowH - h ) / 2, '--k': Math.abs( d ) } }>
							<button type="button" onClick={ () => ( d === 0 ? open( i ) : setAt( i ) ) }
								aria-label={ d === 0 ? `View photograph ${ i + 1 } full size` : `Bring photograph ${ i + 1 } to the centre` }>
								<img src={ m.src } alt="" loading="lazy" decoding="async" />
							</button>
						</li>
					);
				} ) }
			</ul>
			<div className="cpGal_flowBar">
				<button type="button" onClick={ () => go( -1 ) } aria-label="Previous photograph">←</button>
				<span>From { pad( 1 ) }</span>
				<i aria-hidden="true"><b style={ { '--p': ( at + 1 ) / n } } /></i>
				<span>To { pad( n ) }</span>
				<button type="button" onClick={ () => go( 1 ) } aria-label="Next photograph">→</button>
				<p className="cpGal_flowNo" aria-live="polite">{ pad( at + 1 ) } / { pad( n ) }</p>
			</div>
		</div>
	);
}

/* Where a phone's link goes, in words. */
const linkText = ( m ) => m.linkLabel || ( /youtu/.test( m.url ) ? 'Watch on YouTube' : 'Watch on Instagram' );

/* A phone links out to its reel when it has one; otherwise it opens the viewer. */
function PhoneWrap( { m, i, open, children } ) {
	const props = { className: 'cpGal_phone', style: { '--i': i } };
	return m.url
		? <a { ...props } href={ m.url } target="_blank" rel="noopener noreferrer" aria-label={ `${ linkText( m ) }, reel ${ i + 1 } (opens in a new tab)` }>{ children }</a>
		: <button type="button" { ...props } onClick={ () => open( i ) } aria-label={ m.video ? 'Play the reel' : `View screen ${ i + 1 }` }>{ children }</button>;
}

function Phones( { media, open, text, slide } ) {
	const vid = useRef( null );
	useSlideVideo( slide, vid );
	return (
		<div className="cpGal_phones">
			<div className="cpGal_phoneRow" ref={ vid }>
				{ media.map( ( m, i ) => (
					<PhoneWrap key={ m.src } m={ m } i={ i } open={ open }>
						<span className="cpGal_key cpGal_key--action" aria-hidden="true" />
						<span className="cpGal_key cpGal_key--up" aria-hidden="true" />
						<span className="cpGal_key cpGal_key--down" aria-hidden="true" />
						<span className="cpGal_key cpGal_key--power" aria-hidden="true" />
						<span className="cpGal_bezel">
							<span className="cpGal_screen">
								{ m.video
									? <video data-src={ m.video } poster={ m.src } muted loop playsInline preload="none" aria-hidden="true" />
									: <img src={ m.src } alt="" loading="lazy" decoding="async" /> }
							</span>
							<span className="cpGal_island" aria-hidden="true" />
							<span className="cpGal_glare" aria-hidden="true" />
						</span>
						{ m.url && <span className="cpGal_watch">{ linkText( m ) } <i aria-hidden="true">↗</i></span> }
					</PhoneWrap>
				) ) }
			</div>
			{ text && <p className="cpGal_note">{ text }</p> }
		</div>
	);
}

function Laptop( { media, open, text, video, yt, slide } ) {
	const vid = useRef( null );
	useSlideVideo( slide, vid );
	const active = useSlideActive( slide );
	const m = media[ 0 ];
	return (
		<div className="cpGal_laptopWrap">
			<button type="button" className="cpGal_laptop" onClick={ () => open( 0 ) } aria-label={ video || yt ? 'Play the film with sound' : 'View full size' }>
				<span className="cpGal_lid">
					<span className="cpGal_display">
						{ video && <video ref={ vid } data-src={ video } poster={ m.src } muted loop playsInline preload="none" aria-hidden="true" /> }
						{ ! video && <img className="cpGal_drift" src={ m.src } alt="" loading="lazy" decoding="async" /> }
						{ /* The YouTube film plays muted over its still, loaded only while the slide is up. */ }
						{ yt && active && ! reduced && (
							<iframe className="cpGal_yt" src={ ytEmbed( yt, `autoplay=1&mute=1&controls=0&loop=1&playlist=${ yt }&disablekb=1` ) }
								title="" tabIndex={ -1 } aria-hidden="true" allow="autoplay; encrypted-media"
								onLoad={ ( e ) => {
									const f = e.currentTarget;
									setTimeout( () => f.classList.add( 'is-ready' ), 900 ); // the still covers the player's load
								} } />
						) }
						{ yt && <span className="cpGal_play" aria-hidden="true">▶</span> }
					</span>
				</span>
				<span className="cpGal_base" aria-hidden="true" />
			</button>
			{ text && <p className="cpGal_text">{ text }</p> }
		</div>
	);
}

/* What each photography layout invites you to do. */
const HINT = {
	ring: ( n ) => `${ n } photographs · Drag to turn`,
	loupe: ( n ) => `${ n } pieces · Hover to inspect`,
	wall: ( n ) => `${ n } photographs · Drag to walk the wall`,
	brut: ( n ) => `${ n } plates · Click to view`
};

export default function DeckGallery( { page, bg, ink, caption, label, cat } ) {
	const g = GALLERIES[ page ];
	const ref = useInView( 0.25 );
	const [ at, setAt ] = useState( -1 );
	const active = useSlideActive( ref );
	if ( ! g ) {
		return null;
	}
	// The viewer browses the pictures; a laptop's film plays in it too.
	const items = g.layout === 'laptop' && ( g.video || g.yt ) ? [ { ...g.media[ 0 ], video: g.video, yt: g.yt } ] : g.media;
	const open = ( i ) => setAt( i );
	const count = g.media.length;

	return (
		<section className={ `cpSlide cpGal cpGal--${ g.layout }` } ref={ ref } data-slide={ label } data-cat={ cat }
			style={ { '--bg': bg, '--ink': ink } } aria-label={ caption }>
			<header className="cpGal_head">
				<p className="cpGal_title">{ caption }</p>
				<p className="cpGal_count">
					{ HINT[ g.layout ] ? HINT[ g.layout ]( count ) : g.layout === 'laptop' ? 'Film' : g.layout === 'phones' ? `${ count } reels` : count > 1 ? `${ count } photographs` : 'Feature' }
					{ ! HINT[ g.layout ] && <span> · Click to view</span> }
				</p>
			</header>
			{ g.layout === 'grid' && <Grid media={ g.media } open={ open } /> }
			{ g.layout === 'phones' && <Phones media={ g.media } open={ open } text={ g.text } slide={ ref } /> }
			{ g.layout === 'laptop' && <Laptop media={ g.media } open={ open } text={ g.text } video={ g.video } yt={ g.yt } slide={ ref } /> }
			{ g.layout === 'ring' && <Ring media={ g.media } open={ open } active={ active } /> }
			{ g.layout === 'loupe' && <Loupe media={ g.media } open={ open } /> }
			{ g.layout === 'wall' && <Wall media={ g.media } open={ open } active={ active } /> }
			{ g.layout === 'brut' && <Brut media={ g.media } open={ open } /> }
			{ at >= 0 && <Viewer items={ items } index={ at } onIndex={ setAt } onClose={ () => setAt( -1 ) } title={ caption } /> }
		</section>
	);
}
