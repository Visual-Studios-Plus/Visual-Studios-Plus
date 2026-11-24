import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import data from '../../data/site.js';
import { pad, reduced, scrollToTarget } from '../../lib/motion.js';
import TLink from '../TLink.jsx';

/*
 * The corporate profile as one presentation: the slide types that are not
 * case stories (Hello, the closing slide) and the presenter bar that runs over all of them.
 *
 * Every slide is a full-screen <section data-slide="…">, a direct child of
 * the page, so the site's section stack makes each one slide over the last.
 * Slides animate in once ~35% on screen (`is-in`), in CSS.
 */

/*
 * Adds `is-in` when the slide shows: on arrival in presentation mode (and
 * removed on leaving, so the build replays), else once it is well on screen.
 */
export function useInView( threshold = 0.35 ) {
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
 * The category navbar: floating glass with a liquid highlight (after the iOS
 * "liquid glass" tab bar). The highlight is driven by a spring: it stretches
 * along its travel and squashes, overshoots and wobbles into place. It can be
 * dragged — it swells into a clear lens that magnifies what is beneath — and
 * snaps to the nearest category on release. Choosing a category narrows the
 * deck to that chapter (again, or All, shows everything); under All it
 * follows the chapter you are in.
 */
function CategoryNav( { cats, filter, lit, onFilter } ) {
	const bar = useRef( null );
	const pill = useRef( null );
	const sim = useRef( { x: 0, w: 0, vx: 0, vw: 0, tx: 0, tw: 0, drag: false, press: 0, raf: 0, ready: false } );
	const active = filter === 'all' ? ( lit || 'all' ) : filter;
	const ids = [ 'all', ...cats.map( ( c ) => c[ 0 ] ) ];

	const choose = ( id ) => {
		if ( id === 'all' ) {
			onFilter?.( 'all' );
		} else {
			onFilter?.( filter === id ? 'all' : id );
		}
	};

	// The spring loop: runs only while the highlight is moving.
	const kick = () => {
		const st = sim.current;
		if ( st.raf ) {
			return;
		}
		let last = performance.now();
		const tick = ( now ) => {
			const dt = Math.min( 0.034, ( now - last ) / 1000 );
			last = now;
			const k = st.drag ? 520 : 260; // stiffness
			const c = st.drag ? 34 : 17; // damping: low, so it wobbles
			st.vx += ( ( st.tx - st.x ) * k - st.vx * c ) * dt;
			st.vw += ( ( st.tw - st.w ) * k - st.vw * c ) * dt;
			st.x += st.vx * dt;
			st.w += st.vw * dt;
			st.press += ( 0 - st.press ) * Math.min( 1, dt * 9 );
			// Liquid: stretch along the travel, squash across it.
			const v = Math.min( 1, Math.abs( st.vx ) / 2400 );
			const sx = 1 + v * 0.35 + st.press * 0.08 + ( st.drag ? 0.14 : 0 );
			const sy = 1 - v * 0.22 + st.press * 0.1 + ( st.drag ? 0.2 : 0 );
			if ( pill.current ) {
				pill.current.style.width = `${ st.w }px`;
				pill.current.style.transform = `translateX(${ st.x }px) scale(${ sx.toFixed( 3 ) }, ${ sy.toFixed( 3 ) })`;
			}
			const settled = ! st.drag && Math.abs( st.tx - st.x ) < 0.3 && Math.abs( st.vx ) < 4 && Math.abs( st.tw - st.w ) < 0.3 && st.press < 0.01;
			if ( settled ) {
				st.x = st.tx;
				st.w = st.tw;
				st.raf = 0;
				if ( pill.current ) {
					pill.current.style.transform = `translateX(${ st.x }px)`;
					pill.current.style.width = `${ st.w }px`;
				}
				return;
			}
			st.raf = requestAnimationFrame( tick );
		};
		st.raf = requestAnimationFrame( tick );
	};

	const target = ( id ) => {
		const el = bar.current?.querySelector( `[data-id="${ id }"]` );
		return el ? { x: el.offsetLeft, w: el.offsetWidth, el } : null;
	};

	// Glide to the active item.
	useEffect( () => {
		const place = () => {
			const t = target( active );
			if ( ! t ) {
				return;
			}
			const st = sim.current;
			st.tx = t.x;
			st.tw = t.w;
			if ( ! st.ready || reduced ) {
				st.ready = true;
				st.x = t.x;
				st.w = t.w;
				if ( pill.current ) {
					pill.current.style.width = `${ t.w }px`;
					pill.current.style.transform = `translateX(${ t.x }px)`;
				}
			} else {
				kick();
			}
			t.el.scrollIntoView?.( { block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' } );
		};
		place();
		window.addEventListener( 'resize', place );
		return () => window.removeEventListener( 'resize', place );
	}, [ active ] ); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect( () => () => cancelAnimationFrame( sim.current.raf ), [] );

	// Drag the highlight: it becomes a lens and follows the pointer.
	const onDown = ( e ) => {
		// Like iOS, the drag starts from the highlighted item; elsewhere the bar scrolls.
		if ( reduced || e.button > 0 || ! e.target.closest( 'button.is-on' ) ) {
			return;
		}
		const track = bar.current;
		const st = sim.current;
		const r = track.getBoundingClientRect();
		const startX = e.clientX;
		let moved = false;
		st.press = 1;
		kick();
		const move = ( ev ) => {
			if ( ! moved && Math.abs( ev.clientX - startX ) < 6 ) {
				return;
			}
			moved = true;
			st.drag = true;
			pill.current?.classList.add( 'is-lens' );
			const x = ev.clientX - r.left + track.scrollLeft - st.tw / 2;
			st.tx = Math.max( 0, Math.min( track.scrollWidth - st.tw, x ) );
			kick();
		};
		const up = ( ev ) => {
			window.removeEventListener( 'pointermove', move );
			window.removeEventListener( 'pointerup', up );
			pill.current?.classList.remove( 'is-lens' );
			if ( ! moved ) {
				return; // a plain tap: the button's click handles it
			}
			st.drag = false;
			// Snap to the item under the release point.
			const px = ev.clientX - r.left + track.scrollLeft;
			let best = ids[ 0 ];
			let d = Infinity;
			ids.forEach( ( id ) => {
				const t = target( id );
				const c = t ? Math.abs( t.x + t.w / 2 - px ) : Infinity;
				if ( c < d ) {
					d = c;
					best = id;
				}
			} );
			const t = target( best );
			if ( t ) {
				st.tx = t.x;
				st.tw = t.w;
				kick();
			}
			if ( best !== active || best === 'all' ) {
				choose( best );
			}
			// Swallow the click that follows a drag.
			const stop = ( ce ) => {
				ce.stopPropagation();
				ce.preventDefault();
			};
			window.addEventListener( 'click', stop, { capture: true, once: true } );
			setTimeout( () => window.removeEventListener( 'click', stop, { capture: true } ), 50 );
		};
		window.addEventListener( 'pointermove', move );
		window.addEventListener( 'pointerup', up );
	};

	const tap = ( id ) => {
		sim.current.press = 1;
		kick();
		choose( id );
	};

	return (
		<nav className="cpNav" aria-label="Filter the profile by category">
			<div className="cpNav_track" ref={ bar } onPointerDown={ onDown }>
				<span ref={ pill } className={ `cpNav_pill${ filter === 'all' ? '' : ' is-chosen' }` } aria-hidden="true" />
				<button type="button" data-id="all" className={ active === 'all' ? 'is-on' : undefined } aria-pressed={ filter === 'all' } onClick={ () => tap( 'all' ) }>All</button>
				{ cats.map( ( [ id, name ] ) => (
					<button type="button" key={ id } data-id={ id } className={ active === id ? 'is-on' : undefined }
						aria-pressed={ filter === id } onClick={ () => tap( id ) }>{ name }</button>
				) ) }
			</div>
		</nav>
	);
}

/*
 * Presenter bar: slide number, section name, progress, prev/next, and the
 * keyboard (arrows, Page Up/Down, Space). Slide positions are measured in
 * normal flow (stacked slides are sticky), and re-measured as the page settles.
 */
export function DeckHud( { root, deck, cats = [], filter = 'all', onFilter } ) {
	const [ state, setState ] = useState( { i: 0, n: 1, label: '', cat: '' } );
	const tops = useRef( [] );
	const slides = useRef( [] );

	const measure = useCallback( () => {
		// Slides hidden by the category filter are skipped.
		const list = root.current ? [ ...root.current.querySelectorAll( ':scope > section, :scope > header' ) ]
			.filter( ( el ) => el.offsetParent !== null || el.getClientRects().length ) : [];
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
			setState( { i, n: slides.current.length, label: slides.current[ i ]?.dataset.slide || 'Cover', cat: slides.current[ i ]?.dataset.cat || '' } );
		};
		const onScroll = () => {
			if ( ! raf ) {
				raf = requestAnimationFrame( update );
			}
		};
		const onKey = ( e ) => {
			if ( e.target.closest?.( 'input, textarea, select, [contenteditable], video' ) || document.body.classList.contains( 'menu-open' ) ) {
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
	}, [ root, measure, current, go, deck?.enabled, filter ] );

	const { i, n, label, cat } = deck?.enabled ? deck : state;
	// Under 'All' the bar lights the chapter you are in; filtered, the chosen one.
	const lit = filter === 'all' ? cat : filter;
	const move = ( d ) => ( deck?.enabled ? deck.step( d ) : go( d ) );
	// Portalled to <body>: inside the page it would join the section stack.
	return createPortal(
		<>
		<CategoryNav cats={ cats } filter={ filter } lit={ lit } onFilter={ onFilter } />
		<nav className={ `cpHud${ deck?.enabled ? ' cpHud--present' : '' }` } aria-label="Presentation">
			<span className="cpHud_bar" aria-hidden="true"><i style={ { transform: `scaleX(${ n > 1 ? i / ( n - 1 ) : 0 })` } } /></span>
			<span className="cpHud_brand">VS+ <em>Corporate Profile 2026</em></span>
			<span className="cpHud_label" aria-live="polite">{ label }</span>
			<span className="cpHud_count"><b>{ pad( i + 1 ) }</b> / { pad( n ) }</span>
			<span className="cpHud_btns">
				<button type="button" onClick={ () => move( -1 ) } disabled={ i === 0 } aria-label="Previous slide">←</button>
				<button type="button" onClick={ () => move( 1 ) } disabled={ i >= n - 1 } aria-label="Next slide">→</button>
			</span>
		</nav>
		</>,
		document.body
	);
}
