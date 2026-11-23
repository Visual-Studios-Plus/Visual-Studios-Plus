import { useLayoutEffect, useRef } from 'react';
import media from '../../data/caseMedia.js';
import { gsap, reduced, canHover, pad, slugify } from '../../lib/motion.js';

/*
 * Case story slides: each campaign's hero slide from the corporate profile,
 * rebuilt as a full-screen slide in the deck's own idiom — the brand's colour,
 * the brand name stacked in giant rows (solid / outlined) behind a collage,
 * and the copy — followed in the page by its gallery slides.
 *
 *   - the stacked rows slide in alternate directions with the scroll
 *   - the lead frame unveils, the floating frames and cut-outs pop in and then
 *     drift at their own depth (data-speed) as the page moves
 *   - the pointer tilts the collage, cut-outs most
 *   - the copy rises line by line; the result counts up (via useReveals)
 *
 * Touch screens keep the entrances but skip the scrubbed motion, as the rest
 * of the site does; reduced motion gets the static layout.
 */

export const storyImg = ( name ) => `/assets/profile/${ name.replace( /\*$/, '' ) }.webp`;
export const isCut = ( name ) => name.endsWith( '*' );
export const storyId = ( s ) => `story-${ slugify( s.word ) }-${ slugify( s.title ).slice( 0, 24 ) }`;

/* Where the floating frames sit around the lead, and how deep each one is. */
const SLOTS = [
	{ cls: 'a', speed: 1.4, rot: -7 },
	{ cls: 'b', speed: -1.1, rot: 6 },
	{ cls: 'c', speed: 0.8, rot: -4 }
];

function Mark( { client, title } ) {
	const m = media[ title ];
	if ( m?.tile ) {
		return <span className="cpStory_mark cpStory_mark--tile"><img src={ m.tile } alt={ `${ client } logo` } loading="lazy" decoding="async" /></span>;
	}
	if ( m?.mark ) {
		return <span className={ `cpStory_mark${ m.dark ? ' is-dark' : '' }` }><img src={ m.mark } alt={ `${ client } logo` } loading="lazy" decoding="async" /></span>;
	}
	return null;
}

/* One hero slide. Branding projects use the deck's white slide and yellow swoosh. */
export function Story( { s, n, total, flip, label } ) {
	const stage = useRef( null );
	const [ lead, ...floats ] = s.imgs;
	const brand = s.type === 'Branding Project';
	const row = Array.from( { length: 5 }, () => s.word );

	const onMove = ( e ) => {
		if ( reduced || ! canHover || ! stage.current ) {
			return;
		}
		const r = stage.current.getBoundingClientRect();
		stage.current.style.setProperty( '--mx', ( ( e.clientX - r.left ) / r.width - 0.5 ).toFixed( 3 ) );
		stage.current.style.setProperty( '--my', ( ( e.clientY - r.top ) / r.height - 0.5 ).toFixed( 3 ) );
	};
	const onLeave = () => {
		stage.current?.style.setProperty( '--mx', 0 );
		stage.current?.style.setProperty( '--my', 0 );
	};

	return (
		<section className={ `cpSlide cpStory${ flip ? ' cpStory--flip' : '' }${ brand ? ' cpStory--brand' : '' }` } id={ storyId( s ) }
			data-slide={ label } style={ { '--accent': s.accent, '--bg': s.bg, '--ink': s.ink, '--word': s.wordColor } }
			aria-labelledby={ `${ storyId( s ) }-t` }>
			{ brand ? (
				<svg className="cpStory_swoosh" viewBox="0 0 400 400" aria-hidden="true">
					<path d="M60 -20 C 40 160, 120 330, 300 330 C 400 330, 420 200, 330 150" fill="none" stroke="currentColor" strokeWidth="34" strokeLinecap="round" />
				</svg>
			) : (
				<div className="cpStory_marquee" aria-hidden="true">
					{ [ 0, 1, 2, 3 ].map( ( r ) => (
						<div key={ r } className={ `cpStory_row${ r % 2 ? ' cpStory_row--out' : '' }` } data-dir={ r % 2 ? -1 : 1 }>
							{ row.map( ( w, i ) => <span key={ i }>{ w }</span> ) }
						</div>
					) ) }
				</div>
			) }

			<div className="cpStory_grid">
				<div className="cpStory_stage" ref={ stage } onMouseMove={ onMove } onMouseLeave={ onLeave }>
					<div className="cpStory_layer" data-speed="0.35">
						<figure className={ `cpStory_lead${ isCut( lead ) ? ' is-cut' : '' }` } style={ { '--d': 0.4 } }>
							<img src={ storyImg( lead ) } alt={ `${ s.client } — ${ s.title }` } loading="lazy" decoding="async" />
						</figure>
					</div>
					{ floats.slice( 0, 3 ).map( ( f, i ) => (
						<div key={ f } className={ `cpStory_layer cpStory_layer--${ SLOTS[ i ].cls }` } data-speed={ SLOTS[ i ].speed }>
							<figure className={ `cpStory_float${ isCut( f ) ? ' is-cut' : '' }` }
								style={ { '--r': `${ SLOTS[ i ].rot }deg`, '--d': isCut( f ) ? 1.6 : 1 } }>
								<img src={ storyImg( f ) } alt="" loading="lazy" decoding="async" />
							</figure>
						</div>
					) ) }
				</div>

				<div className="cpStory_copy">
					<p className="cpStory_idx"><b>{ pad( n ) }</b> / { pad( total ) } <span>·</span> { s.type } <span>·</span> { s.year }</p>
					<div className="cpStory_brand">
						<Mark client={ s.client } title={ s.title } />
						<p className="cpStory_client">{ s.client }</p>
					</div>
					<h3 className="cpStory_title" id={ `${ storyId( s ) }-t` }>{ s.title }</h3>
					<p className="cpStory_text">{ s.text }</p>
					<ul className="pillList cpStory_tags">{ s.tags.map( ( t ) => <li key={ t }>{ t }</li> ) }</ul>
					{ s.metric && (
						<div className="cpStory_metric">
							<p className="resultNum" data-count={ s.metric }>{ s.metric }</p>
							<p className="cpStory_metricLabel">{ s.label }</p>
						</div>
					) }
					{ s.note && <p className="cpStory_note">* { s.note }</p> }
				</div>
			</div>
		</section>
	);
}

/* A story slide's build: lead unveils, floats pop in, copy and rows rise. */
function build( story ) {
	const tl = gsap.timeline();
	const lead = story.querySelector( '.cpStory_lead' );
	if ( lead.classList.contains( 'is-cut' ) ) {
		tl.from( lead, { scale: 0.7, opacity: 0, y: 60, duration: 1.3, ease: 'expo.out' } );
	} else {
		tl.fromTo( lead, { clipPath: 'inset(100% 0% 0% 0% round 1rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 1rem)', duration: 1.3, ease: 'expo.inOut', clearProps: 'clipPath' } )
			.from( lead.querySelector( 'img' ), { scale: 1.25, duration: 1.6, ease: 'expo.out' }, '<0.15' );
	}
	tl.from( story.querySelectorAll( '.cpStory_float' ), {
		scale: 0.4, opacity: 0, rotate: ( i ) => ( i % 2 ? 22 : -22 ), y: 80,
		duration: 1.1, ease: 'back.out(1.7)', stagger: 0.12
	}, 0.35 )
		.from( story.querySelectorAll( '.cpStory_copy > *' ), { y: 34, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06 }, 0.2 )
		.from( story.querySelectorAll( '.cpStory_row' ), { xPercent: ( i ) => ( i % 2 ? 12 : -12 ), opacity: 0, duration: 1.4, ease: 'expo.out', stagger: 0.08 }, 0 );
	const sw = story.querySelector( '.cpStory_swoosh path' );
	if ( sw ) {
		const len = sw.getTotalLength();
		tl.fromTo( sw, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.8, ease: 'expo.inOut' }, 0 );
	}
	return tl;
}

/*
 * Motion for every story slide inside `root`. In presentation mode each slide
 * builds on arrival (and again on every return) and its brand rows drift while
 * it is up; otherwise the build plays as it scrolls in and the rows and layers
 * are scrubbed by the scroll.
 */
export function useStoryMotion( root, present = false ) {
	useLayoutEffect( () => {
		if ( reduced || ! root.current ) {
			return undefined;
		}
		const stories = [ ...root.current.querySelectorAll( '.cpStory' ) ];

		if ( present ) {
			const offs = stories.map( ( story ) => {
				let tl = null;
				let drift = [];
				const enter = () => {
					tl?.progress( 1 ).kill();
					tl = build( story );
					drift = [ ...story.querySelectorAll( '.cpStory_row' ) ].map( ( r ) => {
						const dir = Number( r.dataset.dir );
						return gsap.fromTo( r, { xPercent: dir > 0 ? 0 : -16 }, { xPercent: dir > 0 ? -16 : 0, duration: 26, ease: 'none', repeat: -1, yoyo: true } );
					} );
				};
				const leave = () => {
					drift.forEach( ( d ) => d.kill() );
					drift = [];
				};
				story.addEventListener( 'deck:enter', enter );
				story.addEventListener( 'deck:leave', leave );
				return () => {
					story.removeEventListener( 'deck:enter', enter );
					story.removeEventListener( 'deck:leave', leave );
					leave();
					tl?.kill();
				};
			} );
			return () => offs.forEach( ( off ) => off() );
		}

		const ctx = gsap.context( () => {
			stories.forEach( ( story ) => {
				const tl = build( story );
				tl.pause();
				gsap.timeline( { scrollTrigger: { trigger: story, start: 'top 70%', once: true, onEnter: () => tl.play() } } );
				if ( ! canHover ) {
					return;
				}
				const scrub = { trigger: story, start: 'top bottom', end: 'bottom top', scrub: 0.6 };
				story.querySelectorAll( '.cpStory_row' ).forEach( ( r ) => {
					const dir = Number( r.dataset.dir );
					gsap.fromTo( r, { xPercent: dir > 0 ? 0 : -18 }, { xPercent: dir > 0 ? -18 : 0, ease: 'none', scrollTrigger: scrub } );
				} );
				story.querySelectorAll( '.cpStory_layer' ).forEach( ( layer ) => {
					const sp = Number( layer.dataset.speed );
					gsap.fromTo( layer, { yPercent: sp * 12 }, { yPercent: -sp * 12, ease: 'none', scrollTrigger: scrub } );
				} );
			} );
		}, root );
		return () => ctx.revert();
	}, [ present ] ); // eslint-disable-line react-hooks/exhaustive-deps
}
