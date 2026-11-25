import { Fragment, useRef, useState } from 'react';
import data from '../data/site.js';
import media from '../data/caseMedia.js';
import { usePage } from '../context/PageContext.jsx';
import useReveals from '../lib/useReveals.js';
import ProfileCover from '../components/profile/ProfileCover.jsx';
import ChapterReel from '../components/profile/ChapterReel.jsx';
import { Story, useStoryMotion, storyImg, isCut } from '../components/profile/CaseStories.jsx';
import { DeckHello, DeckClosing, DeckHud } from '../components/profile/DeckSlides.jsx';
import BrandCover, { coverFor } from '../components/profile/BrandCover.jsx';
import DeckGallery from '../components/profile/DeckGallery.jsx';
import useDeck, { presentMode } from '../components/profile/useDeck.js';
import STORIES from '../data/profileStories.js';

/*
 * Corporate Profile 2026 — the studio's presentation as one continuous deck.
 *
 * Every slide is a full-screen section, in the PDF's order: cover, Hello and
 * the client wall, then five chapters (Digital case
 * studies, Digital retainers, Branding, TVC, Photography). Each chapter opens
 * with its fly-through reel; each campaign is its hero slide
 * (brand colour, stacked brand name, collage, copy) followed by the deck's own
 * gallery slides. It closes on the wordmark.
 *
 * On desktop it runs as a real presentation (useDeck): one slide at a time,
 * moved by the wheel, keys or presenter bar, each slide building as it
 * arrives. On touch screens the slides stack as you scroll.
 */


/* Every case study joined with its story from the profile, in deck order. */
const ALL = data.caseStudies.map( ( c ) => {
	const st = STORIES.find( ( x ) => c[ 3 ].startsWith( x.match ) );
	const [ type, year, client, title, line, tags, metric, label ] = c;
	return st ? { ...st, type, year, client, title, line, tags, metric, label } : null;
} ).filter( Boolean );

/* A chapter fly-through's pieces: a framed picture per campaign, and logos. */
const dollyCards = ( items ) => items
	.map( ( s ) => s.imgs.slice( 1 ).find( ( n ) => ! isCut( n ) ) || s.imgs.find( ( n ) => ! isCut( n ) ) )
	.filter( Boolean ).slice( 0, 3 ).map( storyImg );
const dollyMarks = ( items ) => items.map( ( s ) => media[ s.title ]?.mark || media[ s.title ]?.tile ).filter( Boolean ).slice( 0, 2 );

/* The deck's five chapters, with their dividers and reels. */
const CHAPTERS = [
	{
		id: 'digital', short: 'Case Studies', no: 1, kind: 'Digital Case Study', label: 'Digital Case Studies',
		figure: 'Tiesh-7224-1-2.webp', reel: '/assets/smm/medium-concept-02.mp4', kicker: 'Real-time content that stops the scroll.'
	},
	{
		id: 'retainers', short: 'Retainers', no: 2, kind: 'Digital Retainer', label: 'Digital Retainers',
		figure: 'KeelesFoodPhotography0314.webp', reel: '/assets/smm/waga-web-03.mp4', kicker: 'Always on. Month after month.'
	},
	{
		id: 'branding', short: 'Branding', no: 3, kind: 'Branding Project', label: 'Branding Projects',
		figure: 'DSC_1643-2.webp', reel: '/assets/projects/dankotuwa.mp4', kicker: 'Identities you can hold.',
		// Wall design (Online Kade) sits after Viva La Vida in the deck.
		extra: { after: 'Viva La Vida', page: 42, caption: 'Wall Design — Online Kade' }
	},
	{
		id: 'tvc', short: 'TVC', no: 4, kind: 'TVC Campaign', label: 'TVC Campaigns',
		figure: 'D85_3829-HDR.webp', reel: '/assets/smm/waga-web-02.mp4', kicker: 'Real craft. Real results.'
	},
	{
		id: 'photography', short: 'Photography', no: 5, kind: 'Commercial Photography', label: 'Photography Projects',
		figure: 'DJI_0078-HDR.webp', reel: '/assets/projects/heritance.mp4', kicker: 'Frames that sell the experience.',
		// The portfolio spreads come before Sapphire Dragon.
		lead: [ [ 57, 'Hospitality, interior & architecture' ], [ 58, 'High jewellery' ], [ 59, 'Fashion & accessories' ], [ 60, 'Food photography' ] ]
	}
];

const PHOTO_BG = '#f4f2ee';

export default function CorporateProfile() {
	const root = useRef( null );
	usePage( {
		page: 'profile',
		title: 'Corporate Profile 2026 — Visual Studios Plus',
		description: 'The Visual Studios Plus 2026 corporate profile as one presentation: a premier Colombo content creation and curation agency — digital case studies, retainers, branding, TVC and commercial photography for leading local and global brands.',
		cta: {
			title: 'Want this profile as a proposal for your brand?',
			text: 'Commission a dedicated production, a branding system, or an always-on social retainer.',
			button: 'Start a project brief'
		}
	} );
	// Desktop with a pointer: a true presentation, one slide at a time.
	// Elsewhere the slides stack as you scroll.
	const [ present ] = useState( presentMode );
	const none = useRef( null );
	useReveals( present ? none : root );
	useStoryMotion( root, present );
	// Category filter: 'all', or a chapter id — only that chapter's slides show.
	const [ filter, setFilter ] = useState( 'all' );
	const deck = useDeck( root, present, filter );
	const cats = CHAPTERS.map( ( ch ) => [ ch.id, ch.short ] );
	const choose = ( id ) => {
		setFilter( id );
		if ( ! present ) {
			const top = root.current.getBoundingClientRect().top + window.scrollY;
			window.scrollTo( 0, Math.max( 0, top ) );
		}
	};

	return (
		<>
			<div ref={ root } className="corporateProfile cpDeck" data-filter={ filter }>
				<ProfileCover />

				<DeckHello />

				{ CHAPTERS.map( ( ch ) => {
					const items = ALL.filter( ( s ) => s.type === ch.kind );
					return (
						<Fragment key={ ch.id }>
							<section className="cpSlide cpDeckReel" id={ ch.id } data-slide={ ch.label } data-cat={ ch.id }>
								<ChapterReel video={ ch.id === 'tvc' ? data.site.showreel : undefined } still={ ch.id === 'tvc' ? '/assets/img/Cover.jpeg' : undefined } label={ ch.label } kicker={ ch.kicker }
									accent={ items[ 0 ].accent } cards={ dollyCards( items ) } marks={ dollyMarks( items ) } present={ present } />
							</section>

							{ ch.lead && ch.lead.map( ( [ page, caption ] ) => (
								<DeckGallery key={ page } page={ page } bg={ PHOTO_BG } ink="#141414" caption={ caption } label={ caption } cat={ ch.id } />
							) ) }

							{ items.map( ( s ) => {
								const n = ALL.indexOf( s ) + 1;
								return (
									<Fragment key={ s.title }>
										{ coverFor( s ) && <BrandCover s={ s } cat={ ch.id } /> }
										<Story s={ s } n={ n } total={ ALL.length } flip={ n % 2 === 0 } label={ s.word } cat={ ch.id } />
										{ s.spreads.map( ( page, k ) => (
											<DeckGallery key={ page } page={ page } bg={ s.bg } ink={ s.ink } label={ `${ s.word } — gallery` } cat={ ch.id }
												caption={ `${ s.title }${ s.spreads.length > 1 ? ` · ${ k + 1 }/${ s.spreads.length }` : '' }` } />
										) ) }
										{ ch.extra && s.title.startsWith( ch.extra.after ) && (
											<DeckGallery page={ ch.extra.page } bg="#f6f5f1" ink="#141414" caption={ ch.extra.caption } label={ ch.extra.caption } cat={ ch.id } />
										) }
									</Fragment>
								);
							} ) }
						</Fragment>
					);
				} ) }

				<DeckClosing />
			</div>
			<DeckHud root={ root } deck={ deck } cats={ cats } filter={ filter } onFilter={ choose } />
		</>
	);
}
