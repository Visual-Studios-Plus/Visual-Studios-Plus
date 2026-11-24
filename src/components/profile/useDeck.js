import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap, reduced, canHover, startScroll, stopScroll } from '../../lib/motion.js';

/*
 * Presentation mode for the corporate profile (desktop, pointer, motion on).
 *
 * The page stops scrolling and becomes a deck: one full-screen slide at a
 * time. The wheel, the keyboard (arrows, Page Up/Down, Space, Home/End), the
 * presenter bar and in-page #links move exactly one slide (or to a target),
 * with a deck transition — the next slide slides up over the current one,
 * which recedes and dims; going back reverses it.
 *
 * Slides hear `deck:enter` / `deck:leave`, so each one plays its build when
 * it arrives (and resets when it goes). Only the active slide and its
 * neighbours are displayed, so the rest of the deck does not load up front.
 * A slide taller than the screen scrolls inside itself before the deck moves.
 */

export const presentMode = () => typeof window !== 'undefined' && ! reduced && canHover &&
	window.matchMedia( '(min-width: 900px) and (min-height: 560px)' ).matches;

const DUR = 0.95;

/* The number count-up, for slides that arrive rather than scroll in. */
function countUp( slide ) {
	slide.querySelectorAll( '.resultNum[data-count]' ).forEach( ( node ) => {
		const raw = node.getAttribute( 'data-count' );
		const m = raw.match( /^([^\d]*)([\d.]+)(.*)$/ );
		if ( ! m ) {
			return;
		}
		const end = parseFloat( m[ 2 ] );
		const dec = ( m[ 2 ].split( '.' )[ 1 ] || '' ).length;
		const o = { v: 0 };
		gsap.to( o, {
			v: end, duration: 1.4, delay: 0.35, ease: 'power2.out', overwrite: true,
			onUpdate: () => {
				node.textContent = m[ 1 ] + o.v.toFixed( dec ) + m[ 3 ];
			},
			onComplete: () => {
				node.textContent = raw;
			}
		} );
	} );
}

export default function useDeck( root, enabled ) {
	const [ state, setState ] = useState( { i: 0, n: 0, label: '' } );
	const api = useRef( { go: () => {} } );

	useLayoutEffect( () => {
		const el = root.current;
		if ( ! enabled || ! el ) {
			return undefined;
		}
		const slides = [ ...el.querySelectorAll( ':scope > section, :scope > header' ) ];
		const n = slides.length;
		const label = ( k ) => slides[ k ]?.dataset.slide || 'Cover';
		let i = 0;
		let busy = false;
		let quietUntil = 0;
		let coasting = false;

		const html = document.documentElement;
		html.classList.add( 'cp-present' );
		el.classList.add( 'cpDeck--present' );
		window.scrollTo( 0, 0 );
		stopScroll();

		const mark = ( k ) => slides.forEach( ( s, j ) => {
			s.classList.toggle( 'is-active', j === k );
			s.classList.toggle( 'is-near', Math.abs( j - k ) === 1 );
		} );
		const emit = ( k, type ) => slides[ k ]?.dispatchEvent( new CustomEvent( type ) );
		const arrive = ( k ) => {
			emit( k, 'deck:enter' );
			countUp( slides[ k ] );
			slides[ k ].scrollTop = 0;
		};

		mark( 0 );
		setState( { i: 0, n, label: label( 0 ) } );
		requestAnimationFrame( () => arrive( 0 ) );

		const go = ( to ) => {
			const k = Math.max( 0, Math.min( n - 1, to ) );
			if ( k === i || busy ) {
				return;
			}
			busy = true;
			const from = slides[ i ];
			const next = slides[ k ];
			const fwd = k > i;
			emit( i, 'deck:leave' );
			next.classList.add( 'is-active' );
			from.classList.add( 'is-leaving' );
			( fwd ? next : from ).classList.add( 'is-top' );

			const tl = gsap.timeline( {
				defaults: { duration: DUR, ease: 'expo.inOut' },
				onComplete: () => {
					from.classList.remove( 'is-leaving', 'is-top' );
					next.classList.remove( 'is-top' );
					gsap.set( [ from, next ], { clearProps: 'transform,--dim' } );
					mark( k );
					busy = false;
					coasting = true;
					quietUntil = performance.now() + 180;
				}
			} );
			if ( fwd ) {
				tl.fromTo( next, { yPercent: 100 }, { yPercent: 0 } )
					.fromTo( from, { scale: 1, '--dim': 0 }, { scale: 0.92, '--dim': 0.65 }, 0 );
			} else {
				tl.fromTo( from, { yPercent: 0 }, { yPercent: 100 } )
					.fromTo( next, { scale: 0.92, '--dim': 0.65 }, { scale: 1, '--dim': 0 }, 0 );
			}
			tl.call( () => arrive( k ), null, DUR * 0.45 );
			i = k;
			setState( { i: k, n, label: label( k ) } );
		};
		api.current.go = go;
		api.current.step = ( d ) => go( i + d );

		/*
		 * Mouse wheel and trackpad. A mouse wheel notch (a big, whole-number
		 * delta) is one step, so spinning the wheel keeps paging. A trackpad
		 * swipe accumulates into one step; after a move the deck coasts, ignoring
		 * the momentum that trails after it (deltas shrinking), until a fresh
		 * swipe ramps up.
		 */
		let acc = 0;
		let lastWheel = 0;
		let lastAbs = 0;
		let rises = 0;
		const onWheel = ( e ) => {
			const b = document.body.classList;
			if ( html.classList.contains( 'menu-open' ) || b.contains( 'menu-open' ) || b.contains( 'pv-open' ) ) {
				return;
			}
			const s = slides[ i ];
			const canScroll = s.scrollHeight > s.clientHeight + 2 &&
				( e.deltaY > 0 ? s.scrollTop + s.clientHeight < s.scrollHeight - 2 : s.scrollTop > 2 );
			if ( canScroll ) {
				// A slide taller than the screen scrolls inside itself first. Done
				// by hand: the smooth-scroll library is paused and eats native wheel.
				e.preventDefault();
				s.scrollTop += e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY;
				acc = 0;
				return;
			}
			e.preventDefault();
			let dy = e.deltaY;
			if ( e.deltaMode === 1 ) {
				dy *= 40;
			} else if ( e.deltaMode === 2 ) {
				dy *= window.innerHeight;
			}
			if ( ! dy ) {
				return;
			}
			const now = performance.now();
			const gap = now - lastWheel;
			const abs = Math.abs( dy );
			// A fresh push ramps up (deltas rise twice running); momentum only
			// decays. Gaps are not trusted: they can be jank mid-transition.
			rises = abs > lastAbs + 0.5 ? rises + 1 : 0;
			const fresh = rises >= 2 || abs > lastAbs * 1.4 + 3;
			lastWheel = now;
			lastAbs = abs;
			if ( busy || now < quietUntil ) {
				acc = 0;
				coasting = true;
				return;
			}
			const notch = abs >= 50 && Number.isInteger( dy );
			if ( notch ) {
				acc = 0;
				go( i + Math.sign( dy ) );
				return;
			}
			if ( coasting ) {
				if ( ! fresh ) {
					return; // trailing momentum from the last move
				}
				coasting = false;
				acc = 0;
			}
			if ( gap > 260 ) {
				acc = 0;
			}
			acc += dy;
			if ( Math.abs( acc ) > 40 ) {
				go( i + Math.sign( acc ) );
				acc = 0;
			}
		};

		const onKey = ( e ) => {
			if ( e.target.closest?.( 'input, textarea, select, [contenteditable], video' ) || document.body.classList.contains( 'menu-open' ) || document.body.classList.contains( 'pv-open' ) ) {
				return;
			}
			const map = { ArrowDown: 1, ArrowRight: 1, PageDown: 1, ' ': 1, ArrowUp: -1, ArrowLeft: -1, PageUp: -1 };
			if ( e.key === 'Home' || e.key === 'End' ) {
				e.preventDefault();
				go( e.key === 'Home' ? 0 : n - 1 );
			} else if ( map[ e.key ] ) {
				e.preventDefault();
				go( i + ( e.shiftKey && e.key === ' ' ? -1 : map[ e.key ] ) );
			}
		};

		// In-page #links (the cover's menu, etc.) go to the slide holding the target.
		const onClick = ( e ) => {
			const a = e.target.closest( 'a[href*="#"]' );
			if ( ! a ) {
				return;
			}
			const url = new URL( a.getAttribute( 'href' ), window.location.href );
			if ( url.pathname !== window.location.pathname || ! url.hash ) {
				return;
			}
			const target = document.getElementById( decodeURIComponent( url.hash.slice( 1 ) ) );
			const k = target ? slides.findIndex( ( s ) => s.contains( target ) ) : -1;
			if ( k >= 0 ) {
				e.preventDefault();
				e.stopPropagation();
				go( k );
			}
		};

		window.addEventListener( 'wheel', onWheel, { passive: false } );
		window.addEventListener( 'keydown', onKey );
		el.addEventListener( 'click', onClick, true );

		return () => {
			window.removeEventListener( 'wheel', onWheel );
			window.removeEventListener( 'keydown', onKey );
			el.removeEventListener( 'click', onClick, true );
			emit( i, 'deck:leave' );
			slides.forEach( ( s ) => {
				s.classList.remove( 'is-active', 'is-near', 'is-leaving', 'is-top' );
				gsap.set( s, { clearProps: 'transform,--dim' } );
			} );
			el.classList.remove( 'cpDeck--present' );
			html.classList.remove( 'cp-present' );
			startScroll();
		};
	}, [ enabled ] ); // eslint-disable-line react-hooks/exhaustive-deps

	const go = useCallback( ( k ) => api.current.go( k ), [] );
	const step = useCallback( ( d ) => api.current.step?.( d ), [] );
	return { ...state, go, step, enabled };
}
