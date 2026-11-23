import { useLayoutEffect, useRef } from 'react';
import media from '../../data/caseMedia.js';
import { gsap, reduced, canHover, pad, slugify } from '../../lib/motion.js';

/*
 * Case stories: one section per campaign from the corporate profile, in the
 * profile's own idiom (the brand name repeated as a giant band of type) and a
 * motion-design collage (direction after layered "motion web" layouts):
 *
 *   - two rows of the brand word slide in opposite directions with the scroll
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

function Story( { s, n, total, flip } ) {
	const stage = useRef( null );
	const [ lead, ...floats ] = s.imgs;
	const words = Array.from( { length: 6 }, () => s.word );

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
		<article className={ `cpStory${ flip ? ' cpStory--flip' : '' }` } id={ storyId( s ) }
			style={ { '--accent': s.accent } } aria-labelledby={ `${ storyId( s ) }-t` }>
			<div className="cpStory_marquee" aria-hidden="true">
				<div className="cpStory_row" data-dir="1">{ words.map( ( w, i ) => <span key={ i }>{ w }<i>✦</i></span> ) }</div>
				<div className="cpStory_row cpStory_row--out" data-dir="-1">{ words.map( ( w, i ) => <span key={ i }>{ w }<i>✦</i></span> ) }</div>
			</div>

			<div className="cpStory_grid">
				<div className="cpStory_stage" ref={ stage } onMouseMove={ onMove } onMouseLeave={ onLeave }>
					<span className="cpStory_glow" aria-hidden="true" />
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
					<p className="cpStory_line">{ s.line }</p>
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
		</article>
	);
}

export default function CaseStories( { stories, start = 1, total } ) {
	const root = useRef( null );

	useLayoutEffect( () => {
		if ( reduced || ! root.current ) {
			return undefined;
		}
		const ctx = gsap.context( () => {
			gsap.utils.toArray( '.cpStory' ).forEach( ( story ) => {
				// Entrance: lead unveils, floats pop in, copy rises.
				const tl = gsap.timeline( { scrollTrigger: { trigger: story, start: 'top 72%', once: true } } );
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
					.from( story.querySelectorAll( '.cpStory_copy > *' ), {
						y: 34, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06
					}, 0.2 );

				if ( ! canHover ) {
					return;
				}
				// Scrubbed: the brand word slides, each layer drifts at its own depth.
				const scrub = { trigger: story, start: 'top bottom', end: 'bottom top', scrub: 0.6 };
				story.querySelectorAll( '.cpStory_row' ).forEach( ( row ) => {
					const dir = Number( row.dataset.dir );
					gsap.fromTo( row, { xPercent: dir > 0 ? 0 : -22 }, { xPercent: dir > 0 ? -22 : 0, ease: 'none', scrollTrigger: scrub } );
				} );
				story.querySelectorAll( '.cpStory_layer' ).forEach( ( layer ) => {
					const sp = Number( layer.dataset.speed );
					gsap.fromTo( layer, { yPercent: sp * 14 }, { yPercent: -sp * 14, ease: 'none', scrollTrigger: scrub } );
				} );
			} );
		}, root );
		return () => ctx.revert();
	}, [ stories ] );

	return (
		<div className="cpStories" ref={ root }>
			{ stories.map( ( s, i ) => <Story key={ s.title } s={ s } n={ start + i } total={ total } flip={ ( start + i ) % 2 === 0 } /> ) }
		</div>
	);
}
