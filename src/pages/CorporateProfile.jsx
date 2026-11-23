import { useRef } from 'react';
import data from '../data/site.js';
import media from '../data/caseMedia.js';
import { usePage } from '../context/PageContext.jsx';
import useReveals from '../lib/useReveals.js';
import useFlowRows from '../lib/useFlowRows.js';
import { pad, ytThumb } from '../lib/motion.js';
import Roster from '../components/home/Roster.jsx';
import ProfileCover from '../components/profile/ProfileCover.jsx';
import CaseStories, { storyImg, isCut, storyId } from '../components/profile/CaseStories.jsx';
import TLink from '../components/TLink.jsx';
import STORIES from '../data/profileStories.js';

/*
 * Corporate Profile — the studio's 2026 profile reimagined as an image-led
 * editorial showcase (styling direction after premium agency portfolios:
 * full-bleed photography, oversized wordmarks, numbered chapters, a drifting
 * frame gallery). Content comes from the digitised case-study archive in
 * site.js, grouped into the studio's five disciplines.
 */

/* Photo thumbnails for the gallery and showcase stills. */
const F = ( n ) => `/assets/photos/thumb/${ n }`;

/* Every case study joined with its story from the profile (lead image, copy,
 * brand colour), numbered in profile order. */
const ALL = data.caseStudies.map( ( c ) => {
	const st = STORIES.find( ( x ) => c[ 3 ].startsWith( x.match ) );
	const [ type, year, client, title, line, tags, metric, label ] = c;
	return st ? { ...st, type, year, client, title, line, tags, metric, label } : null;
} ).filter( Boolean );

/* Case tuple: [type, year, client, title, line, tags, metric?, label?, text?]. */
const CHAPTERS = [
	{
		id: 'digital', no: 1, kind: 'Digital Case Study', label: 'Digital Campaigns',
		intro: 'Real-time production war rooms, viral launches, and flagship campaigns for Sri Lanka’s most-loved brands.',
		figure: [ 'Tiesh-7224-1-2.webp', 'Fashion portrait from a Visual Studios Plus campaign' ]
	},
	{
		id: 'retainers', no: 2, kind: 'Digital Retainer', label: 'Always-On Retainers',
		intro: 'End-to-end channel ownership — strategy, content, and community — for brands we grow month after month.',
		figure: [ 'KeelesFoodPhotography0314.webp', 'Overhead food photography by Visual Studios Plus' ]
	},
	{
		id: 'branding', no: 3, kind: 'Branding Project', label: 'Branding & Identity',
		intro: 'Logotypes, packaging architecture, and brand worlds built to feel premium, distinctive and unmistakably crafted.',
		figure: [ 'DSC_1643-2.webp', 'Jewellery macro photography by Visual Studios Plus' ]
	},
	{
		id: 'tvc', no: 4, kind: 'TVC Campaign', label: 'Film & TVC',
		intro: 'Concept to screen — scripting, direction, and broadcast-grade production for national commercials.',
		figure: [ 'D85_3829-HDR.webp', 'Hotel terrace overlooking misty mountains, shot by Visual Studios Plus' ]
	},
	{
		id: 'photography', no: 5, kind: 'Commercial Photography', label: 'Commercial Photography',
		intro: 'Tactile, sensory imagery across gastronomy, hospitality and high fashion for brands that live on detail.',
		figure: [ 'DJI_0078-HDR.webp', 'Aerial photograph of a hillside resort by Visual Studios Plus' ]
	}
];

const STATS = [
	[ '50+', 'Premier brands partnered' ],
	[ '10M+', 'Organic digital views' ],
	[ '5+ Yrs', 'Average client retainer' ],
	[ '100%', 'In-house production' ]
];

const SECTORS = [ 'FMCG', 'Food & Beverage', 'Fashion', 'Luxury Hospitality' ];

/* A dense book of work for the drifting gallery. */
const GALLERY = [
	'Tiesh-7077-1.webp', 'KeelesFoodPhotography0314.webp', 'DSC_1657-2.webp', 'D85_3829-HDR.webp',
	'7.webp', 'Palliyaguruge-Jewellers2.webp', 'AAB_5081.webp', 'DJI_0078-HDR.webp',
	'Tiesh-7287-1.webp', 'CurryLeaf.webp', 'D85_2304.webp', 'DSC_1643-2.webp',
	'KeelesFoodPhotography0403.webp', 'Tiesh-6743-1-2.webp', 'AAB_5098-1.webp', 'D85_2638-HDR.webp'
];

function BrandMark( { client, title } ) {
	const m = media[ title ];
	const initials = client.replace( /\(.*?\)/g, '' ).split( /[\s/&×—-]+/ ).filter( Boolean )
		.slice( 0, 2 ).map( ( w ) => w[ 0 ] ).join( '' );
	if ( m?.tile ) {
		return <span className="cpCase_mark cpCase_mark--tile"><img src={ m.tile } alt={ `${ client } logo` } loading="lazy" decoding="async" /></span>;
	}
	if ( m?.mark ) {
		return <span className={ `cpCase_mark cpCase_mark--logo${ m.dark ? ' is-dark' : '' }` }><img src={ m.mark } alt={ `${ client } logo` } loading="lazy" decoding="async" /></span>;
	}
	return <span className="cpCase_mark cpCase_mark--mono" aria-hidden="true">{ initials }</span>;
}

/* An image-led case tile — the campaign's lead frame, logo chip, title on a
 * scrim — that opens the full story further down its chapter. */
function CaseTile( { s, n, feature } ) {
	const { client, year, title, line, tags, metric, label, text } = s;
	const lead = s.imgs[ 0 ];
	return (
		<TLink to={ `#${ storyId( s ) }` } className={ `cpBrand cpCase${ feature ? ' cpCase--feature' : '' }` } style={ { '--accent': s.accent } }
			aria-label={ `${ title } — read the case story` }>
			<div className={ `cpBrand_fig cpCase_media${ isCut( lead ) ? ' cpCase_media--cut' : '' }` }>
				<img src={ storyImg( lead ) } alt={ `${ client } — ${ title }` } loading="lazy" decoding="async" />
				<span className="cpCase_no">{ pad( n ) }</span>
				<BrandMark client={ client } title={ title } />
				{ feature && metric && <span className="cpCase_metric"><b>{ metric }</b>{ label }</span> }
				<div className="cpCase_over">
					<p className="cpCase_client">{ client } · { year }</p>
					<h3 className="cpCase_title">{ title }</h3>
					{ feature && <p className="cpCase_line">{ text || line }</p> }
				</div>
			</div>
			<div className="cpCase_foot">
				<p className="cpCase_line cpCase_line--sub">{ line }</p>
				<div className="cpCase_footRow">
					<ul className="pillList cpCase_tags">{ tags.slice( 0, 2 ).map( ( t ) => <li key={ t }>{ t }</li> ) }</ul>
					{ metric && <p className="cpCase_metricInline"><b>{ metric }</b>{ label }</p> }
				</div>
			</div>
		</TLink>
	);
}

/* Media showcase: a bold statement beside a horizontally-scrolled reel of the
 * studio's films and signature frames (direction after lxlcreative / details.so). */
const SHOWCASE_STILLS = [
	[ 'Tiesh-7077-1.webp', 'Colombo Fashion Week', 'Fashion / Social' ],
	[ 'KeelesFoodPhotography0314.webp', 'Gastronomy', 'Food / Commercial' ],
	[ 'D85_3829-HDR.webp', 'Hospitality', 'Architecture / Interior' ],
	[ 'DSC_1657-2.webp', 'High Jewellery', 'Product / Macro' ]
];

function Showcase() {
	return (
		<section className="cpShowcase" aria-labelledby="cpShowcaseTitle">
			<div className="cpShowcase_head">
				<p className="eyebrow">Media showcase</p>
				<h2 className="sectionTitle" id="cpShowcaseTitle">Real craft.<br /><span className="cpShowcase_mute">Real results.</span></h2>
				<p className="lede">Films, campaigns and frames — scroll the reel.</p>
			</div>
			<div className="cpShowcase_rail">
				{ data.films.map( ( f ) => (
					<a className="cpShowcase_card cpShowcase_card--film" key={ f.slug }
						href={ `https://www.youtube.com/watch?v=${ f.yt }` } target="_blank" rel="noopener noreferrer">
						<span className="cpShowcase_media">
							<img src={ ytThumb( f.yt ) } alt={ f.alt } loading="lazy" decoding="async" />
							<span className="cpShowcase_play" aria-hidden="true">▶</span>
						</span>
						<span className="cpShowcase_meta"><b>{ f.title }</b>{ f.format }</span>
					</a>
				) ) }
				{ SHOWCASE_STILLS.map( ( [ img, name, kind ] ) => (
					<div className="cpShowcase_card" key={ img }>
						<span className="cpShowcase_media"><img src={ F( img ) } alt={ `${ name } photography by Visual Studios Plus` } loading="lazy" decoding="async" /></span>
						<span className="cpShowcase_meta"><b>{ name }</b>{ kind }</span>
					</div>
				) ) }
			</div>
		</section>
	);
}

function Gallery() {
	const root = useRef( null );
	const half = Math.ceil( GALLERY.length / 2 );
	const rows = [ GALLERY.slice( 0, half ), GALLERY.slice( half ) ];
	useFlowRows( root, '.cpGallery_track' );
	return (
		<section className="cpGallery" aria-labelledby="cpGalleryTitle" ref={ root }>
			<div className="cpGallery_head">
				<p className="eyebrow">Selected frames</p>
				<h2 className="sectionTitle" id="cpGalleryTitle">The work, frame by frame.</h2>
			</div>
			<div className="cpGallery_flow">
				{ rows.map( ( row, r ) => (
					<div className="cpGallery_row" key={ r }>
						<ul className="cpGallery_track">
							{ [ 0, 1 ].map( ( copy ) => row.map( ( f ) => (
								<li className="cpGallery_item" key={ `${ copy }-${ f }` } aria-hidden={ copy === 1 || undefined }>
									<img src={ F( f ) } alt={ copy === 1 ? '' : 'Visual Studios Plus photography' } loading="lazy" />
								</li>
							) ) ) }
						</ul>
					</div>
				) ) }
			</div>
		</section>
	);
}

export default function CorporateProfile() {
	const root = useRef( null );
	usePage( {
		page: 'profile',
		title: 'Corporate Profile 2026 — Visual Studios Plus',
		description: 'The Visual Studios Plus 2026 corporate profile: a premier Colombo content creation and curation agency, presented as a portfolio of digital campaigns, retainers, branding, film, and commercial photography for leading local and global brands.',
		cta: {
			title: 'Want this profile as a proposal for your brand?',
			text: 'Commission a dedicated production, a branding system, or an always-on social retainer.',
			button: 'Start a project brief'
		}
	} );
	useReveals( root );

	return (
		<div ref={ root } className="corporateProfile">
			<ProfileCover />

			<section className="cpManifesto" aria-labelledby="cpGoalTitle">
				<div className="cpManifesto_inner">
					<p className="eyebrow">(00) Our goal</p>
					<h2 className="sectionTitle cpManifesto_title" id="cpGoalTitle">
						<span className="cpManifesto_line">To help brands smash their targets and bring bold visions to life —</span>{ ' ' }
						<span className="cpManifesto_line cpManifesto_line--mute">using savvy digital solutions and cinema-grade craft.</span>
					</h2>
					<div className="cpManifesto_cols">
						<p>Visual Studios Plus is a premier content creation and curation agency based in Colombo, with a stellar reputation for videography, photography, and visual content across FMCG, Food, Fashion, and Hospitality.</p>
						<p>Lately we’ve stepped into digital creativity, quickly becoming a go-to for local and global brands — today partnering with Sri Lanka’s favourite consumer names on fresh, real-time digital strategy.</p>
					</div>
					<ul className="pillList pillList--lg cpSectors">{ SECTORS.map( ( s ) => <li key={ s }>{ s }</li> ) }</ul>
					<div className="resultsGrid resultsGrid--four cpStats">
						{ STATS.map( ( [ num, lbl ] ) => (
							<div className="resultItem cpStat" key={ lbl }>
								<p className="resultNum" data-count={ num }>{ num }</p>
								<p className="resultLabel">{ lbl }</p>
							</div>
						) ) }
					</div>
				</div>
			</section>

			{ CHAPTERS.map( ( ch ) => {
				const items = ALL.filter( ( s ) => s.type === ch.kind );
				return (
					<section className="cpChapter" id={ ch.id } key={ ch.id } aria-labelledby={ `${ ch.id }-title` }>
						<div className="cpChapter_inner">
							<div className="cpChapter_head">
								<span className="cpChapter_no" aria-hidden="true">{ pad( ch.no ) }</span>
								<div className="cpChapter_headText">
									<p className="eyebrow">Chapter { pad( ch.no ) } · { items.length } projects</p>
									<h2 className="sectionTitle" id={ `${ ch.id }-title` }>{ ch.label }.</h2>
									<p className="lede">{ ch.intro }</p>
								</div>
							</div>
							<div className="cpCases">
								{ items.map( ( s, i ) => <CaseTile key={ s.title } s={ s } n={ i + 1 } feature={ i === 0 } /> ) }
							</div>
							<CaseStories stories={ items } start={ ALL.indexOf( items[ 0 ] ) + 1 } total={ ALL.length } />
						</div>
					</section>
				);
			} ) }

			<Showcase />

			<Gallery />

			<Roster eyebrow="Client roster" title="Brands that trust our lens and strategy." />
		</div>
	);
}
