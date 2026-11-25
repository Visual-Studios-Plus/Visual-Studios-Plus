import media from '../../data/caseMedia.js';
import COVERS from '../../data/profileCovers.js';
import { storyImg } from './CaseStories.jsx';

/*
 * A brand's title slide, set before its case opener: the brand colour, two
 * giant serif words, the product cut-out (or a framed campaign photo)
 * standing between them, the logo and the campaign copy at the right.
 * Static by design: no entrance or scroll motion. Data: profileCovers.js.
 */
export const coverFor = ( s ) => COVERS[ s.word ];

export default function BrandCover( { s, cat } ) {
	const c = coverFor( s );
	const logo = media[ s.title ]?.mark;
	const pic = c.cut || c.photo;
	return (
		<section className={ `cpSlide cpCover${ c.photo ? ' cpCover--photo' : '' }` } data-slide={ `${ s.word } — cover` } data-cat={ cat }
			style={ { '--cv-bg': c.bg, '--cv-ink': c.ink, '--n1': c.top.length, '--n2': c.bottom.length } } aria-label={ `${ s.client }: ${ s.title }` }>
			<p className="cpCover_word cpCover_word--top" aria-hidden="true">{ c.top }</p>
			<p className="cpCover_word cpCover_word--bottom" aria-hidden="true">{ c.bottom }</p>
			<img className="cpCover_cut" src={ storyImg( pic ) } alt={ `${ s.client } — ${ s.title }` } loading="lazy" decoding="async" />
			<div className="cpCover_side">
				{ logo ? <img className="cpCover_logo" src={ logo } alt={ s.client } /> : <p className="cpCover_name">{ s.client }</p> }
				<p className="cpCover_text">{ s.text }</p>
			</div>
		</section>
	);
}
