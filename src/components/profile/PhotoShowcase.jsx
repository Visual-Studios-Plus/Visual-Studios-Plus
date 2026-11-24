import { useEffect, useRef, useState } from 'react';
import { gsap, pad, reduced, canHover } from '../../lib/motion.js';

/*
 * Premium, interactive photography slides for the Corporate Profile:
 *
 *   Ring  — a 3D gallery in the round: photographs stand on a slowly
 *           turning ring; drag to spin it (with momentum), the front one
 *           comes forward, a click opens it.
 *   Loupe — an exhibition accordion: tall panels open on hover/tap, and a
 *           jeweller's loupe follows the cursor over the open photograph,
 *           magnifying the full-resolution file.
 *   Wall  — a gallery wall: prints at their own proportions along one long
 *           wall; drag to walk it with momentum, each print drifting in its
 *           frame.
 *   Brut  — a brutalist, minimal grid for food: hairline rules, mono
 *           numbers, a heavy word; dishes wipe in and zoom on hover.
 *
 * Each receives `active` (its slide is showing) so motion runs only then.
 */

/* ---------- Ring ---------- */

export function Ring( { media, open, active } ) {
	const n = media.length;
	const ring = useRef( null );
	const st = useRef( { a: 0, v: 0, drag: false, moved: false, raf: 0 } );
	const [ front, setFront ] = useState( 0 );
	const step = 360 / n;

	useEffect( () => {
		const el = ring.current;
		if ( ! el ) {
			return undefined;
		}
		const items = [ ...el.children ];
		let last = performance.now();
		let lastFront = -1;
		const s = st.current;
		const tick = ( now ) => {
			const dt = Math.min( 0.05, ( now - last ) / 1000 );
			last = now;
			if ( ! s.drag ) {
				// Momentum decays into a slow idle turn.
				const idle = active && ! reduced ? -6 : 0;
				s.v += ( idle - s.v ) * Math.min( 1, dt * 1.6 );
				s.a += s.v * dt;
			}
			el.style.transform = `translateZ(calc(var(--r) * -1)) rotateY(${ s.a }deg)`;
			let best = 0;
			let bestF = -2;
			items.forEach( ( it, i ) => {
				const d = ( ( i * step + s.a ) % 360 + 360 ) % 360;
				const f = Math.cos( ( d * Math.PI ) / 180 ); // 1 facing, -1 behind
				it.style.setProperty( '--f', ( ( f + 1 ) / 2 ).toFixed( 3 ) );
				if ( f > bestF ) {
					bestF = f;
					best = i;
				}
			} );
			if ( best !== lastFront ) {
				lastFront = best;
				setFront( best );
			}
			// Keep turning only while the slide is up, or while it still has momentum.
			s.raf = active || s.drag || Math.abs( s.v ) > 0.5 ? requestAnimationFrame( tick ) : 0;
		};
		s.kick = () => {
			if ( ! s.raf ) {
				last = performance.now();
				s.raf = requestAnimationFrame( tick );
			}
		};
		s.raf = requestAnimationFrame( tick );
		return () => {
			cancelAnimationFrame( s.raf );
			s.raf = 0;
		};
	}, [ active, step ] );

	const onDown = ( e ) => {
		const s = st.current;
		const x0 = e.clientX;
		let lx = x0;
		let lt = performance.now();
		s.drag = true;
		s.moved = false;
		s.kick?.();
		const move = ( ev ) => {
			const now = performance.now();
			const dx = ev.clientX - lx;
			if ( Math.abs( ev.clientX - x0 ) > 5 ) {
				s.moved = true;
			}
			s.a += dx * 0.28;
			s.v = ( dx * 0.28 ) / Math.max( 0.008, ( now - lt ) / 1000 );
			lx = ev.clientX;
			lt = now;
		};
		const up = () => {
			s.drag = false;
			s.v = Math.max( -400, Math.min( 400, s.v ) );
			window.removeEventListener( 'pointermove', move );
			window.removeEventListener( 'pointerup', up );
		};
		window.addEventListener( 'pointermove', move );
		window.addEventListener( 'pointerup', up );
	};

	// Brings a photograph round to the front.
	const face = ( i ) => {
		const s = st.current;
		const target = -i * step;
		const cur = s.a;
		const delta = ( ( ( target - cur ) % 360 ) + 540 ) % 360 - 180;
		s.v = 0;
		s.kick?.();
		gsap.to( s, { a: cur + delta, duration: 1.1, ease: 'expo.out', onStart: () => ( s.drag = true ), onComplete: () => ( s.drag = false ) } );
	};

	const click = ( i ) => {
		if ( st.current.moved ) {
			return;
		}
		if ( i === front ) {
			open( i );
		} else {
			face( i );
		}
	};

	return (
		<div className="phRing">
			<div className="phRing_stage" onPointerDown={ onDown } style={ { '--n': n } }>
				<div className="phRing_ring" ref={ ring }>
					{ media.map( ( m, i ) => (
						<button type="button" key={ m.src } className={ `phRing_item${ i === front ? ' is-front' : '' }` }
							style={ { '--a': `${ i * step }deg`, '--i': i } } onClick={ () => click( i ) }
							aria-label={ i === front ? `Open photograph ${ i + 1 }` : `Turn to photograph ${ i + 1 }` }>
							<img src={ m.src } alt="" loading="lazy" decoding="async" draggable="false" />
						</button>
					) ) }
				</div>
				<span className="phRing_floor" aria-hidden="true" />
			</div>
			<div className="phRing_bar">
				<button type="button" onClick={ () => face( ( front - 1 + n ) % n ) } aria-label="Previous photograph">←</button>
				<p><b>{ pad( front + 1 ) }</b> / { pad( n ) }</p>
				<button type="button" onClick={ () => face( ( front + 1 ) % n ) } aria-label="Next photograph">→</button>
			</div>
		</div>
	);
}

/* ---------- Loupe ---------- */

const ZOOM = 2.6;

export function Loupe( { media, open } ) {
	const [ at, setAt ] = useState( 0 );
	const lens = useRef( null );

	const onMove = ( e, m ) => {
		const l = lens.current;
		if ( ! l || ! canHover || reduced ) {
			return;
		}
		const box = e.currentTarget.getBoundingClientRect();
		const mx = e.clientX - box.left;
		const my = e.clientY - box.top;
		// Where the photo actually sits inside the panel (object-fit: cover).
		const sc = Math.max( box.width / m.w, box.height / m.h );
		const w = m.w * sc;
		const h = m.h * sc;
		const ox = ( box.width - w ) / 2;
		const oy = ( box.height - h ) / 2;
		const R = l.offsetWidth / 2;
		l.style.opacity = '1';
		l.style.transform = `translate(${ mx - R }px, ${ my - R }px)`;
		l.style.backgroundImage = `url(${ m.full || m.src })`;
		l.style.backgroundSize = `${ w * ZOOM }px ${ h * ZOOM }px`;
		l.style.backgroundPosition = `${ -( ( mx - ox ) * ZOOM - R ) }px ${ -( ( my - oy ) * ZOOM - R ) }px`;
	};
	const hide = () => {
		if ( lens.current ) {
			lens.current.style.opacity = '0';
		}
	};

	return (
		<div className="phLoupe" onMouseLeave={ hide }>
			{ media.map( ( m, i ) => (
				<div key={ m.src } className={ `phLoupe_panel${ i === at ? ' is-open' : '' }` } style={ { '--i': i } }
					onMouseEnter={ () => setAt( i ) } onFocus={ () => setAt( i ) }>
					<button type="button" className="phLoupe_btn" onClick={ () => ( i === at ? open( i ) : setAt( i ) ) }
						onMouseMove={ i === at ? ( e ) => onMove( e, m ) : undefined } onMouseLeave={ hide }
						aria-label={ i === at ? `Open photograph ${ i + 1 }` : `Show photograph ${ i + 1 }` }>
						<img src={ m.src } alt="" loading="lazy" decoding="async" />
						<span className="phLoupe_no" aria-hidden="true">{ pad( i + 1 ) }</span>
						{ i === at && <span className="phLoupe_lens" ref={ lens } aria-hidden="true" /> }
					</button>
				</div>
			) ) }
		</div>
	);
}

/* ---------- Wall ---------- */

/*
 * A gallery wall: photographs hung at their own proportions and alternating
 * heights along one long wall. Drag (or swipe, or scroll sideways) to walk
 * it, with momentum and soft ends; each print drifts inside its frame as it
 * passes, frames lift on hover, a line shows where you are, a click opens.
 */
export function Wall( { media, open, active } ) {
	const view = useRef( null );
	const track = useRef( null );
	const st = useRef( { x: 0, v: 0, drag: false, moved: false, raf: 0 } );
	const [ prog, setProg ] = useState( 0 );

	const limits = () => {
		const vw = view.current?.clientWidth || 0;
		const tw = track.current?.scrollWidth || 0;
		return Math.min( 0, vw - tw );
	};

	const render = () => {
		const s = st.current;
		const t = track.current;
		const v = view.current;
		if ( ! t || ! v ) {
			return;
		}
		t.style.transform = `translate3d(${ s.x.toFixed( 1 ) }px, 0, 0)`;
		const mid = v.clientWidth / 2;
		[ ...t.children ].forEach( ( el ) => {
			const c = el.offsetLeft + el.offsetWidth / 2 + s.x - mid;
			el.style.setProperty( '--px', `${ ( -c * 0.06 ).toFixed( 1 ) }px` );
		} );
		const min = limits();
		setProg( min ? s.x / min : 0 );
	};

	const run = () => {
		const s = st.current;
		if ( s.raf ) {
			return;
		}
		let last = performance.now();
		const tick = ( now ) => {
			const dt = Math.min( 0.04, ( now - last ) / 1000 );
			last = now;
			const min = limits();
			if ( ! s.drag ) {
				s.x += s.v * dt;
				s.v *= Math.pow( 0.04, dt ); // friction
				// Soft ends: pulled back when past either end.
				if ( s.x > 0 ) {
					s.x += ( 0 - s.x ) * Math.min( 1, dt * 10 );
					s.v *= 0.8;
				} else if ( s.x < min ) {
					s.x += ( min - s.x ) * Math.min( 1, dt * 10 );
					s.v *= 0.8;
				}
			}
			render();
			const still = ! s.drag && Math.abs( s.v ) < 4 && s.x <= 0.5 && s.x >= min - 0.5;
			s.raf = still ? 0 : requestAnimationFrame( tick );
		};
		s.raf = requestAnimationFrame( tick );
	};

	useEffect( () => {
		render();
		const onResize = () => render();
		window.addEventListener( 'resize', onResize );
		return () => {
			window.removeEventListener( 'resize', onResize );
			cancelAnimationFrame( st.current.raf );
			st.current.raf = 0;
		};
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Back to the start of the wall whenever the slide comes round again.
	useEffect( () => {
		if ( ! active ) {
			st.current.x = 0;
			st.current.v = 0;
			render();
		}
	}, [ active ] ); // eslint-disable-line react-hooks/exhaustive-deps

	const onDown = ( e ) => {
		if ( e.button > 0 ) {
			return;
		}
		const s = st.current;
		const x0 = e.clientX;
		const sx = s.x;
		let lx = x0;
		let lt = performance.now();
		s.drag = true;
		s.moved = false;
		s.v = 0;
		run();
		const min = limits();
		const move = ( ev ) => {
			const now = performance.now();
			if ( Math.abs( ev.clientX - x0 ) > 5 ) {
				s.moved = true;
			}
			let x = sx + ( ev.clientX - x0 );
			// Resistance past the ends.
			if ( x > 0 ) {
				x *= 0.35;
			} else if ( x < min ) {
				x = min + ( x - min ) * 0.35;
			}
			s.x = x;
			s.v = ( ev.clientX - lx ) / Math.max( 0.008, ( now - lt ) / 1000 );
			lx = ev.clientX;
			lt = now;
		};
		const up = () => {
			s.drag = false;
			window.removeEventListener( 'pointermove', move );
			window.removeEventListener( 'pointerup', up );
		};
		window.addEventListener( 'pointermove', move );
		window.addEventListener( 'pointerup', up );
	};

	// A sideways trackpad scroll walks the wall too.
	const onWheel = ( e ) => {
		if ( Math.abs( e.deltaX ) <= Math.abs( e.deltaY ) ) {
			return;
		}
		e.stopPropagation();
		const s = st.current;
		s.x = Math.max( limits() - 40, Math.min( 40, s.x - e.deltaX ) );
		s.v = 0;
		run();
	};

	const step = ( d ) => {
		const s = st.current;
		s.v = 0;
		const w = view.current.clientWidth * 0.6;
		const to = Math.max( limits(), Math.min( 0, s.x - d * w ) );
		s.drag = true;
		gsap.to( s, { x: to, duration: 1, ease: 'expo.out', onUpdate: render, onComplete: () => ( s.drag = false ) } );
	};

	return (
		<div className="phWall">
			<div className="phWall_view" ref={ view } onPointerDown={ onDown } onWheel={ onWheel }>
				<div className="phWall_track" ref={ track }>
					{ media.map( ( m, i ) => (
						<button type="button" key={ m.src } className={ `phWall_frame${ i % 2 ? ' is-short' : '' }` }
							style={ { '--ar': m.w / m.h, '--i': i } }
							onClick={ () => ! st.current.moved && open( i ) } aria-label={ `Open photograph ${ i + 1 }` }>
							<span className="phWall_img"><img src={ m.src } alt="" loading="lazy" decoding="async" draggable="false" /></span>
							<span className="phWall_no">{ pad( i + 1 ) }</span>
						</button>
					) ) }
				</div>
			</div>
			<div className="phWall_bar">
				<button type="button" onClick={ () => step( -1 ) } aria-label="Back along the wall">←</button>
				<span className="phWall_line" aria-hidden="true"><i style={ { transform: `scaleX(${ Math.max( 0.04, prog ).toFixed( 3 ) })` } } /></span>
				<button type="button" onClick={ () => step( 1 ) } aria-label="Further along the wall">→</button>
			</div>
		</div>
	);
}

/* ---------- Brut ---------- */

/*
 * A brutalist, minimal grid for food: hairline rules, square corners, mono
 * index numbers and one heavy word. The first dish is a large feature; the
 * rules draw in and the photographs wipe in cell by cell; on hover a dish
 * zooms and its label bar turns solid. A click opens it.
 */
export function Brut( { media, open, title = 'Food' } ) {
	const [ lead, ...rest ] = media;
	const cell = ( m, i, cls = '' ) => (
		<button type="button" key={ m.src } className={ `phBrut_cell ${ cls }` } style={ { '--i': i } }
			onClick={ () => open( i ) } aria-label={ `Open photograph ${ i + 1 }` }>
			<span className="phBrut_img"><img src={ m.src } alt="" loading="lazy" decoding="async" /></span>
			<span className="phBrut_bar"><b>{ pad( i + 1 ) }</b> —</span>
		</button>
	);
	return (
		<div className="phBrut">
			{ cell( lead, 0, 'is-lead' ) }
			<div className="phBrut_type" style={ { '--i': 1 } }>
				<p className="phBrut_word">{ title }</p>
				<p className="phBrut_meta"><span>{ pad( media.length ) } plates</span><span>Styled · lit · shot in-house</span></p>
			</div>
			{ rest.map( ( m, k ) => cell( m, k + 1 ) ) }
		</div>
	);
}
