import { useEffect, useRef } from 'react';
import { gsap, reduced, canHover } from '../../lib/motion.js';
import TLink from '../TLink.jsx';

/*
 * Corporate profile cover: a black sheet floating on an electric-blue field,
 * an oversized serif wordmark spilling past its edges, and photographs from
 * the archive pinned around it. The tiles drift against the pointer, so the
 * composition answers the cursor.
 */
const F = ( n ) => `/assets/photos/thumb/${ n }`;

const TILES = [
	{ file: 'Tiesh-7077-1.webp', alt: 'Fashion portrait from a Visual Studios Plus campaign', slot: 'a', rot: -5, depth: 1 },
	{ file: 'KeelesFoodPhotography0403.webp', alt: 'Food photography by Visual Studios Plus', slot: 'b', rot: 4, depth: -0.8 },
	{ file: 'Tiesh-6743-1-2.webp', alt: 'Jewellery campaign still', slot: 'c', rot: 6, depth: 0.9 },
	{ file: 'AAB_5098-1.webp', alt: 'Studio food styling', slot: 'd', rot: -3, depth: -1.1 },
	{ file: 'DSC_5393.webp', alt: 'Jewellery detail photographed by Visual Studios Plus', slot: 'e', rot: -7, depth: 0.7 },
	{ file: 'D85_2304.webp', alt: 'Hospitality interior photographed by Visual Studios Plus', slot: 'f', rot: 5, depth: -0.9 }
];

export default function ProfileCover() {
	const cover = useRef( null );
	const card = useRef( null );

	useEffect( () => {
		if ( reduced ) {
			return undefined;
		}
		const ctx = gsap.context( () => {
			gsap.timeline( { delay: 0.15 } )
				.from( card.current, { y: 46, opacity: 0, scale: 0.985, duration: 1.2, ease: 'expo.out' } )
				.from( '.pfWordmark', { yPercent: 26, opacity: 0, duration: 1.1, ease: 'expo.out' }, 0.25 )
				.from( '.pfTile img', { scale: 0.72, opacity: 0, duration: 1, ease: 'back.out(1.6)', stagger: 0.08, clearProps: 'transform' }, 0.35 )
				.from( '.pfCard_chrome > *, .pfCard_foot > *', { y: 14, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07 }, 0.55 );
		}, cover );
		return () => ctx.revert();
	}, [] );

	const onMove = ( e ) => {
		if ( reduced || ! canHover || ! card.current ) {
			return;
		}
		const r = card.current.getBoundingClientRect();
		const nx = ( e.clientX - r.left ) / r.width - 0.5;
		const ny = ( e.clientY - r.top ) / r.height - 0.5;
		card.current.style.setProperty( '--mx', `${ ( nx * 22 ).toFixed( 2 ) }px` );
		card.current.style.setProperty( '--my', `${ ( ny * 16 ).toFixed( 2 ) }px` );
	};

	return (
		<header className="pfCover" ref={ cover } onMouseMove={ onMove } aria-labelledby="pfCoverTitle">
			<div className="pfCover_inner">
				<div className="pfCard" ref={ card }>
					<div className="pfCard_chrome">
						<TLink className="pfCard_menu" to="#digital" aria-label="Skip to the first chapter">
							<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
						</TLink>
					</div>

					<h1 className="pfWordmark" id="pfCoverTitle">
						<span className="pfWordmark_line">visual studios<span className="pfWordmark_plus">+</span></span>
					</h1>

					<ul className="pfTiles" aria-hidden="true">
						{ TILES.map( ( t ) => (
							<li key={ t.slot } className={ `pfTile pfTile--${ t.slot }` } style={ { '--rot': `${ t.rot }deg`, '--depth': t.depth } }>
								<img src={ F( t.file ) } alt={ t.alt } loading="eager" decoding="async" />
							</li>
						) ) }
					</ul>

					<div className="pfCard_foot">
						<span>Brand · Film · Photography</span>
						<span>Colombo 04, Sri Lanka</span>
					</div>
				</div>
			</div>
		</header>
	);
}
