import { useRef } from 'react';
import data from '../data/site.js';
import media from '../data/caseMedia.js';
import { usePage } from '../context/PageContext.jsx';
import useReveals from '../lib/useReveals.js';
import useFlowRows from '../lib/useFlowRows.js';
import { pad } from '../lib/motion.js';
import PageHero from '../components/PageHero.jsx';
import Roster from '../components/home/Roster.jsx';
import TLink from '../components/TLink.jsx';

/*
 * Corporate Profile — the studio's 2026 profile reimagined as an image-led
 * editorial showcase (styling direction after premium agency portfolios:
 * full-bleed photography, oversized wordmarks, numbered chapters, a drifting
 * frame gallery). Content comes from the digitised case-study archive in
 * site.js, grouped into the studio's five disciplines.
 */

/* A fitting photograph for each case study (keyed by title = caseStudies[n][3]). */
const F = ( n ) => `/assets/photos/full/${ n }`;
const CASE_IMG = {
	'Nescafé × Colombo Fashion Week': F( 'Tiesh-7077-1.webp' ),
	'Pond’s Super Light Gel Launch': F( '7.webp' ),
	'UNDP Sri Lanka — HackaDev Social Innovation': '/assets/img/Cover.jpeg',
	'Dankotuwa Porcelain CGI World': F( 'KeelesFoodPhotography0403.webp' ),
	'Ministry of Crab Gastronomy': F( 'KeelesFoodPhotography0314.webp' ),
	'American Express × Swim Week Colombo': F( 'Tiesh-7224-1-2.webp' ),
	'Knorr Mother’s Day Campaign': '/assets/cases/knorr-2.webp',
	'Munchee CBL — Festive AI & Lego Campaign': '/assets/cases/knorr-5.webp',
	'Ahmad Tea London — Digital Channel Retainer': F( 'AAB_5081.webp' ),
	'Swisstek Aluminium — Technical & Solar Strategy': F( 'D85_2638-HDR.webp' ),
	'Swadeshi Khomba — Natural Herbal Digital Presence': F( 'DJI_0078-HDR.webp' ),
	'Imorich Ice Cream — 5-Year Creative Partnership': F( 'CL4.webp' ),
	'SOZO Sparkling Drinks — Identity & Can Design': F( 'DSC_1643-2.webp' ),
	'Too Good Dessert Chocolatier': F( 'CurryLeaf.webp' ),
	'Viva La Vida Pharma Skincare': F( 'DSC_1657-2.webp' ),
	'CBW (Cairns Bicycle Works) — Australia': '/assets/brands/cbw.webp',
	'Te Dalu — Boutique Hotel Ella': F( 'D85_2304.webp' ),
	'Viva Malted Food Drink — Avurudu Series': '/assets/img/yt-ZX7DkXlNgmk.jpg',
	'MintPay — Digital Vouchers Commercial': '/assets/img/yt-Nv1hYJFlshM.jpg',
	'Swadeshi Khomba — Women’s Day TVC': F( 'Tiesh-6743-1-2.webp' ),
	'DSI Footwear — Everyday Journeys': F( 'Tiesh-7287-1.webp' ),
	'Sapphire Dragon Chinese Restaurant': F( 'AAB_5098-1.webp' )
};

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

/* A dense spread of work for the intro montage behind the oversized wordmark. */
const MONTAGE = [
	'Tiesh-7077-1.webp', 'KeelesFoodPhotography0314.webp', 'DSC_1657-2.webp', 'D85_3829-HDR.webp', '7.webp',
	'Palliyaguruge-Jewellers2.webp', 'AAB_5081.webp', 'DJI_0078-HDR.webp', 'Tiesh-7287-1.webp', 'CurryLeaf.webp',
	'D85_2304.webp', 'DSC_1643-2.webp', 'KeelesFoodPhotography0403.webp', 'Tiesh-6743-1-2.webp', 'AAB_5098-1.webp',
	'D85_2638-HDR.webp', 'Palliyaguruge-Jewellers4.webp', 'Tiesh-7224-1-2.webp', 'DSC_5365.webp', 'D85_2612.webp'
];

/* A spread of frames for the drifting gallery. */
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

/* An image-led case tile: photograph, logo chip, headline result, title on a scrim. */
function CaseTile( { c, n, feature } ) {
	const [ type, year, client, title, line, tags, metric, label, text ] = c;
	const img = CASE_IMG[ title ] || F( 'D85_3829-HDR.webp' );
	return (
		<article className={ `cpBrand cpCase${ feature ? ' cpCase--feature' : '' }` }>
			<div className="cpBrand_fig cpCase_media">
				<img src={ img } alt={ `${ client } — ${ title }` } loading="lazy" decoding="async" />
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
		</article>
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
			<PageHero className="pageHero--profile" eyebrow="Corporate Profile · Colombo · 2026"
				lines={ [ 'The creative', 'agency' ] }
				lede="We create content meant to be experienced. Not simply consumed.">
				<ul className="pageJump">
					{ CHAPTERS.map( ( ch ) => (
						<li key={ ch.id }><TLink to={ `#${ ch.id }` }>({ pad( ch.no ) }) { ch.label }</TLink></li>
					) ) }
				</ul>
			</PageHero>

			<section className="cpMontage" aria-label="Visual Studios Plus showreel montage">
				<div className="cpMontage_grid" aria-hidden="true">
					{ MONTAGE.map( ( f ) => (
						<span className="cpMontage_cell" key={ f }><img src={ F( f ) } alt="" loading="lazy" decoding="async" /></span>
					) ) }
				</div>
				<div className="cpMontage_center">
					<p className="eyebrow">Showreel · 2026</p>
					<h2 className="cpMontage_word">Visual Studios<span className="cpMontage_plus">+</span></h2>
					<p className="cpMontage_sub">Branding · Film · Photography · Social · CGI</p>
				</div>
			</section>

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
				const items = data.caseStudies.filter( ( c ) => c[ 0 ] === ch.kind );
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
								{ items.map( ( c, i ) => <CaseTile key={ c[ 3 ] } c={ c } n={ i + 1 } feature={ i === 0 } /> ) }
							</div>
						</div>
					</section>
				);
			} ) }

			<Gallery />

			<Roster eyebrow="Client roster" title="Brands that trust our lens and strategy." />
		</div>
	);
}
