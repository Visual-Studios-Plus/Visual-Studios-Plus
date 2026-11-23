import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin( ScrollTrigger );

export { gsap, ScrollTrigger };

export const reduced = typeof window !== 'undefined' &&
	window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

export const canHover = typeof window !== 'undefined' &&
	window.matchMedia( '(hover: hover)' ).matches;

let lenis = null;

/** One Lenis instance for the whole app, driven by the GSAP ticker so ScrollTrigger stays in sync. */
export function startLenis() {
	if ( lenis || reduced ) {
		return lenis;
	}
	lenis = new Lenis( { lerp: 0.1, smoothWheel: true } );
	lenis.on( 'scroll', ScrollTrigger.update );
	gsap.ticker.add( ( time ) => lenis.raf( time * 1000 ) );
	gsap.ticker.lagSmoothing( 0 );
	return lenis;
}

export function getLenis() {
	return lenis;
}

export function stopScroll() {
	if ( lenis ) {
		lenis.stop();
	}
}

export function startScroll() {
	if ( lenis ) {
		lenis.start();
	}
}

/*
 * Document y of an element. Inside a stacked (sticky) section the on-screen
 * position is wherever the card is frozen, not where it sits in the page, so
 * the card is measured in normal flow for a moment (static ignores its `top`).
 */
function flowTop( el ) {
	const card = el.closest( '.stackCard' );
	if ( ! card ) {
		return el.getBoundingClientRect().top + window.scrollY;
	}
	const prev = card.style.position;
	card.style.position = 'static';
	const y = el.getBoundingClientRect().top + window.scrollY;
	card.style.position = prev;
	return y;
}

/** Scroll to a y position or element, through Lenis when it runs. */
export function scrollToTarget( target, { offset = 0, immediate = false } = {} ) {
	const y = typeof target === 'number' ? target : flowTop( target ) + offset;
	if ( lenis ) {
		lenis.scrollTo( y, { immediate, duration: immediate ? 0 : 1.4, force: true } );
		return;
	}
	window.scrollTo( { top: y, behavior: immediate || reduced ? 'auto' : 'smooth' } );
}

export const pad = ( n ) => String( n ).padStart( 2, '0' );

export const slugify = ( s ) => s.toLowerCase().normalize( 'NFKD' ).replace( /[^\w]+/g, '-' ).replace( /^-|-$/g, '' );

export const thumb = ( f ) => '/assets/photos/thumb/' + f.replace( /\.\w+$/, '.webp' );

/** Card/feature images: film stills and the cover live in /img, everything else is an archive thumb. */
export const imgSrc = ( f ) => ( f.startsWith( 'yt-' ) || f === 'Cover.jpeg' ? '/assets/img/' + f : thumb( f ) );

export const ytThumb = ( id ) => `/assets/img/yt-${ id }.jpg`;

export const ytEmbed = ( id, opts ) =>
	`https://www.youtube-nocookie.com/embed/${ id }?${ opts }&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`;

export function ytCommand( iframe, func ) {
	if ( iframe && iframe.contentWindow ) {
		iframe.contentWindow.postMessage( JSON.stringify( { event: 'command', func, args: '' } ), '*' );
	}
}
