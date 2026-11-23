import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import data from '../../data/site.js';
import { pad, reduced, scrollToTarget } from '../../lib/motion.js';
import TLink from '../TLink.jsx';

/*
 * The corporate profile as one presentation: the slide types that are not
 * case stories (Hello, gallery spreads, the closing slide) and the presenter bar that runs over all of them.
 *
 * Every slide is a full-screen <section data-slide="…">, a direct child of
 * the page, so the site's section stack makes each one slide over the last.
 * Slides animate in once ~35% on screen (`is-in`), in CSS.
 */

/*
 * Adds `is-in` when the slide shows: on arrival in presentation mode (and
 * removed on leaving, so the build replays), else once it is well on screen.
 */
function useInView( threshold = 0.35 ) {
	const ref = useRef( null );
	useEffect( () => {
		const el = ref.current;
		if ( ! el ) {
			return undefined;
		}
		if ( reduced ) {
			el.classList.add( 'is-in' );
			return undefined;
		}
		if ( el.closest( '.cpDeck--present' ) ) {
			const on = () => el.classList.add( 'is-in' );
			const off = () => el.classList.remove( 'is-in' );
			el.addEventListener( 'deck:enter', on );
			el.addEventListener( 'deck:leave', off );
			return () => {
				el.removeEventListener( 'deck:enter', on );
				el.removeEventListener( 'deck:leave', off );
			};
		}
		const io = new IntersectionObserver( ( [ e ] ) => {
			if ( e.isIntersecting ) {
				el.classList.add( 'is-in' );
				io.disconnect();
			}
		}, { threshold } );
		io.observe( el );
		return () => io.disconnect();
	}, [ threshold ] );
	return ref;
}

const L = ( n ) => `/assets/profile/logos/${ n }.webp`;
const LOGOS = [
	'unilever', 'nestle', 'amex', 'undp', 'hilton', 'taj', 'omega', 'keells', 'krest', 'munchee', 'maliban',
	'elephant-house', 'ahmad-tea', 'uber-eats', 'cinnamon', 'shangri-la', 'movenpick', 'heritance', 'dankotuwa',
	'dsi', 'swadeshi', 'imorich', 'multilac', 'upfield', 'lion', 'il-gelato', 'jat', 'hemas', 'mclarens',
	'cosmopolitan', 'walkers-tours', 'heritance-2', 'hotel'
];

/* Slide 02 — Hello, and the wall of clients. */
export function DeckHello() {
	const ref = useInView();
	return (
		<section className="cpSlide cpHello" ref={ ref } data-slide="Hello" aria-labelledby="cpHelloTitle">
			<div className="cpHello_copy">
				<p className="cpHello_vs">VS+</p>
				<h2 className="cpHello_title" id="cpHelloTitle">Hello<span>’</span></h2>
				<p className="cpHello_lede">The Creative Agency. We create content meant to be experienced. <em>Not simply consumed.</em></p>
			</div>
			<ul className="cpHello_logos" aria-label="Brands we have worked with">
				{ LOGOS.map( ( n, i ) => (
					<li key={ n } style={ { '--i': i, '--f': `${ 5 + ( i % 5 ) }s` } }><img src={ L( n ) } alt={ n.replace( /-\d$/, '' ).replace( /-/g, ' ' ) } loading="lazy" decoding="async" /></li>
				) ) }
			</ul>
		</section>
	);
}

/* A gallery slide from the deck, shown whole on its campaign's colour. */
export function DeckSpread( { page, bg, caption, label } ) {
	const ref = useInView( 0.25 );
	return (
		<section className="cpSlide cpSpread" ref={ ref } data-slide={ label } style={ { '--bg': bg } }>
			<figure className="cpSpread_fig">
				<img src={ `/assets/profile/slides/s${ pad( page ) }.webp` } alt={ caption } loading="lazy" decoding="async" />
			</figure>
			<p className="cpSpread_cap">{ caption }</p>
		</section>
	);
}

/* Slide 63 — closing. */
export function DeckClosing() {
	const ref = useInView();
	return (
		<section className="cpSlide cpClosing" ref={ ref } data-slide="Thank you" aria-label="Thank you">
			<p className="cpClosing_mark">Visual Studios<span>+</span></p>
			<p className="cpClosing_thanks">Thank you.</p>
			<div className="cpClosing_contact">
				<a href={ `mailto:${ data.site.email }` }>{ data.site.email }</a>
				{ data.site.phones.map( ( p ) => <a key={ p } href={ `tel:${ p.replace( /\s+/g, '' ) }` }>{ p }</a> ) }
				<span>{ data.site.address.join( ', ' ) }</span>
			</div>
			<TLink className="cpClosing_cta" to="/contact/">Start a project <span aria-hidden="true">→</span></TLink>
		</section>
	);
}

/*
 * Presenter bar: slide number, section name, progress, prev/next, and the
 * keyboard (arrows, Page Up/Down, Space). Slide positions are measured in
 * normal flow (stacked slides are sticky), and re-measured as the page settles.
 */
export function DeckHud( { root, deck } ) {
	const [ state, setState ] = useState( { i: 0, n: 1, label: '' } );
	const tops = useRef( [] );
	const slides = useRef( [] );

	const measure = useCallback( () => {
		const list = root.current ? [ ...root.current.querySelectorAll( ':scope > section, :scope > header' ) ] : [];
		slides.current = list;
		tops.current = list.map( ( el ) => {
			const prev = el.style.position;
			el.style.position = 'static';
			const y = el.getBoundingClientRect().top + window.scrollY;
			el.style.position = prev;
			return y;
		} );
	}, [ root ] );

	const current = useCallback( () => {
		const y = window.scrollY + window.innerHeight * 0.4;
		let i = 0;
		tops.current.forEach( ( t, k ) => {
			if ( t <= y ) {
				i = k;
			}
		} );
		return i;
	}, [] );

	const go = useCallback( ( d ) => {
		measure();
		const i = Math.max( 0, Math.min( slides.current.length - 1, current() + d ) );
		scrollToTarget( slides.current[ i ], { offset: 0 } );
	}, [ measure, current ] );

	useEffect( () => {
		if ( deck?.enabled ) {
			return undefined; // presentation mode drives the bar
		}
		measure();
		let raf = 0;
		const update = () => {
			raf = 0;
			const i = current();
			setState( { i, n: slides.current.length, label: slides.current[ i ]?.dataset.slide || 'Cover' } );
		};
		const onScroll = () => {
			if ( ! raf ) {
				raf = requestAnimationFrame( update );
			}
		};
		const onKey = ( e ) => {
			if ( e.target.closest( 'input, textarea, select, [contenteditable], video' ) || document.body.classList.contains( 'menu-open' ) ) {
				return;
			}
			const next = [ 'ArrowDown', 'ArrowRight', 'PageDown', ' ' ].includes( e.key );
			const prev = [ 'ArrowUp', 'ArrowLeft', 'PageUp' ].includes( e.key );
			if ( next || prev ) {
				e.preventDefault();
				go( next ? 1 : -1 );
			}
		};
		const ro = new ResizeObserver( () => {
			measure();
			update();
		} );
		ro.observe( root.current );
		const again = setTimeout( () => {
			measure();
			update();
		}, 1200 );
		window.addEventListener( 'scroll', onScroll, { passive: true } );
		window.addEventListener( 'keydown', onKey );
		update();
		return () => {
			clearTimeout( again );
			ro.disconnect();
			cancelAnimationFrame( raf );
			window.removeEventListener( 'scroll', onScroll );
			window.removeEventListener( 'keydown', onKey );
		};
	}, [ root, measure, current, go, deck?.enabled ] );

	const { i, n, label } = deck?.enabled ? deck : state;
	const move = ( d ) => ( deck?.enabled ? deck.step( d ) : go( d ) );
	// Portalled to <body>: inside the page it would join the section stack.
	return createPortal(
		<nav className={ `cpHud${ deck?.enabled ? ' cpHud--present' : '' }` } aria-label="Presentation">
			<span className="cpHud_bar" aria-hidden="true"><i style={ { transform: `scaleX(${ n > 1 ? i / ( n - 1 ) : 0 })` } } /></span>
			<span className="cpHud_brand">VS+ <em>Corporate Profile 2026</em></span>
			<span className="cpHud_label" aria-live="polite">{ label }</span>
			<span className="cpHud_count"><b>{ pad( i + 1 ) }</b> / { pad( n ) }</span>
			<span className="cpHud_btns">
				<button type="button" onClick={ () => move( -1 ) } disabled={ i === 0 } aria-label="Previous slide">←</button>
				<button type="button" onClick={ () => move( 1 ) } disabled={ i >= n - 1 } aria-label="Next slide">→</button>
			</span>
		</nav>,
		document.body
	);
}
