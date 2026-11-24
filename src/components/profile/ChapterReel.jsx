import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap, reduced, canHover } from '../../lib/motion.js';

/*
 * Chapter reel — a 3D camera fly-through (after the "motion graphics" web
 * reference): the chapter's video card sits in the middle of a composition
 * of brand logos, campaign frames and a pill, each at its own depth. As you scroll the camera pushes in: the
 * foreground swells, blurs and flies past, until the video fills the screen
 * with the chapter title on it.
 *
 * Desktop: a sticky stage inside a tall wrapper, scrubbed by the scroll.
 * Touch / reduced motion: the assembled composition, no fly-through.
 * The video gets its source only near the screen and plays only on it.
 */

const PERSPECTIVE = 1000;
const END_Z = 600; // the video card (z 0) fills the viewport here

/* Layer layout: x/y offsets from centre (vw/vh), depth (px), width (vw). */
const LAYOUT = {
	markA: { x: -27, y: -19, z: 260, w: 7.5 },
	cardB: { x: 25, y: -21, z: -180, w: 15 },
	cardC: { x: -25, y: 21, z: 140, w: 12.5 },
	cardD: { x: 23, y: 23, z: 430, w: 10 },
	pill: { x: 13, y: 18, z: 300 },
	markE: { x: 31, y: 2, z: -320, w: 5.5 }
};

const place = ( k ) => {
	const l = LAYOUT[ k ];
	return {
		'--x': `${ l.x }vw`, '--y': `${ l.y }vh`, '--z': `${ l.z }px`,
		...( l.w ? { '--w': `${ l.w }vw` } : {} )
	};
};

export default function ChapterReel( { video, still, label, kicker, count, cards = [], marks = [], accent, present = false } ) {
	const root = useRef( null );
	const vid = useRef( null );

	// Lazy source; play only while visible.
	useEffect( () => {
		const v = vid.current;
		if ( ! v ) {
			return undefined;
		}
		const load = () => {
			if ( ! v.getAttribute( 'src' ) ) {
				v.src = video;
				v.load();
			}
		};
		const ready = () => v.classList.add( 'is-playing' );
		v.addEventListener( 'playing', ready );

		// Presentation mode: the slide says when it is up.
		if ( present ) {
			const slide = root.current.closest( 'section' );
			const enter = () => {
				load();
				v.play().catch( () => {} );
			};
			const leave = () => v.pause();
			slide.addEventListener( 'deck:enter', enter );
			slide.addEventListener( 'deck:leave', leave );
			return () => {
				slide.removeEventListener( 'deck:enter', enter );
				slide.removeEventListener( 'deck:leave', leave );
				v.removeEventListener( 'playing', ready );
				v.pause();
			};
		}

		const near = new IntersectionObserver( ( [ e ] ) => e.isIntersecting && load(), { rootMargin: '900px 0px' } );
		const onScreen = new IntersectionObserver( ( [ e ] ) => {
			if ( e.isIntersecting ) {
				load();
				if ( ! reduced ) {
					v.play().catch( () => {} );
				}
			} else {
				v.pause();
			}
		}, { threshold: 0.1 } );
		near.observe( root.current );
		onScreen.observe( v );
		return () => {
			near.disconnect();
			onScreen.disconnect();
			v.removeEventListener( 'playing', ready );
			v.pause();
		};
	}, [ video, present ] );

	// The fly-through.
	useLayoutEffect( () => {
		if ( reduced || ! canHover || ! root.current ) {
			return undefined;
		}
		const el = root.current;
		// Projected by hand (no preserve-3d): Chrome mis-sorts blurred layers in a
		// 3D context, so each piece gets its own perspective scale and stacking.
		const pieces = [ ...el.querySelectorAll( '[data-k]' ) ].map( ( n ) => ( { n, ...( LAYOUT[ n.dataset.k ] || { x: 0, y: 0, z: 0 } ), card: n.dataset.k === 'card' } ) );
		const title = el.querySelector( '.cpDolly_cardOver' );
		const cam = { z: -150 };

		const apply = () => {
			pieces.forEach( ( { n, x, y, z, card } ) => {
				const eff = z + cam.z;
				const gone = eff > PERSPECTIVE - 120;
				const sc = gone ? 1 : PERSPECTIVE / ( PERSPECTIVE - eff );
				n.style.transform = `translate(-50%, -50%) translate(${ ( x * sc ).toFixed( 2 ) }vw, ${ ( y * sc ).toFixed( 2 ) }vh) scale(${ sc.toFixed( 4 ) })`;
				n.style.zIndex = String( 1000 + Math.round( eff ) );
				if ( card ) {
					// Corners shrink back as the card grows, so it lands square-edged.
					n.style.borderRadius = `${ ( 14 / sc / sc ).toFixed( 1 ) }px`;
					return;
				}
				// Depth of field: sharp near the card, soft far behind, very soft rushing past.
				const blur = eff > 330 ? Math.min( 16, ( eff - 330 ) / 30 ) : eff < -260 ? 2.5 : 0;
				const op = gone || eff > 860 ? 0 : eff > 690 ? 1 - ( eff - 690 ) / 170 : 1;
				n.style.filter = blur ? `blur(${ blur.toFixed( 1 ) }px)` : '';
				n.style.opacity = op;
				n.style.visibility = op <= 0 ? 'hidden' : '';
			} );
			const t = gsap.utils.clamp( 0, 1, ( cam.z - 380 ) / 200 );
			title.style.opacity = t;
			title.style.transform = `translateY(${ ( 1 - t ) * 24 }px)`;
		};

		// Presentation mode: the camera pushes in as the slide arrives.
		if ( present ) {
			const slide = el.closest( 'section' );
			let tw = null;
			const enter = () => {
				tw?.kill();
				cam.z = -150;
				apply();
				tw = gsap.to( cam, { z: END_Z, duration: 3.4, delay: 0.7, ease: 'power2.inOut', onUpdate: apply } );
			};
			const leave = () => {
				tw?.kill();
				cam.z = -150;
				apply();
			};
			apply();
			slide.addEventListener( 'deck:enter', enter );
			slide.addEventListener( 'deck:leave', leave );
			return () => {
				slide.removeEventListener( 'deck:enter', enter );
				slide.removeEventListener( 'deck:leave', leave );
				tw?.kill();
			};
		}

		const ctx = gsap.context( () => {
			apply();
			gsap.to( cam, {
				z: END_Z, ease: 'power1.inOut', onUpdate: apply,
				scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.9 }
			} );
		}, el );
		return () => ctx.revert();
	}, [ present ] );

	const [ b, c, d ] = cards;
	const [ ma, me ] = marks;

	return (
		<div className={ `cpDolly${ present ? ' cpDolly--present' : '' }` } ref={ root } style={ { '--accent': accent } }>
			<div className="cpDolly_stage">
				<div className="cpDolly_world">
					{ b && <figure className="cpDolly_layer cpDolly_img" data-k="cardB" style={ place( 'cardB' ) }><img src={ b } alt="" loading="lazy" decoding="async" /></figure> }
					{ me && <span className="cpDolly_layer cpDolly_mark cpDolly_mark--light" data-k="markE" style={ place( 'markE' ) }><img src={ me } alt="" loading="lazy" decoding="async" /></span> }

					<div className="cpDolly_card" data-k="card">
						<img className="cpDolly_media cpDolly_still" src={ still } alt="" aria-hidden="true" loading="lazy" decoding="async" />
						<video ref={ vid } className="cpDolly_media cpDolly_video" muted loop playsInline preload="none" aria-label={ `${ label } — reel` } />
						<span className="cpDolly_shade" aria-hidden="true" />
						<div className="cpDolly_cardOver">
							<p className="cpDolly_word">{ label }</p>
							<p className="cpDolly_kicker">{ kicker }</p>
						</div>
					</div>

					{ c && <figure className="cpDolly_layer cpDolly_img" data-k="cardC" style={ place( 'cardC' ) }><img src={ c } alt="" loading="lazy" decoding="async" /></figure> }
					{ ma && <span className="cpDolly_layer cpDolly_mark" data-k="markA" style={ place( 'markA' ) }><img src={ ma } alt="" loading="lazy" decoding="async" /></span> }
					<span className="cpDolly_layer cpDolly_pill" data-k="pill" style={ place( 'pill' ) }>{ count } { count === 1 ? 'project' : 'projects' }</span>
					{ d && <figure className="cpDolly_layer cpDolly_img" data-k="cardD" style={ place( 'cardD' ) }><img src={ d } alt="" loading="lazy" decoding="async" /></figure> }
				</div>
			</div>
		</div>
	);
}
